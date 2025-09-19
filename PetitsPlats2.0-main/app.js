import { recipes } from "./recipes.js";

let selectedFilters = {
  ingredients: [],
  appliances: [],
  ustensils: [],
};

let currentRecipes = recipes;

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
const activeFiltersContainer = document.getElementById("activeFilters");

// Setup UI for a filter block
function setupFilterUI(filterId, type, placeholderText) {
  const root = document.getElementById(filterId);
  if (!root) return null;

  const header = root.querySelector(".filter-header");
  const search = root.querySelector(".filter-search");
  const optionsList = root.querySelector(".filter-options");

  // Accessibility: allow keyboard toggle
  header.tabIndex = 0;
  header.setAttribute("role", "button");

  // Close when click outside
  function outsideClickListener(e) {
    if (!root.contains(e.target)) {
      root.classList.remove("open");
      document.removeEventListener("click", outsideClickListener);
    }
  }

  // Toggle open/close
  function toggleOpen() {
    const open = root.classList.toggle("open");
    if (open) {
      // open -> focus search and attach outside click close
      search.focus();
      document.addEventListener("click", outsideClickListener);
    } else {
      document.removeEventListener("click", outsideClickListener);
    }
    // update arrow
    root.classList.toggle("is-open", open);
  }

  header.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleOpen();
  });

  header.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleOpen();
    }
  });

  // Render options: selected first (yellow), then rest filtered by search
  function renderOptions(allItems) {
    const selected = selectedFilters[type] || [];
    const searchTerm = (search.value || "").trim().toLowerCase();

    // Build a set for quick skip
    const selectedSet = new Set(selected);

    optionsList.innerHTML = "";

    // 1) selected items first (always visible)
    selected.forEach((val) => {
      const li = document.createElement("li");
      li.className = "option-item selected";
      li.dataset.value = val;
      li.innerHTML = `<span class="label">${val}</span><button class="remove-btn" aria-label="Retirer ${val}">×</button>`;
      optionsList.appendChild(li);
    });

    // 2) remaining items, filtered by search
    allItems.forEach((it) => {
      if (selectedSet.has(it)) return; // skip already selected (already added)
      if (searchTerm && !it.toLowerCase().includes(searchTerm)) return;
      const li = document.createElement("li");
      li.className = "option-item";
      li.dataset.value = it;
      li.textContent = it;
      optionsList.appendChild(li);
    });
  }

  // Listen clicks (delegation) - select or remove
  optionsList.addEventListener("click", (e) => {
    const li = e.target.closest("li.option-item");
    if (!li) return;
    const value = li.dataset.value;

    // If clicked the remove button inside a selected item
    if (e.target.classList.contains("remove-btn")) {
      selectedFilters[type] = (selectedFilters[type] || []).filter(
        (v) => v !== value
      );
      filterRecipes(); // re-run global filter which will also call updateUIs
      return;
    }

    // Toggle selection: if already selected -> remove, else add
    if ((selectedFilters[type] || []).includes(value)) {
      selectedFilters[type] = selectedFilters[type].filter((v) => v !== value);
    } else {
      selectedFilters[type] = [
        ...new Set([...(selectedFilters[type] || []), value]),
      ];
    }

    filterRecipes(); // trigger re-render of everything
  });

  // Input search -> re-render options live (keeps selected items visible)
  search.addEventListener("input", () => {
    renderOptions(getUniqueElements(recipes, type));
  });

  // Public update method
  return {
    update: () => renderOptions(getUniqueElements(currentRecipes, type)),
    open: () => {
      if (!root.classList.contains("open")) {
        toggleOpen();
      }
    },
  };
}

// Create three UIs (ids must match your HTML)
const ingredientUI = setupFilterUI(
  "ingredientFilter",
  "ingredients",
  "Rechercher un ingrédient..."
);
const applianceUI = setupFilterUI(
  "applianceFilter",
  "appliances",
  "Rechercher un appareil..."
);
const ustensilUI = setupFilterUI(
  "ustensilFilter",
  "ustensils",
  "Rechercher un ustensile..."
);

// Mets à jour les filtres sélectionnés en dessous de la barre de recherche du filtre
function renderActiveFilters() {
  if (!activeFiltersContainer) return;
  activeFiltersContainer.innerHTML = "";

  Object.entries(selectedFilters).forEach(([type, values]) => {
    values.forEach((val) => {
      const tag = document.createElement("div");
      tag.className = "filter-tag";
      tag.innerHTML = `<span class="tag-label">${val}</span><button class="tag-remove" aria-label="Retirer ${val}">×</button>`;

      tag.querySelector(".tag-remove").addEventListener("click", () => {
        // remove from selected filters and rerun filter
        selectedFilters[type] = (selectedFilters[type] || []).filter(
          (v) => v !== val
        );
        filterRecipes();
      });

      activeFiltersContainer.appendChild(tag);
    });
  });
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
    const matchSearch =
      recipe.name.toLowerCase().includes(searchTerm) ||
      recipe.description.toLowerCase().includes(searchTerm) ||
      recipe.ingredients.some((i) =>
        i.ingredient.toLowerCase().includes(searchTerm)
      );

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

  // 🔥 mettre à jour la variable globale
  currentRecipes = filtered;

  displayRecipes(filtered);

  ingredientUI && ingredientUI.update();
  applianceUI && applianceUI.update();
  ustensilUI && ustensilUI.update();
  renderActiveFilters();
}

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
        <img src="JSON_recipes/${recipe.image}" alt="${escapeHtml(
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
