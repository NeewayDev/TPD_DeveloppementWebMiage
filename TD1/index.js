const toggle = document.querySelector('.toggle');
const navbar = document.querySelector('.menu-links');
const menuTop = document.querySelector('.menu-top');

console.log(toggle);
console.log(navbar);

toggle.addEventListener('click', () => {
    navbar.classList.toggle('navbar');
});

let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        menuTop.classList.remove('scroll-up');
        return;
    }
    
    if (currentScroll > lastScroll) {
        menuTop.classList.remove('scroll-up');
        menuTop.classList.add('scroll-down');
    } else {
        menuTop.classList.remove('scroll-down');
        menuTop.classList.add('scroll-up');
    }
    
    lastScroll = currentScroll;
});