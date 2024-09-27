// Initialize the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('virgo-constellation') });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Star positions (scaled for better visibility)
const starPositions = [
    { name: '109 Virginis', x: 2, y: -4, z: 1 },
    { name: 'Auva', x: 1.5, y: 1.5, z: 1.5 },
    { name: 'Heze', x: 3, y: -1, z: 0.5 },
    { name: 'Nu Virginis', x: -2.5, y: 4, z: 2 },
    { name: 'Omnicron Virginis', x: 2, y: 4, z: 3 },
    { name: 'Porrima', x: 4.5, y: 2, z: 0 },
    { name: 'Rijl Al Awwa', x: 4.3, y: -4, z: -0.1 },
    { name: 'Spica', x: -2, y: -1, z: -2 },
    { name: 'Syrma', x: 4, y: 3, z: -1 },
    { name: 'Tau Virginis', x: 0.5, y: -2, z: 1.2 },
    { name: 'Theta Virginis', x: -4, y: 0.5, z: -2 },
    { name: 'Vindemiatrix', x: 2.5, y: 1.2, z: 2.5 },
    { name: 'Zaniah', x: -1.5, y: 3, z: 0.5 },
    { name: 'Zavijava', x: 5, y: 4.5, z: 1 }
];

// Store star meshes for animation
let starMeshes = [];

// Create stars (small glowing spheres) in the scene
starPositions.forEach(star => {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);  // Star size
    const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        emissive: 0xffff00,  // Glow color
        emissiveIntensity: 0.6
    });
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
        if (star.material.emissiveIntensity > 1 || star.material.emissiveIntensity < 0.6) {
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
