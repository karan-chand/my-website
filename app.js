// Custom cursor element for mobile and tablet
const customCursor = document.getElementById('custom-cursor');
if (customCursor) {
    // Update cursor position on pointermove (for mobile/touch support)
    window.addEventListener('pointermove', (event) => {
        console.log('Pointer moved:', event.pageX, event.pageY);
        customCursor.style.left = `${event.pageX}px`;
        customCursor.style.top = `${event.pageY}px`;
    });
} else {
    console.error('Custom cursor element not found.');
}

// Initialize the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
console.log('Camera initialized with perspective:', camera);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('virgo-constellation'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
console.log('Renderer initialized with size:', window.innerWidth, window.innerHeight);

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
console.log('Bloom pass added to composer with settings:', bloomPass);

// Star data and creation focused on prominent stars visible in the Virgo constellation map with corrected spacing based on the provided coordinates
const starData = [
    { name: 'α Virginis known as Spica', x: -0.6396, y: -2.586, z: -1.29181, size: 1.0, link: 'Audio/Kahin%20Deep%20Jale%20Kahin%20Dil.mp3' }, // Alpha Virginis
    { name: 'β Virginis known as Zavijava', x: 5.5248, y: 0.3765216, z: 0.0, size: 0.3 },  // Beta Virginis
    { name: 'γ Virginis konwn as Porrima', x: 2.1864, y: -0.3196296, z: -0.01463, size: 0.5 },   // Gamma Virginis
    { name: 'δ Virginis known as Auva', x: 1.3512, y: 0.7918332, z: -1.14551, size: 0.4 },     // Delta Virginis
    { name: 'ε Virginis known as Vindemiatrix', x: 0.918, y: 2.586, z: -0.4484, size: 0.6 }, // Epsilon Virginis
    { name: 'ζ Virginis known as Heze', x: -1.2864, y: -0.0925788, z: -0.22287, size: 0.35 },    // Zeta Virginis
    { name: 'η Virginis known as Zaniah', x: 3.732, y: -0.1763652, z: -1.42158, size: 0.4 },    // Eta Virginis
    { name: 'θ Virginis', x: 0.3936, y: -1.3079988, z: -1.82229, size: 0.3 }, // Theta Virginis
    { name: 'ι Virginis known as Syrma', x: -4.0056, y: -1.3664424, z: -0.20083, size: 0.35 },   // Iota Virginis
    { name: 'μ Virginis known as Rijl al Awwa', x: -5.79, y: -1.3079988, z: -0.15067, size: 0.35 }, // Mu Virginis
    { name: 'ν Virginis', x: 6.0, y: 1.4652276, z: -1.9, size: 0.3 }, // Nu Virginis
    { name: 'ο Virginis', x: 4.5708, y: 1.905882, z: -0.75848, size: 0.3 }, // Omicron Virginis
    { name: 'τ Virginis', x: -3.0732, y: 0.4065192, z: -1.17762, size: 0.3 }, // Tau Virginis
    { name: '109 Virginis', x: -6.0, y: 0.4251384, z: -0.59052, size: 0.3 }  // 109 Virginis
];

let starMeshes = [];
const defaultIntensity = 0.4; // Bright base glow
const hoverIntensityMultiplier = 1.8;
const clickIntensityMultiplier = 1.8; // Reduced to avoid overly intense glow
let currentlyHoveredStar = null;

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
    console.log('Star added to scene:', star.name, starMesh.position);
});

// Adjust camera position and controls
camera.position.set(0, 0, 50); // Adjusted z position to 50 to zoom out
console.log('Camera position set to:', camera.position);
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.7;
controls.enableZoom = true;
controls.enablePan = false;
controls.target.set(0, 0, 0);  // Set initial focus point to the center
console.log('Orbit controls configured.');

// Raycaster for hover detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const starNameElement = document.getElementById('star-name');

// Define a variable to store the GSAP pulse tween
let activePulseTween = null;
let activeStar = null;

// Handle hover logic
window.addEventListener('pointermove', event => {
    console.log('Pointer move detected at:', event.clientX, event.clientY);
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const hoveredStar = intersects[0].object;
        const hoveredStarData = starMeshes.find(star => star.mesh === hoveredStar);

        if (currentlyHoveredStar !== hoveredStar && hoveredStarData) {
            console.log('New star hovered:', hoveredStarData.name);
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
            starNameElement.innerHTML = hoveredStarData.name;
        }
    } else if (currentlyHoveredStar && currentlyHoveredStar !== activeStar) {
        console.log('Hover cleared, resetting previous star.');
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
    handleStarClick(event.clientX, event.clientY);
});

// Function to handle star click logic
function handleStarClick(clientX, clientY) {
    console.log('Pointer down at:', clientX, clientY);
    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const clickedStar = intersects[0].object;
        const clickedStarData = starMeshes.find(star => star.mesh === clickedStar);

        if (clickedStarData && clickedStarData.link) {
            console.log('Star clicked:', clickedStarData.name);
            if (activePulseTween) {
                activePulseTween.kill();
                activePulseTween = null;
            }

            activeStar = clickedStar;

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
        }
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    composer.render();
}
animate();

