const $ = (s) => document.querySelector(s);
const cards = $("#cards");
const stats = $("#stats");
const q = $("#q");
const clearBtn = $("#clear");
let DATA = null;

function norm(s){
  return (s || "").toString().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu,"");
}

function matchesModule(m, query){
  if(!query) return true;
  const hay = [
    m.title, m.desc, m.objective,
    (m.tags || []).join(" "),
    (m.topics || []).join(" ")
  ].join(" | ");
  return norm(hay).includes(norm(query));
}

function countMaterialFiles(m){
  const home = (m.home || "").trim();
  const res = (m.resources || []);
  // Zähle alles außer dem Modulseiten-Link selbst (home endet i.d.R. mit /)
  return res.filter(r => (r.href || "").trim() && (r.href || "").trim() !== home).length;
}

function render(modules, query){
  const filtered = modules
    .filter(m => matchesModule(m, query))
    .sort((a,b) => (a.order ?? 999) - (b.order ?? 999));

  stats.textContent = `${filtered.length} / ${modules.length} Module`;

  cards.innerHTML = filtered.map(m => {
    const href = m.home || "#";
    const nFiles = countMaterialFiles(m);
    return `
      <article class="card cardlink" role="link" tabindex="0" data-href="${href}">
        <div>
          <h3 class="title">${m.title}</h3>
          <p class="muted">${m.desc || ""}</p>
        </div>

        <div class="tags">
          ${(m.tags || []).slice(0,6).map(t => `<span class="tag">${t}</span>`).join("")}
          ${m.level ? `<span class="tag">Level ${m.level}</span>` : ""}
        </div>

        <hr/>

        <div class="cardfooter">
          <a class="modlink" href="${href}">Modulseite</a>
          <span class="small muted">${nFiles ? `${nFiles} Datei(en)` : ""}</span>
        </div>
      </article>
    `;
  }).join("");
}

async function boot(){
  const res = await fetch("./materials.json", { cache: "no-store" });
  DATA = await res.json();
  render(DATA.modules || [], "");
}

q.addEventListener("input", () => render(DATA.modules || [], q.value.trim()));
clearBtn.addEventListener("click", () => { q.value = ""; render(DATA.modules || [], ""); q.focus(); });

// Ganze Karte klickbar (ohne echte <a>-Klicks zu kapern)
cards.addEventListener("click", (ev) => {
  const a = ev.target.closest("a");
  if (a) return;
  const card = ev.target.closest(".cardlink");
  if (!card) return;
  const href = card.getAttribute("data-href");
  if (href && href !== "#") window.location.href = href;
});

cards.addEventListener("keydown", (ev) => {
  const card = ev.target.closest(".cardlink");
  if (!card) return;
  if (ev.key === "Enter" || ev.key === " ") {
    ev.preventDefault();
    const href = card.getAttribute("data-href");
    if (href && href !== "#") window.location.href = href;
  }
});

boot().catch(err => {
  stats.textContent = "Fehler beim Laden von materials.json";
  cards.innerHTML = `<pre class="card">${String(err)}</pre>`;
});
