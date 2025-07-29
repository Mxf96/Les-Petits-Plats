/* =========================================================
   F I L T R E S
======================================================== */
import { recipes } from "./recipes.js";
import { renderRecipes } from "./renderCards.js";

/* -------------------- DOM ----------------------------- */
const searchInput = document.querySelector(".search-bar input");
const tagContainer = document.querySelector(".active-tags");
const recipeCounter = document.querySelector(".recipe-count");
const mainForm = document.getElementById("search-form");

/* filtres secondaires */
const ingForm = document.getElementById("ingredient-search-form");
const ingInput = document.getElementById("ingredient-search-input");
const ingList = document.getElementById("ingredient-options");

const appForm = document.getElementById("appliance-search-form");
const appInput = document.getElementById("appliance-search-input");
const appList = document.getElementById("appliance-options");

const ustForm = document.getElementById("ustensil-search-form");
const ustInput = document.getElementById("ustensil-search-input");
const ustList = document.getElementById("ustensil-options");

/* ----------------------- ÉTAT ------------------------- */
let activeTags = [];
let currentDataset = recipes; // sous‑ensemble visible

/* -------------------- UTILITAIRES --------------------- */
const L = (s) => s.toLowerCase();
const uc = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const setCount = (n) =>
  (recipeCounter.textContent = `${String(n).padStart(2, "0")} recettes`);

/* --------------------- TAGS --------------------------- */
function createTag(label) {
  const span = document.createElement("span");
  span.className = "tag";
  span.textContent = label;
  const close = document.createElement("button");
  close.textContent = "×";
  close.onclick = () => {
    activeTags = activeTags.filter((t) => t !== label);
    span.remove();
    filterAndRender();
  };
  span.appendChild(close);
  tagContainer.appendChild(span);
}

/* ------------------ LISTES UNIQUES -------------------- */
const ingOf = (r) => r.ingredients.map((i) => L(i.ingredient));
const appOf = (r) => (r.appliance ? [L(r.appliance)] : []);
const ustOf = (r) => (r.ustensils || []).map(L);

const uniq = (src, fn) => [...new Set(src.flatMap(fn))].sort();

function fill(ul, items) {
  ul.innerHTML = "";
  items.forEach((it) => {
    const li = document.createElement("li");
    li.textContent = uc(it);
    li.onclick = () => addTag(it); // clic garanti valide
    ul.appendChild(li);
  });
}
const refreshLists = (src) => {
  fill(ingList, uniq(src, ingOf));
  fill(appList, uniq(src, appOf));
  fill(ustList, uniq(src, ustOf));
};

/* ----------------- FILTRAGE / RENDU ------------------ */
const match = (r, t) =>
  r.name.toLowerCase().includes(t) ||
  r.description.toLowerCase().includes(t) ||
  r.ingredients.some((i) => L(i.ingredient).includes(t)) ||
  (r.appliance && L(r.appliance).includes(t)) ||
  (r.ustensils && r.ustensils.some((u) => L(u).includes(t)));

function filterAndRender() {
  currentDataset = activeTags.length
    ? recipes.filter((r) => activeTags.every((t) => match(r, t)))
    : recipes;

  renderRecipes(currentDataset);
  setCount(currentDataset.length);
  refreshLists(currentDataset);
}

/* --------------  AJOUT D’UN TAG (validation) ---------- */
function flashInvalid(target) {
  target.classList.add("invalid");
  setTimeout(() => target.classList.remove("invalid"), 600);
}
function addTag(raw) {
  const q = L(raw);
  if (q.length < 3 || activeTags.includes(q)) return;

  /* simulation : si le nouveau tag mettrait le compte à 0, on refuse */
  const testDataset = currentDataset.filter((r) => match(r, q));
  if (testDataset.length === 0) {
    flashInvalid(searchInput); // petit feedback visuel
    return;
  }

  activeTags.push(q);
  createTag(q);
  filterAndRender();
}

/* -----------------  SOUMISSIONS ----------------------- */
mainForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addTag(searchInput.value.trim());
  searchInput.value = "";
});

