/* =========================================================
   F I L T R E S 
========================================================= */

// Import du dataset de recettes et de la fonction qui affiche les cartes
import { recipes } from "./recipes.js";
import { renderRecipes } from "./renderCards.js";

/* -------------------- Config bench --------------------- */
const ENABLE_BENCH = false; // Passe à true pour mesurer et logguer le temps d'exécution du filtrage

/* -------------------- DOM ------------------------------ */
// Récupération des éléments de l'interface
const searchInput   = document.querySelector(".search-bar input");   // Champ principal de recherche
const tagContainer  = document.querySelector(".active-tags");        // Zone où s'affichent les tags actifs
const recipeCounter = document.querySelector(".recipe-count");       // Compteur du nombre de recettes
const mainForm      = document.getElementById("search-form");        // Formulaire principal (submit = ajout de tag)

// Formulaires et éléments des filtres secondaires (ingrédients / appareils / ustensiles)
const ingForm  = document.getElementById("ingredient-search-form");  // Form ingrédient
const ingInput = document.getElementById("ingredient-search-input"); // Input ingrédient
const ingList  = document.getElementById("ingredient-options");      // <ul> liste des options ingrédient

const appForm  = document.getElementById("appliance-search-form");   // Form appareil
const appInput = document.getElementById("appliance-search-input");  // Input appareil
const appList  = document.getElementById("appliance-options");       // <ul> liste des options appareil

const ustForm  = document.getElementById("ustensil-search-form");    // Form ustensile
const ustInput = document.getElementById("ustensil-search-input");   // Input ustensile
const ustList  = document.getElementById("ustensil-options");        // <ul> liste des options ustensile

/* ----------------------- ÉTAT -------------------------- */
// État local de l'appli
let activeTags = [];          // Liste des tags actifs (toujours en minuscule)
let currentDataset = recipes; // Dataset courant affiché après filtrage

/* -------------------- UTILITAIRES ---------------------- */
// Helpers de transformation de texte
const toLower = (s) => s.toLowerCase();                  // Minuscule
const normalize = (s) => toLower(String(s).trim());      // Trim + minuscule (pour normaliser une saisie)
const capitalizeFirst = (s) => s.charAt(0).toUpperCase() + s.slice(1); // Met la 1re lettre en majuscule (pour affichage)

// Met à jour l'UI du compteur de recettes
const setRecipeCount = (n) => {
  // Pad à 2 chiffres (ex: 03) + libellé
  recipeCounter.textContent = `${String(n).padStart(2, "0")} recettes`;
};

/* --------------------- TAGS UI ------------------------- */
// Crée un tag "chip" cliquable dans la zone des tags
function createTagChip(label) {
  const chip = document.createElement("span"); // <span> visuel du tag
  chip.className = "tag";
  chip.textContent = label;                    // Label tel qu'affiché (déjà minuscule ici)

  // Bouton de fermeture (croix) pour retirer le tag
  const close = document.createElement("button");
  close.textContent = "×";
  // Quand on clique sur la croix : on enlève le tag de l'état + on relance le filtrage
  close.onclick = () => {
    activeTags = activeTags.filter((t) => t !== label); // retire "label" des tags actifs
    chip.remove();                                      // enlève le chip du DOM
    applyFiltersAndRender();                            // recalcule + réaffiche
  };

  chip.appendChild(close);        // Ajoute la croix dans le chip
  tagContainer.appendChild(chip); // Ajoute le chip dans le container des tags
}

/* --------------- EXTRACTION DES FACETTES --------------- */
// Fonctions pour extraire les "facettes" (valeurs uniques) de chaque recette
const ingredientsOf = (r) => r.ingredients.map((i) => toLower(i.ingredient)); // liste d'ingrédients (minuscule)
const applianceOf   = (r) => (r.appliance ? [toLower(r.appliance)] : []);     // appareil (0 ou 1) en minuscule
const utensilsOf    = (r) => (r.ustensils || []).map(toLower);                // ustensiles en minuscule

// Calcule un ensemble unique trié de valeurs extraites sur une collection
const uniqueSorted = (src, extractor) =>
  [...new Set(src.flatMap(extractor))].sort(); // flatMap -> Set (unicité) -> sort (tri alpha)

/* Remplit une <ul> avec des <li> cliquables */
function populateList(ul, items) {
  ul.innerHTML = ""; // Vide la liste avant de la remplir (sans risque d'injection car on n'insère pas de HTML utilisateur)
  items.forEach((val) => {
    const li = document.createElement("li"); // Crée un <li> par valeur
    li.textContent = capitalizeFirst(val);   // Affichage avec 1re lettre en majuscule (cosmétique)
    li.onclick = () => addTag(val);          // Cliquer sur l'item = ajoute ce tag
    ul.appendChild(li);                      // Ajoute l'item dans la <ul>
  });
}

/* Recalcule les listes (ingrédients, appareils, ustensiles) d’après le dataset courant */
const refreshFacetLists = (src) => {
  // Recalcule les facettes uniques sur le dataset fourni et peuple chaque liste visible
  populateList(ingList, uniqueSorted(src, ingredientsOf));
  populateList(appList, uniqueSorted(src, applianceOf));
  populateList(ustList, uniqueSorted(src, utensilsOf));
};

