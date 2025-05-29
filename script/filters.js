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

// Initialisation
renderRecipes(recipes);
updateRecipeCount(recipes.length);
