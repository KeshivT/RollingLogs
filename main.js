import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const groundGeometry = new THREE.PlaneGeometry(20, 300);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -2.5;
ground.receiveShadow = true;
scene.add(ground);

scene.background = new THREE.Color(0x87CEEB); // Sky blue

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
ambientLight.castShadow = false;  // Ambient light should NOT cast shadows

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.shadow.mapSize.width = 4096; // Increase resolution for better quality
directionalLight.shadow.mapSize.height = 4096;
directionalLight.shadow.camera.left = -20;  
directionalLight.shadow.camera.right = 20;  
directionalLight.shadow.camera.top = 30;  // Increase top boundary
directionalLight.shadow.camera.bottom = -30;  // Increase bottom boundary
directionalLight.shadow.camera.far = 100; // Ensure shadows extend further
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);
ambientLight.castShadow = false;  

function createTree(x, z) {
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(x, -1.5, z);
    trunk.castShadow = true;
    trunk.receiveShadow = true;

    const leavesGeometry = new THREE.SphereGeometry(1);
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x2E8B57 });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.set(x, 0, z);
    leaves.castShadow = true;
    leaves.receiveShadow = true;

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

// const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
// const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
// cube.castShadow = true;
// cube.receiveShadow = true;
//  scene.add(cube);

// // Position the cube
// cube.position.y = -2; // Set ground level

let isFirstPerson = false; // Track the camera mode

camera.position.set(0, -2, 0);

function toggleCamera() {
    isFirstPerson = !isFirstPerson;

    // if (isFirstPerson) {
    //     // First-Person View: Camera follows the player
    //     camera.position.set(cube.position.x, cube.position.y + 0.8, cube.position.z);
    //     camera.lookAt(cube.position.x, cube.position.y + 0.8, cube.position.z - 5);
    // } else {
    //     // Third-Person View: Fixed camera position
    //     camera.position.set(0, 8, 10);  // High and behind the scene
    //     camera.lookAt(0, 0, 0);  // Look at the center of the world
    // }

    if (isFirstPerson) {
        // First-person: Keep camera inside frog, looking forward
        camera.position.set(frog.position.x, frog.position.y + 0.8, frog.position.z);
        camera.lookAt(frog.position.x, frog.position.y + 0.8, frog.position.z - 5);
    } else {
        // Third-Person View: Fixed camera position
        camera.position.set(0, 8, 10);  // High and behind the scene
        camera.lookAt(0, 0, 0);  // Look at the center of the world
    }
}

const textureLoader = new THREE.TextureLoader();

// Variable to store the loaded model
let frog = null;

// Load the MTL file (materials)
const mtlLoader = new MTLLoader();
mtlLoader.load('Tree_frog.mtl', (materials) => {
    console.log('MTL file loaded successfully');
    materials.preload();

    // Load the OBJ file with the materials
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load('Tree_frog.obj', (object) => {
        console.log('OBJ file loaded successfully');
        frog = object;  // Store the object in the variable
        console.log('Frog object:', frog);  

        // Traverse through the group to find the meshes
        frog.traverse((child) => {
            if (child.isMesh) {
                console.log('Found mesh:', child);

                // Enable shadows for the mesh
                child.castShadow = true;
                child.receiveShadow = false;

                // Apply opacity if the material exists
                if (child.material) {
                    child.material.opacity = 1;
                }
                // You can also set material properties here if needed
            }
        });

        // Now apply the transformations to the mesh
        frog.scale.set(0.3, 0.3, 0.3);
        let frogBox = new THREE.Box3().setFromObject(frog);
        let frogCenter = frogBox.getCenter(new THREE.Vector3());
    
        if (frog) {
            frog.position.set(0, -2, 0);
        }
        frog.rotation.set(0, 2, 0);
        scene.add(frog);
    });
});

const logTexture = textureLoader.load('log_texture.jpg');

