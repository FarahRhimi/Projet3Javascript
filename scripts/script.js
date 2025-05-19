console.log ("bonjour")
async function getworks () {
const reponse = await fetch("http://localhost:5678/api/works");
/*if (!reponse.ok) {
    console.log("status : "+reponse.status);
  }*/

const projets = await reponse.json();
let gallery = document.getElementsByClassName ("gallery") [0]
gallery.innerHTML=""
let paragraphe;
let figureElement; 
let figcaptionElement;
let imgElement;

for (let compteur = 0; compteur <projets.length ; compteur = compteur +1){
    console.log (projets [compteur].title) 
    paragraphe=document.createElement("p")
    paragraphe.textContent=projets [compteur].title 
    /*
    gallery.appendChild(paragraphe)
    */
    figureElement = document.createElement ("figure")
    figcaptionElement = document.createElement ("figcaption")
    figcaptionElement.textContent = projets [compteur].title 
    imgElement = document.createElement ("img")
    imgElement.src = projets [compteur].imageUrl
    figureElement.appendChild (imgElement)
    figureElement.appendChild (figcaptionElement)
    gallery.appendChild (figureElement)
}
console.log (projets)
}
/*
async function await fetch ("http://localhost:5678/api/categories");
*if (!reponse.ok) {
    console.log("status : "+reponse.status);
  }
*/

getworks()

async function getcategories () {
  const reponse = await fetch("http://localhost:5678/api/categories");
  /*if (!reponse.ok) {
      console.log("status : "+reponse.status);
    }*/
  
  const categories = await reponse.json();
  let categoriesMenu = document.getElementById ("categories-menu") 
  let liElement; 
  liElement = document.createElement ("li")
  /* inser dataset balise li = ajout d'un attibut quivas'appeler data-catID qui vaut zéro pcq pas dans l'API on veut tous les afficher et dont la valeur sera l'id de la cat récupéré dans l'api*/ 
  liElement.textContent="Tous" 
  categoriesMenu.appendChild (liElement)

  for (let compteur = 0; compteur <categories.length ; compteur = compteur +1){
    liElement=document.createElement ("li")
    /* inser dataset balise li = ajout d'un attibut quivas'appeler data-catID et dont la valeur sera l'id de la cat récupéré dans l'api*/ 
      console.log (categories [compteur].name) 
      liElement.textContent=categories [compteur].name 
      categoriesMenu.appendChild (liElement)
  }
  console.log (categories)
  }

  getcategories()
