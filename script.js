// Scene setup
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 50;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Texture loader
const loader = new THREE.TextureLoader();

// Group to hold Mars + images
const marsGroup = new THREE.Group();
scene.add(marsGroup);

// Load Mars texture
const marsTextureUrl = 'source/8k_earth_nightmap.jpg';
const marsTexture = loader.load(marsTextureUrl);

// Create Mars sphere
const sphereGeometry = new THREE.SphereGeometry(10, 64, 64);
const sphereMaterial = new THREE.MeshStandardMaterial({
  map: marsTexture,
  roughness: 1,
  metalness: 0,
});
const marsSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
marsGroup.add(marsSphere);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(30, 50, 50);
scene.add(directionalLight);

// Galaxy image URLs
const imageUrls = [
  'source/9yk3eo.gif',
  'source/IMG_20241102_153456.jpg',
  'source/IMG_20241102_153620.jpg',
  'source/IMG_20250123_172909_486.jpg',
  'source/IMG_20250123_172910_847.jpg',
  'source/IMG_20250313_191743_695.jpg',
  'source/IMG_20250313_191743_828.jpg',
  'source/IMG_20250326_165727_630.jpg',
  'source/IMG_20250326_165727_714.jpg',
  'source/IMG_20250526_175802_636.jpg',
  'source/IMG_20250526_175802_785.jpg'
];

// Load and scatter images in a spiral
for (let i = 0; i < 200; i++) {
  const image = imageUrls[i % imageUrls.length];
  loader.load(image, (texture) => {
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true,
    });
    const geometry = new THREE.PlaneGeometry(2.5, 2.5);
    const plane = new THREE.Mesh(geometry, material);

    const angle = i * 0.2;
    const radius = 30 + i * 0.2;
    const armOffset = (Math.random() - 0.5) * 10;

    const x = Math.cos(angle) * radius + armOffset;
    const y = (Math.random() - 0.5) * 10;
    const z = Math.sin(angle) * radius + armOffset;

    plane.position.set(x, y, z);
    plane.lookAt(marsSphere.position);

    marsGroup.add(plane);
  });
}

// Orbit controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Animate
function animate() {
  requestAnimationFrame(animate);
  marsGroup.rotation.y += 0.001;
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 🎵 Background Music
const bgMusic = new Audio('source/davi.mp3');
bgMusic.loop = true;
bgMusic.volume = 1.0; // Valid range: 0.0 to 1.0

// Try to autoplay on page load
window.addEventListener('load', () => {
  bgMusic.play().catch(() => {
    // Autoplay blocked (browser rule), so wait for a single user interaction
    const resumePlayback = () => {
      if (bgMusic.paused) {
        bgMusic.play().catch(err => {
          console.warn('Still blocked:', err);
        });
      }
      // Remove listener after first attempt
      document.removeEventListener('click', resumePlayback);
    };

    document.addEventListener('click', resumePlayback);
  });
});
