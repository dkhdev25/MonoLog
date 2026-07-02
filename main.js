// npx vite serve
import './style.css'

// vars
let scene = 'menu';
let keybind = null;

// start and set keybind
document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();

    // set keybind
    if (scene === 'menu' && keybind === null) {
        document.querySelector('.about').style.animation = 'none';
        document.querySelector('h1').style.animation = 'fadeOutUp 0.6s ease-out forwards';
        document.querySelector('.about').style.animation = 'fadeOutUpText 0.6s ease-out 0.1s forwards';
        document.querySelector('.hint').style.animation = 'fadeOutUpHint 0.6s ease-out forwards';
        keybind = key;
        
        setTimeout(() => {
        document.querySelector('.app').style.display = 'none';
        scene = 'selection';
        }, 600);
    }
});