import { recipes } from "./recipes.js";

const container = document.querySelector(".cards-container");

// Fonction pour diviser les ingrédients en deux colonnes
function createIngredientColumns(ingredients) {
  const col1 = [];
  const col2 = [];

  // Parcourt chaque ingrédient et l’ajoute dans l’une des deux colonnes
  ingredients.forEach((item, index) => {
    // Création du label affiché pour chaque ingrédient (nom, quantité, unité)
    const label = `<strong>${item.ingredient}</strong><br />${
      item.quantity ?? ""
    }${item.unit ? " " + item.unit : ""}`;

    // Répartition alternée dans col1 ou col2 selon l'index
    if (index % 2 === 0) col1.push(`<li>${label}</li>`);
    else col2.push(`<li>${label}</li>`);
  });

  // Répartition alternée dans col1 ou col2 selon l'index
  return [col1.join("\n"), col2.join("\n")];
}

// Affichage initial de toutes les recettes dès le chargement
recipes.forEach((recipe) => {
  const [col1, col2] = createIngredientColumns(recipe.ingredients);

  // Création de l'élément article pour représenter la carte
  const article = document.createElement("article");
  article.className = "card";

  // Remplissage du contenu HTML de la carte avec les infos de la recette
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

  // Ajoute la carte générée dans le conteneur principal
  container.appendChild(article);
});

// Fonction exportée pour afficher dynamiquement une liste de recettes (filtrée par exemple)
export function renderRecipes(recipeList) {
  // Nettoie le conteneur avant d'ajouter les nouvelles cartes
  container.innerHTML = "";
  // Pour chaque recette dans la liste fournie
  recipeList.forEach((recipe) => {
    const [col1, col2] = createIngredientColumns(recipe.ingredients);
    const article = document.createElement("article");
    article.className = "card";

    // Création de la carte HTML
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

    // Ajoute chaque carte dans le conteneur
    container.appendChild(article);
  });
}