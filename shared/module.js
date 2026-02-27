const $ = (s) => document.querySelector(s);

function esc(s){
  return (s ?? "").toString()
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
function levelLabel(level){
  if (level === 1) return "Level 1 (kennen / wiedergeben)";
  if (level === 3) return "Level 3 (anwenden / ausführen)";
  if (level === 5) return "Level 5 (erstellen)";
  return level ? `Level ${level}` : "";
}
function normalizeHomeToPath(home){
  let p = (home || "").replace(/^\.\//, "/");
  if (!p.endsWith("/")) p += "/";
  return p;
}

async function boot(){
  const titleEl = $("#modTitle");
  const descEl = $("#modDesc");
  const levelEl = $("#modLevel");
  const objEl = $("#modObjective");
  const topicsEl = $("#modTopics");
  const resEl = $("#modResources");

  const path = window.location.pathname;

  const res = await fetch("../../materials.json", { cache: "no-store" });
  const data = await res.json();
  const modules = data.modules || [];

  const mod = modules.find(x => {
    const homePath = normalizeHomeToPath(x.home);
    return path.endsWith(homePath) || path.endsWith(homePath + "index.html");
  }) || null;

  if (!mod) {
    titleEl.textContent = "Modul nicht gefunden";
    descEl.textContent = "Prüfe materials.json (home-Pfad) und deinen Ordnernamen.";
    levelEl.textContent = "";
    objEl.innerHTML = topicsEl.innerHTML = resEl.innerHTML = "";
    return;
  }

  document.title = mod.title || "Modul";
  titleEl.textContent = mod.title || "Modul";
  descEl.textContent = mod.desc || "";
  levelEl.textContent = levelLabel(mod.level);

  objEl.innerHTML = mod.objective
    ? `<p class="small">${esc(mod.objective)}</p>`
    : `<p class="small muted">Kein Lernzieltext hinterlegt (optional: Feld "objective" in materials.json).</p>`;

  const topics = mod.topics || [];
  topicsEl.innerHTML = topics.length
    ? `<ul class="small">${topics.map(t => `<li>${esc(t)}</li>`).join("")}</ul>`
    : `<p class="small muted">Keine Topics hinterlegt.</p>`;

  const resources = mod.resources || [];
  resEl.innerHTML = resources.length
    ? resources.map(r => `<a href="${esc(r.href)}" target="_blank" rel="noopener">${esc(r.label || r.href)}</a>`).join("")
    : `<p class="small muted">Noch keine Ressourcen verlinkt.</p>`;
}
boot().catch(err => { const el = document.getElementById("fatal"); if (el) el.textContent = String(err); });
