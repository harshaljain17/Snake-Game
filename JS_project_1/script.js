const board = document.querySelector('.board');
const modal = document.querySelector('.modal');
const startbutton = document.querySelector('.btn-start');
const restartbutton = document.querySelector('.btn-restart');
const startGameText = document.querySelector('.start-game');
const gameOverText = document.querySelector('.game-over');

const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('High-score');
const timeDisplay = document.getElementById('time');

let highScore = localStorage.getItem('highScore') || 0;
let score = 0;

let timerInterval = null;

const CONFIG = {
    blockHeight: 80,
    blockWidth: 80,
    speed: 300
};

const rows = Math.floor(board.clientHeight / CONFIG.blockHeight);
const cols = Math.floor(board.clientWidth / CONFIG.blockWidth);

let snake = [{ x: 1, y: 3 }, { x: 1, y: 2 }, { x: 1, y: 1 }];
let food = generateFood();
let direction = 'right';
let nextDirection = 'right'; // Buffer to prevent 180-degree turns
let intervalId = null;
const blocks = {};

function initBoard() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const block = document.createElement('div');
            block.classList.add('block');
            board.appendChild(block);
            blocks[`${row}, ${col}`] = block;
        }
    }
}

function generateFood() {
    let newFood;
    newFood = {
        x: Math.floor(Math.random() * rows),
        y: Math.floor(Math.random() * cols)
    };
    return newFood;
}

function update() {
    direction = nextDirection;
    const head = { ...snake[0] };

    // 1. Calculate New Head Position
    if (direction === 'right') head.y++;
    else if (direction === 'left') head.y--;
    else if (direction === 'up') head.x--;
    else if (direction === 'down') head.x++;

    // 2. Check Collisions (Wall or Self)
    const hitWall = head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols;
    const hitSelf = snake.some(seg => seg.x === head.x && seg.y === head.y);

    if (hitWall || hitSelf) {
        return gameOver();
    }

    // 3. Move Snake
    snake.unshift(head);

    // 4. Check Food
    if (head.x === food.x && head.y === food.y) {
        // Don't pop the tail = Snake grows!
        clearBlock(food.x, food.y, 'food');
        food = generateFood();

        score += 1
        scoreDisplay.innerText = score;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
        }

    } else {
        // Pop the tail to maintain length
        const tail = snake.pop();
        clearBlock(tail.x, tail.y, 'fill');
    }

    render();
}

function render() {
    // Render Food
    const foodEl = blocks[`${food.x}, ${food.y}`];
    foodEl.classList.add('food');

    // Render Snake
    snake.forEach((segment, index) => {
        const segEl = blocks[`${segment.x}, ${segment.y}`];
        segEl.classList.add('fill');
        if (index === 0) segEl.classList.add('head');
        else segEl.classList.remove('head');
    });

    highScoreDisplay.innerText = highScore;
}

function gameOver() {
    clearInterval(intervalId);
    modal.style.display = 'flex';
    startGameText.style.display = 'none';
    gameOverText.style.display = 'flex';

    score = 0;
    scoreDisplay.innerText = score;

    // clear snake and food from board
    snake.forEach(segment => {
        clearBlock(segment.x, segment.y, 'fill');
    });
    clearBlock(food.x, food.y, 'food');

    restartbutton.addEventListener('click', () => {

        // Reset Game State
        snake = [{ x: 1, y: 3 }, { x: 1, y: 2 }, { x: 1, y: 1 }];
        food = generateFood();
        direction = 'right';
        nextDirection = 'right';

        // Hide Modal
        modal.style.display = 'none';
        gameOverText.style.display = 'none';

        // Restart Game
        intervalId = setInterval(update, CONFIG.speed);
    });
}

window.addEventListener('keydown', (e) => {
    const key = e.key;
    // Prevent reverse direction (e.g., can't go Left if currently going Right)
    if (key === 'ArrowRight' && direction !== 'left') nextDirection = 'right';
    else if (key === 'ArrowLeft' && direction !== 'right') nextDirection = 'left';
    else if (key === 'ArrowUp' && direction !== 'down') nextDirection = 'up';
    else if (key === 'ArrowDown' && direction !== 'up') nextDirection = 'down';
});

function clearBlock(x, y, className) {
    const el = blocks[`${x}, ${y}`];
    el.classList.remove(className, 'head');
}

// START GAME
initBoard();
startbutton.addEventListener('click', () => {
    modal.style.display = 'none';
    intervalId = setInterval(update, CONFIG.speed);
});
