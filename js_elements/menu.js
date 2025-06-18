// -- Menu faces data --
const faces = [
  { label: "Game Play",    edge: "top",    info: "About Me: Your story, skills, and interests." },
  { label: "Calendar",     edge: "right",  info: "Resume/Socials: Your experience and how to contact you." },
  { label: "Memory Card",  edge: "bottom", info: "Projects: Cool things you've built or are working on." },
  { label: "Options",      edge: "left",   info: "Academics: Education, degrees, coursework, and more." }
];

// -- Edge configs for label positioning (tweak as you like!) --
const edgeConfigs = [
  { left: "50%", top: "20vh",  transform: "translate(-50%, 0) rotate(0deg)" },      // top
  { left: "77%", top: "45vh",  transform: "translate(-50%, 0) rotate(90deg)" },     // right
  { left: "50%", top: "71vh",  transform: "translate(-50%, 0) rotate(0deg)" },      // bottom
  { left: "22%", top: "45vh",  transform: "translate(-50%, 0) rotate(90deg)" }      // left
];

// -- Cube setup --
let width = window.innerWidth;
let height = window.innerHeight * 0.90;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 1000);
camera.position.z = 5.2;
const renderer = new THREE.WebGLRenderer({canvas: document.getElementById("cube-canvas"), antialias: true, alpha: true});
renderer.setClearColor(0x000000, 0);
renderer.setSize(width, height);

// Lighting
const ambient = new THREE.AmbientLight(0xffffff, 0.63);
scene.add(ambient);
const spot = new THREE.SpotLight(0xffffff, 1.3, 7, Math.PI/2, 0.4, 1.4);
spot.position.set(5, 6, 7);
scene.add(spot);

// Cube with blank faces (just iridescent/glassy material)
const geometry = new THREE.BoxGeometry(2.2, 2.2, 2.2);
const cubeMaterials = [];
for (let i = 0; i < 6; i++) {
  cubeMaterials.push(new THREE.MeshPhysicalMaterial({
    color: 0x6480b6,
    transparent: true,
    opacity: 0.74,
    roughness: 0.18,
    metalness: 0.48,
    reflectivity: 0.7,
    clearcoat: 0.84,
    clearcoatRoughness: 0.18,
    ior: 1.38,
    transmission: 0.15
  }));
}
const cube = new THREE.Mesh(geometry, cubeMaterials);
scene.add(cube);

// -- Cube rotation logic --
let currentFace = 0; // 0: top, 1: right, 2: bottom, 3: left
let targetRotation = getRotationForFace(currentFace);

function getRotationForFace(faceIdx) {
  // Cube faces: 0=right, 1=left, 2=top, 3=bottom, 4=front, 5=back
  // But our "active" faces are: 0=top, 1=right, 2=bottom, 3=left (see faces[])
  switch (faceIdx) {
    case 0: return { x: -Math.PI/2, y: 0 };         // Top
    case 1: return { x: 0, y: -Math.PI/2 };         // Right
    case 2: return { x: Math.PI/2, y: 0 };          // Bottom
    case 3: return { x: 0, y: Math.PI/2 };          // Left
    default: return { x: 0, y: 0 };
  }
}

function animate() {
  // Interpolate cube rotation
  cube.rotation.x += (targetRotation.x - cube.rotation.x) * 0.14;
  cube.rotation.y += (targetRotation.y - cube.rotation.y) * 0.14;

  // Floating/wobble effect
  const t = performance.now() * 0.001;
  cube.rotation.x += Math.sin(t * 1.13) * 0.005;
  cube.rotation.y += Math.cos(t * 1.37) * 0.005;
  cube.position.y = Math.sin(t * 1.35) * 0.07;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// -- Label overlay logic --
function updateLabel(idx) {
  const labelDiv = document.getElementById('cube-label');
  const conf = edgeConfigs[idx];
  labelDiv.textContent = faces[idx].label;
  labelDiv.style.left = conf.left;
  labelDiv.style.top = conf.top;
  labelDiv.style.transform = conf.transform;
}

// -- Info panel logic --
function showInfo(idx) {
  const infoDiv = document.getElementById('cube-info');
  infoDiv.textContent = faces[idx].info;
  infoDiv.style.display = "block";
}
function hideInfo() {
  document.getElementById('cube-info').style.display = "none";
}

// -- User interaction: keys and click --
document.addEventListener('keydown', e => {
  hideInfo();
  if (e.key === "ArrowRight") { currentFace = (currentFace + 1) % 4; rotateToFace(currentFace); }
  if (e.key === "ArrowLeft") { currentFace = (currentFace + 3) % 4; rotateToFace(currentFace); }
  if (e.key === "ArrowUp") { currentFace = 0; rotateToFace(currentFace); }
  if (e.key === "ArrowDown") { currentFace = 2; rotateToFace(currentFace); }
  if (e.key === "Enter") showInfo(currentFace);
});
renderer.domElement.addEventListener('click', () => {
  showInfo(currentFace);
});

// -- Rotation helper --
function rotateToFace(faceIdx) {
  targetRotation = getRotationForFace(faceIdx);
  updateLabel(faceIdx);
}

// -- Init on load --
updateLabel(currentFace);

// -- Responsive canvas --
window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight * 0.90;
  camera.aspect = width/height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});
