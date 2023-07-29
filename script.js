const narutoAPICharactersURL = 'https://api.narutodb.xyz/character/';
let startContainer = document.getElementById("startGameContainer");
let gameContainer = document.getElementById("gameContainer");
let game = document.getElementById('game');
let moves = document.getElementById('moves');
let movesCounter = document.getElementById('movesCount');
let results = document.getElementById('results');
let resetButton = document.getElementById('reset');
let startButton = document.getElementById('start');
let characters = [];
let firstClick = null;
let disableClicks = false;
let movesCount = 0;
let previousMovesCount = null;
let bestScoreCount = 0;
movesCounter.innerText = movesCount;


// adds to moves counter
function calcMoves() {
  movesCount++;
  movesCounter.innerText = movesCount;
}

//sets best score based on local storage or player's score, whichever is lowest
function handleScore(){
  if(localStorage.score){
    bestScoreCount = JSON.parse(localStorage.score);
    if(previousMovesCount && previousMovesCount < bestScoreCount){
      localStorage.score = JSON.stringify(previousMovesCount);
      bestScoreCount = previousMovesCount;
    } 
  }else{
    bestScoreCount = previousMovesCount;
    localStorage.score = JSON.stringify(bestScoreCount);
  }
}

// here is a helper function to shuffle an array
// it returns the same array with values shuffled
// it is based on an algorithm called Fisher Yates if you want ot research more
function shuffle(array) {
  let counter = array.length;

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    let index = Math.floor(Math.random() * counter);

    // Decrease counter by 1
    counter--;

    // And swap the last element with it
    let temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }
  return array;
}

// TODO: Implement this function!
function handleCardClick(event) {
  let card = event.currentTarget;
  let front = card.querySelector('.front');
  let back = card.querySelector('.back');

  // if card flipped or clicks disabled exit out of function
  if(front.classList.contains('flipped') || disableClicks) return;

  disableClicks = true;
  front.classList.toggle('flipped');
  back.classList.toggle('flipped');

  //if it's the first click/flip set first card and enable clicks
  if(!firstClick){
    firstClick = card;
    disableClicks = false;
  }else{
    calcMoves();
    //if second click and card id's don't match - flip cards after one second
    if(firstClick.dataset.id !== card.dataset.id){
      let firstFront = firstClick.querySelector('.front');
      let firstBack = firstClick.querySelector('.back');
      setTimeout(() => {
        front.classList.toggle('flipped');
        back.classList.toggle('flipped');
        firstFront.classList.toggle('flipped');
        firstBack.classList.toggle('flipped');
        firstClick = null;
        disableClicks = false;
      }, 1000);
    }else{
      //if cards match - keep cards flipped and remove click events
      firstClick.removeEventListener('click', handleCardClick);
      card.removeEventListener('click', handleCardClick);
      firstClick = null;
      disableClicks = false;
      let flippedCards = 0;
      let frontCards = document.querySelectorAll('.front');
      //check all cards to determine if they are all flipped
      //if all flipped - dispay winning message and scores
      for(let card of frontCards){
        if(card.classList.contains('flipped')) flippedCards++;
      }
      if(flippedCards === frontCards.length){
        setTimeout(() => {
          previousMovesCount = movesCount;
          moves.style.display = 'none';
          gameContainer.style.display = 'none';
          handleScore();
          results.style.display = 'block';
          results.innerHTML = `<h1>You Won!</h1>
                              <h2>Moves: ${previousMovesCount}</h2>
                              <h2 style="color: black;">Best Score: <span style="color: white;">${bestScoreCount}</span></h2>`;
          startContainer.style.display = 'flex';
          startButton.style.display = 'block';
          characters = [];
          firstClick = null;
          disableClicks = false;
          movesCount = 0;
          movesCounter.innerText = movesCount;
        }, 1000);
      }
    }
  }
}

// this function loops over the array of colors
// it creates a new div and gives it a class with the value of the color
// it also adds an event listener for a click for each card
function createDivsForCharacters(charArray) {
  let shuffledChars = shuffle(charArray);

  for (let char of shuffledChars) {
    // create new divs
    let containerDiv = document.createElement("div");
    let frontDiv = document.createElement("div");
    let backDiv = document.createElement("div");
    let img = document.createElement("img");
    let name = document.createElement('h5');

    // set a character id data attribute for the value we are looping over
    containerDiv.setAttribute('data-id', char.id);

    // set the class attributes for front and back divs
    frontDiv.classList.add('front');
    backDiv.classList.add('back');
    backDiv.classList.add('flipped');

    // add character image to back div
    img.setAttribute('src', char.images.length ? char.images[0] : 'missing-image.jpg');
    img.setAttribute('alt', char.name);

    // add character name to header
    name.innerText = char.name;

    // place image and name in back div
    backDiv.appendChild(img);
    backDiv.appendChild(name);

    // place divs in container div
    containerDiv.appendChild(frontDiv);
    containerDiv.appendChild(backDiv);

    // call a function handleCardClick when a div is clicked on
    containerDiv.addEventListener("click", handleCardClick);

    // append the div to the element with an id of game
    game.append(containerDiv);
  }
}

//initialize elements for start of game
//load local storage if any
function startGame(){
  if(localStorage.score) bestScoreCount = JSON.parse(localStorage.score);
  characters = [];
  firstClick = null;
  disableClicks = false;
  moves.style.display = 'block';
  movesCount = 0;
  movesCounter.innerText = movesCount;
  previousMovesCount = 0;
  game.innerHTML = '';
  results.innerHTML = '';
  results.style.display = 'none';
  loadCharacters();
}

//request characters, based on random ids, from naruto api
async function loadCharacters(){
  let randomCharacterIds = new Set();
  while(randomCharacterIds.size < 5){
    let randomNumber = Math.ceil(Math.random() * 300);
    randomCharacterIds.add(randomNumber);
  }
  let characterIds = [...randomCharacterIds];
  for(let i = 0; i < characterIds.length; i++){
    let res = await fetch(narutoAPICharactersURL + characterIds[i]);
    let character = await res.json();
    characters.push(character);
  }
  createDivsForCharacters([...characters, ...characters]);
}

//restart game when reset button clicked
resetButton.addEventListener('click', function(){
  startGame();
});

// when the DOM loads
gameContainer.style.display = 'none';
results.innerHTML = '';
results.style.display = 'none';
moves.style.display = 'none';
//initialize game when start button clicked
startButton.addEventListener('click', function(){
  this.style.display = 'none';
  startContainer.style.display = 'none';
  gameContainer.style.display = 'flex';
  startGame();
});
