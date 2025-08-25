// Récup et affichage des travaux dans la galerie principale // 
async function getworks() {
  const reponse = await fetch("http://localhost:5678/api/works"); // Récupère les projets depuis l'API //
  const projets = await reponse.json(); // Convertit la réponse en JSON (liste de projets) //
  let gallery = document.getElementsByClassName("gallery")[0]; // Sélectionne le conteneur HTML de la galerie //
  gallery.innerHTML = ""; // Vide le contenu actuel de la galerie //

  // Parcours tous les projets un par un
  for (let compteur = 0; compteur < projets.length; compteur++) {
    const figureElement = document.createElement("figure"); // Crée un conteneur figure pour chaque projet //
    const figcaptionElement = document.createElement("figcaption"); // Crée l’élément texte (titre du projet) //
    figcaptionElement.textContent = projets[compteur].title; // Affecte le titre du projet //
    const imgElement = document.createElement("img"); // Crée l’image //
    imgElement.src = projets[compteur].imageUrl; // Source de l’image depuis l’API //

    figureElement.appendChild(imgElement); // Ajoute l’image à figure //
    figureElement.appendChild(figcaptionElement); // Ajoute le titre à figure //
    figureElement.setAttribute("data-categoryid", projets[compteur].categoryId); // Attribut personnalisé pour le filtre //
    gallery.appendChild(figureElement); // Ajoute la figure à la galerie //
  }
}


// Récup et affichage des catégories depuis l'API //
async function getcategories() {
  const reponse = await fetch("http://localhost:5678/api/categories"); // Appel à l’API pour les catégories //
  const categories = await reponse.json(); // Transformation de la réponse en tableau //
  const categoriesMenu = document.getElementById("categories-menu"); // Conteneur HTML des boutons de filtre //
  const categorySelect = document.getElementById("category"); // Liste déroulante du formulaire ajout photo //

  categoriesMenu.innerHTML = ""; // On vide d’abord l’ancien contenu //
  categorySelect.innerHTML = ""; // On vide le <select> aussi //

  // Fonction pour créer un bouton de filtre //
  function createButton(name, id) {
    const button = document.createElement("button"); // Crée un bouton //
    button.textContent = name; // Texte du bouton //
    button.classList.add("boutons-filtres"); // Classe CSS pour styliser //
    button.setAttribute("data-category-id", id); // Attribut pour savoir à quelle catégorie il correspond //

    // Événement clic : filtre la galerie et met le bouton actif //
    button.addEventListener("click", () => {
      setActiveButton(button);
      filterGalleryByCategory(id);
    });

    categoriesMenu.appendChild(button); // Ajoute le bouton au menu HTML //
  }

  // Création du bouton "Tous" //
  createButton("Tous", 0);

  // Ajoute une option vide au <select> (pour forcer l'utilisateur à choisir) //
  const option = document.createElement("option");
  option.value = 0;
  option.textContent = "";
  categorySelect.appendChild(option);

  // Création des boutons et options <select> pour chaque catégorie //
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    categorySelect.appendChild(option);

    createButton(category.name, category.id);
  });
}

// Met en surbrillance le bouton actif //
function setActiveButton(activeBtn) {
  document.querySelectorAll(".boutons-filtres").forEach((btn) => {
    btn.classList.remove("active"); // Supprime la classe active sur tous les boutons //
  });
  activeBtn.classList.add("active"); // Ajoute la classe active sur le bouton cliqué //
}


// Affiche uniquement les projets correspondant à la catégorie sélectionnée //
function filterGalleryByCategory(categoryId) {
  const figures = document.querySelectorAll(".gallery figure"); // Sélectionne tous les projets //
  figures.forEach((figure) => {
    const id = parseInt(figure.getAttribute("data-categoryid")); // Récupère la catégorie de chaque projet //
    // Si "Tous" est sélectionné (0) ou si la catégorie correspond, on l’affiche. Sinon, on le cache //
    figure.style.display = categoryId === 0 || id === categoryId ? "block" : "none";
  });
}

// Affichage de la galerie dans la modale (admin) //
async function displayModalGallery() {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    const works = await response.json();
    const container = document.getElementById("modal-gallery-container");
    container.innerHTML = "";

    works.forEach((work) => {
      const figure = document.createElement("figure");
      const img = document.createElement("img");
      img.src = work.imageUrl;
      img.alt = work.title;

      const deleteBtn = document.createElement("span");
      deleteBtn.classList.add("delete-icon");
      deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';

      deleteBtn.addEventListener("click", () => {
        deleteWork(work.id); // Suppression du projet au clic sur la corbeille //
      });

      figure.appendChild(img);
      figure.appendChild(deleteBtn);
      container.appendChild(figure);
    });
  } catch (error) {
    console.error("Erreur lors du chargement des works :", error);
  }
}

