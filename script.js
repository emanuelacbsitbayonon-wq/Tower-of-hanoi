const diskSelect = document.getElementById("diskCount");
const movesDisplay = document.getElementById("moves");
const minimumDisplay = document.getElementById("minimum");
const timerDisplay = document.getElementById("timer");
const hint = document.getElementById("hint");
const winMessage = document.getElementById("winMessage");
const winDetails = document.getElementById("winDetails");
const towerButtons = [...document.querySelectorAll(".tower")];
const towerViews = [0, 1, 2].map(i => document.getElementById(`tower${i}`));

let towers = [[], [], []];
let diskCount = 5;
let moves = 0;
let selectedTower = null;
let seconds = 0;
let timerId = null;
let started = false;
const diskColors = ["#8cf0c8", "#70c8ff", "#a99aff", "#ffb86b", "#ff829c", "#f4df75", "#79dfd5", "#c1a4ff"];

function minimumMoves(n) {
  return 2 ** n - 1;
}

function formatTime(value) {
  const mins = Math.floor(value / 60).toString().padStart(2, "0");
  const secs = (value % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function startTimer() {
  if (timerId !== null) return;
  timerId = setInterval(() => {
    seconds += 1;
    timerDisplay.textContent = formatTime(seconds);
  }, 1000);
}

function stopTimer() {
  if (timerId !== null) clearInterval(timerId);
  timerId = null;
}

function newGame() {
  stopTimer();
  diskCount = Number(diskSelect.value);
  towers = [Array.from({ length: diskCount }, (_, i) => diskCount - i), [], []];
  moves = 0;
  seconds = 0;
  selectedTower = null;
  started = false;
  movesDisplay.textContent = "0";
  minimumDisplay.textContent = minimumMoves(diskCount);
  timerDisplay.textContent = "00:00";
  hint.textContent = "Select a tower with a disk, then select its destination.";
  winMessage.hidden = true;
  render();
}

function render() {
  towers.forEach((tower, index) => {
    towerViews[index].innerHTML = "";
    tower.forEach(disk => {
      const diskElement = document.createElement("span");
      diskElement.className = "disk";
      diskElement.style.width = `${24 + (disk / diskCount) * 66}%`;
      diskElement.style.background = diskColors[(disk - 1) % diskColors.length];
      diskElement.setAttribute("aria-label", `Disk ${disk}`);
      towerViews[index].appendChild(diskElement);
    });
    towerButtons[index].classList.toggle("selected", selectedTower === index);
    towerButtons[index].setAttribute("aria-pressed", selectedTower === index ? "true" : "false");
  });
}

function chooseTower(index) {
  if (winMessage.hidden === false) return;

  if (selectedTower === null) {
    if (towers[index].length === 0) {
      hint.textContent = "That tower is empty. Choose a tower that has a disk.";
      return;
    }
    selectedTower = index;
    hint.textContent = `Tower ${"ABC"[index]} selected. Now choose where to move its top disk.`;
    render();
    return;
  }

  if (selectedTower === index) {
    selectedTower = null;
    hint.textContent = "Selection cancelled. Choose a source tower.";
    render();
    return;
  }

  const source = towers[selectedTower];
  const destination = towers[index];
  const movingDisk = source[source.length - 1];
  const topDestination = destination[destination.length - 1];

  if (topDestination !== undefined && movingDisk > topDestination) {
    hint.textContent = "Invalid move: a larger disk cannot be placed on a smaller disk.";
    selectedTower = null;
    render();
    return;
  }

  destination.push(source.pop());
  moves += 1;
  movesDisplay.textContent = moves;
  selectedTower = null;

  if (!started) {
    started = true;
    startTimer();
  }

  if (towers[2].length === diskCount) {
    stopTimer();
    hint.textContent = "Excellent work. You solved the puzzle!";
    winDetails.textContent = `Completed in ${moves} moves and ${formatTime(seconds)}. Minimum possible: ${minimumMoves(diskCount)} moves.`;
    winMessage.hidden = false;
  } else {
    hint.textContent = `Move successful. ${moves} move${moves === 1 ? "" : "s"} so far.`;
  }

  render();
}

towerButtons.forEach((button, index) => {
  button.addEventListener("click", () => chooseTower(index));
});

document.getElementById("newGame").addEventListener("click", newGame);
document.getElementById("resetGame").addEventListener("click", newGame);
diskSelect.addEventListener("change", newGame);

newGame();
