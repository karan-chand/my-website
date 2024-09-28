// Initialize the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('virgo-constellation') });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Create an audio element and load the track for Spica
const spicaAudio = new Audio('Audio/Kahin%20Deep%20Jale%20Kahin%20Dil.mp3');  // Path to your audio file

// Star positions and relative sizes (Spica at default size, others smaller)
const starData = [
    { name: '109 Virginis', x: 2, y: -4, z: 1, size: 0.3 },
    { name: 'Auva', x: 1.5, y: 1.5, z: 1.5, size: 0.4 },
    { name: 'Heze', x: 3, y: -1, z: 0.5, size: 0.35 },
    { name: 'Nu Virginis', x: -2.5, y: 4, z: 2, size: 0.3 },
    { name: 'Omnicron Virginis', x: 2, y: 4, z: 3, size: 0.4 },
    { name: 'Porrima', x: 4.5, y: 2, z: 0, size: 0.5 },
    { name: 'Rijl Al Awwa', x: 4.3, y: -4, z: -0.1, size: 0.5 },
    { name: 'Spica', x: -2, y: -1, z: -2, size: 1 },  // Spica star
    { name: 'Syrma', x: 4, y: 3, z: -1, size: 0.35 },
    { name: 'Tau Virginis', x: 0.5, y: -2, z: 1.2, size: 0.3 },
    { name: 'Theta Virginis', x: -4, y: 0.5, z: -2, size: 0.3 },
    { name: 'Vindemiatrix', x: 2.5, y: 1.2, z: 2.5, size: 0.6 },
    { name: 'Zaniah', x: -1.5, y: 3, z: 0.5, size: 0.4 },
    { name: 'Zavijava', x: 5, y: 4.5, z: 1, size: 0.3 }
];

// Store star meshes for interaction
let starMeshes = [];

// Create stars (small glowing spheres with different sizes) in the scene
starData.forEach(star => {
    let material;
    
    if (star.name === 'Spica') {
        material = new THREE.MeshBasicMaterial({
            color: 0x0000ff,         // Blue color for Spica
            emissive: 0x0000ff,      // Blue glow
            emissiveIntensity: 0.8,  // Glow effect
            wireframe: false
        });
    } else {
        material = new THREE.MeshBasicMaterial({
            color: 0xffffff,         // White color for other stars
            emissive: 0xffff00,      // Yellowish glow
            emissiveIntensity: 0.6,  // Glow effect
            wireframe: false
        });
    }

    const geometry = new THREE.SphereGeometry(star.size, 32, 32);  // Scaled-down star sizes
    const starMesh = new THREE.Mesh(geometry, material);
    starMesh.position.set(star.x * 5, star.y * 5, star.z * 5); // Adjust position for visibility
    scene.add(starMesh);

    // Store reference to the star's mesh and name for later interaction
    starMeshes.push({ mesh: starMesh, name: star.name });
});

// Set up the camera position
camera.position.z = 30;

// Enable OrbitControls for rotation and zoom
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.7;
controls.enableZoom = true;
controls.enablePan = false;

// Add Raycaster for detecting mouse clicks on stars
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Detect click on the star
window.addEventListener('click', event => {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const clickedStar = intersects[0].object;

        // Check if the clicked star is Spica, then play the audio
        starMeshes.forEach(star => {
            if (star.mesh === clickedStar && star.name === 'Spica') {
                spicaAudio.play();  // Play the audio track for Spica
                console.log('Spica clicked! Playing audio...');
            }
        });
    }
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Handle window resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
