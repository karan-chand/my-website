// Initialize the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('virgo-constellation') });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Create an audio element and load the track for Spica
const spicaAudio = new Audio('Audio/Kahin%20Deep%20Jale%20Kahin%20Dil.mp3');

// Star positions and relative sizes
const starData = [
    { name: '109 Virginis', x: 2, y: -4, z: 1, size: 0.3 },
    { name: 'Auva', x: 1.5, y: 1.5, z: 1.5, size: 0.4 },
    { name: 'Heze', x: 3, y: -1, z: 0.5, size: 0.35 },
    { name: 'Nu Virginis', x: -2.5, y: 4, z: 2, size: 0.3 },
    { name: 'Omnicron Virginis', x: 2, y: 4, z: 3, size: 0.4 },
    { name: 'Porrima', x: 4.5, y: 2, z: 0, size: 0.5 },
    { name: 'Rijl Al Awwa', x: 4.3, y: -4, z: -0.1, size: 0.5 },
    { name: 'Spica', x: -2, y: -1, z: -2, size: 1 },
    { name: 'Syrma', x: 4, y: 3, z: -1, size: 0.35 },
    { name: 'Tau Virginis', x: 0.5, y: -2, z: 1.2, size: 0.3 },
    { name: 'Theta Virginis', x: -4, y: 0.5, z: -2, size: 0.3 },
    { name: 'Vindemiatrix', x: 2.5, y: 1.2, z: 2.5, size: 0.6 },
    { name: 'Zaniah', x: -1.5, y: 3, z: 0.5, size: 0.4 },
    { name: 'Zavijava', x: 5, y: 4.5, z: 1, size: 0.3 }
];

let starMeshes = [];

const baseEmissiveIntensity = 0.8;
const hoverEmissiveMultiplier = 1.618; // Golden ratio for hover effect

// Shader for a glowing halo
const haloShader = {
    uniforms: {
        'c': { type: 'f', value: 1.0 },
        'p': { type: 'f', value: 3.0 },
        glowColor: { type: 'c', value: new THREE.Color(0xffffff) },
        viewVector: { type: 'v3', value: camera.position }
    },
    vertexShader: `
        uniform vec3 viewVector;
        varying float intensity;
        void main() {
            vec3 vNormal = normalize(normalMatrix * normal);
            vec3 vNormView = normalize(viewVector - (modelViewMatrix * vec4(position, 1.0)).xyz);
            intensity = pow(c - dot(vNormal, vNormView), p);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
            gl_FragColor = vec4(glowColor, intensity);
        }
    `,
    transparent: true,
    depthWrite: false
};

// Create stars in the scene with a halo effect
starData.forEach(star => {
    // Create the halo
    const haloGeometry = new THREE.SphereGeometry(star.size * 1.8, 32, 32);
    const haloMaterial = new THREE.ShaderMaterial(haloShader);
    const haloMesh = new THREE.Mesh(haloGeometry, haloMaterial);
    haloMesh.position.set(star.x * 5, star.y * 5, star.z * 5);
    scene.add(haloMesh);

    // Create the star mesh as the core
    const starGeometry = new THREE.SphereGeometry(star.size, 32, 32);
    const starMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: baseEmissiveIntensity
    });
    const starMesh = new THREE.Mesh(starGeometry, starMaterial);
    starMesh.position.set(star.x * 5, star.y * 5, star.z * 5);
    scene.add(starMesh);

    starMeshes.push({ mesh: starMesh, halo: haloMesh, name: star.name, defaultIntensity: baseEmissiveIntensity });
});

// Set up the camera position
camera.position.z = 30;
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.7;
controls.enableZoom = true;
controls.enablePan = false;

// Add Raycaster for hover detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const starNameElement = document.getElementById('star-name');

// Detect hover over a star
window.addEventListener('mousemove', event => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    starMeshes.forEach(star => {
        if (intersects.length > 0 && intersects[0].object === star.mesh) {
            // Intensify the glow when hovered
            gsap.to(star.mesh.material, {
                emissiveIntensity: baseEmissiveIntensity * hoverEmissiveMultiplier,
                duration: 0.5
            });
            starNameElement.innerHTML = star.name;
        } else {
            // Gradually revert to default intensity when not hovered
            gsap.to(star.mesh.material, {
                emissiveIntensity: baseEmissiveIntensity,
                duration: 3
            });
        }
    });
});

// Detect clicks for playing Spica's audio
window.addEventListener('click', event => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const clickedStar = intersects[0].object;
        starMeshes.forEach(star => {
            if (star.mesh === clickedStar && star.name === 'Spica') {
                spicaAudio.play();
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
