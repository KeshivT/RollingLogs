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


function resetGame() {
    // Reset player position and velocity
    cube.position.set(0, -2, 0);
    playerVelocity.set(0, 0, 0);

    // Reset log properties
    logSpeed = 0.03; 
    spawnRate = initialSpawnRate; 

    // Remove all logs
    logs.forEach((log) => scene.remove(log));
    logs = [];

    // Clear previous log spawn interval
    clearTimeout(logSpawnInterval);

    // Restart spawning logs
    startSpawningLogs();
}

function checkCollision() {
    const cubeBox = new THREE.Box3().setFromObject(cube);

    logs.forEach((log) => {
        const logBox = new THREE.Box3().setFromObject(log);

        if (cubeBox.intersectsBox(logBox)) {
            console.log("Game Over!");
            alert("Game Over! Press OK to restart.");
            resetGame();
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
