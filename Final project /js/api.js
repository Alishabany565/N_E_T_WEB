(() => {
  async function fetchRates(baseCurrency){
    const base = baseCurrency || "ILS";
    const url = `https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("FETCH_FAIL");
    const data = await res.json();
    if (data.result !== "success" || !data.rates) throw new Error("BAD_DATA");
    return {
      base: data.base_code,
      timeLastUpdate: data.time_last_update_utc,
      rates: data.rates
    };
  }

  function convertAmount(amount, ratesObj, targetCurrency){
    if (!ratesObj || !ratesObj.rates) return amount;
    const rate = ratesObj.rates[targetCurrency];
    if (!rate || !Number.isFinite(rate)) return amount;
    return amount * rate;
  }

  window.ApiService = { fetchRates, convertAmount };
})();