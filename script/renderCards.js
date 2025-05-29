import { recipes } from "./recipes.js";

const container = document.querySelector(".cards-container");

function createIngredientColumns(ingredients) {
  const col1 = [];
  const col2 = [];

  ingredients.forEach((item, index) => {
    const label = `<strong>${item.ingredient}</strong><br />${
      item.quantity ?? ""
    }${item.unit ? " " + item.unit : ""}`;
    if (index % 2 === 0) col1.push(`<li>${label}</li>`);
    else col2.push(`<li>${label}</li>`);
  });

  return [col1.join("\n"), col2.join("\n")];
}

recipes.forEach((recipe) => {
  const [col1, col2] = createIngredientColumns(recipe.ingredients);
  const article = document.createElement("article");
  article.className = "card";

  article.innerHTML = `
    <div class="card-image">
      <img src="./assets/img/recette/${recipe.image}" alt="${recipe.name}" />
      <span class="card-duration">${recipe.time}min</span>
    </div>
    <div class="card-content">
      <h3 class="card-title">${recipe.name}</h3>
      <h4 class="section-subtitle">Recette</h4>
      <p class="card-description">${recipe.description}</p>
      <h4 class="section-subtitle">Ingrédients</h4>
      <div class="card-ingredients">
        <ul>${col1}</ul>
        <ul>${col2}</ul>
      </div>
    </div>
  `;

  container.appendChild(article);
});

export function renderRecipes(recipeList) {
  container.innerHTML = "";
  recipeList.forEach((recipe) => {
    const [col1, col2] = createIngredientColumns(recipe.ingredients);
    const article = document.createElement("article");
    article.className = "card";

    article.innerHTML = `
      <div class="card-image">
        <img src="./assets/img/recette/${recipe.image}" alt="${recipe.name}" />
        <span class="card-duration">${recipe.time}min</span>
      </div>
      <div class="card-content">
        <h3 class="card-title">${recipe.name}</h3>
        <h4 class="section-subtitle">Recette</h4>
        <p class="card-description">${recipe.description}</p>
        <h4 class="section-subtitle">Ingrédients</h4>
        <div class="card-ingredients">
          <ul>${col1}</ul>
          <ul>${col2}</ul>
        </div>
      </div>
    `;
    container.appendChild(article);
  });
}