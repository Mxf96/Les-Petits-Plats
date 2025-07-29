import { recipes } from "./recipes.js";
import { renderRecipes } from "./renderCards.js";

// Références DOM
const searchInput = document.querySelector(".search-bar input");
const tagContainer = document.querySelector(".active-tags");
const recipeCountElement = document.querySelector(".recipe-count");
const form = document.getElementById("search-form");

//  Ingrédients
const ingredientSearchForm = document.getElementById("ingredient-search-form");
const ingredientSearchInput = document.getElementById(
  "ingredient-search-input"
);
const ingredientList = document.getElementById("ingredient-options");

//  Appareils
const applianceSearchForm = document.getElementById("appliance-search-form");
const applianceSearchInput = document.getElementById("appliance-search-input");
const applianceList = document.getElementById("appliance-options");

//  Ustensiles
const ustensilSearchForm = document.getElementById("ustensil-search-form");
const ustensilSearchInput = document.getElementById("ustensil-search-input");
const ustensilList = document.getElementById("ustensil-options");

// État
let activeTags = [];

// Utilitaires
function updateRecipeCount(count) {
  if (recipeCountElement) {
    recipeCountElement.textContent = `${count
      .toString()
      .padStart(2, "0")} recettes`;
  }
}

function createTag(label) {
  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = label;

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", () => {
    activeTags = activeTags.filter((t) => t !== label);
    tag.remove();
    filterAndRender();
  });

  tag.appendChild(closeBtn);
  tagContainer.appendChild(tag);
}

// Filtrage + rendu
function filterAndRender() {
  if (activeTags.length === 0) {
    renderRecipes(recipes);
    updateRecipeCount(recipes.length);
    return;
  }

  const filtered = recipes.filter((recipe) =>
    activeTags.every((tag) => {
      const lowerTag = tag.toLowerCase();
      return (
        recipe.name.toLowerCase().includes(lowerTag) ||
        recipe.description.toLowerCase().includes(lowerTag) ||
        recipe.ingredients.some((ing) =>
          ing.ingredient.toLowerCase().includes(lowerTag)
        ) ||
        (recipe.appliance &&
          recipe.appliance.toLowerCase().includes(lowerTag)) ||
        (recipe.ustensils &&
          recipe.ustensils.some((u) => u.toLowerCase().includes(lowerTag)))
      );
    })
  );

  renderRecipes(filtered);
  updateRecipeCount(filtered.length);
}

// Recherche principale (header)
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = searchInput.value.trim().toLowerCase();
  if (query.length < 3 || activeTags.includes(query)) {
    searchInput.value = "";
    return;
  }
  activeTags.push(query);
  createTag(query);
  filterAndRender();
  searchInput.value = "";
});

// Ingrédients : submit + filtrage live + options dynamiques
ingredientSearchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = ingredientSearchInput.value.trim().toLowerCase();
  if (query.length < 3 || activeTags.includes(query)) {
    ingredientSearchInput.value = "";
    return;
  }
  activeTags.push(query);
  createTag(query);
  filterAndRender();
  ingredientSearchInput.value = "";
});

ingredientSearchInput.addEventListener("input", () => {
  const val = ingredientSearchInput.value.trim().toLowerCase();
  ingredientList.querySelectorAll("li").forEach((li) => {
    li.style.display = li.textContent.toLowerCase().includes(val) ? "" : "none";
  });
});

// Appareils : helpers + submit + filtrage live + options dynamiques
function getUniqueAppliances(recipes) {
  const set = new Set();
  recipes.forEach(
    (r) => r.appliance && set.add(r.appliance.toLowerCase().trim())
  );
  return Array.from(set).sort();
}

function populateApplianceOptions() {
  const appliances = getUniqueAppliances(recipes);
  applianceList.innerHTML = "";
  appliances.forEach((appliance) => {
    const li = document.createElement("li");
    li.textContent = appliance.charAt(0).toUpperCase() + appliance.slice(1);
    applianceList.appendChild(li);
    li.addEventListener("click", () => {
      if (!activeTags.includes(appliance)) {
        activeTags.push(appliance);
        createTag(appliance);
        filterAndRender();
      }
    });
  });
}

applianceSearchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = applianceSearchInput.value.trim().toLowerCase();
  if (query.length < 3 || activeTags.includes(query)) {
    applianceSearchInput.value = "";
    return;
  }
  activeTags.push(query);
  createTag(query);
  filterAndRender();
  applianceSearchInput.value = "";
});

applianceSearchInput.addEventListener("input", () => {
  const val = applianceSearchInput.value.trim().toLowerCase();
  applianceList.querySelectorAll("li").forEach((li) => {
    li.style.display = li.textContent.toLowerCase().includes(val) ? "" : "none";
  });
});

// Ustensiles : helpers + submit + filtrage live + options dynamiques
function getUniqueUstensils(recipes) {
  const set = new Set();
  recipes.forEach((r) =>
    (r.ustensils || []).forEach((u) => set.add(u.toLowerCase().trim()))
  );
  return Array.from(set).sort();
}

function populateUstensilOptions() {
  const ustensils = getUniqueUstensils(recipes);
  ustensilList.innerHTML = "";
  ustensils.forEach((u) => {
    const li = document.createElement("li");
    li.textContent = u.charAt(0).toUpperCase() + u.slice(1);
    ustensilList.appendChild(li);
    li.addEventListener("click", () => {
      if (!activeTags.includes(u)) {
        activeTags.push(u);
        createTag(u);
        filterAndRender();
      }
    });
  });
}

ustensilSearchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = ustensilSearchInput.value.trim().toLowerCase();
  if (query.length < 3 || activeTags.includes(query)) {
    ustensilSearchInput.value = "";
    return;
  }
  activeTags.push(query);
  createTag(query);
  filterAndRender();
  ustensilSearchInput.value = "";
});

ustensilSearchInput.addEventListener("input", () => {
  const val = ustensilSearchInput.value.trim().toLowerCase();
  ustensilList.querySelectorAll("li").forEach((li) => {
    li.style.display = li.textContent.toLowerCase().includes(val) ? "" : "none";
  });
});

// Ingrédients : helpers + options dynamiques
function getUniqueIngredients(recipes) {
  const ingredientsSet = new Set();
  recipes.forEach((recipe) => {
    recipe.ingredients.forEach((item) => {
      ingredientsSet.add(item.ingredient.toLowerCase());
    });
  });
  return Array.from(ingredientsSet).sort();
}

function populateIngredientOptions() {
  const ingredients = getUniqueIngredients(recipes);
  ingredientList.innerHTML = "";
  ingredients.forEach((ingredient) => {
    const li = document.createElement("li");
    li.textContent = ingredient.charAt(0).toUpperCase() + ingredient.slice(1);
    ingredientList.appendChild(li);
    li.addEventListener("click", () => {
      if (!activeTags.includes(ingredient)) {
        activeTags.push(ingredient);
        createTag(ingredient);
        filterAndRender();
      }
    });
  });
}

/** Construit la liste unique de termes recherchables (casse préservée) */
function buildSearchTerms(recipes) {
  const lowerSeen = new Set();
  const terms = [];

  const pushUnique = (s) => {
    if (!s) return;
    const raw = String(s).trim();
    if (!raw) return;
    const lower = raw.toLowerCase();
    if (lowerSeen.has(lower)) return;
    lowerSeen.add(lower);
    terms.push(raw);
  };

  recipes.forEach((r) => {
    pushUnique(r.name); // Nom
    (r.ingredients || []).forEach((it) => pushUnique(it.ingredient)); // Ingrédients
    pushUnique(r.appliance); // Appareil
    (r.ustensils || []).forEach((u) => pushUnique(u)); // Ustensiles
  });

  return terms.sort((a, b) =>
    a.localeCompare(b, "fr", { sensitivity: "base" })
  );
}

const SEARCH_TERMS = buildSearchTerms(recipes);

/* ========= AUTOCOMPLÉTION GLOBALE (barre de recherche du header) ========= */
/* Création du conteneur de suggestions, porté sous <body> pour éviter le clipping */
const suggestBox = document.createElement("ul");
suggestBox.id = "global-suggestions";
suggestBox.className = "select-options";
suggestBox.style.position = "fixed"; // ← important : hors du flux du header
suggestBox.style.left = "0";
suggestBox.style.top = "0";
suggestBox.style.width = "0";
suggestBox.style.display = "none";
suggestBox.style.zIndex = "9999"; // ← passe au-dessus de tout
document.body.appendChild(suggestBox);

