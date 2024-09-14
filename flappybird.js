let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
}

let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

let velocityX = -2;
let velocityY = 0;
let gravity = 0.4;

let gameOver = false;
let score = 0;
let gameStarted = false;

let gameOverCount = 0; // Track the number of game overs
let gameInterval;
let pipeInterval;
const difficultyIncreaseThreshold = 3; // Number of game overs before increasing difficulty
const difficultyIncreaseFactor = 0.5; // Amount to increase difficulty

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    birdImg = new Image();
    birdImg.src = "./flappybird.png";

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    const tapBtn = document.getElementById("tapBtn");
    tapBtn.addEventListener("click", handleTap);

    document.getElementById("restartBtn").addEventListener("click", restartGame);
    document.getElementById("closeModalBtn").addEventListener("click", closeModal);

    const bgMusic = document.getElementById("bgMusic");
    bgMusic.volume = 0.2;
    bgMusic.loop = true;

    // Handle keyboard events
    document.addEventListener("keydown", function(e) {
        if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX") {
            handleTap();
        }
    });

    // Handle touch events for mobile
    board.addEventListener("touchstart", handleTap);
    board.addEventListener("mousedown", handleTap); // For mouse click events
}

function handleTap() {
    if (!gameStarted) {
        startGame();
    } else if (gameOver) {
        restartGame();
    } else {
        moveBird();
    }
}

function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        document.getElementById("tapBtn").style.display = 'none'; // Hide button once game starts
        requestAnimationFrame(update);
        pipeInterval = setInterval(placePipes, 1500);
        const bgMusic = document.getElementById("bgMusic");
        bgMusic.play().catch(error => {
            console.error("Error playing background music:", error);
        });
    }
}

function update() {
    if (!gameStarted) return;

    requestAnimationFrame(update);
    if (gameOver) return;

    context.clearRect(0, 0, board.width, board.height);

    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
        gameOverCount++;
        showModal();
        return; // Stop further game updates when game over
    }

    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
            gameOverCount++;
            showModal();
            return; // Stop further game updates when game over
        }
    }

    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(`Score: ${Math.floor(score)}`, 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
    }
}

function placePipes() {
    if (!gameStarted || gameOver) return;

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(bottomPipe);

    // Increase difficulty after a certain number of game overs
    if (gameOverCount % difficultyIncreaseThreshold === 0) {
        increaseDifficulty();
    }
}

function moveBird() {
    if (!gameStarted) return;

    velocityY = -6;

    if (gameOver) {
        restartGame();
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function restartGame() {
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    gameOver = false;
    gameStarted = false;
    document.getElementById("gameOverModal").style.display = 'none';
    document.getElementById("tapBtn").style.display = 'block'; // Show button again
    clearInterval(pipeInterval); // Stop placing pipes
    const bgMusic = document.getElementById("bgMusic");
    bgMusic.pause();
    bgMusic.currentTime = 0; // Reset music to start
}

function showModal() {
    document.getElementById("finalScore").textContent = `Score: ${Math.floor(score)}`;
    document.getElementById("gameOverModal").style.display = 'flex';
}

function closeModal() {
    document.getElementById("gameOverModal").style.display = 'none';
}

function increaseDifficulty() {
    // Increase the speed at which pipes move
    velocityX -= difficultyIncreaseFactor;
    // You can add more difficulty adjustments here, like increasing pipe frequency or decreasing the space between pipes
}
