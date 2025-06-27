// Solar System 3D Scene with Planets, Orbiting Earth Images, Shooting Stars, and Music

// --- Basic Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 100;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- Texture Loader ---
const loader = new THREE.TextureLoader();

// --- Lighting ---
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(50, 50, 50);
scene.add(directionalLight);

// --- Sun ---
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(10, 64, 64),
  new THREE.MeshBasicMaterial({ color: 0xffff00, emissive: 0xffcc00 })
);
scene.add(sun);

// --- Planets ---
const planetsData = [
  { name: "Mercury", radius: 22, size: 1.2, speed: 0.02, texture: 'source/2k_mercury.jpg' },
  { name: "Venus", radius: 30, size: 1.5, speed: 0.015, texture: 'source/2k_venus_surface.jpg' },
  { name: "Earth", radius: 40, size: 5, speed: 0.01, texture: 'source/2k_earth_nightmap.jpg' },
  { name: "Mars", radius: 50, size: 3.5, speed: 0.007, texture: 'source/2k_mars.jpg' },
  { name: "Jupiter", radius: 65, size: 7, speed: 0.004, texture: 'source/2k_jupiter.jpg' },
  { name: "Saturn", radius: 80, size: 6, speed: 0.003, texture: 'source/2k_saturn.jpg' },
];

const planetMeshes = {};
const orbitGroups = [];

planetsData.forEach(data => {
  const orbitGroup = new THREE.Group();
  scene.add(orbitGroup);

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(data.size, 32, 32),
    new THREE.MeshStandardMaterial({
      map: loader.load(
        data.texture,
        undefined,
        undefined,
        err => console.error('Failed to load planet texture:', data.texture, err)
      )
    })
  );
  mesh.position.x = data.radius;
  orbitGroup.add(mesh);

  planetMeshes[data.name] = mesh;
  orbitGroups.push({ group: orbitGroup, speed: data.speed });
});

// --- Orbiting Images around Earth ---
const earth = planetMeshes['Earth'];
const earthImageGroup = new THREE.Group();
earth.add(earthImageGroup);

const imageUrls = [
  'source/IMG_20241102_153456.jpg', 'source/IMG_20241102_153620.jpg',
  'source/IMG_20250123_172909_486.jpg', 'source/IMG_20250123_172910_847.jpg',
  'source/IMG_20250313_191743_695.jpg', 'source/IMG_20250313_191743_828.jpg',
  'source/IMG_20250326_165727_630.jpg', 'source/IMG_20250326_165727_714.jpg',
  'source/IMG_20250526_175802_636.jpg', 'source/IMG_20250526_175802_785.jpg'
];

for (let i = 0; i < 50; i++) {
  const image = imageUrls[i % imageUrls.length];
  loader.load(
    image,
    texture => {
      const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true });
      const geometry = new THREE.PlaneGeometry(1.5, 1.5);
      const plane = new THREE.Mesh(geometry, material);

      const radius = 10 + Math.random() * 8;
      const angle = Math.random() * Math.PI * 2;

      plane.userData = {
        orbitRadius: radius,
        orbitAngle: angle,
        orbitSpeed: 0.005 + Math.random() * 0.015,
        height: (Math.random() - 0.5) * 6
      };

      plane.position.set(
        Math.cos(angle) * radius,
        plane.userData.height,
        Math.sin(angle) * radius
      );

      earthImageGroup.add(plane);
    },
    undefined,
    err => console.error('Failed to load image texture:', image, err)
  );
}

// --- Shooting Stars ---
const shootingStars = [];
for (let i = 0; i < 5; i++) {
  const star = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  star.visible = false;
  scene.add(star);

  const trail = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })
  );
  trail.visible = false;
  scene.add(trail);

  shootingStars.push({ star, trail, shooting: false, start: 0, startPos: new THREE.Vector3(), endPos: new THREE.Vector3(), duration: 0 });
}

function triggerShootingStar(i) {
  const s = shootingStars[i];
  s.shooting = true;
  s.start = performance.now();
  s.star.visible = s.trail.visible = true;
  const theta = Math.random() * 2 * Math.PI;
  const phi = Math.acos(2 * Math.random() - 1);
  s.startPos.setFromSphericalCoords(250, phi, theta);
  const dir = s.startPos.clone().negate().normalize().add(new THREE.Vector3((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4)).normalize();
  s.endPos.copy(s.startPos).add(dir.multiplyScalar(150 + Math.random() * 150));
  s.duration = 1000 + Math.random() * 1000;
  s.star.position.copy(s.startPos);
}

function scheduleShooting(i) {
  setTimeout(() => {
    if (!shootingStars[i].shooting) triggerShootingStar(i);
    scheduleShooting(i);
  }, 2000 + Math.random() * 6000);
}
shootingStars.forEach((_, i) => scheduleShooting(i));

// --- Stars Background ---
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(3000);
for (let i = 0; i < 3000; i++) starPos[i] = (Math.random() - 0.5) * 1000;
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.8 })));

// --- Controls ---
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// --- Animate ---
function animate() {
  requestAnimationFrame(animate);

  orbitGroups.forEach(obj => obj.group.rotation.y += obj.speed);

  earthImageGroup.children.forEach((plane) => {
    plane.userData.orbitAngle += plane.userData.orbitSpeed;
    plane.position.set(
      Math.cos(plane.userData.orbitAngle) * plane.userData.orbitRadius,
      plane.userData.height,
      Math.sin(plane.userData.orbitAngle) * plane.userData.orbitRadius
    );
    plane.lookAt(earth.position);
  });

  const now = performance.now();
  shootingStars.forEach(s => {
    if (s.shooting) {
      const t = (now - s.start) / s.duration;
      if (t >= 1) {
        s.shooting = s.star.visible = s.trail.visible = false;
      } else {
        const pos = new THREE.Vector3().lerpVectors(s.startPos, s.endPos, t);
        s.star.position.copy(pos);
        const trailStart = pos.clone().lerp(s.startPos, 0.3);
        s.trail.geometry.setFromPoints([trailStart, pos]);
      }
    }
  });

  controls.update();
  renderer.render(scene, camera);
}
animate();

// --- Resize ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Music ---
const bgMusic = new Audio('source/davi-VEED.mp3');
bgMusic.loop = true;
bgMusic.volume = 1.0;
window.addEventListener('load', () => {
  bgMusic.play().catch(() => {
    const resume = () => {
      bgMusic.play();
      document.removeEventListener('click', resume);
    };
    document.addEventListener('click', resume);
  });
});