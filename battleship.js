const boardContainer = document.querySelector("#board-container");
const rotateButton = document.querySelector("#rotate-button");
const shipCategory = document.querySelector("#ship-category");

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

//create new object called ship and assign to each ship name variable
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
      // startId - (Math.floor(
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
      shipBlock.push(boardBlocks[Number(validStartNum) + i]); //locate the block with the random start index and as well as its next blocks according to the length property of the ship
    } else {
      shipBlock.push(boardBlocks[Number(validStartNum) + i * width]); //locate the block with the random start index and as well as the blocks right next rows according to the length property of the ship
    }
  }
  console.log(shipBlock);

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
const allPlayerBlocks = document.querySelectorAll("#player div"); // get all div blocks under the parent div with the id "player"

// when ship is dragged from the ship-category
let draggedShip;

function dragShip(evt) {
  notDropped = false; // this sets the first state of ship notDropped to be false
  draggedShip = evt.target;
  console.log(draggedShip);
}

// when ship is dragged into the target, which should be the player board
function dragOver(evt) {
  evt.preventDefault();
}

function placeShip(evt) {
  const startIndex = evt.target.id; // this locates position where the ship block is dropped. e.target.id grabs the id of the div block
  console.log(startIndex);
  const ship = ships[draggedShip.id]; // this tells which ship is dragged
  addShip(ship, "player", startIndex);
  if (!notDropped) {
    // if ship is dropped/placed, remove the ship block from ship-category container
    draggedShip.remove();
  }
  console.log(notDropped);
}

shipsArray.forEach((shipArray) =>
  shipArray.addEventListener("dragstart", dragShip)
);

allPlayerBlocks.forEach((playerBlock) => {
  playerBlock.addEventListener("dragover", dragOver);
  playerBlock.addEventListener("drop", placeShip);
});

