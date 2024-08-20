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
    const [data, toggleState] = await fetchBasketData(storedPseudo);
    renderCalendar(data);
    setToggle(toggleState);
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
    const toggleState = data.toogleState ? JSON.parse(data.toogleState) : false;
    return [CheckBoxState, toggleState];
  } catch (error) {
    console.error("Erreur lors de la récupération du panier : ", error);
    return [[], false];
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

    htmlyear += `<div class='weeks'><p style="width:20px;margin:0;padding:0;text-align:center">${year}</p>${htmlweek}</div>`;
  }

  document.getElementById("years").innerHTML = htmlyear;
}

function bufferCheck(value) {
  const state = document.getElementById(value).checked;
  buffer[value] = state;

  CheckBoxState[value] = state;

  document.getElementById("loader").style.display = "block";

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    if (buffer.length > 0) {
      updateBasket();
    }
  }, DEBOUNCE_DELAY);
}

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
      buffer = [];
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
    document.getElementById("loader").style.display = "none";
  }
}

window.addEventListener("beforeunload", () => {
  if (buffer.length > 0) {
    updateBasket();
  }
});

function setToggle(toggleState) {
  const toggleInput = document.querySelector(".toggle-state");
  const labelText = document.querySelector(".label-text");

  if (toggleInput) {
    // Définir l'état initial du toggle
    toggleInput.checked = toggleState;

    // Modifier l'interface en fonction de l'état initial
    if (toggleState) {
      setWeeksAndYearsStyles("column", "row", "Vertical");
    } else {
      setWeeksAndYearsStyles("row", "column", "Horizontal");
    }

    // Écouter les changements d'état
    toggleInput.addEventListener("change", function () {
      const newState = toggleInput.checked;
      updateToggleState(newState); // Mettre à jour l'état du toggle dans l'API

      if (newState) {
        setWeeksAndYearsStyles("column", "row", "Vertical");
      } else {
        setWeeksAndYearsStyles("row", "column", "Horizontal");
      }
    });
  }
}

function setWeeksAndYearsStyles(
  weeksDirection,
  yearsDirection,
  labelTextValue
) {
  const weeks = document.querySelectorAll(".weeks");
  const years = document.querySelector(".years");
  const labelText = document.querySelector(".label-text");

  weeks.forEach((week) => {
    week.style.flexDirection = weeksDirection;
  });

  years.style.flexDirection = yearsDirection;
  labelText.textContent = labelTextValue;
}

async function updateToggleState(newState) {
  const storedPseudo = localStorage.getItem("pseudo");
  const pantryId = "3a4b5008-221a-4a4e-bf24-fbbc173c978c";
  const apiUrl = `https://getpantry.cloud/apiv1/pantry/${pantryId}/basket/${storedPseudo}`;

  try {
    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ toogleState: newState }),
    });

    if (response.ok) {
      console.log("État du toggle mis à jour avec succès");
    } else {
      const errorData = await response.json();
      console.error(
        "Erreur lors de la mise à jour de l'état du toggle : ",
        errorData.message || "Veuillez réessayer."
      );
    }
  } catch (error) {
    console.error(
      "Erreur réseau ou autre lors de la mise à jour de l'état du toggle :",
      error
    );
  }
}
