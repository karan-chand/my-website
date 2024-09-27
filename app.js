// Initialize the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('virgo-constellation') });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Star positions from your data
const starPositions = [
    { name: '109 Virginis', x: 5.086842105, y: -10, z: 1.4, link: 'link-to-mix1' },
    { name: 'Auva', x: 1.455263158, y: 2.2, z: 2.1, link: 'link-to-mix2' },
    { name: 'Heze', x: 7.976315789, y: -2.1, z: 0.4, link: 'link-to-mix3' },
    { name: 'Nu Virginis', x: -4.597368421, y: 9.8, z: 3.4, link: 'link-to-mix4' },
    { name: 'Omnicron Virginis', x: 2.876315789, y: 7.8, z: 4.5, link: 'link-to-mix5' },
    { name: 'Porrima', x: 9.871052632, y: 3.8, z: 0, link: 'link-to-mix6' },
    { name: 'Rijl Al Awwa', x: 8.671052632, y: -9.5, z: -0.19, link: 'link-to-mix7' },
    { name: 'Spica', x: -1.807894737, y: -1, z: -4.2, link: 'link-to-mix8' },
    { name: 'Syrma', x: 8.202631579, y: 6.6, z: -2, link: 'link-to-mix9' },
    { name: 'Tau Virginis', x: 0.4026315789, y: -5, z: 1.3, link: 'link-to-mix10' },
    { name: 'Theta Virginis', x: -9.965789474, y: 0.7, z: -1.8, link: 'link-to-mix11' },
    { name: 'Vindemiatrix', x: 6.107894737, y: 1.5, z: 5.5, link: 'link-to-mix12' },
    { name: 'Zaniah', x: -2.071052632, y: 6.1, z: 0.3, link: 'link-to-mix13' },
    { name: 'Zavijava', x: 10, y: 9.3, z: 1.4, link: 'link-to-mix14' }
];

// Create stars (as clickable points) in the scene
starPositions.forEach(star => {
    const geometry = new THREE.SphereGeometry(0.1, 32, 32);  // size of the stars
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const starMesh = new THREE.Mesh(geometry, material);
    starMesh.position.set(star.x, star.y, star.z);
    starMesh.name = star.name;  // Give the star a name
    scene.add(starMesh);

    // Make stars clickable
    starMesh.userData = { url: star.link };
});

// Set up the camera position
camera.position.z = 20;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Event listener to handle clicks
window.addEventListener('click', (event) => {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        const star = intersects[0].object;
        if (star.userData.url) {
            window.location.href = star.userData.url;  // Redirect to the star's link
        }
    }
});
