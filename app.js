// Initialize the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('virgo-constellation') });
renderer.setSize(window.innerWidth, window.innerHeight);

// Star positions from your data
const starPositions = [
    { name: '109 Virginis', x: 5.08, y: -10, z: 1.4 },
    { name: 'Auva', x: 1.45, y: 2.2, z: 2.1 },
    { name: 'Heze', x: 7.97, y: -2.1, z: 0.4 },
    { name: 'Nu Virginis', x: -4.59, y: 9.8, z: 3.4 },
    { name: 'Omnicron Virginis', x: 2.87, y: 7.8, z: 4.5 },
    { name: 'Porrima', x: 9.87, y: 3.8, z: 0 },
    { name: 'Rijl Al Awwa', x: 8.67, y: -9.5, z: -0.19 },
    { name: 'Spica', x: -1.8, y: -1, z: -4.2 },
    { name: 'Syrma', x: 8.20, y: 6.6, z: -2 },
    { name: 'Tau Virginis', x: 0.4, y: -5, z: 1.3 },
    { name: 'Theta Virginis', x: -9.96, y: 0.7, z: -1.8 },
    { name: 'Vindemiatrix', x: 6.10, y: 1.5, z: 5.5 },
    { name: 'Zaniah', x: -2.07, y: 6.1, z: 0.3 },
    { name: 'Zavijava', x: 10, y: 9.3, z: 1.4 }
];

// Create stars (small spheres) in the scene
starPositions.forEach(star => {
    const geometry = new THREE.SphereGeometry(0.3, 32, 32);  // Adjust size as needed
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const starMesh = new THREE.Mesh(geometry, material);
    starMesh.position.set(star.x * 10, star.y * 10, star.z * 10); // Scaling up for visibility
    scene.add(starMesh);
});

// Set up the camera position
camera.position.z = 100;  // Move camera back to see all stars more clear

