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

  function fetchFinancialQuote(){
    const url = `https://api.adviceslip.com/advice?ts=${Date.now()}`;
    return fetch(url, { cache: "no-store" })
      .then(res => {
        if (!res.ok) throw new Error("QUOTE_FETCH_FAIL");
        return res.json();
      })
      .then(data => ({
        content: data?.slip?.advice || (window.I18N?.t ? I18N.t("quoteFallbackText") : "Track your expenses wisely."),
        author: "AdviceSlip"
      }))
      .catch(err => {
        console.error("Quote API error:", err);
        const fallbackContent = window.I18N?.t ? I18N.t("quoteFallbackText") : "Track your expenses wisely.";
        const fallbackAuthor = "AdviceSlip";
        return {
          content: fallbackContent,
          author: fallbackAuthor
        };
      });
  }

  window.fetchFinancialQuote = fetchFinancialQuote;
  window.ApiService = { fetchRates, convertAmount, fetchFinancialQuote };
})();