/* ----------------- MOTEUR DE FILTRAGE ------------------ */
/** Teste si une recette r correspond au terme t (t est en minuscule) */
function doesRecipeMatchTerm(r, t) {
  return (
    r.name.toLowerCase().includes(t) ||                                   // nom contient t
    r.description.toLowerCase().includes(t) ||                            // description contient t
    r.ingredients.some((i) => toLower(i.ingredient).includes(t)) ||       // ingrédient contient t
    (r.appliance && toLower(r.appliance).includes(t)) ||                  // appareil contient t
    (r.ustensils && r.ustensils.some((u) => toLower(u).includes(t)))      // au moins un ustensile contient t
  );
}

/** Filtre un dataset en appliquant tous les tags (ET logique : chaque tag doit matcher) */
function filterRecipesByTags(dataset, tags) {
  if (!tags.length) return dataset;                         // Sans tag, on renvoie tout le dataset
  return dataset.filter((r) => tags.every((t) => doesRecipeMatchTerm(r, t))); // Garde les recettes qui matchent tous les tags
}

/* --------------- APPLICATION + RENDU ------------------- */
// Applique le filtrage à partir des tags actifs, puis met à jour l'UI
function applyFiltersAndRender() {
  // Optionnel : chronométrage
  const t0 = ENABLE_BENCH ? performance.now() : 0;

  // Calcule le dataset filtré depuis le dataset complet "recipes"
  currentDataset = filterRecipesByTags(recipes, activeTags);

  // Log du temps d'exécution si bench activé
  if (ENABLE_BENCH) {
    const dt = (performance.now() - t0).toFixed(2);
    console.log(
      `[filter] ${activeTags.length} tag(s) – ${currentDataset.length} recettes – ${dt} ms`
    );
  }

  // Rendu des cartes recettes dans le DOM
  renderRecipes(currentDataset);

  // Mise à jour du compteur (ex: "08 recettes")
  setRecipeCount(currentDataset.length);

  // Recalcule les facettes (listes déroulantes) à partir du dataset filtré
  refreshFacetLists(currentDataset);
}

/* ----------- AJOUT D’UN TAG (validation) --------------- */
// Normalise la saisie, vérifie quelques règles, ajoute le tag et relance le filtrage
function addTag(raw) {
  const q = normalize(raw);                 // normalisation (trim + minuscule)
  if (q.length < 3 || activeTags.includes(q)) return; // Ignore si trop court (<3) ou déjà présent

  activeTags.push(q);       // Ajoute le tag dans l'état
  createTagChip(q);         // Crée et affiche le chip correspondant
  applyFiltersAndRender();  // Recalcule + met à jour l'UI
}

/* -------------------- SOUMISSIONS ---------------------- */
// Soumission du formulaire principal = tente d'ajouter le contenu du champ de recherche comme tag
mainForm.addEventListener("submit", (e) => {
  e.preventDefault();            // Empêche le rechargement de page par défaut
  addTag(searchInput.value);     // Ajoute le tag à partir de la valeur du champ
  searchInput.value = "";        // Réinitialise le champ de saisie
});

// Gestion des formulaires secondaires : on n'accepte que des valeurs présentes dans la liste proposée
function handleRestrictedSubmit(e, input, extractor) {
  e.preventDefault();                      // Empêche le rechargement
  const q = normalize(input.value);        // Normalise la saisie
  // Si la valeur tapée existe bien dans les options actuelles, on l'ajoute comme tag
  if (uniqueSorted(currentDataset, extractor).includes(q)) addTag(q);
  input.value = "";                        // Reset du champ
}

// Branche les trois formulaires secondaires sur le handler commun
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
// Filtrage "live" du contenu des listes d'options pendant la saisie dans leurs inputs
[
  [ingInput, ingList],   // input ingrédient => filtre visuel sur <ul> ingrédient
  [appInput, appList],   // input appareil  => filtre visuel sur <ul> appareil
  [ustInput, ustList],   // input ustensile => filtre visuel sur <ul> ustensile
].forEach(([inp, list]) => {
  inp.addEventListener("input", () => {
    const v = normalize(inp.value); // Texte saisi (normalisé)
    // Montre/cache chaque <li> selon s'il contient le motif saisi
    list.querySelectorAll("li").forEach((li) => {
      li.style.display = li.textContent.toLowerCase().includes(v) ? "" : "none";
    });
  });
});

/* ----------------- MENUS custom-select ----------------- */
// Ouvre/ferme un "custom-select" lorsqu'on clique sur son header
document.querySelectorAll(".select-header").forEach((header) => {
  header.addEventListener("click", () =>
    header.closest(".custom-select").classList.toggle("active")
  );
});

// Ferme tous les "custom-select" si on clique ailleurs dans la page
document.addEventListener("click", (e) => {
  document.querySelectorAll(".custom-select").forEach((sel) => {
    if (!sel.contains(e.target)) sel.classList.remove("active");
  });
});

/* ------------------------ INIT ------------------------- */
// Affiche toutes les recettes au chargement
renderRecipes(recipes);
// Initialise le compteur
setRecipeCount(recipes.length);
// Calcule et affiche les facettes à partir du dataset complet
refreshFacetLists(recipes);
