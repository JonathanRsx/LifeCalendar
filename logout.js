document.addEventListener("DOMContentLoaded", function () {
  const logoutBtn = document.getElementById("logout-btn");

  logoutBtn.addEventListener("click", function () {
    // Supprimer le pseudo du localStorage
    localStorage.removeItem("pseudo");

    // Rediriger l'utilisateur vers la page d'authentification
    window.location.href = "index.html";
  });
});