// Handle window resizing
window.addEventListener('resize', () => {
    console.log('Window resized:', window.innerWidth, window.innerHeight);
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
console.log('Audio context and analyzer initialized.');

playPauseBtn.addEventListener('click', () => {
    console.log('Play/Pause button clicked.');
    if (isPlaying) {
        audio.pause();

        // Revert to hover state when paused
        if (activeStar) {
            console.log('Pausing audio, reverting to hover state for star:', activeStar.name);
            gsap.killTweensOf(activeStar.material);
            gsap.to(activeStar.material, {
                emissiveIntensity: defaultIntensity * hoverIntensityMultiplier,
                duration: 0.5,
                ease: "power2.inOut"
            });
            gsap.to(bloomPass, {
                strength: 0.6, // Return to default strength
                duration: 1.5,
                ease: "power4.out",
                onComplete: () => {
                    bloomPass.radius = 0.2; // Reset bloom radius
                    if (activePulseTween) {
                        console.log('Stopping active pulse tween during pause.');
                        activePulseTween.kill();
                        activePulseTween = null;
                    }
                }
            });
        }
    } else {
        audio.play();
        audioContext.resume();

        // Proceed with play effects
        if (activeStar) {
            console.log('Playing audio, starting effects for star:', activeStar.name);
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

            gsap.to(activeStar.material, {
                emissiveIntensity: defaultIntensity * clickIntensityMultiplier,
                duration: 0.5,
                ease: "power2.inOut"
            });
        }
    }
    isPlaying = !isPlaying;
    playPauseBtn.textContent = 'play/pause';

    // Set button text to 'play/pause'
    playPauseBtn.textContent = 'play/pause'; // <-- ADD THIS LINE
});

stopBtn.addEventListener('click', () => {
    console.log('Stop button clicked.');
    audio.pause();
    audio.currentTime = 0;  // Reset the audio to the beginning
    isPlaying = false;      // Set isPlaying to false, indicating that the audio is stopped

    hideAudioPlayer();
    resetStarGlow();  // Reset stars and lighting to default state
    resetCamera();    // Reset camera to default position
});

// Function to reset stars to the default state
function resetStarGlow() {
    console.log('Resetting star glow to default state.');

    // Reset bloom effect strength and radius
    if (activePulseTween) {
        console.log('Stopping active pulse tween during reset.');
        activePulseTween.kill();
        activePulseTween = null;
    }

    gsap.to(bloomPass, {
        strength: 0.6,  // Reset to default strength
        radius: 0.2,    // Reset to default radius
        duration: 1.0,
        ease: "power4.out"
    });

    // Reset each star's emissive intensity to the default value
    starMeshes.forEach(starData => {
        gsap.to(starData.mesh.material, {
            emissiveIntensity: defaultIntensity,
            duration: 1.5,
            ease: "power4.out"
        });
    });

    // Clear active star and reset the Virgo symbol
    activeStar = null;
    currentlyHoveredStar = null;
    starNameElement.innerHTML = "♍︎";
}

// Function to reset camera to default state
function resetCamera() {
    console.log('Resetting camera to default position.');
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

// Reset page 
function resetPage() {
    console.log("Resetting page to default state via header click.");

    // Trigger the same logic as the stop button
    audio.pause();
    audio.currentTime = 0;
    isPlaying = false;
    hideAudioPlayer();
    resetStarGlow();
    resetCamera();
}

// Rewind 30 seconds
rewindBtn.addEventListener('click', () => {
    console.log('Rewind button clicked.');
    audio.currentTime = Math.max(0, audio.currentTime - 30);
});

// Fast forward 30 seconds
fastForwardBtn.addEventListener('click', () => {
    console.log('Fast forward button clicked.');
    audio.currentTime = Math.min(audio.duration, audio.currentTime + 30);
});

// Show audio player and play audio
function showAudioPlayer(audioSrc) {
    console.log('Showing audio player for source:', audioSrc);
    audio.src = audioSrc;
    audioPlayerContainer.style.display = 'flex';
    audio.play();
    isPlaying = true;
    drawWaveform();  // Start drawing waveform
}

// Hide audio player
function hideAudioPlayer() {
    console.log('Hiding audio player.');
    audioPlayerContainer.style.display = 'none';
}

// Event listener for audio start on star click
document.addEventListener("playAudio", (event) => {
    console.log('playAudio event received for source:', event.detail.audioSrc);
    const audioSrc = event.detail.audioSrc;
    showAudioPlayer(audioSrc);
});

// Dropdown menu functionality to simulate Spica star click
function triggerSpica() {
    console.log('Triggering Spica star click from dropdown menu.');
    const spicaStar = starMeshes.find(star => star.name.includes('Spica'));
    if (spicaStar) {
        // Trigger audio play and click state effects for Spica
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
            emissiveIntensity: defaultIntensity * clickIntensityMultiplier,
            duration: 0.5,
            ease: "power2.inOut"
        });

        activeStar = spicaStar.mesh;
    } else {
        console.error('Spica star not found in starMeshes.');
    }
}

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
