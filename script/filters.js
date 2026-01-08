/* ====================================================
   F I L T R E S – Version boucles natives (for/while)
==================================================== */

import { recipes } from "./recipes.js";
import { renderRecipes } from "./renderCards.js";

/* -------------- Config bench --------------------- */
const ENABLE_BENCH = false;

/* --------------- DOM ----------------------------- */
const searchInput = document.querySelector(".search-bar input");
const tagContainer = document.querySelector(".active-tags");
const recipeCounter = document.querySelector(".recipe-count");

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
let activeTags = [];
let currentDataset = recipes;
let mainSearchTerm = "";

/* --------------- UTILITAIRES --------------------- */
const toLower = (s) => s.toLowerCase();
const normalize = (s) => toLower(String(s).trim());
const capitalizeFirst = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const setRecipeCount = (n) => {
  recipeCounter.textContent = `${String(n).padStart(2, "0")} recettes`;
};

/* ---------------- TAGS --------------------------- */
function createTag(label) {
  const span = document.createElement("span");
  span.className = "tag";
  span.textContent = label;

  const close = document.createElement("button");
  close.textContent = "×";
  close.onclick = () => {
    activeTags = activeTags.filter((t) => t !== label);
    span.remove();
    applyFiltersAndRender();
  };

  span.appendChild(close);
  tagContainer.appendChild(span);
}

/* ------------- LISTES UNIQUES -------------------- */
const ingredientsOf = (r) => r.ingredients.map((i) => toLower(i.ingredient));
const applianceOf = (r) => (r.appliance ? [toLower(r.appliance)] : []);
const utensilsOf = (r) => (r.ustensils || []).map(toLower);

const uniqueSorted = (src, extractor) =>
  [...new Set(src.flatMap(extractor))].sort();

function populateList(ul, items) {
  ul.innerHTML = "";
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const li = document.createElement("li");
    li.textContent = capitalizeFirst(it);
    li.onclick = () => addTag(it);
    ul.appendChild(li);
  }
}

const refreshFacetLists  = (src) => {
  populateList(ingList, uniqueSorted(src, ingredientsOf));
  populateList(appList, uniqueSorted(src, applianceOf));
  populateList(ustList, uniqueSorted(src, utensilsOf));
};

/* ---------- FILTRAGE (boucles natives) ----------- */
function matchNative(r, term) {
  const t = term;

  if (r.name.toLowerCase().includes(t)) return true;
  if (r.description.toLowerCase().includes(t)) return true;

  for (let i = 0; i < r.ingredients.length; i++) {
    if (toLower(r.ingredients[i].ingredient).includes(t)) return true;
  }

  if (r.appliance && toLower(r.appliance).includes(t)) return true;

  if (r.ustensils) {
    for (let i = 0; i < r.ustensils.length; i++) {
      if (toLower(r.ustensils[i]).includes(t)) return true;
    }
  }

  return false;
}

function filterNative(dataset, tags) {
  if (!tags.length) return dataset;

  const out = [];

  for (let i = 0; i < dataset.length; i++) {
    const r = dataset[i];
    let ok = true;

    for (let j = 0; j < tags.length; j++) {
      if (!matchNative(r, tags[j])) {
        ok = false;
        break;
      }
    }
    if (ok) out.push(r);
  }

  return out;
}

/* --------- APPLICATION + RENDU ------------------- */
function applyFiltersAndRender() {
  const t0 = ENABLE_BENCH ? performance.now() : 0;

  let filtered = filterNative(recipes, activeTags);

  // Ajout de la recherche principale
  if (mainSearchTerm.length >= 3) {
    const term = mainSearchTerm;
    const out = [];

    for (let i = 0; i < filtered.length; i++) {
      if (matchNative(filtered[i], term)) out.push(filtered[i]);
    }
    filtered = out;
  }

  if (ENABLE_BENCH) {
    console.log(
      `[NATIVE] ${activeTags.length} tag(s), ${filtered.length} recettes – ${(
        performance.now() - t0
      ).toFixed(2)} ms`
    );
  }

  currentDataset = filtered;
  renderRecipes(filtered);
  setRecipeCount(filtered.length);
  refreshFacetLists(filtered);
}

/* ---------  AJOUT D’UN TAG (validation) ---------- */
function flashInvalid(target) {
  target.classList.add("invalid");
  setTimeout(() => target.classList.remove("invalid"), 600);
}

function addTag(raw) {
  const q = normalize(raw);
  if (q.length < 3 || activeTags.includes(q)) return;

  const test = filterNative(currentDataset, [q]);
  if (test.length === 0) {
    flashInvalid(searchInput);
    return;
  }

  activeTags.push(q);
  createTag(q);
  applyFiltersAndRender();
}

/* ------------  SOUMISSIONS ----------------------- */
/* ❗ NOUVEAU COMPORTEMENT : la barre principale ne crée plus de tag */
mainForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = L(searchInput.value.trim());

  if (q.length >= 3) {
    mainSearchTerm = q;
  } else {
    mainSearchTerm = "";
  }

  applyFiltersAndRender();
});

/* Soumissions secondaires */
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



/* -------------- filtre live ---------------------- */
function LiveFilter(inputEl, listEl) {
  inputEl.addEventListener("input", () => {
    const term = normalize(inputEl.value);

    listEl.querySelectorAll("li").forEach((li) => {
      const text = li.textContent.toLowerCase();
      li.style.display = text.includes(term) ? "" : "none";
    });
  });
}

LiveFilter(ingInput, ingList);
LiveFilter(appInput, appList);
LiveFilter(ustInput, ustList);

/* ------------ MENUS custom-select ---------------- */
document.querySelectorAll(".select-header").forEach((h) => {
  h.addEventListener("click", () =>
    h.closest(".custom-select").classList.toggle("active")
  );
});

document.addEventListener("click", (e) => {
  document.querySelectorAll(".custom-select").forEach((s) => {
    if (!s.contains(e.target)) s.classList.remove("active");
  });
});

/* ------------------- INIT ------------------------ */
renderRecipes(recipes);
setRecipeCount(recipes.length);
refreshFacetLists(recipes);