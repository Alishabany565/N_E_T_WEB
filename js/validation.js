(() => {
  const MAX_AMOUNT = 100000;

  function isFutureDate(dateStr){
    const d = new Date(dateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    return d.getTime() > today.getTime();
  }

  function validateExpense(raw){
    const errors = [];

    if (!raw){
      errors.push("errMissing");
      return errors;
    }

    if (!raw.amount && raw.amount !== 0) errors.push("errAmountReq");
    if (!raw.date) errors.push("errDateReq");
    if (!raw.paymentType) errors.push("errPayReq");
    if (!raw.category) errors.push("errCatReq");
    if (errors.length) return errors;

    const amountNum = Number(raw.amount);
    if (!Number.isFinite(amountNum)) errors.push("errAmountNum");
    if (raw.date && Number.isNaN(new Date(raw.date).getTime())) errors.push("errDateInvalid");
    if (errors.length) return errors;

    if (amountNum <= 0) errors.push("errAmountMin");
    if (amountNum > MAX_AMOUNT) errors.push("errAmountMax");
    if (isFutureDate(raw.date)) errors.push("errFutureDate");
    if (errors.length) return errors;

    const s = String(raw.amount);
    const dot = s.indexOf(".");
    if (dot !== -1 && s.length - dot - 1 > 2) errors.push("errDecimals");
    if (raw.description && raw.description.length > 60) errors.push("errDescLen");

    return errors;
  }

  function normalizeExpense(raw){
    return {
      id: raw.id || crypto.randomUUID(),
      amount: Number(raw.amount),
      date: raw.date,
      paymentType: raw.paymentType,
      category: raw.category,
      description: (raw.description || "").trim(),
      createdAt: raw.createdAt || Date.now(),
      updatedAt: Date.now()
    };
  }

  window.ValidationService = { validateExpense, normalizeExpense };
})();