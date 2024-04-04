const intro = document.querySelector("#intro");
const boardContainer = document.querySelector("#board-container");
const rotateButton = document.querySelector("#rotate-button");
const shipCategory = document.querySelector("#ship-category");
const startButton = document.querySelector("#start-button");
const progressDisplay = document.querySelector("#progress span");
const turnDisplay = document.querySelector("#turn span");
const result = document.querySelector("#result");
const message = document.querySelector("#message");

//load the intro modal dialog few seconds after loading the page
setTimeout(() => {
  intro.showModal();
}, 2000);

// flip the angle of ships from ship-category container when button is clicked
let angle = 0;
function rotate() {
  const shipsArray = Array.from(shipCategory.children);
  if (angle === 0) {
    angle = 90;
  } else {
    angle = 0;
  }
  for (let i = 0; i < shipsArray.length; i++) {
    shipsArray[i].style.transform = `rotate(${angle}deg)`;
  }
}
rotateButton.addEventListener("click", rotate);

// create player and computer boards
const width = 10; // arbituary size of each grid box on the board
function createBoard(color, user) {
  const gameBoard = document.createElement("div");
  gameBoard.classList.add("game-board");
  gameBoard.setAttribute("id", `${user}`);
  gameBoard.style.backgroundColor = color;

  for (let i = 0; i < width * width; i++) {
    const gameBlock = document.createElement("div");
    gameBlock.classList.add("game-block");
    gameBlock.setAttribute("id", `${i}`);
    gameBoard.appendChild(gameBlock);
  }
  boardContainer.appendChild(gameBoard);
}
createBoard("#00FFFF", "player");
createBoard("#7FFFD4", "computer");

// create ships by class
class ship {
  constructor(length, name) {
    this.length = length;
    this.name = name;
  }
}

// create new object called ship and assign to each ship name variable
const cruiser = new ship(3, "cruiser");
const destroyer = new ship(4, "destroyer");
const frigate = new ship(5, "frigate");
const corvette = new ship(3, "corvette");
const submarine = new ship(2, "submarine");

// store each ship object as an item in the ships array
const ships = [cruiser, destroyer, frigate, corvette, submarine];

let notDropped;

// add the ship blocks to the computer board
function addShip(ship, user, startIndex) {
  // grab all divs with the class "game-block" under the div id "computer" and store as array
  const boardBlocks = document.querySelectorAll(`#${user} .game-block`);
  let randomStartNum = Math.floor(Math.random() * width * width);
  let randomBoolean = Math.random() > 0.5;
  // check if the user is computer, if not, horizontal or not will depend on the angle of the ship block inside ship-category
  let makeItHorizontal = user === "computer" ? randomBoolean : angle === 0;

  let startId = startIndex ? startIndex : randomStartNum;

  // this addresses the issue where ship is generated outside the board - invalid starting point
  let validStartNum;
  if (makeItHorizontal) {
    // check if the ship is generated horizontally
    if (startId <= width * width - ship.length) {
      validStartNum = startId;
    } else {
      validStartNum = width * width - ship.length;
    }
  } else {
    // check if ship is generated non-horizontally/vertically
    if (startId <= width * width - ship.length * width) {
      validStartNum = startId;
    } //else if (startId === width*width - ship.length*width + width) {
    //validStartNum = startId - width;
    //}
    else {
      validStartNum = startId - ship.length * width + width;
      // validStartNum = startId - (Math.floor(
      //   (startId - (width - ship.length + 1) * width) / width
      // ) +
      //   1) *
      //   width;
    }
  }

  let shipBlock = [];
  // add ship to the computer board
  for (let i = 0; i < ship.length; i++) {
    if (makeItHorizontal) {
      shipBlock.push(boardBlocks[Number(validStartNum) + i]); // locate the block with the random start index and as well as its next blocks according to the length property of the ship
    } else {
      shipBlock.push(boardBlocks[Number(validStartNum) + i * width]); //locate the block with the random start index and as well as the blocks right next rows according to the length property of the ship
    }
  }
  //   console.log(shipBlock);

  // this part addresses the issue where horizontal block will flow to the next row
  let validRow;
  if (makeItHorizontal) {
    shipBlock.every(
      (_ship, index) =>
        (validRow =
          shipBlock[0].id % width !== width - (shipBlock.length - (index + 1)))
    ); // this only return true when the starting position is valid such that any block of the ship does not go to the next row according to its ship.length
  } else {
    shipBlock.every(
      (_ship, index) => (validRow = shipBlock[0].id < 90 + (width * index + 1))
    ); // vertical is always true because it is validated by the validStartNum
  }

  const notOccupied = shipBlock.every(
    (ship) => !ship.classList.contains("occupied")
  );

  // this addresses the overlapping of ship blocks
  if (validRow && notOccupied) {
    // add ship name to the class of randomly created ship, and another class name "occupied" to mark the block is occupied
    let j = 0;
    while (j < ship.length) {
      shipBlock[j].classList.add(ship.name);
      shipBlock[j].classList.add("occupied");
      j++;
    }
  } else {
    if (user === "computer") {
      addShip(ship, user, startIndex);
    } else {
      notDropped = true;
    }
  }
}
// call the addShip function for each ship in the ships array to randomly add ship to the computer board, omit the startIndex parameter
ships.forEach((ship) => addShip(ship, "computer"));

