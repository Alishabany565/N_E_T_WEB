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
    return fetch("https://api.quotable.io/random?tags=wisdom|money|success")
      .then(res => res.json())
      .then(data => ({
        content: data.content,
        author: data.author
      }))
      .catch(err => {
        console.error("Quote API error:", err);
        return {
          content: "Track your expenses wisely.",
          author: "Smart Coach"
        };
      });
  }

  window.fetchFinancialQuote = fetchFinancialQuote;
  window.ApiService = { fetchRates, convertAmount, fetchFinancialQuote };
})();
