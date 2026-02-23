(() => {
  A11Y.init();
  I18N.applyLang();

  const session = Auth.requireAuthOrRedirect();
  const userId = session.userId;

  // Required by assignment
  const PERSONAL_DETAILS = [
    { first: "Ali", last: "Shabany", id: "212428569" },
    { first: "Tala", last: "Jabaren", id: "22222222" }
  ];

  let expenses = StorageService.loadExpenses(userId);
  let currency = StorageService.loadCurrency(userId);
  let ratesObj = StorageService.loadRates(userId);

  function monthKey(dateStr){
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  }
  function currentMonthKey(){
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  }

  let selectedMonth = currentMonthKey();

  const helloUser = document.getElementById("helloUser");
  const langSelect = document.getElementById("langSelect");

  const monthSelect = document.getElementById("monthSelect");
  const lockHint = document.getElementById("lockHint");

  const menuBtn = document.getElementById("menuBtn");
  const userMenu = document.getElementById("userMenu");
  const btnPersonal = document.getElementById("btnPersonal");
  const btnReset = document.getElementById("btnReset");
  const btnLogout = document.getElementById("btnLogout");

  const tabList = document.getElementById("tabList");
  const tabInsights = document.getElementById("tabInsights");
  const panelList = document.getElementById("panelList");
  const panelInsights = document.getElementById("panelInsights");

  const form = document.getElementById("expenseForm");
  const formErrors = document.getElementById("formErrors");
  const expenseId = document.getElementById("expenseId");
  const amount = document.getElementById("amount");
  const date = document.getElementById("date");
  const paymentType = document.getElementById("paymentType");
  const category = document.getElementById("category");
  const description = document.getElementById("description");
  const btnCancelEdit = document.getElementById("btnCancelEdit");

  const tbody = document.getElementById("expensesBody");
  const emptyState = document.getElementById("emptyState");
  const countEl = document.getElementById("count");
  const monthTotalEl = document.getElementById("monthTotal");
  const monthRemainingEl = document.getElementById("monthRemaining");
  const displayTotalEl = document.getElementById("displayTotal");

  const search = document.getElementById("search");
  const filterPayment = document.getElementById("filterPayment");
  const filterCategory = document.getElementById("filterCategory");
  const fromDate = document.getElementById("fromDate");
  const toDate = document.getElementById("toDate");
  const sortBy = document.getElementById("sortBy");
  const btnClearFilters = document.getElementById("btnClearFilters");

  const budgetInput = document.getElementById("budget");
  const btnSaveBudget = document.getElementById("btnSaveBudget");
  const budgetStatus = document.getElementById("budgetStatus");

  const currencySelect = document.getElementById("currency");
  const btnRefreshRates = document.getElementById("btnRefreshRates");
  const rateInfo = document.getElementById("rateInfo");

  if (helloUser){
    const name = session.fullName || session.email || "";
    helloUser.textContent = name ? name : "";
  }

  if (langSelect){
    langSelect.value = I18N.getLang();
    langSelect.addEventListener("change", () => {
      I18N.setLang(langSelect.value);
      render();
    });
  }

  if (currencySelect) currencySelect.value = currency;

  function buildMonthOptions(){
    const set = new Set(expenses.map(e => monthKey(e.date)));
    set.add(currentMonthKey());
    const months = Array.from(set).sort(); // old -> new

    if (!months.includes(selectedMonth)) selectedMonth = currentMonthKey();

    monthSelect.innerHTML = "";
    for (const m of months){
      const opt = document.createElement("option");
      opt.value = m;
      opt.textContent = m + (m === currentMonthKey() ? ` • ${I18N.t("currentMonthLabel")}` : "");
      monthSelect.appendChild(opt);
    }
    monthSelect.value = selectedMonth;
  }

  monthSelect?.addEventListener("change", () => {
    selectedMonth = monthSelect.value;
    resetForm();
    render();
  });

  function isLocked(){
    return selectedMonth !== currentMonthKey();
  }

  function applyLockUI(){
    const locked = isLocked();

    if (lockHint){
      lockHint.textContent = locked ? I18N.t("lockedHint") : "";
    }

    [amount, paymentType, category, date, description].forEach(el => {
      if (el) el.disabled = locked;
    });
    if (form) form.querySelector("button[type='submit']").disabled = locked;

    if (budgetInput) budgetInput.disabled = locked;
    if (btnSaveBudget) btnSaveBudget.disabled = locked;
  }

  function openMenu(){
    if (!userMenu || !menuBtn) return;
    userMenu.hidden = false;
    menuBtn.setAttribute("aria-expanded", "true");
    userMenu.querySelector("button")?.focus();
  }
  function closeMenu(){
    if (!userMenu || !menuBtn) return;
    userMenu.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");
  }

  menuBtn?.addEventListener("click", () => {
    if (!userMenu) return;
    if (userMenu.hidden) openMenu(); else closeMenu();
  });

  document.addEventListener("click", (e) => {
    if (!userMenu || userMenu.hidden) return;
    const inside = userMenu.contains(e.target);
    const onBtn = menuBtn && menuBtn.contains(e.target);
    if (!inside && !onBtn) closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && userMenu && !userMenu.hidden) closeMenu();
  });

  btnLogout?.addEventListener("click", () => {
    Auth.logout();
    window.location.href = "index.html";
  });

  btnPersonal?.addEventListener("click", () => {
    closeMenu();
    const lines = PERSONAL_DETAILS.map(p => `${p.first} ${p.last}\nID: ${p.id}`).join("\n\n---\n\n");
    alert(lines);
  });

  btnReset?.addEventListener("click", () => {
    closeMenu();
    if (!confirm(I18N.t("msgConfirmDeleteAll"))) return;
    expenses = [];
    ratesObj = null;
    StorageService.saveExpenses(userId, expenses);
    StorageService.saveRates(userId, ratesObj);
    buildMonthOptions();
    resetForm();
    render();
  });

  function showPanel(which){
    const showInsights = which === "insights";
    tabList?.setAttribute("aria-selected", showInsights ? "false" : "true");
    tabInsights?.setAttribute("aria-selected", showInsights ? "true" : "false");
    if (panelList) panelList.hidden = showInsights;
    if (panelInsights) panelInsights.hidden = !showInsights;

    if (showInsights){
      ChartService.updateCharts(getFilteredList());
    }
  }
  tabList?.addEventListener("click", () => showPanel("list"));
  tabInsights?.addEventListener("click", () => showPanel("insights"));

  [search, filterPayment, filterCategory, fromDate, toDate, sortBy].forEach(el => {
    el?.addEventListener("input", render);
    el?.addEventListener("change", render);
  });

  btnClearFilters?.addEventListener("click", () => {
    if (search) search.value = "";
    if (filterPayment) filterPayment.value = "all";
    if (filterCategory) filterCategory.value = "all";
    if (fromDate) fromDate.value = "";
    if (toDate) toDate.value = "";
    if (sortBy) sortBy.value = "date_desc";
    render();
  });

  btnSaveBudget?.addEventListener("click", () => {
    if (isLocked()) return;
    const v = Number(budgetInput?.value);
    if (!Number.isFinite(v) || v < 0){
      alert(I18N.t("msgBudgetInvalid"));
      return;
    }
    StorageService.saveBudget(userId, selectedMonth, v);
    render();
  });

  currencySelect?.addEventListener("change", () => {
    currency = currencySelect.value;
    StorageService.saveCurrency(userId, currency);
    render();
  });

  btnRefreshRates?.addEventListener("click", async () => {
    await refreshRates(false);
    render();
  });

  btnCancelEdit?.addEventListener("click", resetForm);
  form?.addEventListener("submit", onSubmit);

  buildMonthOptions();
  resetForm();

  if (!ratesObj) refreshRates(true).finally(render);
  else {
    updateRateInfo(false);
    render();
  }

  async function refreshRates(silent){
    try{
      ratesObj = await ApiService.fetchRates("ILS");
      StorageService.saveRates(userId, ratesObj);
      updateRateInfo(false);
      if (!silent) alert(I18N.t("msgRatesOk"));
    } catch {
      updateRateInfo(true);
      if (!silent) alert(I18N.t("msgRatesFail"));
    }
  }

  function updateRateInfo(isError){
    if (!rateInfo) return;
    if (isError){
      rateInfo.textContent = I18N.t("msgRatesFail");
      return;
    }
    if (!ratesObj){
      rateInfo.textContent = "";
      return;
    }
    rateInfo.textContent = `Base: ${ratesObj.base} • ${ratesObj.timeLastUpdate}`;
  }

  function onSubmit(ev){
    ev.preventDefault();
    if (isLocked()) return;

    const raw = {
      id: expenseId?.value || null,
      amount: amount?.value,
      date: date?.value,
      paymentType: paymentType?.value,
      category: category?.value,
      description: description?.value,
      createdAt: null
    };

    if (raw.date && monthKey(raw.date) !== selectedMonth){
      raw.date = `${selectedMonth}-01`;
      date.value = raw.date;
    }

    if (raw.id){
      const old = expenses.find(e => e.id === raw.id);
      if (old) raw.createdAt = old.createdAt;
    }

    const errors = ValidationService.validateExpense(raw);
    UIService.showErrors(formErrors, errors);
    if (errors.length) return;

    const normalized = ValidationService.normalizeExpense(raw);

    if (raw.id) expenses = expenses.map(e => e.id === normalized.id ? normalized : e);
    else expenses.push(normalized);

    StorageService.saveExpenses(userId, expenses);
    buildMonthOptions();
    resetForm();
    render();
  }

  function onEdit(id){
    if (isLocked()) return;
    const e = expenses.find(x => x.id === id);
    if (!e) return;

    expenseId.value = e.id;
    amount.value = String(e.amount);
    date.value = e.date;
    paymentType.value = e.paymentType;
    category.value = e.category;
    description.value = e.description || "";

    btnCancelEdit.hidden = false;

    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  function onDelete(id){
    if (isLocked()) return;
    if (!confirm(I18N.t("msgConfirmDeleteOne"))) return;
    expenses = expenses.filter(x => x.id !== id);
    StorageService.saveExpenses(userId, expenses);
    buildMonthOptions();
    render();
  }

  function resetForm(){
    expenseId.value = "";
    amount.value = "";
    paymentType.value = "";
    category.value = "";
    description.value = "";
    btnCancelEdit.hidden = true;
    UIService.showErrors(formErrors, []);

    if (date){
      date.value = `${selectedMonth}-01`;
    }
  }

  function getMonthListOnly(){
    return expenses.filter(e => monthKey(e.date) === selectedMonth);
  }

  function getFilteredList(){
    const base = getMonthListOnly();

    const f = {
      search: search?.value?.trim() || "",
      payment: filterPayment?.value || "all",
      category: filterCategory?.value || "all",
      fromDate: fromDate?.value || "",
      toDate: toDate?.value || ""
    };

    let list = FilterService.applyFilters(base, f);
    list = FilterService.applySort(list, sortBy?.value || "date_desc");
    return list;
  }

  function render(){
    I18N.applyLang();
    buildMonthOptions();
    applyLockUI();

    const locked = isLocked();
    const list = getFilteredList();

    if (emptyState) emptyState.hidden = list.length !== 0;

    UIService.renderTable(tbody, list, currency, onEdit, onDelete, ratesObj, locked);
    if (countEl) countEl.textContent = String(list.length);

    const monthTotal = getMonthListOnly().reduce((s,e) => s + e.amount, 0);
    const budget = StorageService.loadBudget(userId, selectedMonth);

    if (monthTotalEl) monthTotalEl.textContent = UIService.fmtMoney(monthTotal, "ILS");

    const remaining = (budget > 0) ? (budget - monthTotal) : 0;
    if (monthRemainingEl) monthRemainingEl.textContent = budget > 0 ? UIService.fmtMoney(remaining, "ILS") : "—";

    const converted = ratesObj ? ApiService.convertAmount(monthTotal, ratesObj, currency) : monthTotal;
    if (displayTotalEl) displayTotalEl.textContent = UIService.fmtMoney(converted, currency);

    if (budgetInput) budgetInput.value = budget ? String(budget) : "";

    if (budgetStatus){
      budgetStatus.textContent = UIService.budgetMessage(monthTotal, budget);
      budgetStatus.style.borderColor = "var(--border)";
      if (budget > 0){
        const pct = (monthTotal / budget) * 100;
        if (pct >= 100) budgetStatus.style.borderColor = "rgba(255,77,79,.6)";
        else if (pct >= 80) budgetStatus.style.borderColor = "rgba(245,166,35,.6)";
        else budgetStatus.style.borderColor = "rgba(34,197,94,.6)";
      }
    }

    updateRateInfo(false);
    ChartService.updateCharts(list);
  }
})();