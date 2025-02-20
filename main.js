import * as THREE from 'three';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set camera position
camera.position.z = 5;

const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);

// Position the cube
cube.position.y = -2; // Set ground level

function createLog() {
    const logGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 16);
    const logMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
    const log = new THREE.Mesh(logGeometry, logMaterial);

    // Position the log above the player and move towards them
    log.position.set(Math.random() * 4 - 2, -2, -5); // Random x position
    log.rotation.z = Math.PI / 2; // Lay it sideways

    scene.add(log);
    return log;
}

let logs = [];
setInterval(() => {
    logs.push(createLog());
}, 2000);

function updateLogs() {
    logs.forEach((log, index) => {
        log.position.z += 0.03; // Move towards player
        log.rotation.x += 0.1; // Make it roll
        if (log.position.z < -5) {
            scene.remove(log);
            logs.splice(index, 1);
        }
    });
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' && cube.position.x > -6) {
        cube.position.x -= 1;
    } else if (event.key === 'ArrowRight' && cube.position.x < 6) {
        cube.position.x += 1;
    } else if (event.key === ' ') {
        if (cube.position.y === -2) { // Jump only if on the ground
            cube.velocity = 0.2;
        }
    }
});

// Gravity for jumping
cube.velocity = 0;
function updatePlayer() {
    if (cube.position.y > -2) {
        cube.velocity -= 0.004; // Gravity effect
    }
    cube.position.y += cube.velocity;
    if (cube.position.y < -2) {
        cube.position.y = -2; // Stay on ground
        cube.velocity = 0;
    }
}


function checkCollision() {
    const cubeBox = new THREE.Box3().setFromObject(cube);

    logs.forEach((log) => {
        const logBox = new THREE.Box3().setFromObject(log);

        if (cubeBox.intersectsBox(logBox)) {
            console.log("Game Over!");
            alert("Game Over!");
            location.reload(); // Restart game
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
