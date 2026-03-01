(() => {
  A11Y.init();
  I18N.applyLang();

  const THEME_KEY = "et_theme_v1";
  function getTheme(){
    return localStorage.getItem(THEME_KEY) || "dark";
  }
  function applyTheme(){
    const t = getTheme();
    document.documentElement.setAttribute("data-theme", t === "light" ? "light" : "dark");
  }

  applyTheme();

  const langSelect = document.getElementById("langSelect");
  if (langSelect){
    langSelect.value = I18N.getLang();
    langSelect.addEventListener("change", () => {
      I18N.setLang(langSelect.value);
    });
  }

  if (Auth.getSession()){
    window.location.href = "app.html";
    return;
  }

  const landingView = document.getElementById("landingView");
  const loginView = document.getElementById("loginView");
  const registerView = document.getElementById("registerView");

  const btnOpenLogin = document.getElementById("btnOpenLogin");
  const btnOpenRegister = document.getElementById("btnOpenRegister");
  const toRegister = document.getElementById("toRegister");
  const toLogin = document.getElementById("toLogin");

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const loginErrors = document.getElementById("loginErrors");
  const registerErrors = document.getElementById("registerErrors");

  function showErr(el, msg){
    if (!el) return;
    el.style.display = msg ? "block" : "none";
    el.textContent = msg || "";
  }

  function showView(view){
    if (!landingView || !loginView || !registerView) return;

    landingView.hidden = view !== "landing";
    loginView.hidden = view !== "login";
    registerView.hidden = view !== "register";

    if (view === "login") document.getElementById("loginEmail")?.focus();
    if (view === "register") document.getElementById("regName")?.focus();
  }

  btnOpenLogin?.addEventListener("click", () => showView("login"));
  btnOpenRegister?.addEventListener("click", () => showView("register"));
  toRegister?.addEventListener("click", () => showView("register"));
  toLogin?.addEventListener("click", () => showView("login"));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape"){
      showView("landing");
    }
  });

  loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    showErr(loginErrors, "");

    try{
      await Auth.login({
        email: document.getElementById("loginEmail")?.value.trim() || "",
        password: document.getElementById("loginPassword")?.value || ""
      });
      window.location.href = "app.html";
    } catch {
      showErr(loginErrors, I18N.t("msgLoginFail"));
    }
  });

  registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    showErr(registerErrors, "");

    const fullName = document.getElementById("regName")?.value.trim() || "";
    const email = document.getElementById("regEmail")?.value.trim() || "";
    const password = document.getElementById("regPassword")?.value || "";
    const confirmPassword = document.getElementById("regConfirmPassword")?.value || "";

    if (password !== confirmPassword){
      showErr(registerErrors, I18N.t("msgPasswordMismatch"));
      return;
    }

    try{
      await Auth.register({ fullName, email, password });
      window.location.href = "app.html";
    } catch {
      showErr(registerErrors, I18N.t("msgRegisterFail"));
    }
  });
})();
