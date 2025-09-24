import { recipes } from "./recipes.js";

// Tableau global des recettes actuellement affichées après filtrage
let selectedFilters = {
  ingredients: [],
  appliances: [],
  ustensils: [],
};

// Tableau global des recettes actuellement affichées après filtrage
let currentRecipes = recipes;

// Sélecteurs du DOM
const container = document.getElementById("recipes-container");
const recipeCount = document.getElementById("recipeCount");
const searchInput = document.getElementById("search");
const clearSearch = document.getElementById("clearSearch");
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

// Configuration de l'interface utilisateur pour un bloc de filtre
function setupFilterUI(filterId, type, placeholderText) {
  const root = document.getElementById(filterId);
  if (!root) return null;

  const header = root.querySelector(".filter-header");
  const search = root.querySelector(".filter-search");
  const optionsList = root.querySelector(".filter-options");

  search.addEventListener("input", () => {
    if (search.value.trim().length > 0) {
      search.classList.add("has-text");
    } else {
      search.classList.remove("has-text");
    }
    renderOptions(getUniqueElements(currentRecipes, type));
  });

  // bouton croix = vider input
  const clearBtn = root.querySelector(".clear-filter");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      search.value = "";
      search.classList.remove("has-text");
      renderOptions(getUniqueElements(currentRecipes, type));
    });
  }

  // Accessibilité : permettre le basculement au clavier
  header.tabIndex = 0;
  header.setAttribute("role", "button");

  // Fermer quand on clique à l'extérieur
  function outsideClickListener(e) {
    if (!root.contains(e.target)) {
      root.classList.remove("open");
      document.removeEventListener("click", outsideClickListener);
    }
  }

  // Basculer ouverture/fermeture
  function toggleOpen(root, search, header) {
    const isOpening = !root.classList.contains("open");

    // Fermer tous les autres filtres
    document.querySelectorAll(".filter-box").forEach((f) => {
      if (f !== root) {
        f.classList.remove("open", "is-open");
        const icon = f.querySelector(".filter-header i");
        if (icon) icon.className = "fa-solid fa-chevron-down";
      }
    });

    if (isOpening) {
      root.classList.add("open", "is-open");
      search.focus();
      document.addEventListener("click", outsideClickListener);

      const icon = header.querySelector("i");
      if (icon) icon.className = "fa-solid fa-chevron-down";
    } else {
      root.classList.remove("open", "is-open");
      document.removeEventListener("click", outsideClickListener);

      const icon = header.querySelector("i");
      if (icon) icon.className = "fa-solid fa-chevron-down";
    }
  }

  // Listeners
  header.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleOpen(root, search, header);
  });

  header.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleOpen(root, search, header);
    }
  });

  // Afficher les options d'abord sélectionnées (en jaune), puis le reste filtré par la recherche
  function renderOptions(allItems) {
    const selected = selectedFilters[type] || [];
    const searchTerm = (search.value || "").trim().toLowerCase();

    // Créer un set pour ignorer les éléments déjà sélectionnés
    const selectedSet = new Set(selected);

    optionsList.innerHTML = "";

    // Éléments sélectionnés en premier (toujours visibles)
    selected.forEach((val) => {
      const li = document.createElement("li");
      li.className = "option-item selected";
      li.dataset.value = val;
      li.innerHTML = `
    <span class="label">${val}</span>
    <i class="fa-solid fa-circle-xmark remove-btn" aria-label="Retirer ${val}" style="cursor: pointer;"></i>
    `;
      optionsList.appendChild(li);
    });

    // Éléments restants, filtrés par la recherche
    allItems.forEach((it) => {
      if (selectedSet.has(it)) return; // ignorer déjà sélectionnés (déjà ajoutés)
      if (searchTerm && !it.toLowerCase().includes(searchTerm)) return;
      const li = document.createElement("li");
      li.className = "option-item";
      li.dataset.value = it;
      li.textContent = it;
      optionsList.appendChild(li);
    });
  }

  // Gestion des clics sur les options sélectionner et retirer
  optionsList.addEventListener("click", (e) => {
    const li = e.target.closest("li.option-item");
    if (!li) return;
    const value = li.dataset.value;

    // suppression uniquement si clic sur la croix
    if (e.target.classList.contains("remove-btn")) {
      selectedFilters[type] = (selectedFilters[type] || []).filter(
        (v) => v !== value
      );
      filterRecipes();
      return;
    }

    // si c’est déjà sélectionné et qu’on ne clique pas la croix → on ignore
    if (li.classList.contains("selected")) {
      return;
    }

    // Ajouter sinon
    selectedFilters[type] = [
      ...new Set([...(selectedFilters[type] || []), value]),
    ];
    filterRecipes();
  });

  search.addEventListener("input", () => {
    renderOptions(getUniqueElements(currentRecipes, type));
  });

  return {
    update: () => renderOptions(getUniqueElements(currentRecipes, type)),
    open: () => {
      if (!root.classList.contains("open")) {
        toggleOpen();
      }
    },
  };
}

// Créer une interface utilisateur par filtre
const ingredientUI = setupFilterUI("ingredientFilter", "ingredients");
const applianceUI = setupFilterUI("applianceFilter", "appliances");
const ustensilUI = setupFilterUI("ustensilFilter", "ustensils");

// Met à jour les filtres sélectionnés sous la barre de recherche du filtre
function renderActiveFilters() {
  if (!activeFiltersContainer) return;
  activeFiltersContainer.innerHTML = "";

  Object.entries(selectedFilters).forEach(([type, values]) => {
    values.forEach((val) => {
      const tag = document.createElement("div");
      tag.className = "filter-tag";
      tag.innerHTML = `
        <span class="tag-label">${val}</span>
        <button class="tag-remove" aria-label="Retirer ${val}">
          <i class="fa-solid fa-xmark"></i>
        </button>
      `;

      // 👉 seul le bouton supprime le filtre
      tag.querySelector(".tag-remove").addEventListener("click", () => {
        selectedFilters[type] = (selectedFilters[type] || []).filter(
          (v) => v !== val
        );
        filterRecipes();
      });

      activeFiltersContainer.appendChild(tag);
    });
  });
}

// Fonction pour remplir une liste déroulante
function fillFilter(element, items) {
  element.innerHTML = element.options[0].outerHTML;
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

  // Moins de 3 caractères = pas d'affichage de recette
  if (searchTerm.length > 0 && searchTerm.length < 3) {
    currentRecipes = recipes;
    displayRecipes(currentRecipes);
    ingredientUI && ingredientUI.update();
    applianceUI && applianceUI.update();
    ustensilUI && ustensilUI.update();
    renderActiveFilters();
    return;
  }

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

  // Ajouter une croix pour supprimer le contenu des input
  searchInput.addEventListener("input", () => {
    if (searchInput.value.trim().length > 0) {
      clearSearch.style.display = "block";
    } else {
      clearSearch.style.display = "none";
    }
  });

  clearSearch.addEventListener("click", () => {
    searchInput.value = "";
    clearSearch.style.display = "none";
    searchInput.focus();
    filterRecipes();
  });

  // Mettre à jour la variable globale
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
    const searchTerm = searchInput.value.trim();
    container.innerHTML = `<p>Aucune recette ne contient "${escapeHtml(
      searchTerm
    )}", vous pouvez chercher "tarte aux pommes", "poisson", etc.</p>`;
    recipeCount.textContent = "0 recette";
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

    // si la description est longue, on ajoute le bouton pour voir plus/moins
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
  if (!str && str !== "") return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Initialisation
filterRecipes();
displayRecipes(recipes);
