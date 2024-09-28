// Initialize the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('virgo-constellation') });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Create audio element for Spica
const audio = new Audio('Audio/Kahin Deep Jale Kahin Dil.mp3');

// Star positions and sizes
const starData = [
    { name: '109 Virginis', x: 2, y: -4, z: 1, size: 0.3 },
    { name: 'Auva', x: 1.5, y: 1.5, z: 1.5, size: 0.4 },
    { name: 'Heze', x: 3, y: -1, z: 0.5, size: 0.35 },
    { name: 'Nu Virginis', x: -2.5, y: 4, z: 2, size: 0.3 },
    { name: 'Omnicron Virginis', x: 2, y: 4, z: 3, size: 0.4 },
    { name: 'Porrima', x: 4.5, y: 2, z: 0, size: 0.5 },
    { name: 'Rijl Al Awwa', x: 4.3, y: -4, z: -0.1, size: 0.5 },
    { name: 'Spica', x: -2, y: -1, z: -2, size: 1 },  // Spica star linked to the audio
    { name: 'Syrma', x: 4, y: 3, z: -1, size: 0.35 },
    { name: 'Tau Virginis', x: 0.5, y: -2, z: 1.2, size: 0.3 },
    { name: 'Theta Virginis', x: -4, y: 0.5, z: -2, size: 0.3 },
    { name: 'Vindemiatrix', x: 2.5, y: 1.2, z: 2.5, size: 0.6 },
    { name: 'Zaniah', x: -1.5, y: 3, z: 0.5, size: 0.4 },
    { name: 'Zavijava', x: 5, y: 4.5, z: 1, size: 0.3 }
];

// Create stars (small spheres) in the scene
starData.forEach(star => {
    const geometry = new THREE.SphereGeometry(star.size, 32, 32);  // Star size
    let material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        emissive: 0xffff00,
        emissiveIntensity: 0.6
    });

    if (star.name === 'Spica') {
        material.color.set(0x0000ff);  // Make Spica blue
        material.emissive.set(0x0000ff);  // Spica emissive color
    }

    const starMesh = new THREE.Mesh(geometry, material);
    starMesh.position.set(star.x * 5, star.y * 5, star.z * 5);  // Scaling positions for better visibility
    scene.add(starMesh);

    // Add event listener for Spica to play audio on click
    if (star.name === 'Spica') {
        starMesh.userData = { isSpica: true };  // Mark Spica to distinguish it
    }
});

// Set up the camera position
camera.position.z = 30;  // Set camera distance

// Orbit controls to rotate the scene
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.7;

// Raycaster for detecting star clicks
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Get the objects that intersect with the ray
    const intersects = raycaster.intersectObjects(scene.children);

    // Check if Spica was clicked and play the audio
    if (intersects.length > 0 && intersects[0].object.userData.isSpica) {
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
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
