// app.js
(() => {
  function startApp(){
  if (window.A11Y?.init) A11Y.init();
  if (window.I18N?.applyLang) I18N.applyLang();
  if (!window.I18N || !window.Auth?.requireAuthOrRedirect || !window.StorageService || !window.UIService || !window.ValidationService || !window.ApiService){
    console.warn("[App] Required services are missing.");
    return;
  }

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
      if (icon) icon.textContent = (t === "light") ? "â˜€" : "â˜¾";
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
  if (!session || !session.userId) return;
  const userId = session.userId;

  const PERSONAL_DETAILS = [
    { first: "Ali", last: "Shabany", id: "212428569" },
    { first: "Tala", last: "Jabaren", id: "22222222" }
  ];

  const loadedExpenses = StorageService.loadExpenses(userId);
  let expenses = Array.isArray(loadedExpenses) ? loadedExpenses : [];
  let currency = StorageService.loadCurrency(userId);
  let ratesObj = StorageService.loadRates(userId);

  function asArray(v){
    return Array.isArray(v) ? v : [];
  }

  function monthKey(dateStr){
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  }
  function currentMonthKey(){
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  }
  function daysInMonth(yyyymm){
    if (!/^\d{4}-\d{2}$/.test(yyyymm || "")) return 30;
    const [y,m] = yyyymm.split("-").map(Number);
    return new Date(y, m, 0).getDate();
  }
  function daysElapsedInMonth(yyyymm){
    if (!/^\d{4}-\d{2}$/.test(yyyymm || "")) return 1;
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

  function initQuoteFeature(){
    const quoteText = document.getElementById("quoteText");
    const quoteAuthor = document.getElementById("quoteAuthor");
    const refreshBtn = document.getElementById("btnRefreshQuote");

    if (!quoteText || !quoteAuthor) return;

    function loadQuote(){
      quoteText.textContent = I18N.t("quoteLoading");
      quoteAuthor.textContent = "";
      if (typeof fetchFinancialQuote !== "function"){
        quoteText.textContent = `"${I18N.t("quoteFallbackText")}"`;
        quoteAuthor.textContent = "— AdviceSlip";
        return;
      }
      fetchFinancialQuote().then(q => {
        quoteText.textContent = `"${q.content}"`;
        quoteAuthor.textContent = "— AdviceSlip";
      });
    }

    loadQuote();

    if (refreshBtn){
      refreshBtn.addEventListener("click", loadQuote);
    }

    document.addEventListener("i18n:changed", loadQuote);
  }

  function initPersonalDetailsModal(){
    const btn = document.getElementById("btnPersonal");
    const modal = document.getElementById("personalModal");
    const closeBtn = document.getElementById("closePersonalModal");
    const overlay = modal ? modal.querySelector(".modal-overlay") : null;

    if (!btn || !modal){
      console.warn("[PersonalModal] Missing required elements.");
      return;
    }

    function openModal(){
      closeMenu();
      modal.hidden = false;
    }

    function closeModal(){
      modal.hidden = true;
    }

    btn.addEventListener("click", openModal);

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (overlay) overlay.addEventListener("click", closeModal);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  const featureWarned = {};
  function warnOnce(key, message){
    if (featureWarned[key]) return;
    featureWarned[key] = true;
    console.warn(message);
  }

  function parseNumericText(value){
    if (value == null) return NaN;
    const cleaned = String(value)
      .replace(/,/g, "")
      .replace(/[^\d.-]/g, "");
    if (!cleaned || cleaned === "-" || cleaned === "." || cleaned === "-.") return NaN;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : NaN;
  }

  function getSessionDisplayName(){
    const direct = String(session?.displayName || "").trim();
    if (direct) return direct.split(/\s+/)[0];

    const fullName = String(session?.fullName || "").trim();
    if (fullName) return fullName.split(/\s+/)[0];

    const email = String(session?.email || "").trim();
    if (email) return email.split("@")[0];

    return "";
  }

  function initWelcomeCard(){
    const welcomeTitleEl = document.getElementById("welcomeTitle");
    const welcomeSubEl = document.getElementById("welcomeSub");
    const welcomeDateEl = document.getElementById("welcomeDate");
    if (!welcomeTitleEl || !welcomeSubEl || !welcomeDateEl){
      warnOnce("welcomeCard", "[WelcomeCard] Missing welcome card elements.");
      return;
    }

    const today = new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(new Date());

    const displayName = getSessionDisplayName();

    welcomeTitleEl.textContent = displayName
      ? I18N.t("welcomeTitleNamed").replace("{name}", displayName)
      : I18N.t("welcomeTitleGuest");
    welcomeDateEl.textContent = today;
  }

  function updateSpendingAlert(){
    const alertEl = document.getElementById("spendingAlert");
    const alertIconEl = document.getElementById("alertIcon");
    const alertTitleEl = document.getElementById("alertTitle");
    const alertMsgEl = document.getElementById("alertMsg");
    if (!alertEl || !alertIconEl || !alertTitleEl || !alertMsgEl){
      warnOnce("spendingAlert", "[SmartSpendingAlert] Missing alert elements.");
      return;
    }

    const spentRaw = monthTotalEl?.textContent || "";
    const budgetRaw = budgetInput?.value || "";

    const spentNum = parseNumericText(spentRaw);
    const budgetNum = parseNumericText(budgetRaw);
    const spent = Number.isFinite(spentNum) ? spentNum : 0;
    const budget = Number.isFinite(budgetNum) ? budgetNum : 0;

    alertEl.classList.remove("alert-high", "alert-warn", "alert-mid");

    if (!(budget > 0)){
      alertEl.hidden = true;
      return;
    }

    const ratio = spent / budget;

    if (ratio >= 1){
      alertEl.classList.add("alert-high");
      alertIconEl.textContent = "⚠️";
      alertTitleEl.textContent = I18N.t("alertBudgetExceededTitle");
      alertMsgEl.textContent = I18N.t("alertBudgetExceededMsg");
      alertEl.hidden = false;
      return;
    }

    if (ratio >= 0.85){
      alertEl.classList.add("alert-warn");
      alertIconEl.textContent = "⚠️";
      alertTitleEl.textContent = I18N.t("alertBudgetWarningTitle");
      alertMsgEl.textContent = I18N.t("alertBudgetWarningMsg");
      alertEl.hidden = false;
      return;
    }

    if (ratio >= 0.6){
      alertEl.classList.add("alert-mid");
      alertIconEl.textContent = "💡";
      alertTitleEl.textContent = I18N.t("alertSpendingInsightTitle");
      alertMsgEl.textContent = I18N.t("alertSpendingInsightMsg");
      alertEl.hidden = false;
      return;
    }

    alertEl.hidden = true;
  }

  function previousMonthKey(month){
    if (!month || typeof month !== "string") return "";
    const parts = month.split("-");
    if (parts.length !== 2) return "";
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    if (!Number.isFinite(y) || !Number.isFinite(m)) return "";

    const d = new Date(y, m - 2, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  function expenseMonthKey(exp){
    if (!exp || typeof exp !== "object") return null;

    if (typeof exp.date === "string"){
      const m = exp.date.match(/^(\d{4})-(\d{2})/);
      if (m) return `${m[1]}-${m[2]}`;
    }

    const d = new Date(exp.date);
    if (Number.isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  function expenseAmount(exp){
    if (!exp || typeof exp !== "object") return null;
    if (typeof exp.amount === "number" && Number.isFinite(exp.amount)) return exp.amount;

    const n = parseNumericText(exp.amount);
    return Number.isFinite(n) ? n : null;
  }

  function updateMonthlyComparison(){
    const compareEl = document.getElementById("compareValue");
    if (!compareEl){
      warnOnce("monthlyCompareEl", "[MonthlyComparison] Missing #compareValue element.");
      return;
    }

    compareEl.classList.remove("compare-up", "compare-down", "compare-flat");

    if (!Array.isArray(expenses)){
      warnOnce("monthlyCompareData", "[MonthlyComparison] Expenses data is not an array.");
      compareEl.textContent = "â€”";
      compareEl.classList.add("compare-flat");
      return;
    }

    const currentKey = currentMonthKey();
    const prevKey = previousMonthKey(currentKey);
    let thisMonthTotal = 0;
    let lastMonthTotal = 0;
    let schemaWarned = false;

    for (const exp of asArray(expenses)){
      const mKey = expenseMonthKey(exp);
      const amt = expenseAmount(exp);

      if (!mKey || !Number.isFinite(amt)){
        if (!schemaWarned){
          schemaWarned = true;
          console.warn("[MonthlyComparison] Unknown expense schema detected; some rows skipped.");
        }
        continue;
      }

      if (mKey === currentKey) thisMonthTotal += amt;
      if (mKey === prevKey) lastMonthTotal += amt;
    }

    const diff = thisMonthTotal - lastMonthTotal;
    const pct = lastMonthTotal === 0
      ? (diff === 0 ? 0 : 100)
      : Math.round(Math.abs((diff / lastMonthTotal) * 100));

    const absDiff = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(Math.abs(diff));

    if (diff > 0){
      compareEl.textContent = `+${absDiff} (↑ ${pct}%)`;
      compareEl.classList.add("compare-up");
      return;
    }

    if (diff < 0){
      compareEl.textContent = `-${absDiff} (↓ ${pct}%)`;
      compareEl.classList.add("compare-down");
      return;
    }

    compareEl.textContent = "0 (→ 0%)";
    compareEl.classList.add("compare-flat");
  }

  function getUserId(){
    if (typeof userId !== "undefined" && userId) return userId;
    if (typeof currentUserId !== "undefined" && currentUserId) return currentUserId;
    return "default";
  }

  function parseAmount(x){
    if (typeof x === "number") return Number.isFinite(x) ? x : 0;
    const cleaned = String(x ?? "")
      .replace(/,/g, "")
      .replace(/[^\d.-]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }

  function parseDateToKey(dateString){
    if (!dateString) return null;
    const raw = String(dateString).trim();

    let m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m){
      const y = Number(m[1]);
      const mo = Number(m[2]);
      const d = Number(m[3]);
      const dt = new Date(y, mo - 1, d);
      if (dt.getFullYear() === y && dt.getMonth() + 1 === mo && dt.getDate() === d){
        return `${String(y).padStart(4, "0")}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      }
      return null;
    }

    m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m){
      const mo = Number(m[1]);
      const d = Number(m[2]);
      const y = Number(m[3]);
      const dt = new Date(y, mo - 1, d);
      if (dt.getFullYear() === y && dt.getMonth() + 1 === mo && dt.getDate() === d){
        return `${String(y).padStart(4, "0")}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      }
      return null;
    }

    const dt = new Date(raw);
    if (Number.isNaN(dt.getTime())) return null;
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  }

  function getSelectedMonth(){
    const value = monthSelect?.value;
    if (value && /^\d{4}-\d{2}$/.test(value)){
      const [year, month] = value.split("-").map(Number);
      return { year, month };
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }

  function renderHeatmap(){
    const grid = document.getElementById("heatmapGrid");
    const hint = document.getElementById("heatmapHint");
    if (!grid || !hint){
      warnOnce("heatmapMissing", "[Heatmap] Missing #heatmapGrid or #heatmapHint.");
      return;
    }

    const uid = getUserId();
    const loaded = StorageService.loadExpenses(uid);
    const list = Array.isArray(loaded) ? loaded : [];

    const { year, month } = getSelectedMonth();
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstWeekday = new Date(year, month - 1, 1).getDay();

    const totalsByDate = {};
    for (const exp of asArray(list)){
      const rawDate = exp?.date ?? exp?.day;
      const rawAmount = exp?.amount ?? exp?.value;
      const key = parseDateToKey(rawDate);
      if (!key) continue;

      const [yy, mm] = key.split("-").map(Number);
      if (yy !== year || mm !== month) continue;
      totalsByDate[key] = (totalsByDate[key] || 0) + parseAmount(rawAmount);
    }

    let maxDaily = 0;
    for (let day = 1; day <= daysInMonth; day++){
      const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const total = totalsByDate[key] || 0;
      if (total > maxDaily) maxDaily = total;
    }

    grid.innerHTML = "";

    for (let i = 0; i < firstWeekday; i++){
      const empty = document.createElement("div");
      empty.className = "day-cell empty";
      empty.setAttribute("aria-hidden", "true");
      grid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++){
      const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayTotal = totalsByDate[dateKey] || 0;
      const level = maxDaily === 0 ? 0 : Math.max(0, Math.min(4, Math.round((dayTotal / maxDaily) * 4)));

      const cell = document.createElement("div");
      cell.className = `day-cell h${level}`;
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("tabindex", "0");
      cell.textContent = String(day);

      if (dayTotal > 0){
        const amt = document.createElement("span");
        amt.className = "amt";
        amt.textContent = `₪${dayTotal.toFixed(0)}`;
        cell.appendChild(amt);
      }

      const showHint = () => {
        if (dayTotal === 0){
          hint.textContent = I18N.t("heatmapNoSpending");
        } else {
          hint.textContent = I18N.t("heatmapDateSpent")
            .replace("{date}", dateKey)
            .replace("{amount}", dayTotal.toFixed(2));
        }
      };

      cell.addEventListener("click", showHint);
      cell.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " "){
          e.preventDefault();
          showHint();
        }
      });

      grid.appendChild(cell);
    }
  }

  if (helloUser){
    const name = session.displayName || session.fullName || session.email || "";
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
    if (!monthSelect) return;

    const current = currentMonthKey();
    const monthsSet = new Set([current]);

    asArray(expenses).forEach((e) => {
      const mk = monthKey(e?.date);
      if (/^\d{4}-\d{2}$/.test(mk)) monthsSet.add(mk);
    });

    const months = Array.from(monthsSet).sort((a, b) => b.localeCompare(a));

    if (!months.includes(selectedMonth)){
      selectedMonth = current;
    }

    monthSelect.innerHTML = months
      .map((m) => {
        const tag = m === current ? ` - ${I18N.t("currentMonthLabel")}` : "";
        return `<option value="${m}">${m}${tag}</option>`;
      })
      .join("");

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
    const submitBtn = form?.querySelector("button[type='submit']");
    if (submitBtn) submitBtn.disabled = locked;

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
    const keyMap = {
      ILS: "currencyNameILS",
      USD: "currencyNameUSD",
      EUR: "currencyNameEUR",
      GBP: "currencyNameGBP",
      JOD: "currencyNameJOD"
    };
    return keyMap[code] ? I18N.t(keyMap[code]) : code;
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
        <div class="currency-tag">${I18N.t("convertTag")}</div>
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
    rateInfo.textContent = `${I18N.t("rateBase")}: ${ratesObj.base} • ${ratesObj.timeLastUpdate}`;
  }

  function isPossibleDuplicate(normalized){
    const windowMs = 60 * 1000;
    const t = Date.now();
    return asArray(expenses).some(e => {
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
      if (date) date.value = raw.date;
    }

    if (raw.id){
      const old = asArray(expenses).find(e => e.id === raw.id);
      if (old) raw.createdAt = old.createdAt;
    }

    const errors = ValidationService.validateExpense(raw);
    UIService.showErrors(formErrors, errors);
    if (errors.length) return;

    const normalized = ValidationService.normalizeExpense(raw);

    if (!raw.id && isPossibleDuplicate(normalized)){
      if (!confirm(I18N.t("msgPossibleDup"))) return;
    }

    const safeExpenses = asArray(expenses);
    if (raw.id){
      expenses = safeExpenses.map(e => e.id === normalized.id ? normalized : e);
    } else {
      safeExpenses.push(normalized);
      expenses = safeExpenses;
    }

    StorageService.saveExpenses(userId, expenses);
    buildMonthOptions();
    resetForm();
    render();
    document.dispatchEvent(new Event("expenses:changed"));
  }

  function onEdit(id){
    if (isLocked()) return;
    const e = asArray(expenses).find(x => x.id === id);
    if (!e) return;

    if (!expenseId || !amount || !date || !paymentType || !category || !description || !btnCancelEdit) return;

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
    expenses = asArray(expenses).filter(x => x.id !== id);
    StorageService.saveExpenses(userId, expenses);
    buildMonthOptions();
    render();
    document.dispatchEvent(new Event("expenses:changed"));
  }

  function resetForm(){
    if (!expenseId || !amount || !paymentType || !category || !description || !btnCancelEdit) return;

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
    return asArray(expenses).filter(e => monthKey(e.date) === selectedMonth);
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

    let list = window.FilterService?.applyFilters ? FilterService.applyFilters(base, f) : base;
    list = window.FilterService?.applySort ? FilterService.applySort(list, sortBy?.value || "date_desc") : (list || []);
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
    const sorted = [...asArray(list)].sort((a,b) => new Date(a.date) - new Date(b.date));

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
    const safeList = asArray(list);
    if (safeList.length === 0){
      alert(I18N.t("msgCsvEmpty"));
      return;
    }

    const cur = currency || "ILS";
    const order = ["cash","credit","check"];

    const main = buildCsvTable(safeList, cur);

    const lines = [];
    lines.push("\ufeff" + main.header);
    lines.push(...main.rows);
    lines.push("");

    const groups = new Map(order.map(pt => [pt, []]));
    for (const e of safeList){
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
    return I18N.t("pdfAllTitle");
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

    const rows = asArray(items).map(e => {
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
    const safeList = asArray(list);
    if (safeList.length === 0){
      alert(I18N.t("msgPdfEmpty"));
      return;
    }

    const rtl = (I18N.getLang() === "ar" || I18N.getLang() === "he");
    const lang = I18N.getLang();
    const cur = currency || "ILS";

    const prep = (arr) => asArray(arr)
      .slice()
      .sort((a,b) => new Date(a.date) - new Date(b.date))
      .map(e => {
        const out = ratesObj ? ApiService.convertAmount(e.amount, ratesObj, cur) : e.amount;
        return { ...e, _cur: cur, _amountOut: UIService.fmtMoney(out, cur) };
      });

    const sumOut = (arr) => asArray(arr).reduce((s,e) => {
      const out = ratesObj ? ApiService.convertAmount(e.amount, ratesObj, cur) : e.amount;
      return s + (Number(out) || 0);
    }, 0);

    const sections = [];

    const allItems = prep(safeList);
    const allTotal = UIService.fmtMoney(sumOut(safeList), cur);
    sections.push(buildPdfSectionHtml(pdfAllTitle(), allItems, cur, allTotal));

    const order = ["cash","credit","check"];
    for (const pt of order){
      const items = safeList.filter(e => e.paymentType === pt);
      if (!items.length) continue;
      const total = UIService.fmtMoney(sumOut(items), cur);
      sections.push(buildPdfSectionHtml(pdfSectionTitle(pt), prep(items), cur, total));
    }

    const title = `${pdfAllTitle()} â€” ${selectedMonth}`;

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
    for (const e of asArray(list)) m.set(e.category, (m.get(e.category) || 0) + e.amount);
    let best = null;
    for (const [k,v] of m.entries()){
      if (!best || v > best.sum) best = { key: k, sum: v };
    }
    return best;
  }

  function topDay(list){
    const m = new Map();
    for (const e of asArray(list)) m.set(e.date, (m.get(e.date) || 0) + e.amount);
    let best = null;
    for (const [k,v] of m.entries()){
      if (!best || v > best.sum) best = { key: k, sum: v };
    }
    return best;
  }

  function clearBox(box){ if (box) box.innerHTML = ""; }
  function setPlaceholder(box){ if (box){ clearBox(box); box.textContent = "â€”"; } }

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

    for (const k of (kpis || [])){
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
    const safeMonthList = asArray(monthList);
    if (!smartInsightsBox) return;
    if (!safeMonthList.length){ setPlaceholder(smartInsightsBox); return; }

    const topCat = topCategory(safeMonthList);
    const topD = topDay(safeMonthList);

    const total = safeMonthList.reduce((s,e) => s + e.amount, 0);
    const elapsed = Math.max(1, daysElapsedInMonth(selectedMonth));
    const avgDaily = total / elapsed;

    const kpis = [
      { label: I18N.t("insightsTopCategory"), value: UIService.fmtMoney(topCat ? topCat.sum : 0, "ILS"), meta: topCat ? UIService.labelCategory(topCat.key) : "â€”" },
      { label: I18N.t("insightsTopDay"), value: topD ? topD.key : "â€”", meta: topD ? UIService.fmtMoney(topD.sum, "ILS") : "" },
      { label: I18N.t("insightsAvgDaily"), value: UIService.fmtMoney(avgDaily, "ILS"), meta: "" }
    ];

    renderKpis(smartInsightsBox, I18N.t("smartInsightsTitle"), "", null, kpis, null);
  }

  function renderPrediction(monthList, budget){
    const safeMonthList = asArray(monthList);
    if (!predictionBox) return;
    if (!safeMonthList.length){ setPlaceholder(predictionBox); return; }

    const total = safeMonthList.reduce((s,e) => s + e.amount, 0);
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
      { label: I18N.t("predictionBudgetDiff"), value: (budget>0) ? UIService.fmtMoney(diff, "ILS") : "â€”", meta: (budget>0) ? I18N.t("metaBudgetMinusExpected") : I18N.t("metaSetBudgetToCompare") }
    ];

    renderKpis(predictionBox, I18N.t("predictionTitle"), I18N.t("predictionSub"), badge, kpis, footer);
  }

  function renderBudgetProgress(monthTotal, budget){
    if (!budgetBar || !budgetPctLabel || !budgetProgressHint) return;

    if (!budget || budget <= 0){
      budgetPctLabel.textContent = "â€”";
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
      budgetProgressHint.textContent = I18N.t("badgeExceeded");
    } else if (pct >= 80){
      budgetBar.style.background = "rgba(245,166,35,.78)";
      budgetProgressHint.textContent = I18N.t("badgeNearBudget");
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
    initWelcomeCard();
    renderCurrencyTiles();
    buildMonthOptions();
    applyLockUI();

    const locked = isLocked();
    const list = asArray(getFilteredList());

    if (emptyState) emptyState.hidden = list.length !== 0;

    UIService.renderTable(tbody, list, currency, onEdit, onDelete, ratesObj, locked);
    if (countEl) countEl.textContent = String(list.length);

    const monthTotal = asArray(getMonthListOnly()).reduce((s,e) => s + e.amount, 0);
    const budget = StorageService.loadBudget(userId, selectedMonth);

    if (monthTotalEl) monthTotalEl.textContent = UIService.fmtMoney(monthTotal, "ILS");

    const remaining = (budget > 0) ? (budget - monthTotal) : 0;
    if (monthRemainingEl) monthRemainingEl.textContent = budget > 0 ? UIService.fmtMoney(remaining, "ILS") : "â€”";

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

    updateSpendingAlert();
    updateMonthlyComparison();
    renderHeatmap();

    renderBudgetProgress(monthTotal, budget);
    renderPrediction(getMonthListOnly(), budget);
    renderSmartInsights(getMonthListOnly());

    updateRateInfo(false);

    // âœ… charts always visible now
    if (window.ChartService?.updateCharts){
      ChartService.updateCharts(list);
    }
  }

  document.addEventListener("expenses:changed", renderHeatmap);

  initQuoteFeature();
  initPersonalDetailsModal();
  initWelcomeCard();
  updateSpendingAlert();
  updateMonthlyComparison();
  renderHeatmap();
  render();

  }

  if (document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", startApp, { once: true });
  } else {
    startApp();
  }
})();

function initTabs(){
  const tabList = document.getElementById("tabList");
  const tabInsights = document.getElementById("tabInsights");
  const panelList = document.getElementById("panelList");
  const panelInsights = document.getElementById("panelInsights");

  if(!tabList || !tabInsights || !panelList || !panelInsights){
    console.warn("Tabs missing");
    return;
  }

  function show(which){
    const isList = which === "list";

    panelList.hidden = !isList;
    panelInsights.hidden = isList;

    tabList.classList.toggle("is-active", isList);
    tabInsights.classList.toggle("is-active", !isList);

    tabList.setAttribute("aria-selected", isList);
    tabInsights.setAttribute("aria-selected", !isList);
  }

  tabList.addEventListener("click", () => show("list"));
  tabInsights.addEventListener("click", () => show("insights"));

  show("list");
}

document.addEventListener("DOMContentLoaded", initTabs);

