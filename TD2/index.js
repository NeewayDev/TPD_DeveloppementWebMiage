const couleurs = ["red", "green", "blue", "yellow", "purple", "orange"];

const carre = document.querySelector('.carre');

console.log(carre);
carre.addEventListener('click', () => {
    const couleurAleatoire = couleurs[Math.floor(Math.random() * couleurs.length)];
    carre.style.backgroundColor = couleurAleatoire;
    console.log(`Couleur changée en : ${couleurAleatoire}`);
});