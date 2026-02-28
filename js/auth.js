(() => {
  const KEY_USERS = "et_users_v2";
  const KEY_SESSION = "et_session_v2";

  function loadUsers(){
    try { return JSON.parse(localStorage.getItem(KEY_USERS)) || []; }
    catch { return []; }
  }
  function saveUsers(users){
    localStorage.setItem(KEY_USERS, JSON.stringify(users));
  }

  function getSession(){
    try { return JSON.parse(localStorage.getItem(KEY_SESSION)); }
    catch { return null; }
  }
  function setSession(s){
    localStorage.setItem(KEY_SESSION, JSON.stringify(s));
  }
  function clearSession(){
    localStorage.removeItem(KEY_SESSION);
  }

  async function hashPassword(pw){
    const enc = new TextEncoder().encode(pw);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("");
  }

  async function register({ fullName, email, password }){
    const users = loadUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())){
      throw new Error("EMAIL_EXISTS");
    }
    const passHash = await hashPassword(password);
    const user = { id: crypto.randomUUID(), fullName, email, passHash, createdAt: Date.now() };
    users.push(user);
    saveUsers(users);
    const displayName = String(user.fullName || "").trim() || String(user.email || "").split("@")[0] || "";
    setSession({ userId: user.id, fullName: user.fullName, email: user.email, displayName });
    return user;
  }

  async function login({ email, password }){
    const users = loadUsers();
    const u = users.find(x => x.email.toLowerCase() === email.toLowerCase());
    if (!u) throw new Error("INVALID");
    const passHash = await hashPassword(password);
    if (passHash !== u.passHash) throw new Error("INVALID");
    const displayName = String(u.fullName || "").trim() || String(u.email || "").split("@")[0] || "";
    setSession({ userId: u.id, fullName: u.fullName, email: u.email, displayName });
    return u;
  }

  function logout(){
    clearSession();
  }

  function requireAuthOrRedirect(){
    const s = getSession();
    if (!s) window.location.href = "index.html";
    return s;
  }

  window.Auth = { register, login, logout, getSession, requireAuthOrRedirect };
})();
