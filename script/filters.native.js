/* =========================================================
   F I L T R E S  –  Version boucles natives (for/while)
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
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const li = document.createElement("li");
    li.textContent = uc(it);
    li.onclick = () => addTag(it);
    ul.appendChild(li);
  }
}
const refreshLists = (src) => {
  fill(ingList, uniq(src, ingOf));
  fill(appList, uniq(src, appOf));
  fill(ustList, uniq(src, ustOf));
};

/* --------------- FILTRAGE (boucles natives) ----------- */
function matchNative(r, t) {
  const tag = t;

  // name
  if (r.name.toLowerCase().includes(tag)) return true;

  // description
  if (r.description.toLowerCase().includes(tag)) return true;

  // ingredients
  for (let i = 0; i < r.ingredients.length; i++) {
    if (L(r.ingredients[i].ingredient).includes(tag)) return true;
  }

  // appliance
  if (r.appliance && L(r.appliance).includes(tag)) return true;

  // ustensils
  if (r.ustensils) {
    for (let i = 0; i < r.ustensils.length; i++) {
      if (L(r.ustensils[i]).includes(tag)) return true;
    }
  }
  return false;
}

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

/* --------------  AJOUT D’UN TAG (validation) ---------- */
function flashInvalid(target) {
  target.classList.add("invalid");
  setTimeout(() => target.classList.remove("invalid"), 600);
}
function addTag(raw) {
  const q = L(raw.trim());
  if (q.length < 3 || activeTags.includes(q)) return;

  // Simulation applicquée au champ principal (focus du test)
  const testDataset = filterNative(currentDataset, [q]);
  if (testDataset.length === 0) {
    flashInvalid(searchInput);
    return;
  }

  activeTags.push(q);
  createTag(q);
  filterAndRender();
}

/* -----------------  SOUMISSIONS ----------------------- */
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