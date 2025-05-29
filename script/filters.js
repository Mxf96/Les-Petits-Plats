import { recipes } from "./recipes.js";
import { renderRecipes } from "./renderCards.js";

const searchInput = document.querySelector(".search-bar input");
const tagContainer = document.querySelector(".active-tags");
const recipeCountElement = document.querySelector(".recipe-count");
const form = document.getElementById("search-form");

let activeTags = [];

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

function filterAndRender() {
  if (activeTags.length === 0) {
    renderRecipes(recipes);
    updateRecipeCount(recipes.length);
    return;
  }

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

  renderRecipes(filtered);
  updateRecipeCount(filtered.length);
}

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

// Récupération du <ul> des ingrédients
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

// Remplit dynamiquement la liste <ul>
function populateIngredientOptions() {
  const ingredients = getUniqueIngredients(recipes);
  ingredientList.innerHTML = ""; // vide les options existantes

  ingredients.forEach((ingredient) => {
    const li = document.createElement("li");
    li.textContent = ingredient.charAt(0).toUpperCase() + ingredient.slice(1);
    ingredientList.appendChild(li);

    // Ajout du clic pour filtrer via tag
    li.addEventListener("click", () => {
      if (!activeTags.includes(ingredient)) {
        activeTags.push(ingredient);
        createTag(ingredient);
        filterAndRender();
      }
    });
  });
}

// Activation/désactivation des menus custom-select au clic
document.querySelectorAll(".select-header").forEach((header) => {
  header.addEventListener("click", () => {
    const parent = header.closest(".custom-select");
    parent.classList.toggle("active");
  });
});

// Fermer tous les menus si on clique ailleurs
document.addEventListener("click", (e) => {
  document.querySelectorAll(".custom-select").forEach((select) => {
    if (!select.contains(e.target)) {
      select.classList.remove("active");
    }
  });
});

// Initialisation
renderRecipes(recipes);
updateRecipeCount(recipes.length);
populateIngredientOptions();