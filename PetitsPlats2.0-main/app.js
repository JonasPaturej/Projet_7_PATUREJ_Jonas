// Sélecteurs
const container = document.getElementById("recipes-container");
const recipeCount = document.getElementById("recipeCount");

// Affichage des recettes
function displayRecipes(list) {
  container.innerHTML = "";
  recipeCount.textContent = `${list.length} recettes`;

  if (!list.length) {
    container.innerHTML = "<p>Aucune recette trouvée</p>";
    return;
  }

  list.forEach((recipe) => {
    const card = document.createElement("div");
    card.classList.add("recipe-card");
    card.innerHTML = `
    <div class="image-wrapper">
      <img src="JSON recipes/${recipe.image}" alt="${recipe.name}">
      <span class="time">${recipe.time}min</span>
    </div>
      <div class="recipe-info">
        <div class="recipe-header">
          <h3>${recipe.name}</h3>
        </div>
        <div class="recipe-description">
            <h4>RECETTE</h4>
            <p>${recipe.description}</p>
        </div>
        <div class="recipe-details">
        <h4>INGRÉDIENTS</h4>
        <p>
            ${recipe.ingredients
              .map(
                (i) => `
              <strong>${i.ingredient}</strong> ${
                  i.quantity ? i.quantity : ""
                } ${i.unit ? i.unit : ""}
            `
              )
              .join("")}
            </p>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Init
displayRecipes(recipes);
