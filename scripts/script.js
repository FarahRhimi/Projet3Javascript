console.log("bonjour");

// Récupération et affichage des travaux dans la galerie principale
async function getworks() {
  const reponse = await fetch("http://localhost:5678/api/works");
  const projets = await reponse.json();
  let gallery = document.getElementsByClassName("gallery")[0];
  gallery.innerHTML = "";

  for (let compteur = 0; compteur < projets.length; compteur++) {
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
}

// Récupération et affichage des catégories
async function getcategories() {
  const reponse = await fetch("http://localhost:5678/api/categories");
  const categories = await reponse.json();
  const categoriesMenu = document.getElementById("categories-menu");
  const categorySelect = document.getElementById("category");

  categoriesMenu.innerHTML = "";
  categorySelect.innerHTML = "";

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

    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    categorySelect.appendChild(option);
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
    figure.style.display = categoryId === 0 || id === categoryId ? "block" : "none";
  });
}

// Galerie modale
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

// Suppression
async function deleteWork(id) {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`http://localhost:5678/api/works/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.ok) {
    console.log(`Suppression de l'œuvre ${id}`);
    displayModalGallery();
    getworks();
  } else {
    alert("Échec de la suppression");
  }
}

// Formulaire ajout photo avec prévisualisation
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
  previewImg.style.marginTop = "10px";
  previewImg.style.display = "none";
  iconImageContainer.appendChild(previewImg);

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    console.log (file)
    if ((file.name).length !=2) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImg.src = e.target.result;
        previewImg.style.display = "block";
      };
      addPhotoLabel.style.display = "none";
      reader.readAsDataURL(file);
    } else {
      previewImg.style.display = "none";
      addPhotoLabel.style.display = "inline";
    }
    checkFormValidity();
  });

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

// DOM Ready
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

  setupAddPhotoForm();
});

getworks();
getcategories();
