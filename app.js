// Initialize the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);  // Setting aspect ratio to 1 initially
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('virgo-constellation') });

// Set the renderer size to match 80% of the viewport
renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);

// Adjust the camera's aspect ratio to the container size
camera.aspect = (window.innerWidth * 0.8) / (window.innerHeight * 0.8);
camera.updateProjectionMatrix();

// Star positions (scaled for better visibility and centered relative to 0, 0, 0)
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

// Create stars (small spheres) and add them to the scene
starPositions.forEach(star => {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);  // Adjust size to make stars visible
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const starMesh = new THREE.Mesh(geometry, material);
    
    // Position the stars based on the given data, centered around 0,0,0
    starMesh.position.set(star.x * 5, star.y * 5, star.z * 5);
    scene.add(starMesh);
});

// Center the camera to focus on the middle of the star positions
camera.position.z = 30;  // Set the camera a bit further back
camera.lookAt(0, 0, 0);  // Ensure the camera is looking at the center of the stars

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Scroll event listener to zoom in and out
window.addEventListener('wheel', function(event) {
    if (event.deltaY > 0) {
        camera.position.z += 2;  // Zoom out (move camera back)
    } else {
        camera.position.z -= 2;  // Zoom in (move camera closer)
    }
    camera.position.z = Math.max(10, Math.min(100, camera.position.z));  // Set zoom limits
});

// Adjust the canvas size dynamically on window resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);  // Adjust based on container size
    camera.aspect = (window.innerWidth * 0.8) / (window.innerHeight * 0.8);
    camera.updateProjectionMatrix();
});
