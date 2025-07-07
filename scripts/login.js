console.log("bonjour");

document.addEventListener("submit", async (event) => {
  event.preventDefault();
  console.log("Il n’y a pas eu de rechargement de page");

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  console.log(email);
  console.log(password);

  const errorMessage = document.getElementById("error-message");

  try {
    const response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      // Si le mot de passe ou l’email est incorrect
      if (errorMessage) {
        errorMessage.textContent = "Email ou mot de passe incorrect.";
        errorMessage.style.display = "block";
      }
      return;
    }

    const data = await response.json();
    console.log("Réponse serveur :", data);
    console.log("Token :", data.token);

    // Stockage du token
    window.sessionStorage.setItem("token", data.token);

    // Redirection vers la page d’accueil
    window.location.href = "index.html"; // adapte selon ton projet

  } catch (error) {
    console.error("Erreur :", error);
    if (errorMessage) {
      errorMessage.textContent = "Une erreur réseau est survenue.";
      errorMessage.style.display = "block";
    }
  }
});