// place the ships into player board
const shipsArray = Array.from(shipCategory.children);
const allPlayerBlocks = document.querySelectorAll("#player .game-block"); // get all div blocks under the parent div with the id "player"

// when ship is dragged from the ship-category
let draggedShip;

function dragShip(evt) {
  notDropped = false; // this sets the first state of ship notDropped to be false
  draggedShip = evt.target;
  //   console.log(draggedShip);
}

// when ship is dragged into the target, which should be the player board
function dragOver(evt) {
  evt.preventDefault();
}

function placeShip(evt) {
  const startIndex = evt.target.id; // this locates position where the ship block is dropped. e.target.id grabs the id of the div block
  //   console.log(startIndex);
  const ship = ships[draggedShip.id]; // this tells which ship is dragged
  addShip(ship, "player", startIndex);
  if (!notDropped) {
    // if ship is dropped/placed, remove the ship block from ship-category container
    draggedShip.remove(); // this will remove the ship from shipCategory div
    // console.log(shipCategory)
  }
  //   console.log(notDropped);
}

shipsArray.forEach((shipArray) =>
  shipArray.addEventListener("dragstart", dragShip)
);

allPlayerBlocks.forEach((playerBlock) => {
  playerBlock.addEventListener("dragover", dragOver);
  playerBlock.addEventListener("drop", placeShip);
});

// start the game
let gameStart;
let gameOver;
let playerTurn;

const allComputerBlocks = document.querySelectorAll("#computer .game-block");

function startGame() {
  if (shipCategory.children.length !== 0) {
    progressDisplay.innerText =
      "Please place all your ships before starting the game !";
  } else if (!gameStart) {
    gameStart = true;
    progressDisplay.innerText = "The game has started !";
    turnDisplay.innerText = "You can make the GO first !";
    allComputerBlocks.forEach((computerBlock) =>
      computerBlock.addEventListener("click", launchAttack)
    );
  }
  // deactivate the start-game button after the game starts
  else if (gameStart) {
    startButton.removeEventListener("click", startGame);
  }
}
startButton.addEventListener("click", startGame);

let capturedByPlayer = [];
let capturedByComputer = [];
let sunkByPlayer = [];
let sunkByComputer = [];

function launchAttack(evt) {
  if (!gameOver) {
    if (
      evt.target.classList.contains("occupied") &&
      !evt.target.classList.contains("hit")
    ) {
      evt.target.classList.add("hit");
      const classes = Array.from(evt.target.classList);
      const filteredClass = classes.filter(
        (className) =>
          className !== "game-block" &&
          className !== "occupied" &&
          className !== "hit"
      );
      const shipHit = filteredClass.toString();
      progressDisplay.innerText = `You hit opponent's ${shipHit} !`;
      // console.log(...filteredClass);
      capturedByPlayer.push(...filteredClass); // the dote notation removes the array [] and keeps only the contents
      checkScores("Opponent", capturedByPlayer, sunkByPlayer);
      //   console.log(capturedByPlayer);
    } else if (
      evt.target.classList.contains("occupied") &&
      evt.target.classList.contains("hit")
    ) {
      progressDisplay.innerText = "You missed a chance!";
      playerTurn = false;
      allComputerBlocks.forEach((computerBlock) =>
        computerBlock.removeEventListener("click", launchAttack)
      );
      setTimeout(computerMove, 3000);
    } else {
      progressDisplay.innerText = "You missed !";
      evt.target.classList.add("not-hit");
      playerTurn = false;
      //   allComputerBlocks.forEach((computerBlock) =>
      //     computerBlock.replaceWith(computerBlock.cloneNode(true))
      allComputerBlocks.forEach((computerBlock) =>
        computerBlock.removeEventListener("click", launchAttack)
      );
      setTimeout(computerMove, 3000);
    }
  }
}

