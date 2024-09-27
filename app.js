// Initialize the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('virgo-constellation') });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);  // Adjust for mobile screens

// Log the camera's initial position
console.log("Camera initial position:", camera.position);

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

// Create stars (small spheres) in the scene
starPositions.forEach(star => {
    const geometry = new THREE.SphereGeometry(0.3, 32, 32);  // Adjust size as needed
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const starMesh = new THREE.Mesh(geometry, material);
    starMesh.position.set(star.x * 5, star.y * 5, star.z * 5); // Scaling for visibility
    scene.add(starMesh);

    // Log the star positions to ensure they are added
    console.log(`Added star: ${star.name} at (${star.x * 5}, ${star.y * 5}, ${star.z * 5})`);
});

// Set up the camera position
camera.position.z = 30;  // Start with a reasonable distance

// Enable OrbitControls for mouse and touch interaction
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;  // Smooth rotation effect
controls.dampingFactor = 0.05;  // Damping speed
controls.rotateSpeed = 0.7;     // Rotation speed
controls.enableZoom = true;     // Enable pinch-to-zoom for mobile devices
controls.enablePan = false;     // Disable panning to keep the focus on rotation

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();  // Ensure the camera updates continuously
    renderer.render(scene, camera);

    // Log the camera position as it moves
    console.log("Camera current position:", camera.position);
}
animate();

// Handle window resizing for mobile and desktop
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);  // Adjust renderer size
    camera.aspect = window.innerWidth / window.innerHeight;   // Adjust camera aspect ratio
    camera.updateProjectionMatrix();  // Ensure camera is updated
});
