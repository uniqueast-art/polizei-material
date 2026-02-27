(function () {
  const AUTH_USER = "student";
  const AUTH_PASS = "verygeheim";
  const KEY = "pm_auth_v1";

  function repoRoot() {
    const parts = location.pathname.split("/").filter(Boolean);
    return parts.length ? `/${parts[0]}/` : "/";
  }

  function isAuthed() {
    try { return JSON.parse(localStorage.getItem(KEY) || "null")?.ok === true; }
    catch { return false; }
  }

  function setAuthed() { localStorage.setItem(KEY, JSON.stringify({ ok: true, t: Date.now() })); }
  function logout() { localStorage.removeItem(KEY); location.href = repoRoot(); }

  function showLogin(nextUrl) {
    document.body.innerHTML = `
      <div style="max-width:420px;margin:10vh auto;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;padding:16px">
        <h1 style="font-size:20px;margin:0 0 10px 0">Login</h1>
        <form id="f" style="display:grid;gap:10px">
          <input id="u" placeholder="User" autocomplete="username" style="padding:10px 12px;border:1px solid #ddd;border-radius:10px">
          <input id="p" placeholder="Passwort" type="password" autocomplete="current-password" style="padding:10px 12px;border:1px solid #ddd;border-radius:10px">
          <button style="padding:10px 12px;border:1px solid #ddd;border-radius:10px;background:#fff;cursor:pointer">Anmelden</button>
          <div id="msg" style="color:#b00020;font-size:13px"></div>
        </form>
      </div>
    `;
    document.getElementById("f").addEventListener("submit", (e) => {
      e.preventDefault();
      const u = document.getElementById("u").value || "";
      const p = document.getElementById("p").value || "";
      if (u === AUTH_USER && p === AUTH_PASS) { setAuthed(); location.href = nextUrl || repoRoot(); }
      else document.getElementById("msg").textContent = "Falscher User oder Passwort.";
    });
  }

  function requireAuth() {
    if (isAuthed()) {
      const b = document.createElement("button");
      b.textContent = "Logout";
      b.style.cssText = "position:fixed;top:12px;right:12px;z-index:9999;padding:6px 10px;border:1px solid #ddd;border-radius:10px;background:#fff;cursor:pointer;font-size:12px";
      b.addEventListener("click", logout);
      (document.body ? document.body : document.documentElement).appendChild(b);
      return;
    }

    const root = repoRoot();
    const here = location.pathname + location.search + location.hash;

    if (location.pathname !== root) {
      location.href = root + "?next=" + encodeURIComponent(here);
      return;
    }

    const url = new URL(location.href);
    const next = url.searchParams.get("next");
    const nextUrl = next ? (root.replace(/\/$/, "") + next) : root;

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => showLogin(nextUrl));
    else showLogin(nextUrl);
  }

  window.PM_AUTH = { requireAuth };
})();