// Time for the computer's move
function computerMove() {
  if (!gameOver) {
    progressDisplay.innerText = "Opponent is thinking really hard...";
    turnDisplay.innerText = "Opponent's turn !";
    setTimeout(() => {
      let randomMove = Math.floor(Math.random() * width * width);
      if (
        allPlayerBlocks[randomMove].classList.contains("occupied") &&
        !allPlayerBlocks[randomMove].classList.contains("hit")
      ) {
        allPlayerBlocks[randomMove].classList.add("hit");
        const classArr = Array.from(allPlayerBlocks[randomMove].classList);
        // console.log(classArr);
        const filteredClassArr = classArr.filter(
          (className) =>
            className !== "game-block" &&
            className !== "occupied" &&
            className !== "hit"
        );
        const shipHits = filteredClassArr.toString();
        progressDisplay.innerText = `Opponent hits your ${shipHits} !`;
        capturedByComputer.push(...filteredClassArr);
        checkScores("Your", capturedByComputer, sunkByComputer);
        // computerMove();
        // return;
      } else if (
        allPlayerBlocks[randomMove].classList.contains("occupied") &&
        allPlayerBlocks[randomMove].classList.contains("hit")
      ) {
        do {
          computerMove();
          return;
        } while (
          allPlayerBlocks[randomMove].classList.contains("occupied") &&
          allPlayerBlocks[randomMove].classList.contains("hit")
        );
        // give computer another chance due to it's random
      } else if (allPlayerBlocks[randomMove].classList.contains("empty")) {
        // give computer another chance due to it's random
        do {
          computerMove();
          return;
        } while (allPlayerBlocks[randomMove].classList.contains("empty"));
      } else {
        progressDisplay.innerText = "Opponent has missed !";
        allPlayerBlocks[randomMove].classList.add("not-hit");
      }
      setTimeout(() => {
        playerTurn = true;
        turnDisplay.innerText = "Your turn !";
        progressDisplay.innerText = "Make your move !";
        allComputerBlocks.forEach((computerBlock) =>
          computerBlock.addEventListener("click", launchAttack)
        );
      }, 3000);
    }, 3000);
  }
}

// check the score to see if ship sunk or game won
function checkScores(user, captureByUser, sunkByUser) {
  function checkShips(shipName, shipLength) {
    if (
      captureByUser.filter((capturedShip) => capturedShip === shipName)
        .length === shipLength
    ) {
      progressDisplay.innerText = `Woohoo ${user} ${shipName} is sunk !`;
      // this is referring to the player checkscore function, not the computer one
      if (user === "Opponent") {
        capturedByPlayer = captureByUser.filter(
          (capturedShip) => capturedShip !== shipName
        ); // retain the ships that does not match with the qualifying ship name (ship that has length condition met)
      }
      // this is referring to the computer checkscore
      else if (user === "Your") {
        capturedByComputer = captureByUser.filter(
          (capturedShip) => capturedShip !== shipName
        );
      }
      // this updates the sunkByPlayer or sunkByComputer array
      sunkByUser.push(shipName);
    }
    if (capturedByPlayer.length === 5) {
      gameOver = true; // stop the game
      message.innerText = "Congratz, you have won the game !";
      setTimeout(openResult, 1000);
    } else if (capturedByComputer.length === 5) {
      gameOver = true; // stop the game
      allComputerBlocks.forEach((computerBlock) =>
        computerBlock.removeEventListener("click", launchAttack)
      );
      message.innerText = "What a pity, you have lost !";
      setTimeout(openResult, 1000);
    }
  }
  ships.forEach((ship) => checkShips(ship.name, ship.length));
  // console.log("user hit", capturedByPlayer);
  // console.log("user sunk", sunkByPlayer);
}
const openResult = () => {
  result.showModal();
};
