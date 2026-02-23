(() => {
  function fmtMoney(v, currency){
    const n = Number(v) || 0;
    const locale = document.documentElement.lang || "en";
    try{
      return new Intl.NumberFormat(locale, { style:"currency", currency: currency || "ILS" }).format(n);
    } catch {
      return new Intl.NumberFormat("en", { style:"currency", currency: currency || "ILS" }).format(n);
    }
  }

  function escapeHtml(s){
    return String(s)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  function showErrors(el, errorKeys){
    if (!errorKeys || !errorKeys.length){
      el.style.display = "none";
      el.innerHTML = "";
      return;
    }
    el.style.display = "block";
    const items = errorKeys.map(k => `<li>${escapeHtml(I18N.t(k))}</li>`).join("");
    el.innerHTML = `<ul>${items}</ul>`;
  }

  function labelPayment(v){
    if (v === "cash") return I18N.t("payCash");
    if (v === "credit") return I18N.t("payCredit");
    if (v === "check") return I18N.t("payCheck");
    return v || "";
  }

  function labelCategory(v){
    const map = {
      clothes: "catClothes",
      entertainment: "catEntertainment",
      fuel: "catFuel",
      food: "catFood",
      bills: "catBills",
      health: "catHealth",
      education: "catEducation",
      other: "catOther"
    };
    return map[v] ? I18N.t(map[v]) : (v || "");
  }

  function renderTable(tbody, list, currency, onEdit, onDelete, ratesObj, locked){
    tbody.innerHTML = "";

    for (const e of list){
      const tr = document.createElement("tr");

      const amountConverted = ratesObj ? ApiService.convertAmount(e.amount, ratesObj, currency) : e.amount;
      const amountHtml = `
        <div>${escapeHtml(fmtMoney(e.amount, "ILS"))}</div>
        <div class="hint">(${escapeHtml(fmtMoney(amountConverted, currency))})</div>
      `;

      const desc = e.description ? escapeHtml(e.description) : "";

      const actionsHtml = locked
        ? `<span class="hint">${escapeHtml(I18N.t("lockedMonth"))}</span>`
        : `
          <div class="row-actions">
            <button class="btn" type="button" data-act="edit" data-id="${escapeHtml(e.id)}">${escapeHtml(I18N.t("edit"))}</button>
            <button class="btn danger" type="button" data-act="del" data-id="${escapeHtml(e.id)}">${escapeHtml(I18N.t("del"))}</button>
          </div>
        `;

      tr.innerHTML = `
        <td>${escapeHtml(e.date)}</td>
        <td>${amountHtml}</td>
        <td>${escapeHtml(labelCategory(e.category))}</td>
        <td>${escapeHtml(labelPayment(e.paymentType))}</td>
        <td>${desc}</td>
        <td>${actionsHtml}</td>
      `;
      tbody.appendChild(tr);
    }

    if (locked) return;

    tbody.querySelectorAll("button[data-act='edit']").forEach(btn => {
      btn.addEventListener("click", () => onEdit(btn.getAttribute("data-id")));
    });
    tbody.querySelectorAll("button[data-act='del']").forEach(btn => {
      btn.addEventListener("click", () => onDelete(btn.getAttribute("data-id")));
    });
  }

  function budgetMessage(total, budget){
    if (!budget || budget <= 0){
      return I18N.getLang() === "he" ? "לא הוגדר תקציב." : (I18N.getLang() === "ar" ? "لم يتم تحديد ميزانية." : "No budget set.");
    }
    const pct = (total / budget) * 100;
    if (pct < 80) return `${pct.toFixed(0)}%`;
    if (pct < 100) return `${pct.toFixed(0)}% • ${I18N.getLang() === "he" ? "מתקרב לתקציב" : (I18N.getLang() === "ar" ? "قريب من الميزانية" : "Near budget")}`;
    return `${pct.toFixed(0)}% • ${I18N.getLang() === "he" ? "חריגה" : (I18N.getLang() === "ar" ? "تجاوز" : "Exceeded")}`;
  }

  window.UIService = {
    fmtMoney,
    showErrors,
    renderTable,
    budgetMessage,
    labelPayment,
    labelCategory
  };
})();