(() => {
  A11Y.init();
  I18N.applyLang();

  const langSelect = document.getElementById("langSelect");
  if (langSelect){
    langSelect.value = I18N.getLang();
    langSelect.addEventListener("change", () => {
      I18N.setLang(langSelect.value);
    });
  }

  const loginModal = document.getElementById("loginModal");
  const registerModal = document.getElementById("registerModal");
  const btnOpenLogin = document.getElementById("btnOpenLogin");
  const btnOpenRegister = document.getElementById("btnOpenRegister");

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const loginErrors = document.getElementById("loginErrors");
  const registerErrors = document.getElementById("registerErrors");

  function showErr(el, msg){
    el.style.display = msg ? "block" : "none";
    el.textContent = msg || "";
  }

  if (Auth.getSession()){
    window.location.href = "app.html";
    return;
  }

  let lastFocused = null;
  function trapFocus(modal){
    lastFocused = document.activeElement;
    const focusable = modal.querySelectorAll("button, input, select, textarea, a[href]");
    const items = Array.from(focusable);
    if (items.length) items[0].focus();

    modal._trap = (e) => {
      if (e.key !== "Tab") return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    };
    modal.addEventListener("keydown", modal._trap);
  }
  function releaseFocus(modal){
    if (modal?._trap) modal.removeEventListener("keydown", modal._trap);
    if (lastFocused) lastFocused.focus();
  }

  function openModal(m){ m.hidden = false; trapFocus(m); }
  function closeModal(m){ m.hidden = true; releaseFocus(m); }

  btnOpenLogin?.addEventListener("click", () => openModal(loginModal));
  btnOpenRegister?.addEventListener("click", () => openModal(registerModal));

  document.querySelectorAll("[data-close='login']").forEach(b => b.addEventListener("click", () => closeModal(loginModal)));
  document.querySelectorAll("[data-close='register']").forEach(b => b.addEventListener("click", () => closeModal(registerModal)));

  document.getElementById("toRegister")?.addEventListener("click", () => { closeModal(loginModal); openModal(registerModal); });
  document.getElementById("toLogin")?.addEventListener("click", () => { closeModal(registerModal); openModal(loginModal); });

  [loginModal, registerModal].forEach(m => {
    m?.addEventListener("click", (e) => { if (e.target === m) closeModal(m); });
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (loginModal && !loginModal.hidden) closeModal(loginModal);
    if (registerModal && !registerModal.hidden) closeModal(registerModal);
  });

  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    showErr(loginErrors, "");
    try{
      await Auth.login({
        email: document.getElementById("loginEmail").value.trim(),
        password: document.getElementById("loginPassword").value
      });
      window.location.href = "app.html";
    } catch {
      showErr(loginErrors, I18N.t("msgLoginFail"));
    }
  });

  registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    showErr(registerErrors, "");
    try{
      await Auth.register({
        fullName: document.getElementById("regName").value.trim(),
        email: document.getElementById("regEmail").value.trim(),
        password: document.getElementById("regPassword").value
      });
      window.location.href = "app.html";
    } catch {
      showErr(registerErrors, I18N.t("msgRegisterFail"));
    }
  });
})();