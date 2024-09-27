// Initialize the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('virgo-constellation') });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Star positions recalculated relative to the box dimensions (scaled to fit)
const starPositions = [
    { name: '109 Virginis', x: 30, y: -40, z: 10 },
    { name: 'Auva', x: 15, y: 15, z: 20 },
    { name: 'Heze', x: 45, y: -10, z: 5 },
    { name: 'Nu Virginis', x: -25, y: 40, z: 25 },
    { name: 'Omnicron Virginis', x: 20, y: 40, z: 35 },
    { name: 'Porrima', x: 50, y: 20, z: 0 },
    { name: 'Rijl Al Awwa', x: 45, y: -40, z: -5 },
    { name: 'Spica', x: -20, y: -10, z: -20 },
    { name: 'Syrma', x: 40, y: 30, z: -10 },
    { name: 'Tau Virginis', x: 10, y: -20, z: 15 },
    { name: 'Theta Virginis', x: -45, y: 5, z: -25 },
    { name: 'Vindemiatrix', x: 25, y: 15, z: 30 },
    { name: 'Zaniah', x: -15, y: 30, z: 10 },
    { name: 'Zavijava', x: 50, y: 45, z: 20 }
];

// Create stars (small spheres) in the scene, positioned relative to the black box
starPositions.forEach(star => {
    const geometry = new THREE.SphereGeometry(0.8, 32, 32);  // Adjust size to make stars visible
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const starMesh = new THREE.Mesh(geometry, material);
    starMesh.position.set(star.x, star.y, star.z); // No need to scale excessively now
    scene.add(starMesh);

    // Log star positions for debugging
    console.log(`Added star: ${star.name} at position (${star.x}, ${star.y}, ${star.z})`);
});

// Set up the camera position
camera.position.z = 70;  // Start further away so all stars are visible

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Scroll event listener to zoom in and out
window.addEventListener('wheel', function(event) {
    if (event.deltaY > 0) {
        camera.position.z += 5;  // Zoom out (move camera back)
    } else {
        camera.position.z -= 5;  // Zoom in (move camera closer)
    }
    camera.position.z = Math.max(20, Math.min(150, camera.position.z));  // Set zoom limits
});

// Adjust the canvas size dynamically on window resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
