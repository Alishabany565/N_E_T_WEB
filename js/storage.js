(() => {
  const BASE_EXP = "et_expenses_v2";
  const BASE_BUD = "et_budget_month_v1";
  const BASE_RATES = "et_rates_v2";
  const BASE_CUR = "et_currency_v2";

  function safeParse(json, fallback){
    try { return JSON.parse(json); } catch { return fallback; }
  }
  function key(base, userId){ return `${base}_${userId}`; }
  function keyMonth(base, userId, yyyymm){ return `${base}_${userId}_${yyyymm}`; }

  function loadExpenses(userId){
    return safeParse(localStorage.getItem(key(BASE_EXP, userId)), []);
  }
  function saveExpenses(userId, list){
    localStorage.setItem(key(BASE_EXP, userId), JSON.stringify(list));
  }

  function loadBudget(userId, yyyymm){
    const v = localStorage.getItem(keyMonth(BASE_BUD, userId, yyyymm));
    return v ? Number(v) : 0;
  }
  function saveBudget(userId, yyyymm, v){
    localStorage.setItem(keyMonth(BASE_BUD, userId, yyyymm), String(Number(v)||0));
  }

  function loadRates(userId){
    return safeParse(localStorage.getItem(key(BASE_RATES, userId)), null);
  }
  function saveRates(userId, r){
    localStorage.setItem(key(BASE_RATES, userId), JSON.stringify(r));
  }

  function loadCurrency(userId){
    return localStorage.getItem(key(BASE_CUR, userId)) || "ILS";
  }
  function saveCurrency(userId, c){
    localStorage.setItem(key(BASE_CUR, userId), c);
  }

  window.StorageService = {
    loadExpenses, saveExpenses,
    loadBudget, saveBudget,
    loadRates, saveRates,
    loadCurrency, saveCurrency
  };
})();