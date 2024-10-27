// Custom cursor element for mobile and tablet
const customCursor = document.getElementById('custom-cursor');

// Update cursor position on pointermove (for mobile/touch support)
window.addEventListener('pointermove', (event) => {
    customCursor.style.left = `${event.pageX}px`;
    customCursor.style.top = `${event.pageY}px`;
});

// Initialize the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('virgo-constellation'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Create an audio element and load the track for Spica
const spicaAudio = new Audio('Audio/Kahin%20Deep%20Jale%20Kahin%20Dil.mp3');

// Set up the composer for bloom effect
const composer = new THREE.EffectComposer(renderer);
const renderPass = new THREE.RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.6,  // Base bloom strength for the default glow
    0.2,  // Bloom radius for the default state
    0.08  // Threshold for capturing emissive intensity
);
composer.addPass(bloomPass);

// Star data and creation
const starData = [
    { name: '109 Virginis', x: 2, y: -4, z: 1, size: 0.3 },
    { name: 'Auva', x: 1.5, y: 1.5, z: 1.5, size: 0.4 },
    { name: 'Heze', x: 3, y: -1, z: 0.5, size: 0.35 },
    { name: 'Nu Virginis', x: -2.5, y: 4, z: 2, size: 0.3 },
    { name: 'Omnicron Virginis', x: 2, y: 4, z: 3, size: 0.4 },
    { name: 'Porrima', x: 4.5, y: 2, z: 0, size: 0.5 },
    { name: 'Rijl Al Awwa', x: 4.3, y: -4, z: -0.1, size: 0.5 },
    { name: 'Spica', x: -2, y: -1, z: -2, size: 1, link: 'Audio/Kahin%20Deep%20Jale%20Kahin%20Dil.mp3' },
    { name: 'Syrma', x: 4, y: 3, z: -1, size: 0.35 },
    { name: 'Tau Virginis', x: 0.5, y: -2, z: 1.2, size: 0.3 },
    { name: 'Theta Virginis', x: -4, y: 0.5, z: -2, size: 0.3 },
    { name: 'Vindemiatrix', x: 2.5, y: 1.2, z: 2.5, size: 0.6 },
    { name: 'Zaniah', x: -1.5, y: 3, z: 0.5, size: 0.4 },
    { name: 'Zavijava', x: 5, y: 4.5, z: 1, size: 0.3 }
];

let starMeshes = [];
const defaultIntensity = 0.4; // Bright base glow
const hoverIntensityMultiplier = 1.8;
const clickIntensityMultiplier = 1.8; // Reduced to avoid overly intense glow
let currentlyHoveredStar = null;

// Find the Spica star in the starMeshes array
let spicaStarMesh = null;

// Create stars in the scene
starData.forEach(star => {
    const geometry = new THREE.SphereGeometry(star.size, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        color: 0xe0e0ff,
        emissive: 0xffffff,
        emissiveIntensity: defaultIntensity, // Default intensity for subtle glow
    });
    const starMesh = new THREE.Mesh(geometry, material);
    starMesh.position.set(star.x * 5, star.y * 5, star.z * 5);
    scene.add(starMesh);
    starMeshes.push({ mesh: starMesh, name: star.name, link: star.link });
});

// Adjust camera and controls
camera.position.z = 50;
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.7;
controls.enableZoom = true;
controls.enablePan = false;

// Raycaster for hover detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const starNameElement = document.getElementById('star-name');

// Handle click logic for Spica (dropdown menu)
document.getElementById('spica-menu').addEventListener('click', (event) => {
    event.preventDefault(); // Prevent default anchor behavior
    playSpicaAudio();
});

// Function to play Spica audio and trigger glow
function playSpicaAudio() {
    if (activePulseTween) {
        activePulseTween.kill();
        activePulseTween = null;
    }

    activeStar = spicaStarMesh;

    // Dispatch event to audioplayer.js with the audio source
    const playAudioEvent = new CustomEvent("playAudio", {
        detail: { audioSrc: 'Audio/Kahin%20Deep%20Jale%20Kahin%20Dil.mp3' }
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

    gsap.to(spicaStarMesh.material, {
        emissiveIntensity: defaultIntensity * clickIntensityMultiplier,
        duration: 0.5,
        ease: "power2.inOut"
    });
}

// Define a variable to store the GSAP pulse tween
let activePulseTween = null;
let activeStar = null;

// Handle hover logic
window.addEventListener('pointermove', event => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const hoveredStar = intersects[0].object;

        if (currentlyHoveredStar !== hoveredStar) {
            if (currentlyHoveredStar && currentlyHoveredStar !== activeStar) {
                gsap.killTweensOf(currentlyHoveredStar.material);
                gsap.to(currentlyHoveredStar.material, {
                    emissiveIntensity: defaultIntensity,
                    duration: 1.2,
                    ease: "power4.out"
                });
            }

            gsap.killTweensOf(hoveredStar.material);
            gsap.to(hoveredStar.material, {
                emissiveIntensity: defaultIntensity * hoverIntensityMultiplier,
                duration: 0.5,
                ease: "power2.inOut"
            });

            currentlyHoveredStar = hoveredStar;
            starNameElement.innerHTML = starMeshes.find(star => star.mesh === hoveredStar).name;
        }
    } else if (currentlyHoveredStar && currentlyHoveredStar !== activeStar) {
        gsap.killTweensOf(currentlyHoveredStar.material);
        gsap.to(currentlyHoveredStar.material, {
            emissiveIntensity: defaultIntensity,
            duration: 1.2,
            ease: "power4.out"
        });
        currentlyHoveredStar = null;
        starNameElement.innerHTML = "♍︎";
    }
});

