// Scene setup
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  90,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 35;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Loading manager
const loadingManager = new THREE.LoadingManager();
loadingManager.onLoad = () => {
  const spinner = document.getElementById('loading-spinner');
  if (spinner) spinner.style.display = 'none';
};

const loader = new THREE.TextureLoader(loadingManager);

// Group for Earth and all children
const marsGroup = new THREE.Group();
scene.add(marsGroup);

// Earth sphere
const marsTexture = loader.load('source/2k_earth_nightmap.jpg');
const sphereGeometry = new THREE.SphereGeometry(5, 64, 64);
const sphereMaterial = new THREE.MeshStandardMaterial({
  map: marsTexture,
  roughness: 1,
  metalness: 0,
});
const marsSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
marsGroup.add(marsSphere);

// --- Floating Images ---
const imageUrls = [
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

for (let i = 0; i < 150; i++) {
  const image = imageUrls[i % imageUrls.length];
  loader.load(image, (texture) => {
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true,
    });
    const geometry = new THREE.PlaneGeometry(1.5, 1.5);
    const plane = new THREE.Mesh(geometry, material);

    const angle = i * 0.5;
    const radius = 20 + i * 0.1;
    const armOffset = (Math.random() - 0.5) * 10;
    const x = Math.cos(angle) * radius + armOffset;
    const y = (Math.random() - 0.5) * 5;
    const z = Math.sin(angle) * radius + armOffset;

    plane.position.set(x, y, z);
    plane.lookAt(marsSphere.position);
    marsGroup.add(plane);
  });
}

// --- Timer Canvas on Top ---
const dateCanvas = document.createElement('canvas');
dateCanvas.width = 2028;
dateCanvas.height = 240;
const dateCtx = dateCanvas.getContext('2d');
const dateTexture = new THREE.CanvasTexture(dateCanvas);

const dateMaterial = new THREE.MeshBasicMaterial({
  map: dateTexture,
  transparent: true,
  side: THREE.DoubleSide,
});

const datePlane = new THREE.Mesh(new THREE.PlaneGeometry(32, 7), dateMaterial);
datePlane.position.set(0, 9, 0);
marsGroup.add(datePlane);

// --- Lyrics Canvas below Earth ---
const lyricCanvas = document.createElement('canvas');
lyricCanvas.width = 2048;
lyricCanvas.height = 200;
const lyricCtx = lyricCanvas.getContext('2d');
const lyricTexture = new THREE.CanvasTexture(lyricCanvas);

const lyricMaterial = new THREE.MeshBasicMaterial({
  map: lyricTexture,
  transparent: true,
  side: THREE.DoubleSide,
});

const lyricPlane = new THREE.Mesh(new THREE.PlaneGeometry(32, 2), lyricMaterial);
lyricPlane.position.set(0, -9, 0);
lyricPlane.scale.set(1.5, 1.5, 1.5);
marsGroup.add(lyricPlane);

// Lyrics sync data
const lyrics = [
  { time: 1.44, text: "Watch the sun rise along the" },
  { time: 4.56, text: "coast as we're both getting upp" },
  { time: 10.88, text: "I can't describe what I'm feeling and all Ii" },
  { time: 17.44, text: "Know is we're going homee" },
  { time: 20.2, text: "So please don't let me goo" },
  { time: 25.28, text: "Don't let me goo" },
  { time: 29.2, text: "And if it's rightt" },
  { time: 32.46, text: "I don't care how long it takess" },
  { time: 38.62, text: "As long as I'm with you I'vee" },
  { time: 42.22, text: "Got a smile on my facee" },
  { time: 44.86, text: "Save your tears," },
  { time: 49.38, text: "It'll be okayy" },
  { time: 54.86, text: "All I knoww" },
  { time: 58.46, text: "Is you're heree" },
  { time: 61.34, text: "Withh" },
  { time: 62.42, text: "Me." },
  { time: 67.5, text: "" }
];

// Calculate total duration of lyrics (last time)
const lyricsTotalDuration = lyrics[lyrics.length - 1].time;

const startDate = new Date('2024-08-28T00:00:00');

function getElapsedTimeParts(start, end) {
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();
  let hours = end.getHours() - start.getHours();
  let minutes = end.getMinutes() - start.getMinutes();
  let seconds = end.getSeconds() - start.getSeconds();

  if (seconds < 0) { seconds += 60; minutes--; }
  if (minutes < 0) { minutes += 60; hours--; }
  if (hours < 0) { hours += 24; days--; }
  if (days < 0) {
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prevMonth.getDate();
    months--;
  }
  if (months < 0) { months += 12; years--; }
  months += years * 12;
  return { months, days, hours, minutes, seconds };
}

