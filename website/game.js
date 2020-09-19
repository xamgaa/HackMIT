window.addEventListener('load', init);

// Globals

var socket = io.connect();

const difficulties = [
    "short",
    "medium",
    "long"
]
socket.on('connect',(name)=> {
  console.log('socket on: ' + localStorage.getItem("name"));
});

socket.on('gameReady', ()=> {
  console.log('gameReady received');
  startGame();
});


let difficulty = difficulties[0];
let wpm = 0;
let time = 0;
let score = 0;
let isPlaying;
let countDown = 30;

// DOM Elements
const wordInput = document.querySelector('#word-input');
const currentWord = document.querySelector('#current-word');
const scoreDisplay = document.querySelector('#score');
const timeDisplay = document.querySelector('#time');
const message = document.querySelector('#message');
const seconds = document.querySelector('#seconds');
const wpmDisplay = document.querySelector("#wpm");
const accuracyDisplay = document.querySelector("#accuracy");


const shortWords = [
  'short'
];

const mediumWords = [
  'medium'
];

const longWords = [
  'long'
]


function init()
{
  console.log(name + " joined the game lobby.");
}
// Initialize Game
function startGame() {
  // Show number of seconds in UI
  // Load word from array
  showWord();
  // Start matching on word input
  wordInput.addEventListener('input', startMatch);
  // Call countdown every second
  setInterval(countup, 1000);
  // Check game status
  setInterval(checkStatus, 50);

  //Check wpm
  setInterval(updateWpm, 1000);
  time = 0;
}

// Start match
function startMatch() {
  if (matchWords()) {
    isPlaying = true;
    showWord();
    wordInput.value = '';
    score++;

  }

  // If score is -1, display 0
  if (score === -1) {
    scoreDisplay.innerHTML = 0;
  } else {
    scoreDisplay.innerHTML = score;
  }
}

function updateWpm() {
    wpm = Math.round((score/time)*60);
    wpmDisplay.innerHTML = wpm;
    socket.emit('wpm', wpm);
}
// Match currentWord to wordInput
function matchWords() {
  if (wordInput.value === currentWord.innerHTML) {
    message.innerHTML = 'Correct!!!';
    message.style.color = "green";
    return true;
  } else {
    message.innerHTML = '';
    return false;
  }
}

function accuracy() {

}

// Pick & show random word
function showWord() {
  let words;
  if(difficulty == "short"){
    words = shortWords;
  }
  if(difficulty == "medium"){
    words = mediumWords;
  }
  if(difficulty == "long"){
    words = longWords;
  }
  // Generate random array index
  const randIndex = Math.floor(Math.random() * words.length);
  // Output random word
  currentWord.innerHTML = words[randIndex];
}

// Countdown timer
function countup() {
  if (countDown == 0) {
    countDown = 30;
  }
  if (countDown <= 10) {
    document.getElementById("time").style.color = "red";
  }
  else {
    document.getElementById("time").style.color = "white";
  }
  countDown--;
  time++;
  // Show time
  timeDisplay.innerHTML = countDown;
  console.log(wpm);
}

// Check game status
function checkStatus() {
//   if (!isPlaying) {
//     message.innerHTML = 'Game Over!!!';
//     score = -1;
//   }
}
