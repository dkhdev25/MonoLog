// npx vite serve
import './style.css'

// vars
// global
let scene = 'menu';
let keybind = null;
// start screen
let currentIndex = -1;
let holdTimer = null;
let mode = 2; // 1 = change, 2 = type, 3 = fill
let currentGroup = 0;
let selectedCharacter = 0;
let holdTriggered = false;
let tapTimer = null;
let waitingForSecondTap = false;
let groupTimer = null;
let currentDevlog = null;
let editorText = "";
let keyHeld = false;
let devlogs = [
  { title: 'Devlog 1', content: '' },
  { title: 'Devlog 2', content: '' },
  { title: 'Devlog 3', content: '' }
];

let learnedWords = [];
let words = [];
let cursorIndex = 0;
let suggestionIndex = 0;
let suggestions = [];

const groups = [
  {
    name: "letters",
    keys: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
  },

  {
    name: "numbers",
    keys: "0123456789".split("")
  },

  {
    name: "symbols",
    keys: [
      ".", ",", "!", "?", "'", "\"",
      "(", ")", "[", "]", "{", "}",
      "+", "-", "*", "/", "=",
      "@", "#", "$", "%", "&",
      ":", ";", "_"
    ]
  },

  {
    name: "actions",
    keys: [
      "Space",
      "Enter",
      "Tab"
    ]
  }
];

fetch("./words.txt")
    .then(response => response.text())
    .then(text => {
        words = text
            .split("\n")
            .map(word => word.trim().toUpperCase())
            .filter(word => word.length);
    });

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
  holdTriggered = false;

  const selectedIndex = currentIndex;

  holdTimer = setTimeout(() => {

    holdTriggered = true;

    document.querySelector(".selectionHint").style.animation =
        "fadeOutUpHint 0.4s ease forwards";

    const cards = document.querySelectorAll(".devlog-card");

    cards.forEach((card, index) => {
      setTimeout(() => {
          card.classList.add("hide");
      }, index * 120);
    });

    setTimeout(() => {
        document.querySelector(".selection").style.display = "none";
        scene = "writing";

        if (selectedIndex === devlogs.length) {
          currentDevlog = {
            title: "New Devlog",
            content: ""
          };

        devlogs.push(currentDevlog);

        } 

        else {
          currentDevlog = devlogs[selectedIndex];
        }

        editorText = currentDevlog.content;
        cursorIndex = editorText.length;

        document.getElementById("devlogTitle").textContent =
        currentDevlog.title.toUpperCase();

        document.querySelector('.editor').style.display = 'flex';
        
        // renderEditor();
        updateMode();
        updateKeyboardDebug();

        document.querySelectorAll('.panel').forEach((panel) => {
          panel.classList.add('show');
        });
    }, 900);

  }, 500);
}

    // writing
    if (scene === "writing" && key === keybind) {
        
         if(event.repeat) return;

        keyHeld = true;
        holdTriggered = false;

        holdTimer = setTimeout(() => {

        if (!keyHeld) return;

            holdTriggered = true;

            handleHold();

            if(groupTimer) return;

            groupTimer = setInterval(() => {
            if(keyHeld){
                handleHold();
            }
        }, 120);

}, 600);

}
});

document.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase();
    if(key !== keybind) return;

    if (scene === "writing" && key === keybind) {

        keyHeld = false;

        clearTimeout(holdTimer);
        clearInterval(groupTimer);

        holdTimer = null;
        groupTimer = null;

        if (!holdTriggered) {
            handleTap();
        }

        holdTriggered = false;

    }

    if (scene === 'selection' && key === keybind) {

        if (!holdTriggered) {
            clearTimeout(holdTimer);

            currentIndex = (currentIndex + 1) % document.querySelectorAll('.devlog-card').length;
            updateSelection();
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

function updateMode() {
    const modeText = document.getElementById("modeText");

    if (mode === 1)
        modeText.textContent = "Change Key";

    else if (mode === 2)
        modeText.textContent = "Type Key";

    else
        modeText.textContent = "Autofill";
}

function selectedKey() {
    return groups[currentGroup].keys[selectedCharacter];
}

function updateKeyboardDebug() {
    document.getElementById("groupText").textContent =
        groups[currentGroup].name;

    document.getElementById("keyText").textContent =
        selectedKey();
}

function nextCharacter(){

    selectedCharacter++;

    if(selectedCharacter >= groups[currentGroup].keys.length){
        selectedCharacter = 0;
    }

    updateKeyboardDebug();
}


function typeCharacter(){

    let char = selectedKey();

    if(char === "Space"){

        let word = getCurrentWord();

        if(word.length >= 3 && !learnedWords.includes(word)){
            learnedWords.push(word);
        }

        editorText =
        editorText.slice(0, cursorIndex) +
        " " +
        editorText.slice(cursorIndex);

        cursorIndex++;
    }

    else if(char === "Enter"){
        editorText =
        editorText.slice(0, cursorIndex) +
        "\n" +
        editorText.slice(cursorIndex);

        cursorIndex++;
    }

    else if(char === "Tab"){
        editorText =
        editorText.slice(0, cursorIndex) +
        "    " +
        editorText.slice(cursorIndex);

        cursorIndex += 4;
    }

    else{
        editorText =
        editorText.slice(0, cursorIndex) +
        char +
        editorText.slice(cursorIndex);

        cursorIndex += char.length;
    }

    currentDevlog.content = editorText;

    updateSuggestion();
}

function switchMode(){

    mode++;

    if(mode > 3){
        mode = 1;
    }

    updateMode();
    updateSuggestion();

}

function nextGroup(){

    currentGroup++;

    if(currentGroup >= groups.length){
        currentGroup = 0;
    }

    selectedCharacter = 0;

    updateKeyboardDebug();

}

function handleTap(){

    if(waitingForSecondTap){

        clearTimeout(tapTimer);
        tapTimer = null;
        waitingForSecondTap = false;

        switchMode();
        return;
    }


    waitingForSecondTap = true;


    tapTimer = setTimeout(() => {

        waitingForSecondTap = false;

        if(mode === 1){
            nextCharacter();
        }

        else if(mode === 2){
            typeCharacter();
        }

        else if(mode === 3){
            autofill();
        }

    }, 190);

}


function handleHold(){

    if(mode === 1){

        nextGroup();

    }

    else if(mode === 2){

        backspace();

    }

    else if(mode === 3){

        autofill();

    }

}

function backspace(){

    if(cursorIndex <= 0){
        return;
    }

    editorText =
        editorText.slice(0, cursorIndex - 1) +
        editorText.slice(cursorIndex);

    cursorIndex--;

    currentDevlog.content = editorText;

    updateSuggestion();
}

function getCurrentWord() {

    let beforeCursor = editorText.slice(0, cursorIndex);

    return beforeCursor
        .split(/\s+/)
        .pop()
        .toUpperCase();

}

function getSuggestions(prefix) {

    if(prefix.length < 2){
        return [];
    }

    prefix = prefix.toUpperCase();

    let personal = learnedWords.filter(word =>
        word.startsWith(prefix)
    );

    let dictionary = words.filter(word =>
        word.startsWith(prefix)
    );

    return [
        ...personal,
        ...dictionary
    ];

}

function updateSuggestion(){

    if(mode !== 3){
        suggestions = [];
        suggestionIndex = 0;
        // renderEditor();
        return;
    }

    const word = getCurrentWord();
    
    suggestionIndex = 0;

    suggestions = getSuggestions(word);

    // renderEditor();
}

function autofill(){
    // placeholder
}