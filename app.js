// Initialize the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('virgo-constellation') });

// Set the renderer size to 80% of the viewport width and height
renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);
document.body.appendChild(renderer.domElement);

// Adjust the camera's aspect ratio and update the projection matrix
camera.aspect = (window.innerWidth * 0.8) / (window.innerHeight * 0.8);
camera.updateProjectionMatrix();

// Star positions — simplified and centered near the origin
const starPositions = [
    { name: 'Star 1', x: 0, y: 0, z: 0 },  // Right at the center
    { name: 'Star 2', x: 5, y: 5, z: 0 },
    { name: 'Star 3', x: -5, y: -5, z: 0 }
];

// Log out star positions for debugging
console.log('Star positions:', starPositions);

// Create stars (small spheres) in the scene
starPositions.forEach(star => {
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);  // Adjust size
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const starMesh = new THREE.Mesh(geometry, material);
    starMesh.position.set(star.x, star.y, star.z);
    scene.add(starMesh);

    console.log(`Added star: ${star.name} at (${star.x}, ${star.y}, ${star.z})`);
});

// Move the camera back slightly to see the stars
camera.position.z = 10;
camera.lookAt(0, 0, 0);  // Look at the origin

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Scroll event listener to zoom in and out
window.addEventListener('wheel', function(event) {
    if (event.deltaY > 0) {
        camera.position.z += 2;  // Zoom out
    } else {
        camera.position.z -= 2;  // Zoom in
    }
    camera.position.z = Math.max(5, Math.min(50, camera.position.z));  // Limit zoom
});

// Handle resizing the window
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);
    camera.aspect = (window.innerWidth * 0.8) / (window.innerHeight * 0.8);
    camera.updateProjectionMatrix();
});
