// npx vite serve
import './style.css'

// vars
let scene = 'menu';
let keybind = null;
let keyPressTime = 0;
let currentIndex = -1;
let devlogs = [
  { title: 'Devlog 1', content: '...' },
  { title: 'Devlog 2', content: '...' },
  { title: 'Devlog 3', content: '...' }
];

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
        document.querySelector('.selectionHint').style.animation = 'fadeIn 0.6s ease-out 0.5s forwards';
        document.querySelector('.selection').style.display = 'block';

        currentIndex = 0;
        updateSelection();

        const cards = document.querySelectorAll('.devlog-card');

        cards.forEach((card, index) => {
          setTimeout(() => {
            card.classList.add('show');
          }, index * 120);
        });

        }, 600);
    }

    // selection
    if (scene === 'selection' && key === keybind) {
    keyPressTime = Date.now();
    currentIndex = (currentIndex + 1) % document.querySelectorAll('.devlog-card').length;
    updateSelection();
    }
});

document.addEventListener('keyup', (event) => {
  const key = event.key.toLowerCase();
  if (scene === 'selection' && key === keybind) {
    const holdTime = Date.now() - keyPressTime;
    if (holdTime > 500) {
      scene = 'writing';
      console.log('Entering devlog:', currentIndex);
    }
  }
});

function updateSelection() {
  const cards = document.querySelectorAll('.devlog-card');
  cards.forEach((card, i) => {
    card.classList.remove('active');
    if (i === currentIndex) card.classList.add('active');
  });
}