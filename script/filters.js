/* ====================================================
   F I L T R E S  –  Version boucles natives (for/while)
==================================================== */

import { recipes } from "./recipes.js";
import { renderRecipes } from "./renderCards.js";

/* -------------- Config bench --------------------- */
const ENABLE_BENCH = false; // passe à true pour afficher le temps de filtrage

/* --------------- DOM ----------------------------- */
const searchInput = document.querySelector(".search-bar input");
const tagContainer = document.querySelector(".active-tags");
const recipeCounter = document.querySelector(".recipe-count");
const mainForm = document.getElementById("search-form");

// formulaires secondaires
const ingForm = document.getElementById("ingredient-search-form");
const ingInput = document.getElementById("ingredient-search-input");
const ingList = document.getElementById("ingredient-options");

const appForm = document.getElementById("appliance-search-form");
const appInput = document.getElementById("appliance-search-input");
const appList = document.getElementById("appliance-options");

const ustForm = document.getElementById("ustensil-search-form");
const ustInput = document.getElementById("ustensil-search-input");
const ustList = document.getElementById("ustensil-options");

/* ------------------ ÉTAT ------------------------- */
let activeTags = []; // tags actifs saisis par l'utilisateur
let currentDataset = recipes; // recettes filtrées actuellement affichées

/* --------------- UTILITAIRES --------------------- */
const L = (s) => s.toLowerCase();
const uc = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const setCount = (n) =>
  (recipeCounter.textContent = `${String(n).padStart(2, "0")} recettes`);

/* ---------------- TAGS --------------------------- */
// Crée un tag visuel + bouton de fermeture
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

/* ------------- LISTES UNIQUES -------------------- */
// extrait les éléments à filtrer pour chaque type
const ingOf = (r) => r.ingredients.map((i) => L(i.ingredient));
const appOf = (r) => (r.appliance ? [L(r.appliance)] : []);
const ustOf = (r) => (r.ustensils || []).map(L);

// rend une liste unique triée
const uniq = (src, fn) => [...new Set(src.flatMap(fn))].sort();

// insère les options dans les menus déroulants
function fill(ul, items) {
  ul.innerHTML = "";
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const li = document.createElement("li");
    li.textContent = uc(it);
    li.onclick = () => addTag(it);
    ul.appendChild(li);
  }
}

// met à jour les 3 listes avec le dataset courant
const refreshLists = (src) => {
  fill(ingList, uniq(src, ingOf));
  fill(appList, uniq(src, appOf));
  fill(ustList, uniq(src, ustOf));
};

/* ---------- FILTRAGE (boucles natives) ----------- */
// vérifie si une recette r correspond à un tag t
function matchNative(r, t) {
  const tag = t;
  if (r.name.toLowerCase().includes(tag)) return true;
  if (r.description.toLowerCase().includes(tag)) return true;
  for (let i = 0; i < r.ingredients.length; i++) {
    if (L(r.ingredients[i].ingredient).includes(tag)) return true;
  }
  if (r.appliance && L(r.appliance).includes(tag)) return true;
  if (r.ustensils) {
    for (let i = 0; i < r.ustensils.length; i++) {
      if (L(r.ustensils[i]).includes(tag)) return true;
    }
  }
  return false;
}

// filtre toutes les recettes avec tous les tags (ET logique)
function filterNative(dataset, tags) {
  if (!tags.length) return dataset;
  const out = [];
  for (let i = 0; i < dataset.length; i++) {
    const r = dataset[i];
    let allOK = true;
    for (let j = 0; j < tags.length; j++) {
      if (!matchNative(r, tags[j])) {
        allOK = false;
        break;
      }
    }
    if (allOK) out.push(r);
  }
  return out;
}

// applique le filtrage et met à jour l'affichage
function filterAndRender() {
  const t0 = ENABLE_BENCH ? performance.now() : 0;
  currentDataset = filterNative(recipes, activeTags);
  if (ENABLE_BENCH) {
    const dt = (performance.now() - t0).toFixed(2);
    console.log(
      `[NATIVE] ${activeTags.length} tag(s) – ${currentDataset.length} recettes – ${dt} ms`
    );
  }
  renderRecipes(currentDataset);
  setCount(currentDataset.length);
  refreshLists(currentDataset);
}

/* ---------  AJOUT D’UN TAG (validation) ---------- */
function flashInvalid(target) {
  target.classList.add("invalid");
  setTimeout(() => target.classList.remove("invalid"), 600);
}

function addTag(raw) {
  const q = L(raw.trim());
  if (q.length < 3 || activeTags.includes(q)) return;
  const testDataset = filterNative(currentDataset, [q]);
  if (testDataset.length === 0) {
    flashInvalid(searchInput);
    return;
  }
  activeTags.push(q);
  createTag(q);
  filterAndRender();
}

/* ------------  SOUMISSIONS ----------------------- */
mainForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addTag(searchInput.value);
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

/* -------------- filtre live ---------------------- */
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

/* ------------ MENUS custom-select ---------------- */
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

/* ------------------- INIT ------------------------ */
renderRecipes(recipes);
setCount(recipes.length);
refreshLists(recipes);
