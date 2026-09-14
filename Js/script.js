let character = document.getElementById('character');
let hitbox = document.getElementById('hitbox');
let block = document.getElementById('block');
let game = document.getElementById('game');

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
        setBackground(currentIndex);
        currentIndex = (currentIndex + 1) % backgroundSprites.length;
    };
}

const updateBackground = cycleBackgrounds();
setBackground(0);
setInterval(updateBackground, 60000);

function randomObstacleSprite() {
    const randomIndex = Math.floor(Math.random() * obstacleSprites.length);
    const chosenSprite = obstacleSprites[randomIndex];

    block.style.backgroundImage = `url("${chosenSprite}")`;
    block.style.backgroundSize = 'contain';
    block.style.backgroundRepeat = 'no-repeat';
    block.style.backgroundPosition = 'center';
}
/*
block.addEventListener('animationiteration', function () {
    randomObstacleSprite();
});
*/
const jump = function () {
    if (!character.classList.contains('animate')) {
        character.classList.add('animate');
    }
    setTimeout(function () {
        character.classList.remove('animate');
    }, 500);
}

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
document.addEventListener('click', jump);