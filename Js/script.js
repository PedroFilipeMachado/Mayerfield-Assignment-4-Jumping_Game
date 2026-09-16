let character = document.getElementById('character');
let hitbox = document.getElementById('hitbox');
let block = document.getElementById('block');
let game = document.getElementById('game');
let scoreElement = document.getElementById('score');
let obstaclesAvoidedElement = document.getElementById('obstacles-avoided');

const backgroundSprites = [
    'Assets/Backgrounds/day_background.png',
    'Assets/Backgrounds/noon_background.png',
    'Assets/Backgrounds/night_background.png'
];

const obstacleSprites = [
    'Assets/Obstacles/building_01.png',
    'Assets/Obstacles/building_02.png',
    'Assets/Obstacles/building_03.png',
    'Assets/Obstacles/building_04.png',
    'Assets/Obstacles/building_05.png'
];

function setBackground(index) {
    game.style.backgroundImage = `url("${backgroundSprites[index]}")`;
}

function cycleBackgrounds() {
    let currentIndex = 0;

    return function () {
        currentIndex = (currentIndex + 1) % backgroundSprites.length;
        setBackground(currentIndex);
        increaseObstacleSpeed();
    };
}

const obstacleSpeedIncrease = 0.9;
let obstaclePlaybackRate = 1;

function increaseObstacleSpeed() {
    obstaclePlaybackRate /= obstacleSpeedIncrease;
    const obstacleAnimation = block.getAnimations()[0];

    if (obstacleAnimation) {
        obstacleAnimation.updatePlaybackRate(obstaclePlaybackRate);
    }
}

const updateBackground = cycleBackgrounds();
setBackground(0);
setInterval(updateBackground, 10000);

function randomObstacleSprite() {
    const randomIndex = Math.floor(Math.random() * obstacleSprites.length);
    const chosenSprite = obstacleSprites[randomIndex];

    block.style.backgroundImage = `url("${chosenSprite}")`;
    block.style.backgroundSize = 'contain';
    block.style.backgroundRepeat = 'no-repeat';
    block.style.backgroundPosition = 'center';
}

let score = 0;
let obstaclesAvoided = 0;

block.addEventListener('animationiteration', function () {
    score += 10;
    obstaclesAvoided += 1;
    scoreElement.textContent = score;
    obstaclesAvoidedElement.textContent = obstaclesAvoided;
    randomObstacleSprite();
});

const groundPosition = 300;
const jumpStrength = 18;
const gravity = 0.8;
let characterPosition = groundPosition;
let characterVelocity = 0;
let isJumping = false;

function updateJump() {
    characterVelocity += gravity;
    characterPosition += characterVelocity;

    if (characterPosition >= groundPosition) {
        characterPosition = groundPosition;
        characterVelocity = 0;
        isJumping = false;
    }

    character.style.top = `${characterPosition}px`;

    if (isJumping) {
        requestAnimationFrame(updateJump);
    }
}

const jump = function () {
    if (isJumping) {
        return;
    }

    isJumping = true;
    characterVelocity = -jumpStrength;
    requestAnimationFrame(updateJump);
};

let checkDead = setInterval(function () {
    let hitboxRect = hitbox.getBoundingClientRect();
    let blockRect = block.getBoundingClientRect();

    let overlaps =
        hitboxRect.right > blockRect.left &&
        hitboxRect.left < blockRect.right &&
        hitboxRect.bottom > blockRect.top &&
        hitboxRect.top < blockRect.bottom;

    if (overlaps) {
        block.style.animation = 'none';
        block.style.display = 'none';
        alert('Game Over');
    }
}, 10);

randomObstacleSprite();
document.addEventListener('keydown', jump);