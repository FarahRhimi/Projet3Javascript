console.log("bonjour");

async function getworks() {
  const reponse = await fetch("http://localhost:5678/api/works");
  const projets = await reponse.json();
  let gallery = document.getElementsByClassName("gallery")[0];
  gallery.innerHTML = "";

  for (let compteur = 0; compteur < projets.length; compteur++) {
    console.log(projets[compteur].title);
    const figureElement = document.createElement("figure");
    const figcaptionElement = document.createElement("figcaption");
    figcaptionElement.textContent = projets[compteur].title;
    const imgElement = document.createElement("img");
    imgElement.src = projets[compteur].imageUrl;

    figureElement.appendChild(imgElement);
    figureElement.appendChild(figcaptionElement);
    figureElement.setAttribute("data-categoryid", projets[compteur].categoryId);

    gallery.appendChild(figureElement);
  }

  console.log(projets);
}

async function getcategories() {
  const reponse = await fetch("http://localhost:5678/api/categories");
  const categories = await reponse.json();
  const categoriesMenu = document.getElementById("categories-menu");

  function createButton(name, id) {
    const button = document.createElement("button");
    button.textContent = name;
    button.classList.add("boutons-filtres");
    button.setAttribute("data-category-id", id);
    button.addEventListener("click", () => {
      setActiveButton(button);
      filterGalleryByCategory(id);
    });
    categoriesMenu.appendChild(button);
  }

  createButton("Tous", 0);
  categories.forEach((category) => {
    createButton(category.name, category.id);
  });
}

function setActiveButton(activeBtn) {
  document.querySelectorAll(".boutons-filtres").forEach((btn) => {
    btn.classList.remove("active");
  });
  activeBtn.classList.add("active");
}

function filterGalleryByCategory(categoryId) {
  const figures = document.querySelectorAll(".gallery figure");
  figures.forEach((figure) => {
    const id = parseInt(figure.getAttribute("data-categoryid"));
    if (categoryId === 0 || id === categoryId) {
      figure.style.display = "block";
    } else {
      figure.style.display = "none";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const modalOverlay = document.getElementById("modal-overlay");
  const modifier = document.getElementById("modifier");
  const closeModalBtn = document.querySelector(".close-modal");
console.log(closeModalBtn)

  // Ouvre la modale
  modifier.addEventListener("click", () => {
    modalOverlay.classList.remove("hidden");
    modalOverlay.classList.add("modal-overlay")
  });

  // Ferme la modale via la croix
  closeModalBtn.addEventListener("click", (e) => {
    console.log (".close-modal")
    modalOverlay.classList.add("hidden");
  });

  // Ferme la modale via l’overlay
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.add("hidden");
    }
  });

  // Connexion/logout
  let token = window.sessionStorage.getItem("token");
  console.log(token);
  const login = document.getElementById("login");
  const adminbar = document.getElementById("admin-bar");
  const categories_menu = document.getElementById("categories-menu");

  if (token != null) {
    console.log("jesuisconnectée");
    adminbar.style.display = "block";
    login.textContent = "logout";
    modifier.style.display = "inline";
    categories_menu.style.display = "none";

    login.addEventListener("click", () => {
      sessionStorage.removeItem("token");
      adminbar.style.display = "none";
      login.innerHTML = '<a href="login.html">login</a>';
      modifier.style.display = "none";
      categories_menu.style.display = "block";
    });
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const modalOverlay = document.getElementById("modal-overlay");
  const closeModalBtn = document.querySelector(".close-modal");
  const modifierBtn = document.getElementById("modifier");

  // Vérification JS
  console.log("JS chargé");

  // Ouvrir la modale
  modifierBtn.addEventListener("click", () => {
    console.log("Ouverture de la modale");
    modalOverlay.classList.remove("hidden");
    displayModalGallery(); // Ajout dynamique des images
  });

  // Fermer via la croix
  closeModalBtn.addEventListener("click", () => {
    console.log("Fermeture via croix");
    modalOverlay.classList.add("hidden");
  });

  // Fermer en cliquant en dehors
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      console.log("Fermeture via overlay");
      modalOverlay.classList.add("hidden");
    }
  });
});

// Fonction pour afficher les œuvres dans la modale
async function displayModalGallery() {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    const works = await response.json();

    const container = document.getElementById("modal-gallery-container");
    container.innerHTML = "";

    works.forEach(work => {
      const figure = document.createElement("figure");

      const img = document.createElement("img");
      img.src = work.imageUrl;
      img.alt = work.title;

      const deleteBtn = document.createElement("span");
      deleteBtn.classList.add("delete-icon");
      deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';

      // TODO : suppression via API
      deleteBtn.addEventListener("click", () => {
        deleteWork(work.id);
      });

      figure.appendChild(img);
      figure.appendChild(deleteBtn);
      container.appendChild(figure);
    });
  } catch (error) {
    console.error("Erreur lors du chargement des works :", error);
  }
}

// Fonction pour supprimer une œuvre
async function deleteWork(id) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`http://localhost:5678/api/works/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (response.ok) {
    console.log(`Suppression de l'œuvre ${id}`);
    displayModalGallery(); // recharge la modale
    getworks?.(); // recharge la galerie principale si définie
  } else {
    alert("Échec de la suppression");
  }
}




getworks();
getcategories();
