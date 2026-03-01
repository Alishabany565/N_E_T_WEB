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
    // make sure we only use "en" / "ar" / "he"
    const rawLang = (window.I18N?.getLang ? I18N.getLang() : (document.documentElement.lang || "en"));
    const lang = String(rawLang).slice(0, 2).toLowerCase();
    const target = (lang === "ar" || lang === "he") ? lang : "en";
  
    const adviceUrl = `https://api.adviceslip.com/advice?ts=${Date.now()}`;
  
    async function translateWithMyMemory(text, to){
      if (!text || to === "en") return text;
  
      const params = new URLSearchParams({
        q: text,
        langpair: `en|${to}`
      });
  
      const url = `https://api.mymemory.translated.net/get?${params}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("MYMEMORY_HTTP_FAIL");
      const data = await res.json();
      const out = data?.responseData?.translatedText;
      return out || text;
    }
  
    return fetch(adviceUrl, { cache: "no-store" })
      .then(res => {
        if (!res.ok) throw new Error("QUOTE_FETCH_FAIL");
        return res.json();
      })
      .then(async data => {
        const original =
          data?.slip?.advice ||
          (window.I18N?.t ? I18N.t("quoteFallbackText") : "Track your expenses wisely.");
  
        const translated = await translateWithMyMemory(original, target);
  
        return {
          content: translated,
          author: "AdviceSlip" // خليه ثابت زي ما بدك
        };
      })
      .catch(err => {
        console.error("Quote API error:", err);
        const fallbackContent = window.I18N?.t ? I18N.t("quoteFallbackText") : "Track your expenses wisely.";
        return { content: fallbackContent, author: "AdviceSlip" };
      });
  }
  window.fetchFinancialQuote = fetchFinancialQuote;
  window.ApiService = { fetchRates, convertAmount, fetchFinancialQuote };
})();