/* Utilitaires pour marquer la correspondance et positionner la box */
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function highlightMatch(text, query) {
  const re = new RegExp(escapeRegExp(query), "ig");
  return text.replace(re, (m) => `<mark>${m}</mark>`);
}
function positionSuggestBox() {
  const r = searchInput.getBoundingClientRect();
  const gap = 10; // petit espace sous l’input
  suggestBox.style.left = `${r.left}px`;
  suggestBox.style.top = `${r.bottom + gap}px`;
  suggestBox.style.width = `${r.width}px`;
}

/* Affiche/masque les suggestions selon la saisie */
let focusedIndex = -1;

function renderSuggestions(query) {
  const q = query.trim().toLowerCase();
  suggestBox.innerHTML = "";
  focusedIndex = -1;

  if (q.length < 2) {
    suggestBox.style.display = "none";
    return;
  }

  const matches = SEARCH_TERMS.filter((t) => t.toLowerCase().includes(q)).slice(
    0,
    12
  );
  if (matches.length === 0) {
    suggestBox.style.display = "none";
    return;
  }

  matches.forEach((m) => {
    const li = document.createElement("li");
    li.innerHTML = highlightMatch(m, q);
    li.style.cursor = "pointer";
    li.addEventListener("click", () => {
      searchInput.value = m;
      const tag = m.toLowerCase();
      if (!activeTags.includes(tag)) {
        activeTags.push(tag);
        createTag(tag);
        filterAndRender();
      }
      suggestBox.style.display = "none";
      searchInput.blur();
      searchInput.value = ""; // on vide comme submit classique
    });
    suggestBox.appendChild(li);
  });

  positionSuggestBox(); // place correctement la box
  suggestBox.style.display = "block";
}

/* Écoutes clavier/souris pour l’autocomplétion */
searchInput.addEventListener("input", () => {
  renderSuggestions(searchInput.value);
});
searchInput.addEventListener("focus", () => {
  if (searchInput.value.trim().length >= 2) {
    positionSuggestBox();
    suggestBox.style.display = "block";
  }
});
window.addEventListener("resize", () => {
  if (suggestBox.style.display !== "none") positionSuggestBox();
});
window.addEventListener(
  "scroll",
  () => {
    if (suggestBox.style.display !== "none") positionSuggestBox();
  },
  { passive: true }
);

// Ferme la liste si on clique ailleurs
document.addEventListener("click", (e) => {
  const clickedInsideSearch =
    e.target === searchInput || searchInput.contains(e.target);
  const clickedInsideBox = suggestBox.contains(e.target);
  if (!clickedInsideSearch && !clickedInsideBox) {
    suggestBox.style.display = "none";
  }
});

// Navigation clavier (↑/↓/Enter/Escape) avec classe .is-focused
searchInput.addEventListener("keydown", (e) => {
  const items = Array.from(suggestBox.querySelectorAll("li"));
  if (suggestBox.style.display === "none" || items.length === 0) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    focusedIndex = (focusedIndex + 1) % items.length;
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    focusedIndex = (focusedIndex - 1 + items.length) % items.length;
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (focusedIndex >= 0) items[focusedIndex].click();
    return;
  } else if (e.key === "Escape") {
    suggestBox.style.display = "none";
    return;
  } else {
    return;
  }

  items.forEach((li, i) =>
    li.classList.toggle("is-focused", i === focusedIndex)
  );
});

// Ouverture/fermeture des menus
document.querySelectorAll(".select-header").forEach((header) => {
  header.addEventListener("click", () => {
    const parent = header.closest(".custom-select");
    parent.classList.toggle("active");
  });
});

document.addEventListener("click", (e) => {
  document.querySelectorAll(".custom-select").forEach((select) => {
    if (!select.contains(e.target)) {
      select.classList.remove("active");
    }
  });
});

//  Initialisation
renderRecipes(recipes);
updateRecipeCount(recipes.length);
populateIngredientOptions();
populateApplianceOptions();
populateUstensilOptions();