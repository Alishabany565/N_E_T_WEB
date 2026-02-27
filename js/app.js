// app.js
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
    if (now.getFullYear() === y && (now.getMonth()+1) === m) return now.getDate();
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

  // filters modal inputs
  const filterPayment = document.getElementById("filterPayment");
  const filterCategory = document.getElementById("filterCategory");
  const fromDate = document.getElementById("fromDate");
  const toDate = document.getElementById("toDate");
  const sortBy = document.getElementById("sortBy");

  const btnExportCsv = document.getElementById("btnExportCsv");
  const btnExportPdf = document.getElementById("btnExportPdf");

  const budgetInput = document.getElementById("budget");
  const btnSaveBudget = document.getElementById("btnSaveBudget");
  const budgetStatus = document.getElementById("budgetStatus");

  const budgetBar = document.getElementById("budgetBar");
  const budgetPctLabel = document.getElementById("budgetPctLabel");
  const budgetProgressHint = document.getElementById("budgetProgressHint");

  const predictionBox = document.getElementById("predictionBox");
  const smartInsightsBox = document.getElementById("smartInsightsBox");

  const currencySelect = document.getElementById("currency");
  const currencyTiles = document.getElementById("currencyTiles");
  const btnRefreshRates = document.getElementById("btnRefreshRates");
  const rateInfo = document.getElementById("rateInfo");

  // filters modal buttons
  const btnOpenFilters = document.getElementById("btnOpenFilters");
  const filtersModal = document.getElementById("filtersModal");
  const filtersClose = document.getElementById("filtersClose");
  const btnApplyFilters = document.getElementById("btnApplyFilters");
  const btnResetFilters = document.getElementById("btnResetFilters");

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

  function isLocked(){ return selectedMonth !== currentMonthKey(); }

  function applyLockUI(){
    const locked = isLocked();
    if (lockHint) lockHint.textContent = locked ? I18N.t("lockedHint") : "";

    [amount, paymentType, category, date, description].forEach(el => { if (el) el.disabled = locked; });
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

  // shortcuts modal
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
      if (e.key === "Escape"){ e.preventDefault(); closeShortcuts(); return; }
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
    if (shortcutsTrap){ shortcutsModal.removeEventListener("keydown", shortcutsTrap); shortcutsTrap = null; }
    if (shortcutsLastFocused && typeof shortcutsLastFocused.focus === "function") shortcutsLastFocused.focus();
    shortcutsLastFocused = null;
  }

  btnShortcuts?.addEventListener("click", openShortcuts);
  shortcutsClose?.addEventListener("click", closeShortcuts);
  shortcutsModal?.addEventListener("click", (e) => { if (e.target === shortcutsModal) closeShortcuts(); });

  // search is live
  search?.addEventListener("input", render);

  // filters modal: open/close + apply/reset
  let filtersLastFocused = null;
  let filtersTrap = null;

  function trapFocus(modal){
    filtersLastFocused = document.activeElement;
    const focusable = modal.querySelectorAll("button, input, select, textarea, a[href]");
    const items = Array.from(focusable);
    if (items.length) items[0].focus();

    filtersTrap = (e) => {
      if (e.key === "Escape"){ e.preventDefault(); closeFilters(); return; }
      if (e.key !== "Tab") return;
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    };

    modal.addEventListener("keydown", filtersTrap);
  }

  function releaseFocus(modal){
    if (filtersTrap) modal.removeEventListener("keydown", filtersTrap);
    filtersTrap = null;
    if (filtersLastFocused && typeof filtersLastFocused.focus === "function") filtersLastFocused.focus();
    filtersLastFocused = null;
  }

  function openFilters(){
    if (!filtersModal) return;
    btnOpenFilters?.setAttribute("aria-expanded", "true");
    filtersModal.hidden = false;
    trapFocus(filtersModal);
  }

  function closeFilters(){
    if (!filtersModal) return;
    filtersModal.hidden = true;
    btnOpenFilters?.setAttribute("aria-expanded", "false");
    releaseFocus(filtersModal);
  }

  btnOpenFilters?.addEventListener("click", openFilters);
  filtersClose?.addEventListener("click", closeFilters);
  filtersModal?.addEventListener("click", (e) => { if (e.target === filtersModal) closeFilters(); });

  btnResetFilters?.addEventListener("click", () => {
    if (filterPayment) filterPayment.value = "all";
    if (filterCategory) filterCategory.value = "all";
    if (fromDate) fromDate.value = "";
    if (toDate) toDate.value = "";
    if (sortBy) sortBy.value = "date_desc";
  });

  btnApplyFilters?.addEventListener("click", () => {
    closeFilters();
    render();
  });

  // budget
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

  // currency select
  function setCurrency(newCurrency){
    currency = newCurrency;
    if (currencySelect) currencySelect.value = currency;
    StorageService.saveCurrency(userId, currency);
    render();
  }

  currencySelect?.addEventListener("change", () => setCurrency(currencySelect.value));

  function currencyName(code){
    const lang = I18N.getLang();
    const names = {
      en: { ILS:"Shekel", USD:"Dollar", EUR:"Euro", GBP:"Pound", JOD:"Dinar" },
      ar: { ILS:"شيكل", USD:"دولار", EUR:"يورو", GBP:"جنيه", JOD:"دينار" },
      he: { ILS:"שקל", USD:"דולר", EUR:"אירו", GBP:"פאונד", JOD:"דינר" }
    };
    const dict = names[lang] || names.en;
    return dict[code] || code;
  }

  function renderCurrencyTiles(){
    if (!currencyTiles || !currencySelect) return;

    const options = Array.from(currencySelect.querySelectorAll("option")).map(o => o.value);
    currencyTiles.innerHTML = "";

    const buttons = [];

    for (const code of options){
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "currency-tile";
      btn.setAttribute("role", "radio");
      btn.setAttribute("data-currency", code);
      btn.setAttribute("aria-checked", String(code === currency));
      btn.innerHTML = `
        <div class="currency-code">${code}</div>
        <div class="currency-name">${currencyName(code)}</div>
        <div class="currency-tag">${I18N.getLang() === "ar" ? "تحويل" : (I18N.getLang() === "he" ? "המרה" : "Convert")}</div>
      `;
      btn.addEventListener("click", () => setCurrency(code));
      btn.addEventListener("keydown", (e) => {
        if (e.key === " " || e.key === "Enter"){
          e.preventDefault();
          setCurrency(code);
          return;
        }
        const isRtl = document.documentElement.dir === "rtl";
        const nextKey = isRtl ? "ArrowLeft" : "ArrowRight";
        const prevKey = isRtl ? "ArrowRight" : "ArrowLeft";
        if (e.key !== nextKey && e.key !== prevKey) return;
        e.preventDefault();
        const idx = buttons.indexOf(btn);
        if (idx === -1) return;
        const nextIdx = (e.key === nextKey) ? (idx + 1) : (idx - 1);
        const target = buttons[(nextIdx + buttons.length) % buttons.length];
        target?.focus();
      });
      currencyTiles.appendChild(btn);
      buttons.push(btn);
    }
  }

  btnRefreshRates?.addEventListener("click", async () => {
    await refreshRates(false);
    render();
  });

  // CSV export
  btnExportCsv?.addEventListener("click", () => exportCsv(getFilteredList()));

  // PDF export
  btnExportPdf?.addEventListener("click", () => exportPdf(getFilteredList()));

  // form
  btnCancelEdit?.addEventListener("click", resetForm);
  form?.addEventListener("submit", onSubmit);

  buildMonthOptions();
  resetForm();

  if (!ratesObj) refreshRates(true).finally(render);
  else { updateRateInfo(false); render(); }

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
    if (isError){ rateInfo.textContent = I18N.t("msgRatesFail"); return; }
    if (!ratesObj){ rateInfo.textContent = ""; return; }
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
    if (date) date.value = `${selectedMonth}-01`;
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

  // -------- CSV export (same as your version) --------
  function csvEscape(v){
    const s = String(v ?? "");
    if (/[",\n\r]/.test(s)){
      return `"${s.replaceAll('"','""')}"`;
    }
    return s;
  }

  function isRtlLang(){
    const lang = I18N.getLang();
    return (lang === "ar" || lang === "he");
  }

  function withRlmIfNeeded(v){
    if (!isRtlLang()) return String(v ?? "");
    const s = String(v ?? "");
    return s ? ("\u200F" + s) : s;
  }

  function buildCsvTable(list, cur){
    const sorted = [...list].sort((a,b) => new Date(a.date) - new Date(b.date));

    const columnsLtr = [
      { key: "colDate", get: (e) => e.date },
      { key: "colAmount", get: (e) => {
        const amountConverted = ratesObj ? ApiService.convertAmount(e.amount, ratesObj, cur) : e.amount;
        return Number.isFinite(amountConverted) ? amountConverted.toFixed(2) : String(e.amount);
      }},
      { key: "colCurrency", get: () => cur },
      { key: "colCategory", get: (e) => UIService.labelCategory(e.category) },
      { key: "colPayment", get: (e) => UIService.labelPayment(e.paymentType) },
      { key: "colDescription", get: (e) => (e.description || "").trim() }
    ];

    const cols = isRtlLang() ? [...columnsLtr].reverse() : columnsLtr;

    const header = cols.map(c => csvEscape(withRlmIfNeeded(I18N.t(c.key)))).join(",");

    const rows = sorted.map(e => {
      const vals = cols.map(c => {
        const raw = c.get(e);
        const out = (typeof raw === "number") ? String(raw) : withRlmIfNeeded(raw);
        return csvEscape(out);
      });
      return vals.join(",");
    });

    return { header, rows, colCount: cols.length };
  }

  function buildSectionTitleLine(titleText, colCount){
    const title = csvEscape(withRlmIfNeeded(titleText));
    const cells = [title];
    for (let i = 1; i < colCount; i++) cells.push("");
    return cells.join(",");
  }

  function exportCsv(list){
    if (!list || list.length === 0){
      alert(I18N.t("msgCsvEmpty"));
      return;
    }

    const cur = currency || "ILS";
    const order = ["cash","credit","check"];

    const main = buildCsvTable(list, cur);

    const lines = [];
    lines.push("\ufeff" + main.header);
    lines.push(...main.rows);
    lines.push("");

    const groups = new Map(order.map(pt => [pt, []]));
    for (const e of list){
      if (groups.has(e.paymentType)) groups.get(e.paymentType).push(e);
    }

    let wroteAnySection = false;

    for (const pt of order){
      const items = groups.get(pt) || [];
      if (!items.length) continue;

      const sectionTitle = `${I18N.t("payType")}: ${UIService.labelPayment(pt)}`;
      lines.push(buildSectionTitleLine(sectionTitle, main.colCount));

      const section = buildCsvTable(items, cur);
      lines.push(section.header);
      lines.push(...section.rows);

      lines.push("");
      wroteAnySection = true;
    }

    if (!wroteAnySection && lines.length && lines[lines.length - 1] === "") {
      lines.pop();
    } else {
      if (lines.length && lines[lines.length - 1] === "") lines.pop();
    }

    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses_${selectedMonth}_${cur}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    alert(I18N.t("msgCsvOk"));
  }

  // -------- PDF export (same as your version) --------
  function escapeHtmlPdf(s){
    return String(s ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  function pdfAllTitle(){
    const lang = I18N.getLang();
    if (lang === "ar") return "جميع المصروفات";
    if (lang === "he") return "כל ההוצאות";
    return "All expenses";
  }

  function pdfSectionTitle(paymentType){
    if (!paymentType) return pdfAllTitle();
    return UIService.labelPayment(paymentType);
  }

  function pdfColumns(){
    const rtl = (I18N.getLang() === "ar" || I18N.getLang() === "he");
    const colsLtr = [
      { key:"thDate", get:(e)=>e.date },
      { key:"thAmount", get:(e)=>e._amountOut },
      { key:"colCurrency", get:(e)=>e._cur },
      { key:"thCat", get:(e)=>UIService.labelCategory(e.category) },
      { key:"thPay", get:(e)=>UIService.labelPayment(e.paymentType) },
      { key:"thDesc", get:(e)=> (e.description || "").trim() }
    ];
    if (!rtl) return colsLtr;

    return [
      { key:"thDesc", get:(e)=> (e.description || "").trim() },
      { key:"thPay", get:(e)=>UIService.labelPayment(e.paymentType) },
      { key:"thCat", get:(e)=>UIService.labelCategory(e.category) },
      { key:"colCurrency", get:(e)=>e._cur },
      { key:"thAmount", get:(e)=>e._amountOut },
      { key:"thDate", get:(e)=>e.date }
    ];
  }

  function buildPdfSectionHtml(title, items, cur, totalFmt){
    const cols = pdfColumns();

    const rows = items.map(e => {
      const tds = cols.map(c => `<td>${escapeHtmlPdf(c.get(e))}</td>`).join("");
      return `<tr>${tds}</tr>`;
    }).join("");

    const ths = cols.map(c => `<th>${escapeHtmlPdf(I18N.t(c.key))}</th>`).join("");

    const rtl = (I18N.getLang() === "ar" || I18N.getLang() === "he");

    return `
      <section class="sheet">
        <div class="sheet-head">
          <div class="sheet-title">${escapeHtmlPdf(title)}</div>
        </div>

        <div class="table-wrap">
          <table class="t" dir="${rtl ? "rtl" : "ltr"}">
            <thead><tr>${ths}</tr></thead>
            <tbody>${rows || ""}</tbody>
          </table>
        </div>

        <div class="totals">
          <div class="total-box">
            <div class="lbl">${escapeHtmlPdf(I18N.t("pdfTotal"))}</div>
            <div class="val">${escapeHtmlPdf(totalFmt)}</div>
          </div>
          <div class="total-box">
            <div class="lbl">${escapeHtmlPdf(I18N.t("pdfCurrencyType"))}</div>
            <div class="val">${escapeHtmlPdf(cur)}</div>
          </div>
        </div>
      </section>
    `;
  }

  function exportPdf(list){
    if (!list || list.length === 0){
      alert(I18N.t("msgPdfEmpty"));
      return;
    }

    const rtl = (I18N.getLang() === "ar" || I18N.getLang() === "he");
    const lang = I18N.getLang();
    const cur = currency || "ILS";

    const prep = (arr) => arr
      .slice()
      .sort((a,b) => new Date(a.date) - new Date(b.date))
      .map(e => {
        const out = ratesObj ? ApiService.convertAmount(e.amount, ratesObj, cur) : e.amount;
        return { ...e, _cur: cur, _amountOut: UIService.fmtMoney(out, cur) };
      });

    const sumOut = (arr) => arr.reduce((s,e) => {
      const out = ratesObj ? ApiService.convertAmount(e.amount, ratesObj, cur) : e.amount;
      return s + (Number(out) || 0);
    }, 0);

    const sections = [];

    const allItems = prep(list);
    const allTotal = UIService.fmtMoney(sumOut(list), cur);
    sections.push(buildPdfSectionHtml(pdfAllTitle(), allItems, cur, allTotal));

    const order = ["cash","credit","check"];
    for (const pt of order){
      const items = list.filter(e => e.paymentType === pt);
      if (!items.length) continue;
      const total = UIService.fmtMoney(sumOut(items), cur);
      sections.push(buildPdfSectionHtml(pdfSectionTitle(pt), prep(items), cur, total));
    }

    const title = `${pdfAllTitle()} — ${selectedMonth}`;

    const css = `
      :root{ --b:#111; --g:#fff; }
      body{ margin:0; padding:24px; font-family: system-ui, -apple-system, Segoe UI, Arial; color:#000; background:#fff; }
      h1{ margin:0 0 14px 0; font-size:16px; font-weight:800; }
      .sheet{ margin: 0 0 28px 0; page-break-inside: avoid; }
      .sheet-head{ display:flex; justify-content:flex-end; margin-bottom: 10px; }
      .sheet-title{
        border:2px solid #000;
        padding:8px 14px;
        font-weight:800;
        font-size:16px;
        min-width: 220px;
        text-align:center;
      }

      .table-wrap{ border:2px solid #000; }
      table.t{ width:100%; border-collapse: collapse; }
      th, td{
        border: 1px solid #000;
        padding: 10px 8px;
        font-size: 13px;
        vertical-align: top;
      }
      th{ font-weight: 800; }

      .totals{
        display:flex;
        justify-content: flex-end;
        gap: 0;
        margin-top: -2px;
      }
      .total-box{
        border:2px solid #000;
        display:grid;
        grid-template-columns: 1fr 1fr;
        min-width: 360px;
      }
      .total-box + .total-box{ margin-inline-start: -2px; }
      .total-box .lbl{
        border-inline-end:1px solid #000;
        padding:10px 8px;
        font-weight:800;
        text-align:center;
      }
      .total-box .val{
        padding:10px 8px;
        font-weight:800;
        text-align:center;
      }

      @media print{
        body{ padding: 0; }
        .sheet{ margin: 0 0 22px 0; }
      }
    `;

    const w = window.open("", "_blank");
    if (!w){
      alert(I18N.t("msgPdfOk"));
      return;
    }

    w.document.open();
    w.document.write(`<!doctype html>
<html lang="${escapeHtmlPdf(lang)}" dir="${rtl ? "rtl" : "ltr"}">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${escapeHtmlPdf(title)}</title>
<style>${css}</style>
</head>
<body>
  <h1>${escapeHtmlPdf(title)}</h1>
  ${sections.join("\n")}
<script>
  window.onload = () => {
    try{ window.focus(); }catch(e){}
    setTimeout(() => { window.print(); }, 250);
    setTimeout(() => { window.close(); }, 800);
  };
</script>
</body>
</html>`);
    w.document.close();
    try{ alert(I18N.t("msgPdfOk")); } catch {}
  }

  // --- Prediction + Smart insights (unchanged) ---
  function topCategory(list){
    const m = new Map();
    for (const e of list) m.set(e.category, (m.get(e.category) || 0) + e.amount);
    let best = null;
    for (const [k,v] of m.entries()){
      if (!best || v > best.sum) best = { key: k, sum: v };
    }
    return best;
  }

  function topDay(list){
    const m = new Map();
    for (const e of list) m.set(e.date, (m.get(e.date) || 0) + e.amount);
    let best = null;
    for (const [k,v] of m.entries()){
      if (!best || v > best.sum) best = { key: k, sum: v };
    }
    return best;
  }

  function clearBox(box){ if (box) box.innerHTML = ""; }
  function setPlaceholder(box){ if (box){ clearBox(box); box.textContent = "—"; } }

  function renderKpis(box, headerTitle, headerSub, badge, kpis, footerText){
    if (!box) return;
    clearBox(box);

    const header = document.createElement("div");
    header.className = "insight-header";

    const left = document.createElement("div");
    const t = document.createElement("div");
    t.className = "insight-title";
    t.textContent = headerTitle;

    const s = document.createElement("div");
    s.className = "insight-sub";
    s.textContent = headerSub || "";

    left.appendChild(t);
    if (headerSub) left.appendChild(s);
    header.appendChild(left);

    if (badge){
      const b = document.createElement("span");
      b.className = `badge ${badge.kind || ""}`.trim();
      b.textContent = badge.text;
      header.appendChild(b);
    }

    const grid = document.createElement("div");
    grid.className = "kpi-grid";

    for (const k of kpis){
      const card = document.createElement("div");
      card.className = "kpi";

      const lbl = document.createElement("div");
      lbl.className = "kpi-label";
      lbl.textContent = k.label;

      const val = document.createElement("div");
      val.className = "kpi-value";
      val.textContent = k.value;

      card.appendChild(lbl);
      card.appendChild(val);

      if (k.meta){
        const meta = document.createElement("div");
        meta.className = "kpi-meta";
        meta.textContent = k.meta;
        card.appendChild(meta);
      }
      grid.appendChild(card);
    }

    box.appendChild(header);
    box.appendChild(grid);

    if (footerText){
      const f = document.createElement("div");
      f.className = "insight-footer";
      const call = document.createElement("div");
      call.className = "insight-callout";
      call.textContent = footerText;
      f.appendChild(call);
      box.appendChild(f);
    }
  }

  function renderSmartInsights(monthList){
    if (!smartInsightsBox) return;
    if (!monthList.length){ setPlaceholder(smartInsightsBox); return; }

    const topCat = topCategory(monthList);
    const topD = topDay(monthList);

    const total = monthList.reduce((s,e) => s + e.amount, 0);
    const elapsed = Math.max(1, daysElapsedInMonth(selectedMonth));
    const avgDaily = total / elapsed;

    const kpis = [
      { label: I18N.t("insightsTopCategory"), value: UIService.fmtMoney(topCat ? topCat.sum : 0, "ILS"), meta: topCat ? UIService.labelCategory(topCat.key) : "—" },
      { label: I18N.t("insightsTopDay"), value: topD ? topD.key : "—", meta: topD ? UIService.fmtMoney(topD.sum, "ILS") : "" },
      { label: I18N.t("insightsAvgDaily"), value: UIService.fmtMoney(avgDaily, "ILS"), meta: "" }
    ];

    renderKpis(smartInsightsBox, I18N.t("smartInsightsTitle"), "", null, kpis, null);
  }

  function renderPrediction(monthList, budget){
    if (!predictionBox) return;
    if (!monthList.length){ setPlaceholder(predictionBox); return; }

    const total = monthList.reduce((s,e) => s + e.amount, 0);
    const totalDays = daysInMonth(selectedMonth);
    const elapsed = Math.max(1, daysElapsedInMonth(selectedMonth));
    const avgDaily = total / elapsed;
    const expectedTotal = avgDaily * totalDays;

    const diff = (budget > 0) ? (budget - expectedTotal) : null;

    let badge = null;
    let footer = null;

    if (budget > 0){
      const pct = (total / budget) * 100;
      if (pct >= 100) badge = { kind:"danger", text: I18N.t("badgeExceeded") };
      else if (pct >= 80) badge = { kind:"warn", text: I18N.t("badgeNearBudget") };
      else badge = { kind:"ok", text: I18N.t("badgeWithinBudget") };

      footer = diff >= 0
        ? `${I18N.t("footerLikelyWithin")} ${UIService.fmtMoney(diff, "ILS")}.`
        : `${I18N.t("footerLikelyExceed")} ${UIService.fmtMoney(Math.abs(diff), "ILS")}.`;
    }

    const kpis = [
      { label: I18N.t("predictionAvgDaily"), value: UIService.fmtMoney(avgDaily, "ILS"), meta: `${elapsed}/${totalDays} ${I18N.t("metaDaysSoFar")}` },
      { label: I18N.t("predictionExpectedTotal"), value: UIService.fmtMoney(expectedTotal, "ILS"), meta: I18N.t("metaIfPaceContinues") },
      { label: I18N.t("predictionBudgetDiff"), value: (budget>0) ? UIService.fmtMoney(diff, "ILS") : "—", meta: (budget>0) ? I18N.t("metaBudgetMinusExpected") : I18N.t("metaSetBudgetToCompare") }
    ];

    renderKpis(predictionBox, I18N.t("predictionTitle"), I18N.t("predictionSub"), badge, kpis, footer);
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
    // tabs were removed; keep shortcuts but focus the section anchors:
    if (e.altKey && (e.key === "i" || e.key === "I")){
      e.preventDefault();
      document.getElementById("insightsHeading")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      return;
    }
    if (e.altKey && (e.key === "l" || e.key === "L")){
      e.preventDefault();
      document.getElementById("listHeading")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      return;
    }
  }
  document.addEventListener("keydown", handleShortcuts);

  function render(){
    I18N.applyLang();
    renderCurrencyTiles();
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

    // ✅ charts always visible now
    ChartService.updateCharts(list);
  }

  render();
})();