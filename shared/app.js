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
    (m.topics || []).join(" "),
    (m.resources || []).map(r => (r.label||"") + " " + (r.href||"")).join(" ")
  ].join(" | ");
  return norm(hay).includes(norm(query));
}

function render(modules, query){
  const filtered = modules
    .filter(m => matchesModule(m, query))
    .sort((a,b) => (a.order ?? 999) - (b.order ?? 999));

  stats.textContent = `${filtered.length} / ${modules.length} Module`;

  cards.innerHTML = filtered.map(m => `
    <article class="card">
      <div>
        <h3>${m.title}</h3>
        <p>${m.desc || ""}</p>
      </div>

      <div class="tags">
        ${(m.tags || []).slice(0,6).map(t => `<span class="tag">${t}</span>`).join("")}
        ${m.level ? `<span class="tag">Level ${m.level}</span>` : ""}
      </div>

      <hr/>

      <div class="links">
        ${(m.resources || []).map(r => `<a href="${r.href}" target="_blank" rel="noopener">${r.label}</a>`).join("")}
      </div>

      <div class="small">Update: ${m.updated || "-"}</div>
    </article>
  `).join("");
}

async function boot(){
  const res = await fetch("./materials.json", { cache: "no-store" });
  DATA = await res.json();
  render(DATA.modules || [], "");
}

q.addEventListener("input", () => render(DATA.modules || [], q.value.trim()));
clearBtn.addEventListener("click", () => { q.value = ""; render(DATA.modules || [], ""); q.focus(); });

boot().catch(err => {
  stats.textContent = "Fehler beim Laden von materials.json";
  cards.innerHTML = `<pre class="card">${String(err)}</pre>`;
});