function format12Hour(hours) {
  const ampm = hours >= 12 ? 'PM' : 'AM';
  let h = hours % 12;
  if (h === 0) h = 12;
  return { hour12: h, ampm };
}

function updateTimerTexture() {
  const now = new Date();
  const elapsed = getElapsedTimeParts(startDate, now);
  const { hour12, ampm } = format12Hour(elapsed.hours);
  const formatted = `${elapsed.months} month${elapsed.months !== 1 ? 's' : ''} ${elapsed.days} day${elapsed.days !== 1 ? 's' : ''} ` +
    `${String(hour12).padStart(2, '0')}:${String(elapsed.minutes).padStart(2, '0')}:${String(elapsed.seconds).padStart(2, '0')} ${ampm}`;

  dateCtx.clearRect(0, 0, dateCanvas.width, dateCanvas.height);
  dateCtx.shadowColor = 'rgba(0,0,0,0.6)';
  dateCtx.shadowBlur = 6;
  dateCtx.fillStyle = 'white';
  dateCtx.font = 'bold 100px Arial';
  dateCtx.textAlign = 'center';
  dateCtx.textBaseline = 'middle';
  dateCtx.fillText(formatted, dateCanvas.width / 2, dateCanvas.height / 2);
  dateTexture.needsUpdate = true;
}

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(30, 50, 50);
scene.add(directionalLight);

// Star background
const starGeometry = new THREE.BufferGeometry();
const starCount = 1000;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i++) {
  starPositions[i] = (Math.random() - 0.5) * 1000;
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.8 });
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// --- Shooting Stars ---
const shootingStarCount = 5;
const shootingStars = [];

for (let i = 0; i < shootingStarCount; i++) {
  const star = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  star.visible = false;
  scene.add(star);

  const trailMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
  });
  const trailGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
  ]);
  const trail = new THREE.Line(trailGeometry, trailMaterial);
  trail.visible = false;
  scene.add(trail);

  shootingStars.push({
    star,
    trail,
    shooting: false,
    shootingStart: 0,
    startPos: new THREE.Vector3(),
    endPos: new THREE.Vector3(),
    duration: 0,
  });
}

function triggerShootingStar(index) {
  const shootingStar = shootingStars[index];
  shootingStar.shooting = true;
  shootingStar.shootingStart = performance.now();
  shootingStar.star.visible = true;
  shootingStar.trail.visible = true;

  const radius = 250;

  const theta = Math.random() * 2 * Math.PI;
  const phi = Math.acos(2 * Math.random() - 1);

  shootingStar.startPos.set(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi)
  );

  if (shootingStar.startPos.distanceTo(camera.position) < 50) {
    shootingStar.startPos.multiplyScalar(1.5);
  }

  const direction = shootingStar.startPos.clone().negate().normalize();

  const spreadAngle = 0.4;
  const randomOffset = new THREE.Vector3(
    (Math.random() - 0.5) * spreadAngle,
    (Math.random() - 0.5) * spreadAngle,
    (Math.random() - 0.5) * spreadAngle
  );
  direction.add(randomOffset).normalize();

  const travelDistance = 150 + Math.random() * 150;

  shootingStar.endPos.copy(shootingStar.startPos).add(direction.multiplyScalar(travelDistance));

  shootingStar.duration = 1000 + Math.random() * 1000;

  shootingStar.star.position.copy(shootingStar.startPos);
}

function scheduleNextShootingStar(index) {
  const delay = 2000 + Math.random() * 6000;
  setTimeout(() => {
    if (!shootingStars[index].shooting) {
      triggerShootingStar(index);
    }
    scheduleNextShootingStar(index);
  }, delay);
}

for (let i = 0; i < shootingStarCount; i++) {
  scheduleNextShootingStar(i);
}

// Background Music
const bgMusic = new Audio('source/davi-VEED.mp3');
bgMusic.loop = true;
bgMusic.volume = 1.0;

window.addEventListener('load', () => {
  bgMusic.play().catch(() => {
    const resumePlayback = () => {
      bgMusic.play().catch(console.warn);
      document.removeEventListener('click', resumePlayback);
    };
    document.addEventListener('click', resumePlayback);
  });
});

