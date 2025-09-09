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
          <p>
            ${recipe.ingredients
              .map(
                (i) => `
              <strong>${escapeHtml(i.ingredient)}</strong> ${
                  i.quantity ? escapeHtml(i.quantity) : ""
                } ${i.unit ? escapeHtml(i.unit) : ""}
            `
              )
              .join("")}
          </p>
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
  if (!str && str !== "") return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Init
displayRecipes(recipes);
