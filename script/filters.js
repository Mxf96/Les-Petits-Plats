import { recipes } from "./recipes.js";
import { renderRecipes } from "./renderCards.js";

const searchInput = document.querySelector(".search-bar input");
const tagContainer = document.querySelector(".active-tags");
const recipeCountElement = document.querySelector(".recipe-count");
const form = document.getElementById("search-form");

// Liste des tags actifs utilisés pour le filtrage
let activeTags = [];

// Met à jour l'affichage du nombre de recettes
function updateRecipeCount(count) {
  if (recipeCountElement) {
    recipeCountElement.textContent = `${count
      .toString()
      .padStart(2, "0")} recettes`;
  }
}

// Crée un tag visible à partir du mot-clé saisi ou sélectionné
function createTag(label) {
  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = label;

  // Bouton de suppression du tag
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", () => {
    // Retire le tag de la liste active et met à jour l'affichage
    activeTags = activeTags.filter((t) => t !== label);
    tag.remove();
    filterAndRender();
  });

  tag.appendChild(closeBtn);
  tagContainer.appendChild(tag);
}

// Filtre les recettes en fonction des tags actifs, puis les affiche
function filterAndRender() {
  if (activeTags.length === 0) {
    renderRecipes(recipes);
    updateRecipeCount(recipes.length);
    return;
  }

  // Filtrage : chaque tag doit apparaître dans le nom, la description ou les ingrédients
  const filtered = recipes.filter((recipe) => {
    return activeTags.every((tag) => {
      const lowerTag = tag.toLowerCase();
      return (
        recipe.name.toLowerCase().includes(lowerTag) ||
        recipe.description.toLowerCase().includes(lowerTag) ||
        recipe.ingredients.some((ing) =>
          ing.ingredient.toLowerCase().includes(lowerTag)
        )
      );
    });
  });

  // Mise à jour de l'affichage
  renderRecipes(filtered);
  updateRecipeCount(filtered.length);
}

// Gestion de la soumission du formulaire de recherche
form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Ignore les recherches trop courtes ou déjà présentes comme tag
  const query = searchInput.value.trim().toLowerCase();

  // Ignore les recherches trop courtes ou déjà présentes comme tag
  if (query.length < 3 || activeTags.includes(query)) {
    searchInput.value = "";
    return;
  }

  // Ajoute le tag et met à jour l'affichage
  activeTags.push(query);
  createTag(query);
  filterAndRender();

  searchInput.value = "";
});

// Récupération de l'élément <ul> contenant les options d'ingrédients
const ingredientList = document.getElementById("ingredient-options");

// Génère une liste unique d'ingrédients depuis les recettes
function getUniqueIngredients(recipes) {
  const ingredientsSet = new Set();
  recipes.forEach((recipe) => {
    recipe.ingredients.forEach((item) => {
      ingredientsSet.add(item.ingredient.toLowerCase());
    });
  });

  return Array.from(ingredientsSet).sort();
}

// Remplit dynamiquement la liste <ul> avec les ingrédients
function populateIngredientOptions() {
  const ingredients = getUniqueIngredients(recipes);
  ingredientList.innerHTML = ""; // vide les options existantes

  ingredients.forEach((ingredient) => {
    const li = document.createElement("li");
    li.textContent = ingredient.charAt(0).toUpperCase() + ingredient.slice(1);
    ingredientList.appendChild(li);

    // Lors d'un clic sur un ingrédient, l'ajouter comme tag si non présent
    li.addEventListener("click", () => {
      if (!activeTags.includes(ingredient)) {
        activeTags.push(ingredient);
        createTag(ingredient);
        filterAndRender();
      }
    });
  });
}

// Gestion de l'ouverture/fermeture des menus de filtre customisés
document.querySelectorAll(".select-header").forEach((header) => {
  header.addEventListener("click", () => {
    const parent = header.closest(".custom-select");
    parent.classList.toggle("active");
  });
});

// Ferme les menus déroulants si l'utilisateur clique en dehors
document.addEventListener("click", (e) => {
  document.querySelectorAll(".custom-select").forEach((select) => {
    if (!select.contains(e.target)) {
      select.classList.remove("active");
    }
  });
});

// Initialisation à l'ouverture de la page : affichage des recettes, compteur, et options
renderRecipes(recipes);
updateRecipeCount(recipes.length);
populateIngredientOptions();