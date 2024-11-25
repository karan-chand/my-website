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

// Initialize Three.js components
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('virgo-constellation'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000); // Set renderer background to black

// Set up the composer for bloom effect
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.6,  // Base bloom strength
    0.2,  // Bloom radius
    0.08  // Threshold
);
composer.addPass(bloomPass);

// Initialize star system
const starSystem = new StarSystem(scene);
starSystem.createStars();

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

let activePulseTween = null;

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
            if (activePulseTween) {
                activePulseTween.kill();
                activePulseTween = null;
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
                    activePulseTween = gsap.to(bloomPass, {
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

// Audio player setup
const audioPlayerContainer = document.getElementById('audio-player-container');
const playPauseBtn = document.getElementById('play-pause-btn');
const stopBtn = document.getElementById('stop-btn');
const rewindBtn = document.getElementById('rewind-btn');
const fastForwardBtn = document.getElementById('fast-forward-btn');
const waveVisualizer = document.getElementById('waveform-visualizer');

let isPlaying = false;
let audio = new Audio();
audio.loop = false;

// Initialize audio context
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyzer = audioContext.createAnalyser();
analyzer.fftSize = 1024;
const source = audioContext.createMediaElementSource(audio);
source.connect(analyzer);
analyzer.connect(audioContext.destination);

// Audio control event listeners
playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
        audio.pause();
        if (starSystem.activeStar) {
            gsap.killTweensOf(starSystem.activeStar.material);
            gsap.to(starSystem.activeStar.material, {
                emissiveIntensity: STAR_CONFIG.defaultIntensity * STAR_CONFIG.hoverIntensityMultiplier,
                duration: 0.5,
                ease: "power2.inOut"
            });
            gsap.to(bloomPass, {
                strength: 0.6,
                duration: 1.5,
                ease: "power4.out",
                onComplete: () => {
                    bloomPass.radius = 0.2;
                    if (activePulseTween) {
                        activePulseTween.kill();
                        activePulseTween = null;
                    }
                }
            });
        }
    } else {
        audio.play();
        audioContext.resume();
        if (starSystem.activeStar) {
            gsap.to(bloomPass, {
                strength: 1.6,
                duration: 1.0,
                ease: "power2.inOut",
                onComplete: () => {
                    bloomPass.radius = 0.1;
                    activePulseTween = gsap.to(bloomPass, {
                        strength: 2.8,
                        duration: 1.8,
                        repeat: -1,
                        yoyo: true,
                        ease: "sine.inOut"
                    });
                }
            });

            gsap.to(starSystem.activeStar.material, {
                emissiveIntensity: STAR_CONFIG.defaultIntensity * STAR_CONFIG.clickIntensityMultiplier,
                duration: 0.5,
                ease: "power2.inOut"
            });
        }
    }
    isPlaying = !isPlaying;
    playPauseBtn.textContent = 'play/pause';
});

stopBtn.addEventListener('click', () => {
    audio.pause();
    audio.currentTime = 0;
    isPlaying = false;
    hideAudioPlayer();
    starSystem.resetAllStars();
    resetCamera();
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
    audio.pause();
    audio.currentTime = 0;
    isPlaying = false;
    hideAudioPlayer();
    starSystem.resetAllStars();
    resetCamera();
}

rewindBtn.addEventListener('click', () => {
    audio.currentTime = Math.max(0, audio.currentTime - 30);
});

fastForwardBtn.addEventListener('click', () => {
    audio.currentTime = Math.min(audio.duration, audio.currentTime + 30);
});

function showAudioPlayer(audioSrc) {
    audio.src = audioSrc;
    audioPlayerContainer.style.display = 'flex';
    audio.play();
    isPlaying = true;
    drawWaveform();
}

function hideAudioPlayer() {
    audioPlayerContainer.style.display = 'none';
}

document.addEventListener("playAudio", (event) => {
    const audioSrc = event.detail.audioSrc;
    showAudioPlayer(audioSrc);
});

// Make triggerSpica global for HTML onclick
window.triggerSpica = function() {
    const spicaStar = starSystem.findStarByName('Spica');

    if (spicaStar) {
        if (activePulseTween) {
            activePulseTween.kill();
            activePulseTween = null;
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
                activePulseTween = gsap.to(bloomPass, {
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

function drawWaveform() {
    requestAnimationFrame(drawWaveform);
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyzer.getByteTimeDomainData(dataArray);

    const canvas = waveVisualizer;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00ffcc';
    ctx.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
}

// Initialize custom cursor
initializeCustomCursor();