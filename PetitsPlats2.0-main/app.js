let selectedFilters = {
  ingredients: [],
  appliances: [],
  ustensils: [],
};

// Sélecteurs
const container = document.getElementById("recipes-container");
const recipeCount = document.getElementById("recipeCount");
const searchInput = document.getElementById("search");
const ingredientFilter = document.getElementById("ingredientFilter");
const applianceFilter = document.getElementById("applianceFilter");
const ustensilFilter = document.getElementById("ustensilFilter");

// Fonction pour récupérer tous les éléments uniques d'un type depuis les recettes filtrées
function getUniqueElements(recipes, type) {
  const set = new Set();
  recipes.forEach((recipe) => {
    if (type === "ingredients") {
      recipe.ingredients.forEach((i) => {
        if (!selectedFilters.ingredients.includes(i.ingredient))
          set.add(i.ingredient);
      });
    } else if (type === "appliances") {
      if (!selectedFilters.appliances.includes(recipe.appliance))
        set.add(recipe.appliance);
    } else if (type === "ustensils") {
      recipe.ustensils.forEach((u) => {
        if (!selectedFilters.ustensils.includes(u)) set.add(u);
      });
    }
  });
  return Array.from(set).sort();
}

// Fonction pour remplir un <select> ou une liste déroulante
function fillFilter(element, items) {
  element.innerHTML = element.options[0].outerHTML; // Garde le titre
  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    element.appendChild(option);
  });
}

// Fonction pour filtrer les recettes selon les filtres et la barre de recherche
function filterRecipes() {
  const searchTerm = searchInput.value.toLowerCase();

  let filtered = recipes.filter((recipe) => {
    // Recherche globale
    const matchSearch =
      recipe.name.toLowerCase().includes(searchTerm) ||
      recipe.description.toLowerCase().includes(searchTerm) ||
      recipe.ingredients.some((i) =>
        i.ingredient.toLowerCase().includes(searchTerm)
      );

    // Vérification filtres sélectionnés
    const matchIngredients = selectedFilters.ingredients.every((f) =>
      recipe.ingredients.some((i) => i.ingredient === f)
    );
    const matchAppliances = selectedFilters.appliances.every(
      (f) => recipe.appliance === f
    );
    const matchUstensils = selectedFilters.ustensils.every((f) =>
      recipe.ustensils.includes(f)
    );

    return matchSearch && matchIngredients && matchAppliances && matchUstensils;
  });

  displayRecipes(filtered);

  // Met à jour les filtres avec les éléments disponibles dans les recettes filtrées
  fillFilter(ingredientFilter, getUniqueElements(filtered, "ingredients"));
  fillFilter(applianceFilter, getUniqueElements(filtered, "appliances"));
  fillFilter(ustensilFilter, getUniqueElements(filtered, "ustensils"));
}

// Exemple d’ajout de filtre lorsqu’une option est sélectionnée
ingredientFilter.addEventListener("change", (e) => {
  if (e.target.value) {
    selectedFilters.ingredients.push(e.target.value);
    e.target.value = "";
    filterRecipes();
  }
});

// Même logique pour applianceFilter et ustensilFilter
applianceFilter.addEventListener("change", (e) => {
  if (e.target.value) {
    selectedFilters.appliances.push(e.target.value);
    e.target.value = "";
    filterRecipes();
  }
});

ustensilFilter.addEventListener("change", (e) => {
  if (e.target.value) {
    selectedFilters.ustensils.push(e.target.value);
    e.target.value = "";
    filterRecipes();
  }
});

// Recherche globale
searchInput.addEventListener("input", filterRecipes);

// Affichage des recettes
function displayRecipes(list) {
  container.innerHTML = "";
  recipeCount.textContent = `${list.length} recettes`;

  if (!list.length) {
    container.innerHTML = "<p>Aucune recette trouvée</p>";
    return;
  }

  const DESC_CHAR_LIMIT = 200; // seuil après lequel on affiche "Voir plus"

  list.forEach((recipe) => {
    const card = document.createElement("div");
    card.classList.add("recipe-card");

    const isLong =
      recipe.description && recipe.description.length > DESC_CHAR_LIMIT;

    card.innerHTML = `
      <div class="image-wrapper">
        <img src="JSON recipes/${recipe.image}" alt="${escapeHtml(
      recipe.name
    )}">
        <span class="time">${escapeHtml(String(recipe.time))}min</span>
      </div>
      <div class="recipe-info">
        <div class="recipe-header">
          <h2>${escapeHtml(recipe.name)}</h2>
        </div>
        <div class="recipe-description">
          <h3>RECETTE</h3>
          <p class="desc-text ${isLong ? "clamp" : ""}">${escapeHtml(
      recipe.description || ""
    )}</p>
          ${
            isLong
              ? `<button class="toggle-desc" aria-expanded="false">Voir plus</button>`
              : ""
          }
        </div>
        <div class="recipe-details">
          <h3>INGRÉDIENTS</h3>
          <div class="ingredients-list">
            ${recipe.ingredients
              .map(
                (i) => `
              <div class="ingredient-item">
                ${escapeHtml(i.ingredient)}
                <span>
                ${i.quantity ? escapeHtml(i.quantity) : ""} 
                ${i.unit ? escapeHtml(i.unit) : ""}
                </span>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </div>
    `;

    container.appendChild(card);

    // si la description est longue, on ajoute le toggle
    if (isLong) {
      const btn = card.querySelector(".toggle-desc");
      const p = card.querySelector(".desc-text");

      btn.addEventListener("click", () => {
        const expanded = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!expanded));

        if (expanded) {
          // on replie
          p.classList.add("clamp");
          p.classList.remove("expanded");
          btn.textContent = "Voir plus";
        } else {
          // on développe
          p.classList.remove("clamp");
          p.classList.add("expanded");
          btn.textContent = "Voir moins";
        }
      });
    }
  });
}

function escapeHtml(str) {
  return str ?? "";
}

// Init
filterRecipes();
displayRecipes(recipes);
