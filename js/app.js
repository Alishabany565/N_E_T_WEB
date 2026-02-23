(() => {
  A11Y.init();
  I18N.applyLang();

  const THEME_KEY = "et_theme_v1";
  function getTheme(){
    return localStorage.getItem(THEME_KEY) || "dark";
  }
  function applyTheme(){
    const t = getTheme();
    document.documentElement.setAttribute("data-theme", t === "light" ? "light" : "dark");
    const btn = document.getElementById("themeToggle");
    if (btn){
      const icon = btn.querySelector("span[aria-hidden='true']");
      if (icon) icon.textContent = (t === "light") ? "☀" : "☾";
      btn.setAttribute("title", t === "light" ? I18N.t("msgThemeLight") : I18N.t("msgThemeDark"));
    }
  }
  function toggleTheme(){
    const cur = getTheme();
    localStorage.setItem(THEME_KEY, cur === "light" ? "dark" : "light");
    applyTheme();
  }

  applyTheme();
  document.getElementById("themeToggle")?.addEventListener("click", toggleTheme);

  const session = Auth.requireAuthOrRedirect();
  const userId = session.userId;

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

  function daysInMonth(yyyymm){
    const [y,m] = yyyymm.split("-").map(Number);
    return new Date(y, m, 0).getDate();
  }

  function daysElapsedInMonth(yyyymm){
    const [y,m] = yyyymm.split("-").map(Number);
    const now = new Date();
    if (now.getFullYear() === y && (now.getMonth()+1) === m){
      return now.getDate();
    }
    return daysInMonth(yyyymm);
  }

  let selectedMonth = currentMonthKey();

  const helloUser = document.getElementById("helloUser");
  const langSelect = document.getElementById("langSelect");

  const monthSelect = document.getElementById("monthSelect");
  const lockHint = document.getElementById("lockHint");

  const menuBtn = document.getElementById("menuBtn");
  const userMenu = document.getElementById("userMenu");
  const btnPersonal = document.getElementById("btnPersonal");
  const btnShortcuts = document.getElementById("btnShortcuts");
  const btnReset = document.getElementById("btnReset");
  const btnLogout = document.getElementById("btnLogout");

  const shortcutsModal = document.getElementById("shortcutsModal");
  const shortcutsClose = document.getElementById("shortcutsClose");

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
  const btnExportCsv = document.getElementById("btnExportCsv");

  const budgetInput = document.getElementById("budget");
  const btnSaveBudget = document.getElementById("btnSaveBudget");
  const budgetStatus = document.getElementById("budgetStatus");

  const budgetBar = document.getElementById("budgetBar");
  const budgetPctLabel = document.getElementById("budgetPctLabel");
  const budgetProgressHint = document.getElementById("budgetProgressHint");

  const predictionBox = document.getElementById("predictionBox");
  const smartInsightsBox = document.getElementById("smartInsightsBox");

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
    const months = Array.from(set).sort();

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

  let shortcutsLastFocused = null;
  let shortcutsTrap = null;

  function openShortcuts(){
    if (!shortcutsModal) return;
    closeMenu();

    shortcutsLastFocused = document.activeElement;
    shortcutsModal.hidden = false;

    const focusable = shortcutsModal.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
    const items = Array.from(focusable);
    if (items.length) items[0].focus();

    shortcutsTrap = (e) => {
      if (e.key === "Escape"){
        e.preventDefault();
        closeShortcuts();
        return;
      }
      if (e.key !== "Tab") return;
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    };

    shortcutsModal.addEventListener("keydown", shortcutsTrap);
  }

  function closeShortcuts(){
    if (!shortcutsModal) return;
    shortcutsModal.hidden = true;

    if (shortcutsTrap){
      shortcutsModal.removeEventListener("keydown", shortcutsTrap);
      shortcutsTrap = null;
    }

    if (shortcutsLastFocused && typeof shortcutsLastFocused.focus === "function") shortcutsLastFocused.focus();
    shortcutsLastFocused = null;
  }

  btnShortcuts?.addEventListener("click", openShortcuts);
  shortcutsClose?.addEventListener("click", closeShortcuts);
  shortcutsModal?.addEventListener("click", (e) => {
    if (e.target === shortcutsModal) closeShortcuts();
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

  btnExportCsv?.addEventListener("click", () => {
    exportCsv(getFilteredList());
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

  function isPossibleDuplicate(normalized){
    const windowMs = 60 * 1000;
    const t = Date.now();
    return expenses.some(e => {
      const same = e.date === normalized.date &&
        e.category === normalized.category &&
        e.paymentType === normalized.paymentType &&
        Number(e.amount) === Number(normalized.amount);
      if (!same) return false;
      const last = Math.max(Number(e.updatedAt || 0), Number(e.createdAt || 0));
      return (t - last) <= windowMs;
    });
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

    if (!raw.id && isPossibleDuplicate(normalized)){
      if (!confirm(I18N.t("msgPossibleDup"))) return;
    }

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

  function exportCsv(list){
    if (!list || list.length === 0){
      alert(I18N.t("msgCsvEmpty"));
      return;
    }
    const header = ["date","amount_ils","category","payment_type","description"].join(",");
    const rows = list.map(e => {
      const vals = [
        e.date,
        String(e.amount),
        e.category,
        e.paymentType,
        (e.description || "").replaceAll('"','""')
      ];
      return `${vals[0]},${vals[1]},${vals[2]},${vals[3]},"${vals[4]}"`;
    });

    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses_${selectedMonth}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    alert(I18N.t("msgCsvOk"));
  }

  function topCategory(list){
    const m = new Map();
    for (const e of list){
      m.set(e.category, (m.get(e.category) || 0) + e.amount);
    }
    let best = null;
    for (const [k,v] of m.entries()){
      if (!best || v > best.sum) best = { key: k, sum: v };
    }
    return best;
  }

  function topDay(list){
    const m = new Map();
    for (const e of list){
      m.set(e.date, (m.get(e.date) || 0) + e.amount);
    }
    let best = null;
    for (const [k,v] of m.entries()){
      if (!best || v > best.sum) best = { key: k, sum: v };
    }
    return best;
  }

  function renderSmartInsights(monthList){
    if (!smartInsightsBox) return;

    if (!monthList.length){
      smartInsightsBox.textContent = "—";
      return;
    }

    const topCat = topCategory(monthList);
    const topD = topDay(monthList);

    const total = monthList.reduce((s,e) => s + e.amount, 0);
    const elapsed = Math.max(1, daysElapsedInMonth(selectedMonth));
    const avgDaily = total / elapsed;

    const lines = [
      `${I18N.t("insightsTopCategory")}: ${topCat ? UIService.labelCategory(topCat.key) : "—"} (${UIService.fmtMoney(topCat ? topCat.sum : 0, "ILS")})`,
      `${I18N.t("insightsTopDay")}: ${topD ? topD.key : "—"} (${UIService.fmtMoney(topD ? topD.sum : 0, "ILS")})`,
      `${I18N.t("insightsAvgDaily")}: ${UIService.fmtMoney(avgDaily, "ILS")}`
    ];

    smartInsightsBox.textContent = lines.join(" • ");
  }

  function renderPrediction(monthList, budget){
    if (!predictionBox) return;

    if (!monthList.length){
      predictionBox.textContent = "—";
      return;
    }

    const total = monthList.reduce((s,e) => s + e.amount, 0);
    const totalDays = daysInMonth(selectedMonth);
    const elapsed = Math.max(1, daysElapsedInMonth(selectedMonth));
    const avgDaily = total / elapsed;

    const expectedTotal = avgDaily * totalDays;
    const diff = (budget > 0) ? (budget - expectedTotal) : null;

    const line1 = `${I18N.t("predictionAvgDaily")}: ${UIService.fmtMoney(avgDaily, "ILS")} • ${elapsed}/${totalDays}`;
    const line2 = `${I18N.t("predictionExpectedTotal")}: ${UIService.fmtMoney(expectedTotal, "ILS")}`;
    const line3 = (budget > 0)
      ? `${I18N.t("predictionBudgetDiff")}: ${UIService.fmtMoney(diff, "ILS")}`
      : "";

    predictionBox.textContent = [line1, line2, line3].filter(Boolean).join(" • ");
  }

  function renderBudgetProgress(monthTotal, budget){
    if (!budgetBar || !budgetPctLabel || !budgetProgressHint) return;

    if (!budget || budget <= 0){
      budgetPctLabel.textContent = "—";
      budgetBar.style.width = "0%";
      budgetBar.style.background = "rgba(96,165,250,.65)";
      budgetProgressHint.textContent = "";
      return;
    }

    const pct = Math.min(999, (monthTotal / budget) * 100);
    const pctClamped = Math.max(0, Math.min(100, pct));

    budgetPctLabel.textContent = `${pct.toFixed(0)}%`;
    budgetBar.style.width = `${pctClamped}%`;

    if (pct >= 100){
      budgetBar.style.background = "rgba(255,77,79,.78)";
      budgetProgressHint.textContent = I18N.getLang() === "he" ? "חריגה" : (I18N.getLang() === "ar" ? "تجاوز" : "Exceeded");
    } else if (pct >= 80){
      budgetBar.style.background = "rgba(245,166,35,.78)";
      budgetProgressHint.textContent = I18N.getLang() === "he" ? "מתקרב לתקציב" : (I18N.getLang() === "ar" ? "قريب من الميزانية" : "Near budget");
    } else {
      budgetBar.style.background = "rgba(34,197,94,.78)";
      budgetProgressHint.textContent = "";
    }
  }

  function handleShortcuts(e){
    const isMac = navigator.platform.toLowerCase().includes("mac");
    const ctrl = isMac ? e.metaKey : e.ctrlKey;

    if (ctrl && (e.key === "f" || e.key === "F")){
      e.preventDefault();
      search?.focus();
      return;
    }

    if (ctrl && (e.key === "n" || e.key === "N")){
      e.preventDefault();
      amount?.focus();
      return;
    }

    if (e.altKey && (e.key === "i" || e.key === "I")){
      e.preventDefault();
      showPanel("insights");
      tabInsights?.focus();
      return;
    }

    if (e.altKey && (e.key === "l" || e.key === "L")){
      e.preventDefault();
      showPanel("list");
      tabList?.focus();
      return;
    }
  }

  document.addEventListener("keydown", handleShortcuts);

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

    renderBudgetProgress(monthTotal, budget);
    renderPrediction(getMonthListOnly(), budget);
    renderSmartInsights(getMonthListOnly());

    updateRateInfo(false);
    ChartService.updateCharts(list);
  }

  render();
})();