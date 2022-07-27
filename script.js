const container = document.querySelector(".container");
const gameEngines = [];
let userData = {};
let speed = 300;

const movementFunctions = {
  ArrowUp() {
    const frog = container.querySelector(".frog");
    const activeRow = frog.parentElement;

    if (activeRow.classList.contains("last-row")) return;

    const cloneFrog = frog.cloneNode(true);
    const nextRow = activeRow.nextElementSibling;

    activeRow.removeChild(frog);
    nextRow.appendChild(cloneFrog);

    if (nextRow.classList.contains("last-row")) {
      score("#score");

      const frog = container.querySelector(".frog");
      const cloneFrog = frog.cloneNode(true);
      const firstRow = document.querySelector(".first-row");

      setTimeout(() => {
        nextRow.removeChild(frog);
        firstRow.appendChild(cloneFrog);
      }, 100);
    }
  },
  ArrowDown() {
    const frog = container.querySelector(".frog");
    const activeRow = frog.parentElement;

    if (activeRow.classList.contains("first-row")) return;

    const cloneFrog = frog.cloneNode(true);
    const previousRow = activeRow.previousElementSibling;

    activeRow.removeChild(frog);
    previousRow.appendChild(cloneFrog);
  },
  ArrowLeft() {
    const frog = container.querySelector(".frog");
    const frogPos = Number(getComputedStyle(frog).gridColumnStart);

    if (frogPos === 1) return;

    frog.style.gridColumnStart = frogPos - 1;
  },
  ArrowRight() {
    const frog = container.querySelector(".frog");
    const frogPos = Number(getComputedStyle(frog).gridColumnStart);

    if (frogPos === 11) return;

    frog.style.gridColumnStart = frogPos + 1;
  },
};

window.addEventListener("keydown", (e) => {
  if (movementFunctions[e.key]) movementFunctions[e.key]();
});

function initGame() {
  restoreData();
  verifyLevel();

  // Loop to create new cars
  createCar();
  const avenueMovement = setInterval(() => {
    createCar();
  }, speed);
  gameEngines.push(avenueMovement);

  // Verify if Game Over
  verifyGameOver();
}
initGame();

// Verify Game Over
function verifyGameOver() {
  const gameOverVerifyLoop = setInterval(() => {
    const frog = container.querySelector(".frog");
    const frogHeight = frog.getBoundingClientRect().height;

    if (frogHeight !== 0) return;

    frog.remove();
    container.classList.add("game-over");
    container.style.background = "red";
    clearInterval(gameOverVerifyLoop);
  }, 1);
}

// Create a Car
function createCar() {
  const streets = container.querySelectorAll(".street");
  const randomStreet = streets[Math.floor(Math.random() * streets.length)];

  const car = document.createElement("div");
  car.classList.add("car");
  car.style.gridColumnStart = 11;

  // Moving a car
  const carEngine = setInterval(() => {
    const carPos = Number(car.style.gridColumnStart);

    if (carPos === 1) {
      randomStreet.removeChild(car);
      return clearInterval(carEngine);
    }

    car.style.gridColumnStart = carPos - 1;
  }, speed);
  gameEngines.push(carEngine);

  randomStreet.appendChild(car);
}

// Function to Stop Game
function stopGame() {
  // Remove the cars
  const allCars = container.querySelectorAll(".car");
  allCars.forEach((car) => car.remove());

  // Stop the engines/intervals
  gameEngines.forEach((engine) => clearInterval(engine));
}

// Restart Button
const restartBtn = container.querySelector(".restart");
restartBtn.addEventListener("click", () => document.location.reload(true));

// Score Function
function score(element) {
  const score = document.querySelector(element);
  const newScore = (Number(score.innerText) + 1).toString().padStart(2, "0");
  score.innerText = newScore;

  verifyRecord(newScore);
  saveData(userData);
}

// Verify and Update Record
function verifyRecord(newScore) {
  const locaStorageData = JSON.parse(localStorage.getItem("userData"));

  let record =
    locaStorageData && locaStorageData.record
      ? Math.max(Number(newScore), locaStorageData.record)
      : newScore;

  record = record.toString().padStart(2, "0");
  userData.record = record;
  updateRecord(record);
}

// Save userData in LocalStorage
function saveData(object) {
  const jsonString = JSON.stringify(object);
  localStorage.setItem("userData", jsonString);
}

// Restore userData
function restoreData() {
  const localStorageData = JSON.parse(localStorage.getItem("userData"));
  if (!localStorageData) return;

  userData = localStorageData;

  // Restore Record
  updateRecord(userData.record);

  // Restore Level
  restoreLevel(userData.level);
}

// Update Record
function updateRecord(value) {
  const record = document.querySelector(".record span");
  record.innerText = value;
}

// Function to change level
function verifyLevel() {
  const level = document.querySelector(".levels input:checked");
  userData.level = level.value;

  const levels = document.querySelectorAll(".levels input");
  levels.forEach((input) => {
    input.addEventListener("click", ({ target }) => {
      if (userData.level === target.value) return;

      userData.level = target.value;
      saveData(userData);
      changeLevel(target.value);

      window.location.reload(true);
    });
  });
}

function changeLevel(level) {
  if (level === "01") speed = 300;
  if (level === "02") speed = 200;
  if (level === "03") speed = 100;
}

// Restore Level
function restoreLevel(level) {
  const items = document.querySelectorAll(".levels input");
  items.forEach((input) => {
    if (input.value !== level) return (input.checked = false);
    input.checked = true;
    changeLevel(input.value);
  });
}
