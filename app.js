// Custom cursor element for mobile and tablet
const customCursor = document.getElementById('custom-cursor');
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

// Define layers
const bloomLayer = 1; // Only clickable stars like Spica are assigned this layer
const defaultLayer = 0; // Other stars remain on the default layer

// Set up the composer for selective bloom
const composer = new THREE.EffectComposer(renderer);
const renderPass = new THREE.RenderPass(scene, camera);
composer.addPass(renderPass);

// Bloom pass for the selective bloom layer
const bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.6,  // Default bloom strength for the entire scene
    0.2,  // Bloom radius
    0.08  // Bloom threshold
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
const defaultIntensity = 0.4;
const hoverIntensityMultiplier = 1.8;
const clickIntensityMultiplier = 1.8;
let currentlyHoveredStar = null;

starData.forEach(star => {
    const geometry = new THREE.SphereGeometry(star.size, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        color: 0xe0e0ff,
        emissive: 0xffffff,
        emissiveIntensity: defaultIntensity,
    });
    const starMesh = new THREE.Mesh(geometry, material);
    starMesh.position.set(star.x * 5, star.y * 5, star.z * 5);

    // Assign Spica to the bloom layer if it has a link
    if (star.name === 'Spica' && star.link) {
        starMesh.layers.set(bloomLayer);
    } else {
        starMesh.layers.set(defaultLayer);
    }

    scene.add(starMesh);
    starMeshes.push({ mesh: starMesh, name: star.name, link: star.link });
});

camera.position.z = 50;
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.7;
controls.enableZoom = true;
controls.enablePan = false;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const starNameElement = document.getElementById('star-name');

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
        starNameElement.innerHTML = "Hover over a star...";
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
                spicaAudio.play();
                console.log(`${clickedStarData.name} clicked! Playing audio...`);

                gsap.to(bloomPass, {
                    strength: 1.6,
                    duration: 1.0,
                    ease: "power2.inOut",
                    onComplete: () => {
                        activePulseTween = gsap.to(bloomPass, {
                            strength: 1.4,
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
                        strength: 0.6,
                        duration: 1.5,
                        ease: "power4.out",
                    });
                    gsap.to(clickedStar.material, {
                        emissiveIntensity: defaultIntensity,
                        duration: 1.5,
                        ease: "power4.out"
                    });
                };
            }
        }
    }
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();

    // Render default layer
    camera.layers.set(defaultLayer);
    renderer.autoClear = true;
    composer.render();

    // Render bloom layer
    camera.layers.set(bloomLayer);
    renderer.autoClear = false;
    bloomPass.enabled = true;
    composer.render();
    bloomPass.enabled = false;
}
animate();

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    composer.setSize(window.innerWidth, window.innerHeight);
});