function createLog() {
    let logSize = Math.random() * (7 - 1) + 1;
    const logGeometry = new THREE.CylinderGeometry(0.5, 0.5, logSize, 16);
    const logMaterial = new THREE.MeshStandardMaterial({ map: logTexture });
    const log = new THREE.Mesh(logGeometry, logMaterial);
    log.position.set(Math.random() * 20 - 10, -2, -8);
    log.rotation.z = Math.PI / 2;
    log.castShadow = true;
    log.receiveShadow = false;

    // 35% chance to apply wobble
    log.isWobbling = Math.random() < 0.35;  
    if (log.isWobbling) {
        log.wobbleOffset = Math.random() * Math.PI * 2; // Unique offset for independent motion
        log.wobbleIntensity = Math.random() * 0.3 + 0.2; // Subtle wobble (0.2 to 0.5)
        log.wobbleSpeed = Math.random() * 1 + 0.5; // Slow and smooth movement (0.5 to 1.5)
    }    

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

        // Apply subtle wobble if the log was marked to wobble
        if (log.isWobbling) {
            let wobbleAmount = Math.sin(log.position.z * log.wobbleSpeed + log.wobbleOffset) * log.wobbleIntensity;
            
            // Keep logs close to the ground without going under -2
            log.position.y = -2 + Math.abs(wobbleAmount * 0.8); // Slight bounce effect
        }

        // Remove logs that pass a certain point
        if (log.position.z > 5) { 
            scene.remove(log);
            logs.splice(index, 1);
        }
    });

    logSpeed += speedIncreaseRate; 
}


function createDustEffectJump() {
    if (!frog) return;

    // Compute the bounding box of the frog
    let frogBox = new THREE.Box3().setFromObject(frog);
    let center = frogBox.getCenter(new THREE.Vector3());
    let size = frogBox.getSize(new THREE.Vector3());

    const dustGeometry = new THREE.SphereGeometry(0.2);
    const dustMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.5 });
    const dust = new THREE.Mesh(dustGeometry, dustMaterial);
    
    // Position dust at the correct center and below the frog slightly
    dust.position.set(center.x, center.y - size.y / 2 - 0.1, center.z);

    scene.add(dust);

    setTimeout(() => scene.remove(dust), 500); // Remove after 0.5 sec
}


let lastDustTime = 0; 
const dustInterval = 500; 

function createDustEffect() {
    if (!frog) return;

    // Enforce cooldown between dust effects
    const currentTime = Date.now();
    if (currentTime - lastDustTime < dustInterval) return;
    lastDustTime = currentTime; // Update last spawn time

    let frogBox = new THREE.Box3().setFromObject(frog);
    let center = frogBox.getCenter(new THREE.Vector3());

    const dustGeometry = new THREE.SphereGeometry(0.2);
    const dustMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.5 });
    const dust = new THREE.Mesh(dustGeometry, dustMaterial);
    
    // Adjusted spawn position using the actual bounding box center
    dust.position.set(center.x, center.y - frogBox.getSize(new THREE.Vector3()).y / 2 - 0.1, center.z);
    
    scene.add(dust);
    setTimeout(() => scene.remove(dust), 500);
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

document.addEventListener('keydown', (event) => {
    if (event.key === 'Shift') {
        toggleCamera();
    }
});

let defaultJumpPower = 0.13; // Store default jump height
let boostedJumpPower = 0.2;  // Boosted jump height