// Suppression d’un projet depuis la modale //
async function deleteWork(id) {
  const token = sessionStorage.getItem("token"); // Récupération du token de session //
  const response = await fetch(`http://localhost:5678/api/works/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    displayModalGallery(); // Mise à jour de la galerie modale //
    getworks(); // Mise à jour de la galerie principale //
  } else {
    alert("Échec de la suppression"); // Message d’erreur //
  }
}

// Gestion du formulaire d’ajout de photo avec prévisualisation //
function setupAddPhotoForm() {
  const form = document.getElementById("add-photo-form");
  const fileInput = document.getElementById("image");
  const titleInput = document.getElementById("title");
  const categorySelect = document.getElementById("category");
  const submitBtn = document.getElementById("submit-photo");

  const iconImageContainer = document.querySelector('.icon-image-container');
  const addPhotoLabel = iconImageContainer.querySelector('label[for="image"]');

  const previewImg = document.createElement('img');
  previewImg.style.maxWidth = "100%";
  previewImg.style.marginTop = "0px";
  previewImg.style.display = "none";
  iconImageContainer.appendChild(previewImg);

  // Affiche la prévisualisation quand une image est choisie //
  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
  
    if (file) {
      const validTypes = ["image/jpeg", "image/png"];
      const maxSize = 4 * 1024 * 1024; // 4 Mo en octets
  
      if (validTypes.includes(file.type) && file.size <= maxSize) {
        const reader = new FileReader();
        reader.onload = (e) => {
          previewImg.src = e.target.result;
          previewImg.style.display = "block";
        };
        reader.readAsDataURL(file);
  
        // Cache les icônes et le texte d'upload
        const iconimage = document.querySelector('.fa-image');
        const formatimg = document.querySelector('.formatimg');
        iconimage.style.display = "none";
        formatimg.style.display = "none";
        addPhotoLabel.style.display = "none";
      } else {
        alert("Veuillez sélectionner une image JPG ou PNG de moins de 4 Mo.");
        fileInput.value = ""; // Réinitialise le champ fichier
        previewImg.style.display = "none";
        addPhotoLabel.style.display = "inline";
  
        const iconimage = document.querySelector('.fa-image');
        const formatimg = document.querySelector('.formatimg');
        iconimage.style.display = "inline";
        formatimg.style.display = "block";
      }
    } else {
      // Pas de fichier sélectionné
      previewImg.style.display = "none";
      addPhotoLabel.style.display = "inline";
  
      const iconimage = document.querySelector('.fa-image');
      const formatimg = document.querySelector('.formatimg');
      iconimage.style.display = "inline";
      formatimg.style.display = "block";
    }
  
    checkFormValidity();
  });
  

  // Mise à jour de l’état du bouton "Valider" //
  titleInput.addEventListener("input", checkFormValidity);
  categorySelect.addEventListener("change", checkFormValidity);

  function checkFormValidity() {
    if (
      fileInput.files.length > 0 &&
      titleInput.value.trim() !== "" &&
      categorySelect.value !== ""
    ) {
      submitBtn.disabled = false;
      submitBtn.classList.add("active");
    } else {
      submitBtn.disabled = true;
      submitBtn.classList.remove("active");
    }
  }

  // Soumission du formulaire //
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = sessionStorage.getItem("token");
    if (!token) {
      alert("Vous devez être connecté pour ajouter une photo.");
      return;
    }

    const formData = new FormData();
    formData.append("image", fileInput.files[0]);
    formData.append("title", titleInput.value);
    formData.append("category", categorySelect.value);

    try {
      const response = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert("Photo ajoutée !");
        form.reset();
        submitBtn.disabled = true;
        submitBtn.classList.remove("active");
        previewImg.style.display = "none";
        addPhotoLabel.style.display = "inline";

        document.getElementById("modal-add-view").classList.add("hidden");
        document.getElementById("modal-gallery-view").classList.remove("hidden");

        displayModalGallery();
        getworks();
      } else {
        alert("Erreur lors de l'ajout");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
    }
  });
}


// Initialisation du script quand la page est prête //
document.addEventListener("DOMContentLoaded", () => {
  const modalOverlay = document.getElementById("modal-overlay");
  const modifier = document.getElementById("modifier");
  const closeModalBtn = document.querySelector(".close-modal");
  const ajoutPhoto = document.getElementById("open-add-photo");
  const modaladdview = document.getElementById("modal-add-view");
  const modalGalleryView = document.getElementById("modal-gallery-view");
  const backToGalleryBtn = document.getElementById("back-to-gallery");

  let token = sessionStorage.getItem("token");
  const login = document.getElementById("login");
  const adminbar = document.getElementById("admin-bar");
  const categories_menu = document.getElementById("categories-menu");

  // Si utilisateur connecté, activer mode admin //
  if (token) {
    adminbar.style.display = "block";
    login.textContent = "logout";
    modifier.style.display = "inline";
    categories_menu.style.display = "none";

    login.addEventListener("click", () => {
      sessionStorage.removeItem("token");
      adminbar.style.display = "none";
      login.innerHTML = '<a href="login.html">login</a>';
      modifier.style.display = "none";
      categories_menu.style.display = "flex";
    });
  }

  // Gestion des boutons d'ouverture et fermeture de la modale //
  modifier.addEventListener("click", () => {
    modalOverlay.classList.remove("hidden");
    modalOverlay.classList.add("modal-overlay");

    modalGalleryView.classList.remove("hidden");
    modaladdview.classList.add("hidden");

    displayModalGallery();
  });

  closeModalBtn.addEventListener("click", () => {
    modalOverlay.classList.add("hidden");
  });

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.add("hidden");
    }
  });

  ajoutPhoto.addEventListener("click", () => {
    modaladdview.classList.remove("hidden");
    modalGalleryView.classList.add("hidden");
  });

  backToGalleryBtn.addEventListener("click", () => {
    modaladdview.classList.add("hidden");
    modalGalleryView.classList.remove("hidden");
  });

  setupAddPhotoForm(); // Initialise la logique du formulaire //
});


// Chargement initial de la galerie et des catégories // 
getworks();      // Charge les projets au démarrage //
getcategories(); // Charge les catégories au démarrage //
