// Initialize the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('virgo-constellation') });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Star positions and sizes (relative sizes for better visibility)
const starData = [
    { name: '109 Virginis', x: 2, y: -4, z: 1, size: 1 }, // Smaller star
    { name: 'Auva', x: 1.5, y: 1.5, z: 1.5, size: 2 },    // Medium star
    { name: 'Heze', x: 3, y: -1, z: 0.5, size: 1.5 },     // Medium-small star
    { name: 'Nu Virginis', x: -2.5, y: 4, z: 2, size: 1.2 },  // Smaller star
    { name: 'Omnicron Virginis', x: 2, y: 4, z: 3, size: 2 }, // Medium star
    { name: 'Porrima', x: 4.5, y: 2, z: 0, size: 1.8 },   // Medium star
    { name: 'Rijl Al Awwa', x: 4.3, y: -4, z: -0.1, size: 1.7 }, // Medium star
    { name: 'Spica', x: -2, y: -1, z: -2, size: 4 },      // Largest star (Spica)
    { name: 'Syrma', x: 4, y: 3, z: -1, size: 1.5 },      // Medium-small star
    { name: 'Tau Virginis', x: 0.5, y: -2, z: 1.2, size: 1.3 }, // Small star
    { name: 'Theta Virginis', x: -4, y: 0.5, z: -2, size: 1.4 }, // Small star
    { name: 'Vindemiatrix', x: 2.5, y: 1.2, z: 2.5, size: 3 }, // Second-largest star
    { name: 'Zaniah', x: -1.5, y: 3, z: 0.5, size: 1.6 },  // Medium star
    { name: 'Zavijava', x: 5, y: 4.5, z: 1, size: 1.2 }   // Small star
];

// Store star meshes for animation
let starMeshes = [];

// Create stars (small glowing spheres with different sizes) in the scene
starData.forEach(star => {
    let material;
    
    // Check if the star is Spica, then make it blue with a glowing effect
    if (star.name === 'Spica') {
        material = new THREE.MeshBasicMaterial({
            color: 0x0000ff,         // Bright Blue color for Spica
            emissive: 0x0000ff,      // Blue glow
            emissiveIntensity: 1.5,  // Strong glow for visibility
            wireframe: false         // Solid star (no wireframe)
        });
    } else {
        material = new THREE.MeshBasicMaterial({
            color: 0xffffff,         // White color for other stars
            emissive: 0xffff00,      // Yellowish glow
            emissiveIntensity: 1,    // Glow intensity for other stars
            wireframe: false         // Solid star (no wireframe)
        });
    }

    const geometry = new THREE.SphereGeometry(star.size, 32, 32);  // Star size based on 'size' property
    const starMesh = new THREE.Mesh(geometry, material);
    starMesh.position.set(star.x * 5, star.y * 5, star.z * 5); // Scaling for visibility
    scene.add(starMesh);

    // Store star mesh for pulsating effect
    starMeshes.push({ mesh: starMesh, material: material });
});

// Set up the camera position
camera.position.z = 30;  // Adjust camera distance

// Enable OrbitControls for mouse and touch interaction
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;  // Smooth rotation effect
controls.dampingFactor = 0.05;  // Damping speed
controls.rotateSpeed = 0.7;     // Rotation speed
controls.enableZoom = true;     // Enable zoom
controls.enablePan = false;     // Disable panning

// Animation loop
let glowSpeed = 0.02;  // Control pulsating speed
function animate() {
    requestAnimationFrame(animate);

    // Pulsating glow effect
    starMeshes.forEach(star => {
        star.material.emissiveIntensity += glowSpeed;
        if (star.material.emissiveIntensity > 2 || star.material.emissiveIntensity < 0.6) {
            glowSpeed *= -1;  // Reverse direction to create pulsating effect
        }
    });

    controls.update();  // Ensure camera updates
    renderer.render(scene, camera);
}
animate();

// Handle window resizing for mobile and desktop
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);  // Adjust renderer size
    camera.aspect = window.innerWidth / window.innerHeight;   // Adjust camera aspect ratio
    camera.updateProjectionMatrix();  // Ensure camera is updated
});