// Orbit controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.minDistance = 10;
controls.maxDistance = 80;
controls.maxPolarAngle = Math.PI / 1.6;

let lastTimerUpdate = 0;

// --- Typewriter lyric effect variables ---
let currentTypedLength = 0;
let currentLineStartTime = 0;
let currentLineDuration = 0;
let currentLyricText = '';

function startNewLine(text, duration, timestamp) {
  currentLyricText = text;
  currentTypedLength = 0;
  currentLineStartTime = timestamp;
  currentLineDuration = duration;
}

function updateLyricsCanvas() {
  const timestamp = performance.now();

  lyricCtx.clearRect(0, 0, lyricCanvas.width, lyricCanvas.height);

  const elapsed = timestamp - currentLineStartTime;
  const letterInterval = currentLineDuration / (currentLyricText.length || 1);
  currentTypedLength = Math.min(currentLyricText.length, Math.floor(elapsed / letterInterval));

  const textToDraw = currentLyricText.substring(0, currentTypedLength);

  lyricCtx.shadowColor = 'black';
  lyricCtx.shadowBlur = 8;
  lyricCtx.fillStyle = 'white';
  lyricCtx.font = 'bold 80px Arial';
  lyricCtx.textAlign = 'center';
  lyricCtx.textBaseline = 'middle';

  lyricCtx.fillText(textToDraw, lyricCanvas.width / 2, lyricCanvas.height / 2);

  lyricTexture.needsUpdate = true;
}

function animate(time = 0) {
  requestAnimationFrame(animate);

  marsGroup.rotation.y += 0.001;
  controls.update();

  if (time - lastTimerUpdate > 500) {
    updateTimerTexture();
    lastTimerUpdate = time;
  }

  datePlane.lookAt(camera.position);
  lyricPlane.lookAt(camera.position);

  if (!bgMusic.paused) {
    // Loop time based on lyrics total duration
    let loopedTime = bgMusic.currentTime % lyricsTotalDuration;

    // Initialize lyric index if not yet
    if (lyricPlane.userData.currentIndex === undefined) {
      lyricPlane.userData.currentIndex = 0;
      const nextTime = lyrics[1] ? lyrics[1].time : loopedTime + 2;
      const duration = (nextTime - lyrics[0].time) * 1000;
      startNewLine(lyrics[0].text, duration, performance.now());
    }

    // Reset to start if loopedTime near zero and index not zero
    if (loopedTime < 0.2 && lyricPlane.userData.currentIndex !== 0) {
      lyricPlane.userData.currentIndex = 0;
      const nextTime = lyrics[1] ? lyrics[1].time : loopedTime + 2;
      const duration = (nextTime - lyrics[0].time) * 1000;
      startNewLine(lyrics[0].text, duration, performance.now());
    }

    let currentIndex = lyricPlane.userData.currentIndex;

    // Advance index while loopedTime passes next lyric time
    while (currentIndex + 1 < lyrics.length && loopedTime >= lyrics[currentIndex + 1].time) {
      currentIndex++;
    }

    if (currentIndex !== lyricPlane.userData.currentIndex) {
      lyricPlane.userData.currentIndex = currentIndex;
      const nextTime = lyrics[currentIndex + 1] ? lyrics[currentIndex + 1].time : loopedTime + 2;
      const duration = (nextTime - lyrics[currentIndex].time) * 1000;
      startNewLine(lyrics[currentIndex].text, duration, performance.now());
    }
  }

  updateLyricsCanvas();

  // Update shooting stars
  const now = performance.now();
  const cameraDistance = camera.position.length();

  shootingStars.forEach((obj) => {
    if (obj.shooting) {
      const elapsed = now - obj.shootingStart;
      const t = elapsed / obj.duration;
      if (t >= 1) {
        obj.star.visible = false;
        obj.trail.visible = false;
        obj.shooting = false;
      } else {
        const currentPos = new THREE.Vector3().lerpVectors(obj.startPos, obj.endPos, t);
        obj.star.position.copy(currentPos);

        const scale = THREE.MathUtils.clamp(cameraDistance / 30, 0.5, 3);
        obj.star.scale.set(scale, scale, scale);

        const trailEnd = currentPos.clone();
        const trailStart = currentPos.clone().lerp(obj.startPos, 0.3);
        obj.trail.geometry.setFromPoints([trailStart, trailEnd]);

        obj.trail.visible = true;
        obj.star.visible = true;
      }
    } else {
      obj.star.visible = false;
      obj.trail.visible = false;
    }
  });

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
