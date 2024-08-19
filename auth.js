document.addEventListener("DOMContentLoaded", function () {
  const authForm = document.getElementById("auth-form");
  const errorMessage = document.getElementById("error-message");
  const createAccountBtn = document.getElementById("create-account-btn");
  const loginBtn = document.getElementById("login-btn");

  // Vérifier si un pseudo est déjà enregistré et rediriger
  const storedPseudo = localStorage.getItem("pseudo");
  if (storedPseudo) {
    window.location.href = "calendar.html"; // Redirige vers la page du calendrier
  }

  createAccountBtn.addEventListener("click", function () {
    handleAuth(true); // Créer un nouveau compte
  });

  loginBtn.addEventListener("click", function () {
    handleAuth(false); // S'authentifier avec un compte existant
  });

  async function handleAuth(isCreatingAccount) {
    const pseudo = document.getElementById("pseudo").value;
    const pantryId = "3a4b5008-221a-4a4e-bf24-fbbc173c978c"; // Remplacez par votre ID de pantry
    const apiUrl = `https://getpantry.cloud/apiv1/pantry/${pantryId}/basket/${pseudo}`;

    if (isCreatingAccount) {
      // Vérifier si le pseudo existe déjà via l'API
      try {
        const response = await fetch(apiUrl);

        if (response.ok) {
          // Si le panier existe, afficher une erreur
          errorMessage.textContent =
            "Ce pseudo existe déjà. Veuillez en choisir un autre.";
          errorMessage.style.display = "block";
        } else if (response.status === 400) {
          // Si le panier n'existe pas (erreur 404), créer un nouveau compte
          // Envoyer une requête POST pour créer le panier
          try {
            const numberOfWeeks = 52;
            const numberOfYears = 91;
            const totalElements = numberOfWeeks * numberOfYears;

            const initialArray = new Array(totalElements).fill(false);

            const postResponse = await fetch(apiUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ value: JSON.stringify(initialArray) }), // Créer un panier vide ou selon ce que l'API attend
            });

            if (postResponse.ok) {
              // Le panier a été créé avec succès
              localStorage.setItem("pseudo", pseudo);
              window.location.href = "calendar.html"; // Redirection vers la page du calendrier
            } else {
              // Afficher un message d'erreur pour la création du panier
              const errorData = await postResponse.json();
              errorMessage.textContent =
                "Une erreur est survenue lors de la création du compte : " +
                (errorData.message || "Veuillez réessayer.");
              errorMessage.style.display = "block";
            }
          } catch (error) {
            // Gestion des erreurs lors de la création du panier
            errorMessage.textContent =
              "Une erreur est survenue lors de la création du compte. Veuillez vérifier votre connexion.";
            errorMessage.style.display = "block";
          }
        } else {
          // Afficher un autre message d'erreur pour les autres codes de réponse
          const errorData = await response.json();
          errorMessage.textContent =
            "Une erreur est survenue : " +
            (errorData.message || "Veuillez réessayer.");
          errorMessage.style.display = "block";
        }
      } catch (error) {
        // Gestion des erreurs réseau ou autres
        errorMessage.textContent =
          "Une erreur est survenue. Veuillez vérifier votre connexion.";
        errorMessage.style.display = "block";
      }
    } else {
      // Logique pour s'authentifier
      try {
        const response = await fetch(apiUrl);

        if (response.ok) {
          // Le panier existe, l'utilisateur peut accéder au calendrier
          localStorage.setItem("pseudo", pseudo);
          window.location.href = "calendar.html"; // Redirection vers la page du calendrier
        } else if (response.status === 400) {
          // Le panier n'existe pas, afficher une erreur
          errorMessage.textContent = "Pseudo incorrect. Veuillez réessayer.";
          errorMessage.style.display = "block";
        } else {
          // Afficher un autre message d'erreur pour les autres codes de réponse
          const errorData = await response.json();
          errorMessage.textContent =
            "Une erreur est survenue : " +
            (errorData.message || "Veuillez réessayer.");
          errorMessage.style.display = "block";
        }
      } catch (error) {
        // Gestion des erreurs réseau ou autres
        errorMessage.textContent =
          "Une erreur est survenue. Veuillez vérifier votre connexion.";
        errorMessage.style.display = "block";
      }
    }
  }
});
