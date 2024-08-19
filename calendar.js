document.addEventListener("DOMContentLoaded", async function () {
  const storedPseudo = localStorage.getItem("pseudo");

  if (!storedPseudo) {
    window.location.href = "index.html";
    return;
  }

  // Afficher le pseudo dans le header
  const userPseudoElement = document.getElementById("user-pseudo");
  if (userPseudoElement) {
    userPseudoElement.textContent = storedPseudo;
  }

  try {
    const data = await fetchBasketData(storedPseudo);
    renderCalendar(data);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données du panier :",
      error
    );
  }
});

let CheckBoxState = [];
let buffer = [];
let debounceTimer;
const DEBOUNCE_DELAY = 1000; // Réduction à 1 seconde

async function fetchBasketData(basketName) {
  const pantryId = "3a4b5008-221a-4a4e-bf24-fbbc173c978c";
  const apiUrl = `https://getpantry.cloud/apiv1/pantry/${pantryId}/basket/${basketName}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Erreur HTTP ! statut : ${response.status}`);
    }
    const data = await response.json();
    CheckBoxState = data.value ? JSON.parse(data.value) : [];
    return CheckBoxState;
  } catch (error) {
    console.error("Erreur lors de la récupération du panier : ", error);
    return [];
  }
}

function renderCalendar(CheckBoxState) {
  let htmlyear = "";
  let count = 0;

  for (let year = 0; year < 91; year++) {
    let htmlweek = "";

    for (let week = 0; week < 52; week++) {
      htmlweek += `<input type='checkbox' id='${count}' onchange='bufferCheck(${count})' onblur='bufferCheck(${count})' ${
        CheckBoxState[count] ? "checked" : ""
      }/>`;
      count += 1;
    }

    htmlyear += `<div class='weeks'><p>AN ${year}</p>${htmlweek}</div>`;
  }

  document.getElementById("year").innerHTML = htmlyear;
}

// Fonction pour ajouter des modifications au buffer et envoyer une requête
function bufferCheck(value) {
  const state = document.getElementById(value).checked;
  buffer[value] = state;

  // Mettre à jour CheckBoxState
  CheckBoxState[value] = state;

  // Afficher le loader
  document.getElementById("loader").style.display = "block";

  // Déclencher la mise à jour avec debounce
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    if (buffer.length > 0) {
      updateBasket();
    }
  }, DEBOUNCE_DELAY);
}

// Fonction pour mettre à jour le panier
async function updateBasket() {
  const storedPseudo = localStorage.getItem("pseudo");
  const pantryId = "3a4b5008-221a-4a4e-bf24-fbbc173c978c";
  const apiUrl = `https://getpantry.cloud/apiv1/pantry/${pantryId}/basket/${storedPseudo}`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ value: JSON.stringify(CheckBoxState) }),
    });

    if (response.ok) {
      console.log("Panier mis à jour avec succès");
      buffer = []; // Réinitialiser le buffer après la mise à jour réussie
    } else {
      const errorData = await response.json();
      console.error(
        "Erreur lors de la mise à jour du panier : ",
        errorData.message || "Veuillez réessayer."
      );
    }
  } catch (error) {
    console.error(
      "Erreur réseau ou autre lors de la mise à jour du panier :",
      error
    );
  } finally {
    // Masquer le loader après la mise à jour
    document.getElementById("loader").style.display = "none";
  }
}

// Sauvegarde automatique avant de quitter la page
window.addEventListener("beforeunload", () => {
  if (buffer.length > 0) {
    updateBasket();
  }
});
