/* =========================================================
   F I L T R E S 
======================================================== */
import { recipes } from "./recipes.js";
import { renderRecipes } from "./renderCards.js";

/* -------------------- Config bench --------------------- */
const ENABLE_BENCH = false; // passe à true pour logguer le temps de filtre

/* -------------------- DOM ----------------------------- */
const searchInput = document.querySelector(".search-bar input");
const tagContainer = document.querySelector(".active-tags");
const recipeCounter = document.querySelector(".recipe-count");
const mainForm = document.getElementById("search-form");

/* filtres secondaires (inchangé) */
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
let currentDataset = recipes;

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
    li.onclick = () => addTag(it);
    ul.appendChild(li);
  });
}
const refreshLists = (src) => {
  fill(ingList, uniq(src, ingOf));
  fill(appList, uniq(src, appOf));
  fill(ustList, uniq(src, ustOf));
};

/* ----------------- FILTRAGE (fonctionnel) ------------- */
const matchFP = (r, t) =>
  r.name.toLowerCase().includes(t) ||
  r.description.toLowerCase().includes(t) ||
  r.ingredients.some((i) => L(i.ingredient).includes(t)) ||
  (r.appliance && L(r.appliance).includes(t)) ||
  (r.ustensils && r.ustensils.some((u) => L(u).includes(t)));

function filterFunctional(dataset, tags) {
  if (!tags.length) return dataset;
  return dataset.filter((r) => tags.every((t) => matchFP(r, t)));
}

function filterAndRender() {
  const t0 = ENABLE_BENCH ? performance.now() : 0;

  currentDataset = filterFunctional(recipes, activeTags);

  if (ENABLE_BENCH) {
    const dt = (performance.now() - t0).toFixed(2);
    console.log(
      `[FP] ${activeTags.length} tag(s) – ${currentDataset.length} recettes – ${dt} ms`
    );
  }

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
  const q = L(raw.trim());
  if (q.length < 3 || activeTags.includes(q)) return;

  // Simulation pour le champ principal (focus du test)
  const testDataset = filterFunctional(currentDataset, [q]);
  if (testDataset.length === 0) {
    flashInvalid(searchInput);
    return;
  }

  activeTags.push(q);
  createTag(q);
  filterAndRender();
}

/* -----------------  SOUMISSIONS ----------------------- */
// → c'est CE chemin (champ principal) qui est au cœur du test
mainForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addTag(searchInput.value);
  searchInput.value = "";
});

// secondaires : ne laissent passer que les valeurs proposées
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