function updatePlayer() {
    if (keys['ArrowLeft']) {
        playerVelocity.x = Math.max(playerVelocity.x - playerAcceleration, -maxSpeed);
        if(frog.position.y === -2) createDustEffect(); 
    }
    if (keys['ArrowRight']) {
        playerVelocity.x = Math.min(playerVelocity.x + playerAcceleration, maxSpeed);
        if(frog.position.y === -2) createDustEffect(); 
    }

    // if (keys[' '] && cube.position.y === -2) {
    //     playerVelocity.y = defaultJumpPower;
    //     createDustEffectJump(); 
    // }

    if (keys[' '] && frog.position.y === -2) {
        playerVelocity.y = defaultJumpPower;
        createDustEffectJump(); 
    }

    playerVelocity.y -= 0.0035;

    if (!keys['ArrowLeft'] && !keys['ArrowRight']) {
        playerVelocity.x *= 1 - friction;
    }

    // cube.position.add(playerVelocity);

    // if (cube.position.y < -2) {
    //     cube.position.y = -2;
    //     playerVelocity.y = 0;
    // }

    // if (cube.position.x < -8) { 
    //     cube.position.x = 8;
    // }

    // if (cube.position.x > 8) { 
    //     cube.position.x = -8;
    // }

    if(frog){
        frog.position.add(playerVelocity);

        if (frog.position.y < -2) {
            frog.position.y = -2;
            playerVelocity.y = 0;
        }

        if (frog.position.x < -8) { 
            frog.position.x = 8;
        }

        if (frog.position.x > 8) { 
            frog.position.x = -8;
        }
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
    // isInvincible = true;
    // cube.material.opacity = 0.5; // Make player semi-transparent
    // setTimeout(() => {
    //     isInvincible = false;
    //     cube.material.opacity = 1; // Reset player visibility
    // }, 1500); // 1.5 sec grace period

    if (frog) {
        isInvincible = true;
    
        // Traverse through the frog group to find each child mesh
        frog.traverse((child) => {
            if (child.isMesh) {
                // Set the opacity for each mesh inside the frog group
                if (child.material) {
                    child.material.opacity = 0.5; // Make player semi-transparent
                }
            }
        });
    
        // After 1.5 seconds, reset the opacity and invincibility state
        setTimeout(() => {
            isInvincible = false;
    
            // Reset the opacity for each mesh in the frog group
            frog.traverse((child) => {
                if (child.isMesh) {
                    if (child.material) {
                        child.material.opacity = 1; // Reset opacity to fully visible
                    }
                }
            });
        }, 1500); // 1.5 sec grace period
    }
}

// Add Sun and Moon
const sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 50;
sunLight.shadow.camera.left = -20;
sunLight.shadow.camera.right = 20;
sunLight.shadow.camera.top = 20;
sunLight.shadow.camera.bottom = -20;
scene.add(sunLight);
scene.remove(directionalLight);  // If `directionalLight` is the extra one

const sunGeometry = new THREE.SphereGeometry(2);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

const moonGeometry = new THREE.SphereGeometry(1.5);
const moonMaterial = new THREE.MeshBasicMaterial({ color: 0xbbbbbb });
const moon = new THREE.Mesh(moonGeometry, moonMaterial);
scene.add(moon);

let timeOfDay = 0; 
const cycleSpeed = 0.002; 

function updateDayNightCycle() {
    timeOfDay += cycleSpeed;
    if (timeOfDay > Math.PI * 2) timeOfDay = 0;
    
    // Calculate Sun & Moon positions
    const sunX = Math.cos(timeOfDay) * 30;
    const sunY = Math.sin(timeOfDay) * 30;
    
    sun.position.set(sunX, sunY, -20);
    sunLight.position.set(sunX, sunY, -10);
    sunLight.target.position.set(0, 0, 0);
    sunLight.target.updateMatrixWorld();
    
    // Moon is opposite to the Sun
    const moonX = -sunX;
    const moonY = -sunY;
    moon.position.set(moonX, moonY, -20);
    
    // Adjust light intensity and color
    let intensity = Math.max(0.1, Math.sin(timeOfDay)); // Brighter during the day
    sunLight.intensity = intensity * 1.5;
    sunLight.color.setHSL(0.1, 0.5, 0.5 + intensity * 0.5);
    sunLight.castShadow = true; 
    
    // Adjust sky color
    let skyFactor = (Math.sin(timeOfDay) + 1) / 2; // Normalized 0 to 1
    let skyColor = new THREE.Color().lerpColors(new THREE.Color(0x001848), new THREE.Color(0x87CEEB), skyFactor);
    scene.background = skyColor;
    
    // Adjust shadows (strong during the day, softer at night)
    sunLight.shadow.darkness = intensity;
    
    // Reduce visibility at night
    let visibilityFactor = Math.max(0.5, intensity); // Min 50% visibility at night
    renderer.toneMappingExposure = visibilityFactor;
}

// Create a power-up display text element
const powerUpDisplay = document.createElement("div");
powerUpDisplay.style.position = "absolute";
powerUpDisplay.style.top = "50px"; 
powerUpDisplay.style.left = "50%";
powerUpDisplay.style.transform = "translateX(-50%)"; // Center align
powerUpDisplay.style.fontSize = "50px";
powerUpDisplay.style.fontWeight = "bold";
powerUpDisplay.style.color = "white";
powerUpDisplay.style.background = "rgba(0, 0, 0, 0.5)"; // Semi-transparent background
powerUpDisplay.style.padding = "10px 15px";
powerUpDisplay.style.borderRadius = "5px";
powerUpDisplay.style.display = "none"; // Hidden by default
document.body.appendChild(powerUpDisplay);

function createPowerUp() {
    const powerUpGeometry = new THREE.SphereGeometry(0.5);
    const powerUpMaterial = new THREE.MeshStandardMaterial({ color:0x7e017e });
    const powerUp = new THREE.Mesh(powerUpGeometry, powerUpMaterial);
    
    powerUp.position.set(Math.random() * 16 - 8, -1.8, 0);
    powerUp.castShadow = true;
    scene.add(powerUp);

    return powerUp;
}

let powerUps = [];

function spawnPowerUps() {
    setInterval(() => {
        if (powerUps.length < 3) {  // Limit active power-ups
            let newPowerUp = createPowerUp();
            powerUps.push(newPowerUp);

            // Remove power-up after 3 seconds if not collected
            setTimeout(() => {
                scene.remove(newPowerUp);
                powerUps = powerUps.filter(p => p !== newPowerUp);
            }, 3000);
        }
    }, 10000); 
}

function checkPowerUpCollision() {
    // const cubeBox = new THREE.Box3().setFromObject(cube);

    // powerUps.forEach((powerUp, index) => {
    //     const powerUpBox = new THREE.Box3().setFromObject(powerUp);

    //     if (cubeBox.intersectsBox(powerUpBox)) {
    //         applyPowerUpEffect();
    //         scene.remove(powerUp);
    //         powerUps.splice(index, 1);
    //     }
    // });

    if (frog) {
        // Create a bounding box for the entire frog group
        const frogBox = new THREE.Box3().setFromObject(frog);  // Bounding box around the frog group

        // Get the center and size of the box
        const center = frogBox.getCenter(new THREE.Vector3());
        const frogSphere = new THREE.Sphere(center, 0.4);

        powerUps.forEach((powerUp, index) => {
            const powerUpBox = new THREE.Box3().setFromObject(powerUp);
    
            if (frogSphere.intersectsBox(powerUpBox)) {
                applyPowerUpEffect();
                scene.remove(powerUp);
                powerUps.splice(index, 1);
            }
        });
    }
}

function applyPowerUpEffect() {
    let effectType = Math.floor(Math.random() * 3); // Choose random power-up type
    let powerUpText = ""; // Text to display

    if (effectType === 0) {
        powerUpText = "🏃‍♂️💨";
        maxSpeed *= 1.3;
        setTimeout(() => { 
            maxSpeed /= 1.3; 
            hidePowerUpText();
        }, 5000);
    } 
    
    else if (effectType === 1) {
        powerUpText = "🛡️";
        isInvincible = true;
        setTimeout(() => { 
            isInvincible = false;
            hidePowerUpText();
        }, 5000);
    } 
    
    else if (effectType === 2) {
        powerUpText = "⬆️";
        defaultJumpPower = boostedJumpPower; // Temporarily increase jump power
        setTimeout(() => { 
            defaultJumpPower = 0.13; // Reset jump height after 5 sec
            hidePowerUpText();
        }, 5000);
    }

    // Show the power-up text
    showPowerUpText(powerUpText);
}

// Function to show the power-up text
function showPowerUpText(text) {
    powerUpDisplay.innerText = text;
    powerUpDisplay.style.display = "block"; // Show text
}

// Function to hide the power-up text
function hidePowerUpText() {
    powerUpDisplay.style.display = "none"; // Hide text
}

function resetPowerUps() {
    maxSpeed = 0.05; // Reset speed boost
    defaultJumpPower = 0.13; // Reset jump boost
    isInvincible = false; // Remove shield effect

    // Reset player opacity (fix for frog model)
    if (frog) {
        frog.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.opacity = 1; // Reset opacity to normal
            }
        });
    }

    hidePowerUpText(); // Hide the power-up text display
}

