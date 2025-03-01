import * as THREE from 'three';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set camera position
camera.position.z = 5;

const groundGeometry = new THREE.PlaneGeometry(20, 300);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -2.5;
scene.add(ground);

scene.background = new THREE.Color(0x87CEEB); // Sky blue

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);


function createTree(x, z) {
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(x, -1.5, z);

    const leavesGeometry = new THREE.SphereGeometry(1);
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x2E8B57 });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.set(x, 0, z);

    scene.add(trunk);
    scene.add(leaves);
}

for (let i = -10; i <= 10; i += 3) {
    createTree(i, -9);
    createTree(i, -15);
    createTree(i, -25);
    createTree(i, -50);
    createTree(i, -75);
    createTree(i, -150);

}

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

directionalLight.castShadow = true;
/*
cube.castShadow = true;
cube.receiveShadow = true;
*/
ground.receiveShadow = true;

const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);

// Position the cube
cube.position.y = -2; // Set ground level

const textureLoader = new THREE.TextureLoader();
const logTexture = textureLoader.load('log_texture.jpg');

function createLog() {
    let logSize; 
    logSize = Math.random() * (7 - 1) + 1
    const logGeometry = new THREE.CylinderGeometry(0.5, 0.5, logSize, 16);
    const logMaterial = new THREE.MeshStandardMaterial({ map: logTexture });
    const log = new THREE.Mesh(logGeometry, logMaterial);

    // Position the log above the player and move towards them
    log.position.set(Math.random() * 20 - 10, -2, -10); // Random x position
    log.rotation.z = Math.PI / 2; // Lay it sideways

    scene.add(log);
    return log;
}

let logs = [];

// Log movement speed
let logSpeed = 0.03; 
let speedIncreaseRate = 0.00005; 

// Log spawn rate variables
let initialSpawnRate = 2000; // Start spawning every 2 seconds
let minSpawnRate = 500; // Minimum spawn rate (0.5 seconds)
let spawnRate = initialSpawnRate;
let spawnRateDecrease = 50;
let logSpawnInterval; 

function startSpawningLogs() {
    logSpawnInterval = setTimeout(() => {
        logs.push(createLog());

        // Gradually increase the spawn rate (decrease interval time)
        if (spawnRate > minSpawnRate) {
            spawnRate -= spawnRateDecrease;
        }

        startSpawningLogs();
    }, spawnRate);
}

function updateLogs() {
    logs.forEach((log, index) => {
        log.position.z += logSpeed;
        log.rotation.x += logSpeed * 2;

        if (log.position.z > 5) { 
            scene.remove(log);
            logs.splice(index, 1);
        }
    });

    logSpeed += speedIncreaseRate; 
}

let playerVelocity = new THREE.Vector3(0, 0, 0);
let playerAcceleration = 0.005;
let friction = 0.005;
let maxSpeed = 0.05;

const keys = {};

document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});


function updatePlayer() {
    if (keys['ArrowLeft']) {
        playerVelocity.x = Math.max(playerVelocity.x - playerAcceleration, -maxSpeed);
    }
    if (keys['ArrowRight']) {
        playerVelocity.x = Math.min(playerVelocity.x + playerAcceleration, maxSpeed);
    }

    if (keys[' '] && cube.position.y === -2) {
        playerVelocity.y = 0.2;
    }

    playerVelocity.y -= 0.0035;

    if (!keys['ArrowLeft'] && !keys['ArrowRight']) {
        playerVelocity.x *= 1 - friction;
    }

    cube.position.add(playerVelocity);

    if (cube.position.y < -2) {
        cube.position.y = -2;
        playerVelocity.y = 0;
    }

    if (cube.position.x < -8) { 
        cube.position.x = 8;
    }

    if (cube.position.x > 8) { 
        cube.position.x = -8;
    }
}

let lives = 3; // Number of lives
let isInvincible = false; // Track grace period
let timeElapsed = 0;
let timerInterval;

// Create a timer display and position it at the top-right
const timerDisplay = document.createElement("div");
timerDisplay.style.position = "absolute";
timerDisplay.style.top = "10px";
timerDisplay.style.right = "20px"; // Align to the top-right
timerDisplay.style.fontSize = "24px";
timerDisplay.style.fontWeight = "bold";
timerDisplay.style.color = "white";
timerDisplay.style.background = "rgba(0, 0, 0, 0.5)"; // Semi-transparent background
timerDisplay.style.padding = "10px 15px";
timerDisplay.style.borderRadius = "5px";
timerDisplay.innerText = "Time: 0s";
document.body.appendChild(timerDisplay);

function startTimer() {
    timeElapsed = 0;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeElapsed += 0.1; 
        timerDisplay.innerText = `Time: ${timeElapsed.toFixed(1)}s`;
    }, 100);
}

function updateLivesDisplay() {
    const hearts = document.querySelectorAll(".heart");
    for (let i = 0; i < hearts.length; i++) {
        if (i < lives) {
            hearts[i].style.opacity = "1"; // Show heart
        } else {
            hearts[i].style.opacity = "0.2"; // Dim heart when lost
        }
    }
}

function startInvincibility() {
    isInvincible = true;
    cube.material.opacity = 0.5; // Make player semi-transparent
    setTimeout(() => {
        isInvincible = false;
        cube.material.opacity = 1; // Reset player visibility
    }, 1500); // 1.5 sec grace period
}

function resetGame() {
    // Reset player position and velocity
    cube.position.set(0, -2, 0);
    playerVelocity.set(0, 0, 0);

    // Reset log properties
    logSpeed = 0.03; 
    spawnRate = initialSpawnRate; 
    lives = 3; // Reset lives
    updateLivesDisplay();

    // Remove all logs
    logs.forEach((log) => scene.remove(log));
    logs = [];

    // Clear previous log spawn interval
    clearTimeout(logSpawnInterval);

    // Restart spawning logs
    startSpawningLogs();

    // Restart the timer
    startTimer();
}

function checkCollision() {
    if (isInvincible) return; // If in grace period, ignore collisions

    const cubeBox = new THREE.Box3().setFromObject(cube);

    logs.forEach((log) => {
        const logBox = new THREE.Box3().setFromObject(log);

        if (cubeBox.intersectsBox(logBox)) {
            lives -= 1;
            updateLivesDisplay();

            if (lives <= 0) {
                console.log("Game Over!");
                alert(`Game Over! You survived for ${timeElapsed.toFixed(1)} seconds. Press OK to restart.`);
                resetGame();
            } else {
                startInvincibility(); // Activate grace period
            }
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    updateLogs();
    updatePlayer();
    checkCollision();
    renderer.render(scene, camera);
}

animate();
startSpawningLogs(); // Start log spawning when game begins
startTimer(); // Start the timer when the game begins

