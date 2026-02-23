(() => {
  const KEY_BIG = "et_a11y_big_v2";
  const KEY_CON = "et_a11y_con_v2";
  const KEY_UND = "et_a11y_und_v2";

  function apply(){
    const big = localStorage.getItem(KEY_BIG) === "1";
    const con = localStorage.getItem(KEY_CON) === "1";
    const und = localStorage.getItem(KEY_UND) === "1";

    document.body.classList.toggle("a11y-bigtext", big);
    document.body.classList.toggle("a11y-contrast", con);
    document.body.classList.toggle("a11y-underline", und);
  }

  function setFlag(key, val){
    localStorage.setItem(key, val ? "1" : "0");
    apply();
  }

  function toggle(kind){
    if (kind === "bigtext"){
      setFlag(KEY_BIG, localStorage.getItem(KEY_BIG) !== "1");
    } else if (kind === "contrast"){
      setFlag(KEY_CON, localStorage.getItem(KEY_CON) !== "1");
    } else if (kind === "underline"){
      setFlag(KEY_UND, localStorage.getItem(KEY_UND) !== "1");
    } else if (kind === "reset"){
      setFlag(KEY_BIG, false);
      setFlag(KEY_CON, false);
      setFlag(KEY_UND, false);
    }
  }

  let lastFocused = null;
  let trapHandler = null;

  function openPanel(){
    const panel = document.getElementById("a11yPanel");
    const fab = document.getElementById("a11yFab");
    if (!panel || !fab) return;

    lastFocused = document.activeElement;
    panel.hidden = false;
    fab.setAttribute("aria-expanded", "true");

    const focusable = panel.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
    const items = Array.from(focusable);
    if (items.length) items[0].focus();

    trapHandler = (e) => {
      if (e.key === "Escape"){
        e.preventDefault();
        closePanel();
        return;
      }
      if (e.key !== "Tab") return;
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    };

    panel.addEventListener("keydown", trapHandler);
  }

  function closePanel(){
    const panel = document.getElementById("a11yPanel");
    const fab = document.getElementById("a11yFab");
    if (!panel || !fab) return;

    panel.hidden = true;
    fab.setAttribute("aria-expanded", "false");

    if (trapHandler){
      panel.removeEventListener("keydown", trapHandler);
      trapHandler = null;
    }

    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    else fab.focus();
    lastFocused = null;
  }

  function init(){
    apply();

    const fab = document.getElementById("a11yFab");
    const closeBtn = document.getElementById("a11yClose");
    const panel = document.getElementById("a11yPanel");

    fab?.addEventListener("click", () => {
      if (panel && !panel.hidden) closePanel();
      else openPanel();
    });

    closeBtn?.addEventListener("click", closePanel);

    panel?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-a11y]");
      if (!btn) return;
      toggle(btn.getAttribute("data-a11y"));
    });

    document.addEventListener("click", (e) => {
      if (!panel || panel.hidden) return;
      const inside = panel.contains(e.target);
      const isFab = fab && fab.contains(e.target);
      if (!inside && !isFab) closePanel();
    });
  }

  window.A11Y = { init, apply };
})();