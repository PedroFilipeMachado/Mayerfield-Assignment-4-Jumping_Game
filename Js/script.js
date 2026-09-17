let character = document.getElementById('character');
let hitbox = document.getElementById('hitbox');
let block = document.getElementById('block');
let upperBlock = document.getElementById('upper-block');
let game = document.getElementById('game');
let scoreElement = document.getElementById('score');
let obstaclesAvoidedElement = document.getElementById('obstacles-avoided');
let musicVolume = document.getElementById('music-volume');
const backgroundMusic = new Audio('Assets/Music/AdhesiveWombat - Night Shade.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = musicVolume.value;

block.style.display = 'none';
upperBlock.style.display = 'none';

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
    'Assets/Obstacles/plane_1.png',
    'Assets/Obstacles/plane_2.png',
    'Assets/Obstacles/plane_3.png',
    'Assets/Obstacles/plane_4.png',
    'Assets/Obstacles/plane_5.png',

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
const minimumObstacleGap = 300;
let obstaclePlaybackRate = 1;
let gameOver = false;
let lowerObstacleSpawnTimeout;
let upperObstacleSpawnTimeout;

function increaseObstacleSpeed() {
    obstaclePlaybackRate /= obstacleSpeedIncrease;
    const obstacleAnimations = block.getAnimations().concat(upperBlock.getAnimations());

    obstacleAnimations.forEach(function (animation) {
        animation.updatePlaybackRate(obstaclePlaybackRate);
    });
}

function randomObstacleSprite(obstacle) {
    const randomIndex = Math.floor(Math.random() * obstacleSprites.length);
    const chosenSprite = obstacleSprites[randomIndex];

    obstacle.style.backgroundImage = `url("${chosenSprite}")`;
    obstacle.style.backgroundSize = 'contain';
    obstacle.style.backgroundRepeat = 'no-repeat';
    obstacle.style.backgroundPosition = 'center';
}

function canSpawnObstacle(obstacle) {
    const otherObstacle = obstacle === block ? upperBlock : block;

    if (otherObstacle.style.display === 'none') {
        return true;
    }

    const otherObstaclePosition = otherObstacle.getBoundingClientRect().left;
    return Math.abs(1000 - otherObstaclePosition) >= minimumObstacleGap;
}

function spawnObstacle() {
    if (gameOver) {
        return;
    }

    if (!canSpawnObstacle(block)) {
        lowerObstacleSpawnTimeout = setTimeout(spawnObstacle, 100);
        return;
    }

    randomObstacleSprite(block);
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

function spawnUpperObstacle() {
    if (gameOver) {
        return;
    }

    if (!canSpawnObstacle(upperBlock)) {
        upperObstacleSpawnTimeout = setTimeout(spawnUpperObstacle, 100);
        return;
    }

    randomObstacleSprite(upperBlock);
    upperBlock.getAnimations().forEach(function (animation) {
        animation.cancel();
    });
    upperBlock.style.left = '1000px';
    upperBlock.style.display = 'block';

    const obstacleAnimation = upperBlock.getAnimations()[0];
    if (obstacleAnimation) {
        obstacleAnimation.updatePlaybackRate(obstaclePlaybackRate);
    }
}

const pointsPerSecond = 10;

function playBackgroundMusic() {
    backgroundMusic.play().catch(function () {
    });
}

musicVolume.addEventListener('input', function () {
    backgroundMusic.volume = musicVolume.value;
});

const groundPosition = 300;
const jumpDuration = 800;
const jumpHeight = 200;
const jumpSounds = [1, 2, 3, 4, 5, 6, 7].map(function (soundNumber) {
    return new Audio(`Assets/Sound Effects/Jumps/jump${soundNumber}.mp3`);
});
const crashSounds = [1, 2, 3, 4, 5, 6, 7, 8].map(function (soundNumber) {
    return new Audio(`Assets/Sound Effects/Crashes/crash${soundNumber}.wav`);
});
let characterPosition = groundPosition;
let isJumping = false;
let jumpStartTime = 0;
let nextJumpSound = 0;

function updateJump(currentTime) {
    const jumpProgress = Math.min((currentTime - jumpStartTime) / jumpDuration, 1);
    characterPosition = groundPosition - jumpHeight * 4 * jumpProgress * (1 - jumpProgress);

    character.style.top = `${characterPosition}px`;

    if (jumpProgress < 1) {
        requestAnimationFrame(updateJump);
    } else {
        isJumping = false;
    }
}

const jump = function () {
    if (isJumping) {
        return;
    }

    playBackgroundMusic();

    isJumping = true;
    jumpStartTime = performance.now();

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

    gameOver = false;
    backgroundMusic.currentTime = 0;
    playBackgroundMusic();
    block.getAnimations().forEach(function (animation) {
        animation.cancel();
    });
    upperBlock.getAnimations().forEach(function (animation) {
        animation.cancel();
    });
    block.style.left = '1000px';
    block.style.display = 'none';
    upperBlock.style.left = '1000px';
    upperBlock.style.display = 'none';
    game.classList.add('game-started');
    setBackground(0);
    setInterval(updateBackground, 25000);

    block.addEventListener('animationiteration', function () {
        obstaclesAvoided += 1;
        obstaclesAvoidedElement.textContent = obstaclesAvoided;
        block.getAnimations().forEach(function (animation) {
            animation.cancel();
        });
        block.style.display = 'none';
        lowerObstacleSpawnTimeout = setTimeout(spawnObstacle, Math.random() * 1500);
    });

    upperBlock.addEventListener('animationiteration', function () {
        obstaclesAvoided += 1;
        obstaclesAvoidedElement.textContent = obstaclesAvoided;
        upperBlock.getAnimations().forEach(function (animation) {
            animation.cancel();
        });
        upperBlock.style.display = 'none';
        upperObstacleSpawnTimeout = setTimeout(spawnUpperObstacle, Math.random() * 1500);
    });

    function updateScore() {
        const secondsSurvived = Math.floor((Date.now() - gameStartTime) / 1000);
        scoreElement.textContent = secondsSurvived * pointsPerSecond;
    }

    scoreTimer = setInterval(updateScore, 1000);

    const checkDead = setInterval(function () {
        let hitboxRect = hitbox.getBoundingClientRect();
        let blockRect = block.getBoundingClientRect();
        let upperBlockRect = upperBlock.getBoundingClientRect();

        let lowerOverlap =
            hitboxRect.right > blockRect.left &&
            hitboxRect.left < blockRect.right &&
            hitboxRect.bottom > blockRect.top &&
            hitboxRect.top < blockRect.bottom;
        let upperOverlap =
            hitboxRect.right > upperBlockRect.left &&
            hitboxRect.left < upperBlockRect.right &&
            hitboxRect.top < upperBlockRect.bottom &&
            hitboxRect.bottom > upperBlockRect.top;

        if (lowerOverlap || upperOverlap) {
            gameOver = true;
            backgroundMusic.pause();
            game.classList.remove('game-started');
            block.getAnimations().forEach(function (animation) {
                animation.cancel();
            });
            upperBlock.getAnimations().forEach(function (animation) {
                animation.cancel();
            });
            block.style.display = 'none';
            upperBlock.style.display = 'none';
            clearInterval(checkDead);
            clearInterval(scoreTimer);
            clearTimeout(lowerObstacleSpawnTimeout);
            clearTimeout(upperObstacleSpawnTimeout);
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
    upperObstacleSpawnTimeout = setTimeout(spawnUpperObstacle, 500);
    document.addEventListener('keydown', jump);
}

alert(`Welcome to the "Non-Descript Lizard Game"!

The non-descript lizard has just destroyed the city's nuclear power plant and must now escape the buildings that are trying to chase him down!

Help him escape!`);
startGame();