// Handle click logic for stars with a link
window.addEventListener('pointerdown', event => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const clickedStar = intersects[0].object;
        const clickedStarData = starMeshes.find(star => star.mesh === clickedStar);

        if (clickedStarData && clickedStarData.link) {
            if (activePulseTween) {
                activePulseTween.kill();
                activePulseTween = null;
            }

            activeStar = clickedStar;

            if (clickedStarData.name === 'Spica') {
                // Dispatch event to audioplayer.js with the audio source
                const playAudioEvent = new CustomEvent("playAudio", {
                    detail: { audioSrc: clickedStarData.link }
                });
                document.dispatchEvent(playAudioEvent);

                console.log(`${clickedStarData.name} clicked! Playing audio...`);

                gsap.to(bloomPass, {
                    strength: 1.6, // Initial burst to 1.6 on click
                    duration: 1.0,
                    ease: "power2.inOut",
                    onComplete: () => {
                        bloomPass.radius = 0.1; // Reduce radius specifically for clicked state to limit spillover
                        activePulseTween = gsap.to(bloomPass, {
                            strength: 2.8, // Pulses between 1.3 and 2.8 for greater intensity
                            duration: 1.8,
                            repeat: -1,
                            yoyo: true,
                            ease: "sine.inOut"
                        });
                    }
                });

                gsap.to(clickedStar.material, {
                    emissiveIntensity: defaultIntensity * clickIntensityMultiplier,
                    duration: 0.5,
                    ease: "power2.inOut"
                });

                spicaAudio.onended = () => {
                    if (activePulseTween) {
                        activePulseTween.kill();
                        activePulseTween = null;
                    }
                    activeStar = null;
                    gsap.to(bloomPass, {
                        strength: 0.6, // Return to default strength
                        duration: 1.5,
                        ease: "power4.out",
                        onComplete: () => { bloomPass.radius = 0.2; } // Reset bloom radius after click ends
                    });
                    gsap.to(clickedStar.material, {
                        emissiveIntensity: defaultIntensity,
                        duration: 1.5,
                        ease: "power4.out"
                    });
                };
            } else {
                window.open(clickedStarData.link, '_blank');
                console.log(`${clickedStarData.name} clicked! Opening URL...`);

                gsap.to(bloomPass, {
                    strength: 1.0,
                    duration: 1.0,
                    ease: "power2.inOut",
                    onComplete: () => {
                        bloomPass.radius = 0.1;
                        activePulseTween = gsap.to(bloomPass, {
                            strength: 1.0,
                            duration: 1.8,
                            repeat: -1,
                            yoyo: true,
                            ease: "sine.inOut"
                        });
                    }
                });

                gsap.to(clickedStar.material, {
                    emissiveIntensity: defaultIntensity * clickIntensityMultiplier,
                    duration: 0.5,
                    ease: "power2.inOut"
                });
            }
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

// Audio player container and controls
const audioPlayerContainer = document.getElementById('audio-player-container');
const playPauseBtn = document.getElementById('play-pause-btn');
const stopBtn = document.getElementById('stop-btn');
const rewindBtn = document.getElementById('rewind-btn');
const fastForwardBtn = document.getElementById('fast-forward-btn');
const waveVisualizer = document.getElementById('waveform-visualizer');

let isPlaying = false;
let audio = new Audio();
audio.loop = false;  // Prevent looping by default

// Initialize audio context for waveform visualization
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyzer = audioContext.createAnalyser();
analyzer.fftSize = 1024;
const source = audioContext.createMediaElementSource(audio);
source.connect(analyzer);
analyzer.connect(audioContext.destination);

// Play/Pause Button functionality
playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
        audio.pause();
        playPauseBtn.textContent = 'play';
    } else {
        audio.play();
        audioContext.resume();
        playPauseBtn.textContent = 'pause';
    }
    isPlaying = !isPlaying;
});

// Stop Button functionality
stopBtn.addEventListener('click', () => {
    audio.pause();
    audio.currentTime = 0;  // Reset the audio to the beginning
    playPauseBtn.textContent = 'play';
    isPlaying = false;
    hideAudioPlayer();
    resetStarGlow();  // Reset stars to default state
});

// Function to reset stars to the default state
function resetStarGlow() {
    // Reset bloom effect strength and radius
    if (activePulseTween) {
        activePulseTween.kill();
        activePulseTween = null;
    }
    bloomPass.strength = 0.6;  // Reset to default strength
    bloomPass.radius = 0.2;    // Reset to default radius

    // Reset each star's emissive intensity to the default
    starMeshes.forEach(starData => {
        gsap.to(starData.mesh.material, {
            emissiveIntensity: defaultIntensity,
            duration: 3.0,
            ease: "power2.inOut"
        });
    });

    // Clear active star and reset the Virgo symbol
    activeStar = null;
    starNameElement.innerHTML = "♍︎";
}

// Rewind 30 seconds
rewindBtn.addEventListener('click', () => {
    audio.currentTime = Math.max(0, audio.currentTime - 30);
});

// Fast forward 30 seconds
fastForwardBtn.addEventListener('click', () => {
    audio.currentTime = Math.min(audio.duration, audio.currentTime + 30);
});

// Show audio player and play audio
function showAudioPlayer(audioSrc) {
    audio.src = audioSrc;
    audioPlayerContainer.style.display = 'flex';
    audio.play();
    playPauseBtn.textContent = 'pause';  // Set to "pause" when playing
    isPlaying = true;
    drawWaveform();  // Start drawing waveform
}

// Hide audio player
function hideAudioPlayer() {
    audioPlayerContainer.style.display = 'none';
}

// Event listener for audio start on star click
document.addEventListener("playAudio", (event) => {
    const audioSrc = event.detail.audioSrc;
    showAudioPlayer(audioSrc);
});

// Visualization Loop for Waveform
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