function submitRestricted(e, input, getList) {
  e.preventDefault();
  const q = L(input.value.trim());
  if (uniq(currentDataset, getList).includes(q)) addTag(q);
  input.value = "";
}
ingForm.addEventListener("submit", (e) => submitRestricted(e, ingInput, ingOf));
appForm.addEventListener("submit", (e) => submitRestricted(e, appInput, appOf));
ustForm.addEventListener("submit", (e) => submitRestricted(e, ustInput, ustOf));

/* ------------------- filtre live ---------------------- */
[
  [ingInput, ingList],
  [appInput, appList],
  [ustInput, ustList],
].forEach(([inp, list]) => {
  inp.addEventListener("input", () => {
    const v = L(inp.value.trim());
    list.querySelectorAll("li").forEach((li) => {
      li.style.display = li.textContent.toLowerCase().includes(v) ? "" : "none";
    });
  });
});

/* ------------------ AUTOCOMPLÉTION -------------------- */
const TERMS = (() => {
  const s = new Set();
  recipes.forEach((r) => {
    [
      r.name,
      ...ingOf(r).map(uc),
      ...appOf(r).map(uc),
      ...ustOf(r).map(uc),
    ].forEach((w) => {
      if (w) s.add(w.toLowerCase());
    });
  });
  return [...s]
    .map(uc)
    .sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));
})();
const box = document.createElement("ul");
box.id = "global-suggestions";
Object.assign(box.style, {
  position: "absolute",
  zIndex: 1000,
  display: "none",
});
document.body.appendChild(box);

const mark = (t, q) =>
  t.replace(
    new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig"),
    (m) => `<mark>${m}</mark>`
  );
const placeBox = () => {
  const r = searchInput.getBoundingClientRect();
  box.style.left = `${window.scrollX + r.left}px`;
  box.style.top = `${window.scrollY + r.bottom + 10}px`;
  box.style.width = `${r.width}px`;
};

let idx = -1;
function show(q) {
  const v = q.trim().toLowerCase();
  if (v.length < 2) {
    box.style.display = "none";
    return;
  }
  const hits = TERMS.filter((t) => t.toLowerCase().includes(v)).slice(0, 12);
  if (!hits.length) {
    box.style.display = "none";
    return;
  }

  box.innerHTML = "";
  idx = -1;
  hits.forEach((h) => {
    const li = document.createElement("li");
    li.innerHTML = mark(h, v);
    li.onclick = () => {
      addTag(h);
      searchInput.value = "";
      box.style.display = "none";
    };
    box.appendChild(li);
  });
  placeBox();
  box.style.display = "block";
}

searchInput.addEventListener("input", (e) => show(e.target.value));
searchInput.addEventListener("focus", () => {
  if (searchInput.value.trim().length >= 2) show(searchInput.value);
});
window.addEventListener("resize", () => {
  if (box.style.display !== "none") placeBox();
});
window.addEventListener(
  "scroll",
  () => {
    if (box.style.display !== "none") placeBox();
  },
  { passive: true }
);
searchInput.addEventListener("keydown", (e) => {
  const items = [...box.querySelectorAll("li")];
  if (box.style.display === "none" || !items.length) return;
  if (e.key === "ArrowDown") {
    e.preventDefault();
    idx = (idx + 1) % items.length;
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    idx = (idx - 1 + items.length) % items.length;
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (idx >= 0) items[idx].click();
    return;
  } else if (e.key === "Escape") {
    box.style.display = "none";
    return;
  }
  items.forEach((li, i) => li.classList.toggle("is-focused", i === idx));
});

/* ----------------- MENUS custom-select ---------------- */
document.querySelectorAll(".select-header").forEach((h) => {
  h.addEventListener("click", () =>
    h.closest(".custom-select").classList.toggle("active")
  );
});
document.addEventListener("click", (e) => {
  document.querySelectorAll(".custom-select").forEach((sel) => {
    if (!sel.contains(e.target)) sel.classList.remove("active");
  });
});

/* ------------------------ INIT ------------------------ */
renderRecipes(recipes);
setCount(recipes.length);
refreshLists(recipes);