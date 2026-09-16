let character = document.getElementById('character');
let hitbox = document.getElementById('hitbox');
let block = document.getElementById('block');
let game = document.getElementById('game');
let scoreElement = document.getElementById('score');
let obstaclesAvoidedElement = document.getElementById('obstacles-avoided');

block.style.display = 'none';

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
    'Assets/Obstacles/building_05.png',
    'Assets/Obstacles/building_06.png',
    'Assets/Obstacles/building_07.png',
    'Assets/Obstacles/building_08.png',
    'Assets/Obstacles/building_09.png',
    'Assets/Obstacles/building_10.png',
    'Assets/Obstacles/building_11.png',
    'Assets/Obstacles/building_12.png',
    'Assets/Obstacles/building_13.png',
    'Assets/Obstacles/building_14.png',
    'Assets/Obstacles/building_15.png',
    'Assets/Obstacles/building_16.png',
    'Assets/Obstacles/building_17.png',
    'Assets/Obstacles/building_18.png',

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
let gameOver = false;

function increaseObstacleSpeed() {
    obstaclePlaybackRate /= obstacleSpeedIncrease;
    const obstacleAnimation = block.getAnimations()[0];

    if (obstacleAnimation) {
        obstacleAnimation.updatePlaybackRate(obstaclePlaybackRate);
    }
}

function randomObstacleSprite() {
    const randomIndex = Math.floor(Math.random() * obstacleSprites.length);
    const chosenSprite = obstacleSprites[randomIndex];

    block.style.backgroundImage = `url("${chosenSprite}")`;
    block.style.backgroundSize = 'contain';
    block.style.backgroundRepeat = 'no-repeat';
    block.style.backgroundPosition = 'center';
}

function spawnObstacle() {
    if (gameOver) {
        return;
    }

    randomObstacleSprite();
    block.getAnimations().forEach(function (animation) {
        animation.cancel();
    });
    block.style.left = '1000px';
    block.style.display = 'block';

    const obstacleAnimation = block.getAnimations()[0];
    if (obstacleAnimation) {
        obstacleAnimation.updatePlaybackRate(obstaclePlaybackRate);
    }
}

const pointsPerSecond = 10;

const groundPosition = 300;
const jumpStrength = 18;
const gravity = 0.8;
const jumpSounds = [1, 2, 3, 4, 5, 6, 7].map(function (soundNumber) {
    return new Audio(`Assets/Sound Effects/Jumps/jump${soundNumber}.mp3`);
});
const crashSounds = [1, 2, 3, 4, 5, 6, 7, 8].map(function (soundNumber) {
    return new Audio(`Assets/Sound Effects/Crashes/crash${soundNumber}.wav`);
});
let characterPosition = groundPosition;
let characterVelocity = 0;
let isJumping = false;
let nextJumpSound = 0;

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

    const jumpSound = jumpSounds[nextJumpSound];
    nextJumpSound = (nextJumpSound + 1) % jumpSounds.length;
    jumpSound.currentTime = 0;
    jumpSound.play().catch(function () {
        // Audio may be unavailable if the browser blocks sound playback.
    });

    requestAnimationFrame(updateJump);
};


function startGame() {
    const updateBackground = cycleBackgrounds();
    const gameStartTime = Date.now();
    let scoreTimer;
    let obstaclesAvoided = 0;
    let obstacleSpawnTimeout;

    gameOver = false;
    block.getAnimations().forEach(function (animation) {
        animation.cancel();
    });
    block.style.left = '1000px';
    block.style.display = 'none';
    game.classList.add('game-started');
    setBackground(0);
    setInterval(updateBackground, 10000);

    block.addEventListener('animationiteration', function () {
        obstaclesAvoided += 1;
        obstaclesAvoidedElement.textContent = obstaclesAvoided;
        block.getAnimations().forEach(function (animation) {
            animation.cancel();
        });
        block.style.display = 'none';
        obstacleSpawnTimeout = setTimeout(spawnObstacle, Math.random() * 1500);
    });

    function updateScore() {
        const secondsSurvived = Math.floor((Date.now() - gameStartTime) / 1000);
        scoreElement.textContent = secondsSurvived * pointsPerSecond;
    }

    scoreTimer = setInterval(updateScore, 1000);

    const checkDead = setInterval(function () {
        let hitboxRect = hitbox.getBoundingClientRect();
        let blockRect = block.getBoundingClientRect();

        let overlaps =
            hitboxRect.right > blockRect.left &&
            hitboxRect.left < blockRect.right &&
            hitboxRect.bottom > blockRect.top &&
            hitboxRect.top < blockRect.bottom;

        if (overlaps) {
            gameOver = true;
            game.classList.remove('game-started');
            block.getAnimations().forEach(function (animation) {
                animation.cancel();
            });
            block.style.display = 'none';
            clearInterval(checkDead);
            clearInterval(scoreTimer);
            clearTimeout(obstacleSpawnTimeout);
            updateScore();

            const crashSound = crashSounds[Math.floor(Math.random() * crashSounds.length)];
            crashSound.currentTime = 0;
            crashSound.play().catch(function () {
            });

            setTimeout(function () {
                const restartGame = confirm('Game Over! Your score: ' + scoreElement.textContent + ' points. You avoided ' + obstaclesAvoided + ' obstacles. Press OK to start over or Cancel to leave.');

                if (restartGame) {
                    window.location.reload();
                }
            }, 150);
        }
    }, 10);

    spawnObstacle();
    document.addEventListener('keydown', jump);
}

alert(`Welcome to the "Non-Descript Lizard Game"!

The non-descript lizard has just destroyed the city's nuclear power plant and must now escape the buildings that are trying to chase him down!

Help him escape!`);
startGame();