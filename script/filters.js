/* =========================================================
   F I L T R E S
========================================================= */
import { recipes } from "./recipes.js";
import { renderRecipes } from "./renderCards.js";

/* -------------------- Config bench --------------------- */
const ENABLE_BENCH = false; // passe à true pour mesurer le temps de filtrage

/* -------------------- DOM ------------------------------ */
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

/* ----------------------- ÉTAT -------------------------- */
let activeTags = []; // tags actifs en minuscule
let currentDataset = recipes; // sous-ensemble courant

/* -------------------- UTILITAIRES ---------------------- */
const toLower = (s) => s.toLowerCase();
const normalize = (s) => toLower(String(s).trim());
const capitalizeFirst = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const setRecipeCount = (n) => {
  recipeCounter.textContent = `${String(n).padStart(2, "0")} recettes`;
};

/* --------------------- TAGS UI ------------------------- */
function createTagChip(label) {
  const chip = document.createElement("span");
  chip.className = "tag";
  chip.textContent = label;

  const close = document.createElement("button");
  close.textContent = "×";
  close.onclick = () => {
    activeTags = activeTags.filter((t) => t !== label);
    chip.remove();
    applyFiltersAndRender();
  };

  chip.appendChild(close);
  tagContainer.appendChild(chip);
}

/* --------------- EXTRACTION DES FACETTES --------------- */
const ingredientsOf = (r) => r.ingredients.map((i) => toLower(i.ingredient));
const applianceOf = (r) => (r.appliance ? [toLower(r.appliance)] : []);
const utensilsOf = (r) => (r.ustensils || []).map(toLower);

const uniqueSorted = (src, extractor) =>
  [...new Set(src.flatMap(extractor))].sort();

/* Remplit une <ul> avec des <li> cliquables */
function populateList(ul, items) {
  ul.innerHTML = "";
  items.forEach((val) => {
    const li = document.createElement("li");
    li.textContent = capitalizeFirst(val);
    li.onclick = () => addTag(val);
    ul.appendChild(li);
  });
}

/* Recalcule les listes (ingrédients, appareils, ustensiles) d’après le dataset courant */
const refreshFacetLists = (src) => {
  populateList(ingList, uniqueSorted(src, ingredientsOf));
  populateList(appList, uniqueSorted(src, applianceOf));
  populateList(ustList, uniqueSorted(src, utensilsOf));
};

/* ----------------- MOTEUR DE FILTRAGE ------------------ */
/** Renvoie true si la recette r “matche” le terme t (t est déjà en minuscule) */
function doesRecipeMatchTerm(r, t) {
  return (
    r.name.toLowerCase().includes(t) ||
    r.description.toLowerCase().includes(t) ||
    r.ingredients.some((i) => toLower(i.ingredient).includes(t)) ||
    (r.appliance && toLower(r.appliance).includes(t)) ||
    (r.ustensils && r.ustensils.some((u) => toLower(u).includes(t)))
  );
}

/** Filtre un dataset par un ensemble de tags (ET logique) */
function filterRecipesByTags(dataset, tags) {
  if (!tags.length) return dataset;
  return dataset.filter((r) => tags.every((t) => doesRecipeMatchTerm(r, t)));
}

/* --------------- APPLICATION + RENDU ------------------- */
function applyFiltersAndRender() {
  const t0 = ENABLE_BENCH ? performance.now() : 0;

  currentDataset = filterRecipesByTags(recipes, activeTags);

  if (ENABLE_BENCH) {
    const dt = (performance.now() - t0).toFixed(2);
    console.log(
      `[filter] ${activeTags.length} tag(s) – ${currentDataset.length} recettes – ${dt} ms`
    );
  }

  renderRecipes(currentDataset);
  setRecipeCount(currentDataset.length);
  refreshFacetLists(currentDataset);
}

/* ----------- AJOUT D’UN TAG (validation) --------------- */
function addTag(raw) {
  const q = normalize(raw);
  if (q.length < 3 || activeTags.includes(q)) return;

  activeTags.push(q);
  createTagChip(q);
  applyFiltersAndRender();
}

/* -------------------- SOUMISSIONS ---------------------- */
// Chemin principal (barre de recherche)
mainForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addTag(searchInput.value);
  searchInput.value = "";
});

// Soumissions restreintes — n’autorisent que les valeurs proposées
function handleRestrictedSubmit(e, input, extractor) {
  e.preventDefault();
  const q = normalize(input.value);
  if (uniqueSorted(currentDataset, extractor).includes(q)) addTag(q);
  input.value = "";
}
ingForm.addEventListener("submit", (e) =>
  handleRestrictedSubmit(e, ingInput, ingredientsOf)
);
appForm.addEventListener("submit", (e) =>
  handleRestrictedSubmit(e, appInput, applianceOf)
);
ustForm.addEventListener("submit", (e) =>
  handleRestrictedSubmit(e, ustInput, utensilsOf)
);

/* ------------------- FILTRE LIVE ----------------------- */
[
  [ingInput, ingList],
  [appInput, appList],
  [ustInput, ustList],
].forEach(([inp, list]) => {
  inp.addEventListener("input", () => {
    const v = normalize(inp.value);
    list.querySelectorAll("li").forEach((li) => {
      li.style.display = li.textContent.toLowerCase().includes(v) ? "" : "none";
    });
  });
});

/* ----------------- MENUS custom-select ----------------- */
document.querySelectorAll(".select-header").forEach((header) => {
  header.addEventListener("click", () =>
    header.closest(".custom-select").classList.toggle("active")
  );
});
document.addEventListener("click", (e) => {
  document.querySelectorAll(".custom-select").forEach((sel) => {
    if (!sel.contains(e.target)) sel.classList.remove("active");
  });
});

/* ------------------------ INIT ------------------------- */
renderRecipes(recipes);
setRecipeCount(recipes.length);
refreshFacetLists(recipes);