function resetGame() {
    if (frog) {
        frog.position.set(0, -2, 0);
    }

    playerVelocity.set(0, 0, 0); // **Fully reset velocity**
    keys['ArrowLeft'] = false;
    keys['ArrowRight'] = false;
    keys[' '] = false; // Prevent jump carry-over

    logSpeed = 0.03;
    spawnRate = initialSpawnRate;
    lives = 3;
    updateLivesDisplay();

    // **Remove all logs**
    logs.forEach(log => scene.remove(log));
    logs = [];  // Clear the logs array

    // **Remove all power-ups**
    powerUps.forEach(powerUp => scene.remove(powerUp));
    powerUps = [];  // Clear the powerUps array

    // **Clear any active intervals**
    clearTimeout(logSpawnInterval);

    // Restart spawning
    startSpawningLogs();
    resetPowerUps()
    spawnPowerUps();
    startTimer();
}

function takeDamage() {
    if (!frog) return;

    let flashCount = 0;
    const flashInterval = setInterval(() => {
        frog.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.color.setHex(flashCount % 2 === 0 ? 0xff0000 : 0xffffff); // Toggle between red and white
            }
        });

        flashCount++;
        if (flashCount > 6) { // Stop after a few flashes
            clearInterval(flashInterval);
            frog.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.color.setHex(0xffffff); // Reset to original color
                }
            });
        }
    }, 200); // Flash every 20ms
}

