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
    1.0,  // Base bloom strength
    0.4,  // Base bloom radius
    0.15  // Threshold of brightness to apply the bloom effect
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
    { name: 'Spica', x: -2, y: -1, z: -2, size: 1 },
    { name: 'Syrma', x: 4, y: 3, z: -1, size: 0.35 },
    { name: 'Tau Virginis', x: 0.5, y: -2, z: 1.2, size: 0.3 },
    { name: 'Theta Virginis', x: -4, y: 0.5, z: -2, size: 0.3 },
    { name: 'Vindemiatrix', x: 2.5, y: 1.2, z: 2.5, size: 0.6 },
    { name: 'Zaniah', x: -1.5, y: 3, z: 0.5, size: 0.4 },
    { name: 'Zavijava', x: 5, y: 4.5, z: 1, size: 0.3 }
];

let starMeshes = [];
const baseEmissiveIntensity = 0.1;
const hoverEmissiveMultiplier = 16.18;
const clickEmissiveMultiplier = 10;
let currentlyHoveredStar = null;

// Create stars in the scene
starData.forEach(star => {
    const geometry = new THREE.SphereGeometry(star.size, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: baseEmissiveIntensity,
    });
    const starMesh = new THREE.Mesh(geometry, material);
    starMesh.position.set(star.x * 5, star.y * 5, star.z * 5);
    scene.add(starMesh);
    starMeshes.push({ mesh: starMesh, name: star.name });
});

// Adjust camera and controls
camera.position.z = 50;
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.7;
controls.enableZoom = true;
controls.enablePan = false;

// Add Raycaster for hover detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const starNameElement = document.getElementById('star-name');

// Handle hover logic
window.addEventListener('mousemove', event => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const hoveredStar = intersects[0].object;

        if (currentlyHoveredStar !== hoveredStar) {
            if (currentlyHoveredStar) {
                gsap.killTweensOf(currentlyHoveredStar.material);
                gsap.to(currentlyHoveredStar.material, {
                    emissiveIntensity: baseEmissiveIntensity,
                    duration: 12,
                    ease: "power4.out"
                });
            }

            gsap.killTweensOf(hoveredStar.material);
            gsap.to(hoveredStar.material, {
                emissiveIntensity: baseEmissiveIntensity * hoverEmissiveMultiplier,
                duration: 0.5,
                ease: "power2.inOut"
            });

            currentlyHoveredStar = hoveredStar;
            starNameElement.innerHTML = starMeshes.find(star => star.mesh === hoveredStar).name;
        }
    } else if (currentlyHoveredStar) {
        gsap.killTweensOf(currentlyHoveredStar.material);
        gsap.to(currentlyHoveredStar.material, {
            emissiveIntensity: baseEmissiveIntensity,
            duration: 12,
            ease: "power4.out"
        });
        currentlyHoveredStar = null;
        starNameElement.innerHTML = "Hover over a star...";
    }
});

// Handle click logic for Spica
window.addEventListener('click', event => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const clickedStar = intersects[0].object;
        const clickedStarData = starMeshes.find(star => star.mesh === clickedStar);

        if (clickedStarData && clickedStarData.name === 'Spica') {
            // Play the audio for Spica
            spicaAudio.play();
            console.log('Spica clicked! Playing audio...');

            // Increase the bloom radius and glow for a moment on click
            gsap.to(bloomPass, {
                strength: 1.5,  // Temporarily increase bloom strength
                radius: 1.0,  // Increase bloom radius
                duration: 1.0,
                ease: "power2.inOut",
                onComplete: () => {
                    // Return the bloom radius and strength back to normal
                    gsap.to(bloomPass, {
                        strength: 1.0,
                        radius: 0.4,
                        duration: 3.0,
                        ease: "power4.out"
                    });
                }
            });

            // Increase the glow of the star on click
            gsap.to(clickedStar.material, {
                emissiveIntensity: baseEmissiveIntensity * clickEmissiveMultiplier,
                duration: 1.0,
                ease: "power2.inOut",
                onComplete: () => {
                    const isHovered = currentlyHoveredStar === clickedStar;
                    gsap.to(clickedStar.material, {
                        emissiveIntensity: isHovered
                            ? baseEmissiveIntensity * hoverEmissiveMultiplier
                            : baseEmissiveIntensity,
                        duration: 3,
                        ease: "power4.out"
                    });
                }
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