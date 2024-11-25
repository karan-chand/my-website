// Import Three.js and its modules
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import gsap from 'gsap';

// Import custom modules
import { initializeCustomCursor } from './cursor.js';
import { StarSystem, STAR_CONFIG } from './starsystem.js';
import { AudioPlayer } from './audioplayer.js';

// Initialize Three.js components
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('virgo-constellation'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000);

// Set up the composer for bloom effect
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.6,
    0.2,
    0.08
);
composer.addPass(bloomPass);

// Initialize star system
const starSystem = new StarSystem(scene);
starSystem.createStars();

// Initialize audio player
const audioPlayer = new AudioPlayer(starSystem, bloomPass);

// Camera and controls setup
camera.position.set(0, 0, 50);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.7;
controls.enableZoom = true;
controls.enablePan = false;
controls.target.set(0, 0, 0);

// Raycaster setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const starNameElement = document.getElementById('star-name');

// Handle hover logic
window.addEventListener('pointermove', event => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        starSystem.handleHover(intersects[0].object, starNameElement);
    } else {
        starSystem.clearHover(starNameElement);
    }
});

// Handle click logic
window.addEventListener('pointerdown', event => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const clickedStar = intersects[0].object;
        const clickedStarData = starSystem.getStarData(clickedStar);

        if (clickedStarData && clickedStarData.link) {
            if (audioPlayer.activePulseTween) {
                audioPlayer.activePulseTween.kill();
                audioPlayer.activePulseTween = null;
            }

            starSystem.activeStar = clickedStar;

            const playAudioEvent = new CustomEvent("playAudio", {
                detail: { audioSrc: clickedStarData.link }
            });
            document.dispatchEvent(playAudioEvent);

            gsap.to(bloomPass, {
                strength: 1.6,
                duration: 1.0,
                ease: "power2.inOut",
                onComplete: () => {
                    bloomPass.radius = 0.1;
                    audioPlayer.activePulseTween = gsap.to(bloomPass, {
                        strength: 2.8,
                        duration: 1.8,
                        repeat: -1,
                        yoyo: true,
                        ease: "sine.inOut"
                    });
                }
            });

            gsap.to(clickedStar.material, {
                emissiveIntensity: STAR_CONFIG.defaultIntensity * STAR_CONFIG.clickIntensityMultiplier,
                duration: 0.5,
                ease: "power2.inOut"
            });
        }
    }
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    composer.render();
}
animate();

// Handle window resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    composer.setSize(window.innerWidth, window.innerHeight);
});

function resetCamera() {
    gsap.to(camera.position, {
        x: 0,
        y: 0,
        z: 50,
        duration: 2.0,
        ease: "power2.inOut"
    });
    controls.target.set(0, 0, 0);
    controls.update();
}

// Make resetPage global for HTML onclick
window.resetPage = function() {
    audioPlayer.stop();
    starSystem.resetAllStars();
    resetCamera();
}

// Make triggerSpica global for HTML onclick
window.triggerSpica = function() {
    const spicaStar = starSystem.findStarByName('Spica');

    if (spicaStar) {
        if (audioPlayer.activePulseTween) {
            audioPlayer.activePulseTween.kill();
            audioPlayer.activePulseTween = null;
        }

        gsap.to(bloomPass, {
            strength: 0.6,
            radius: 0.2,
            duration: 0.5,
            ease: "power2.out"
        });

        const playAudioEvent = new CustomEvent("playAudio", {
            detail: { audioSrc: spicaStar.link }
        });
        document.dispatchEvent(playAudioEvent);

        gsap.to(bloomPass, {
            strength: 1.6,
            duration: 1.0,
            ease: "power2.inOut",
            onComplete: () => {
                bloomPass.radius = 0.1;
                audioPlayer.activePulseTween = gsap.to(bloomPass, {
                    strength: 2.8,
                    duration: 1.8,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
            }
        });

        gsap.to(spicaStar.mesh.material, {
            emissiveIntensity: STAR_CONFIG.defaultIntensity * STAR_CONFIG.clickIntensityMultiplier,
            duration: 0.5,
            ease: "power2.inOut"
        });

        starSystem.activeStar = spicaStar.mesh;
    }
}

// Initialize custom cursor
initializeCustomCursor();