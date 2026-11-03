
// Game screens
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const gameOverScreen = document.getElementById("game-over-screen");

// Buttons
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");

// Game information
let score = 0;
let lives = 3;
let timeLeft = 60;
let fallingSpeed = 3;
let gameRunning = false;
let isPaused = false;

// Start Game
function startGame() {

    score = 0;
    lives = 3;
    timeLeft = 60;
    fallingSpeed = 3;
    basketPosition = (gameArea.clientWidth - basket.offsetWidth) / 2;

    // Remove old fruits
    fruits.forEach(function(fruit) {
        fruit.element.remove();
    });

    fruits = [];

    // Reset displayed values
    document.getElementById("score").textContent = score;
    document.getElementById("lives").textContent = lives;
    document.getElementById("timer").textContent = timeLeft;

    // Reset basket position
    basket.style.left = basketPosition + "px";
    basket.style.transform = "none";

    startScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    gameRunning = true;
    const music = document.getElementById("background-music");

music.volume = 0.25;
music.play();
    isPaused = false;
document.getElementById("pause-btn").textContent = "PAUSE";

    startFruitGeneration();
    requestAnimationFrame(moveFruits);
    startTimer();
    increaseDifficulty();

    console.log("Game Started!");
}

// Game Over
function gameOver() {

    gameRunning = false;
    const music = document.getElementById("background-music");

music.pause();
music.currentTime = 0;
    clearInterval(timerInterval);
    clearInterval(difficultyInterval);
    clearInterval(fruitInterval);

    gameScreen.classList.add("hidden");
    gameOverScreen.classList.remove("hidden");

    document.getElementById("final-score").textContent = score;
}

// Button Events
startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

// Basket movement

const basket = document.getElementById("basket");
const gameArea = document.getElementById("game-area");

let basketPosition = 0;
const basketSpeed = 25;

document.addEventListener("keydown", function(event) {

    if (!gameRunning) return;

    if (event.key === "ArrowLeft") {
        basketPosition -= basketSpeed;
    }

    if (event.key === "ArrowRight") {
        basketPosition += basketSpeed;
    }

    // Keep basket inside game area
    const maxPosition = gameArea.clientWidth - basket.offsetWidth;

    basketPosition = Math.max(
        0,
        Math.min(basketPosition, maxPosition)
    );

    basket.style.left = basketPosition + "px";
    basket.style.transform = "none";
});

// Falling Fruits

let fruits = [];
let fruitInterval;

function createFruit() {

    if (!gameRunning || isPaused) return;

    const item = document.createElement("div");

    const randomValue = Math.random();

const isBomb = randomValue < 0.25;
const isGolden = randomValue >= 0.25 && randomValue < 0.35;

if (isBomb) {
    item.textContent = "💣";
} else if (isGolden) {
    item.textContent = "🌟";
} else {
    item.textContent = "🍎";
}

    item.style.position = "absolute";
    item.style.fontSize = "30px";

    const maxLeft = gameArea.clientWidth - 35;

    item.style.left = Math.random() * maxLeft + "px";
    item.style.top = "0px";

    gameArea.appendChild(item);

    fruits.push({
    element: item,
    y: 0,
    isBomb: isBomb,
    isGolden: isGolden
});
}

// Create a fruit every second
function startFruitGeneration() {
    clearInterval(fruitInterval);

    fruitInterval = setInterval(createFruit, 1000);
}

// Falling Fruits

function moveFruits() {

    if (!gameRunning) return;

    if (!isPaused) {

        for (let i = fruits.length - 1; i >= 0; i--) {

            let fruit = fruits[i];

            fruit.y += fallingSpeed;
            fruit.element.style.top = fruit.y + "px";

            // Check collision with basket
            if (checkCollision(fruit)) {

                if (fruit.isBomb) {

                    lives--;

                    document.getElementById("lives").textContent = lives;

                    playGameSound("bomb");

                    if (lives <= 0) {
                        fruit.element.remove();
                        fruits.splice(i, 1);
                        gameOver();
                        return;
                    }

                } else {

                    if (fruit.isGolden) {
                        score += 30;
                    } else {
                        score += 10;
                    }

                    document.getElementById("score").textContent = score;

                    playGameSound("collect");
                }

                fruit.element.remove();
                fruits.splice(i, 1);

                continue;
            }

            // Remove item when it reaches bottom
            if (fruit.y > gameArea.clientHeight) {

                fruit.element.remove();
                fruits.splice(i, 1);
            }
        }
    }

    // Continue only one animation loop
    requestAnimationFrame(moveFruits);
}

// Collision Detection
function checkCollision(fruit) {

    const fruitRect = fruit.element.getBoundingClientRect();
    const basketRect = basket.getBoundingClientRect();

    return (
        fruitRect.bottom >= basketRect.top &&
        fruitRect.top <= basketRect.bottom &&
        fruitRect.right >= basketRect.left &&
        fruitRect.left <= basketRect.right
    );
}

let timerInterval;

function startTimer() {

    clearInterval(timerInterval);

    timerInterval = setInterval(function() {

        if (!gameRunning || isPaused) return;

        timeLeft--;

        document.getElementById("timer").textContent = timeLeft;

        if (timeLeft <= 0) {
            gameOver();
        }

    }, 1000);
}

let difficultyInterval;

function increaseDifficulty() {

    clearInterval(difficultyInterval);

    difficultyInterval = setInterval(function() {

        if (!gameRunning) return;

        fallingSpeed += 1;

    }, 15000);
}
// Sound Effects
let audioContext;

function playGameSound(type) {

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    if (!audioContext) {
        audioContext = new AudioContextClass();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    if (type === "collect") {

        // Fruit collection sound
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
            990, audioContext.currentTime + 0.12
        );

    } else {

        // Bomb sound
        oscillator.type = "sawtooth";
        oscillator.frequency.setValueAtTime(180, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
            55, audioContext.currentTime + 0.25
        );
    }

    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.15, audioContext.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + (type === "collect" ? 0.15 : 0.3)
    );

    oscillator.start();
    oscillator.stop(
        audioContext.currentTime + (type === "collect" ? 0.16 : 0.31)
    );
}

const pauseBtn = document.getElementById("pause-btn");

pauseBtn.addEventListener("click", function() {

    if (!gameRunning) return;

    isPaused = !isPaused;

    const music = document.getElementById("background-music");

if (isPaused) {
    pauseBtn.textContent = "RESUME";
    music.pause();
} else {
    pauseBtn.textContent = "PAUSE";
    music.play();
}
});