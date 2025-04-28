console.log ("bonjour")
async function getworks () {
const reponse = await fetch("http://localhost:5678/api/works");
/*if (!reponse.ok) {
    console.log("status : "+reponse.status);
  }*/
const projets = await reponse.json();
for (let compteur = 0; compteur <projets.length ; compteur = compteur +1){
    console.log (projets [compteur].title) 
}
console.log (projets)
}
getworks()