function checkCollision() {
    if (isInvincible) return; // If in grace period, ignore collisions

    if (frog) {
        // Create a bounding box for the entire frog group
        let frogBox = new THREE.Box3().setFromObject(frog);
        let frogCenter = frogBox.getCenter(new THREE.Vector3());
    
        let frogSphere = new THREE.Sphere(frogCenter, frogBox.getSize(new THREE.Vector3()).x / 3);  // Proportional radius

        // // Create a wireframe cube at the center of the frog's bounding box
        // const geometry = new THREE.SphereGeometry(0.4, 32, 32);  // Cube size based on frog's bounding box
        // const material = new THREE.LineBasicMaterial({ color: 0xffff00 });  // Yellow wireframe color
        // const wireframe = new THREE.LineSegments(new THREE.WireframeGeometry(geometry), material);

        // // Position the wireframe sphere at the center of the frog
        // wireframe.position.set(center.x, center.y, center.z);

        // // Add the wireframe to the scene
        // scene.add(wireframe);

        // // Optional: Remove the wireframe after a short duration for debugging purposes
        // setTimeout(() => {
        //     scene.remove(wireframe);
        // }, 1000);  // Remove wireframe after 1 second

        // Check for collisions with logs
        logs.forEach((log) => {
            const logBox = new THREE.Box3().setFromObject(log);  // Get bounding box for the log

            if (frogSphere.intersectsBox(logBox)) {  // Check for collision between frog and log
                lives -= 1;
                updateLivesDisplay();
                takeDamage(); 

                if (lives <= 0) {
                    console.log("Game Over!");
                    alert(`Game Over! You survived for ${timeElapsed.toFixed(1)} seconds. Press OK to restart.`);
                    resetGame();
                } else {
                    startInvincibility();  // Trigger invincibility period
                }
            }
        });
    }
}

// function checkCollision() {
//     if (isInvincible) return; // If in grace period, ignore collisions

//     const cubeBox = new THREE.Box3().setFromObject(cube);

//     logs.forEach((log) => {
//         const logBox = new THREE.Box3().setFromObject(log);

//         if (cubeBox.intersectsBox(logBox)) {
//             lives -= 1;
//             updateLivesDisplay();

//             if (lives <= 0) {
//                 console.log("Game Over!");
//                 alert(`Game Over! You survived for ${timeElapsed.toFixed(1)} seconds. Press OK to restart.`);
//                 resetGame();
//             } else {
//                 startInvincibility(); 
//             }
//         }
//     });
// }

function animate() {
    requestAnimationFrame(animate);
    updateDayNightCycle();
    updateLogs();
    updatePlayer();
    checkCollision();
    checkPowerUpCollision();

    // if (isFirstPerson) {
    //     // First-person: Keep camera inside player, looking forward
    //     camera.position.set(cube.position.x, cube.position.y, cube.position.z);
    //     camera.lookAt(cube.position.x, cube.position.y + 0.8, cube.position.z - 5); 
    // } else {
    //     // Third-person: Keep camera behind and above the player
    //     camera.position.set(cube.position.x, cube.position.y + 1.5, cube.position.z + 4);
    //     camera.lookAt(cube.position.x, cube.position.y + 1, cube.position.z);
    // }

    if (frog) {
        updateDayNightCycle();
        updateLogs();
        updatePlayer();
        checkCollision();
        if (isFirstPerson) {
            camera.position.set(frog.position.x, frog.position.y, frog.position.z);
            camera.lookAt(frog.position.x, frog.position.y, frog.position.z - 5);
        } else {
            camera.position.set(frog.position.x + 1.35, frog.position.y + 1.5, frog.position.z + 4);
            camera.lookAt(frog.position.x + 1.35, frog.position.y + 1, frog.position.z);
        }
    }

    renderer.render(scene, camera);
}

animate();
startSpawningLogs(); // Start log spawning when game begins
startTimer(); // Start the timer when the game begins
spawnPowerUps(); //start spawing the powerups 
