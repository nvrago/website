// ---- Menu regions and section content ----
const menuRegions = [
  { name: "About Me",        edge: "top",    info: "About Me: Your story, skills, and interests." },
  { name: "Personal Projects",edge: "right", info: "Projects: Cool things you've built or are working on." },
  { name: "Academics",       edge: "bottom", info: "Academics: Education, degrees, coursework, and more." },
  { name: "Contact Me",      edge: "left",   info: "Contact Me: Ways to reach you." }
];

// ---- Three.js setup ----
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

// ---- Cube with labels only on front face ----
const geometry = new THREE.BoxGeometry(2.2, 2.2, 2.2);
const materials = [
  new THREE.MeshPhysicalMaterial({ color: 0x222b37 }), // right
  new THREE.MeshPhysicalMaterial({ color: 0x222b37 }), // left
  new THREE.MeshPhysicalMaterial({ color: 0x222b37 }), // top
  new THREE.MeshPhysicalMaterial({ color: 0x222b37 }), // bottom
  new THREE.MeshPhysicalMaterial({ // front (menu face)
    map: makeFrontFaceTexture(),
    transparent: true,
    roughness: 0.16,
    metalness: 0.39,
    clearcoat: 0.88,
    reflectivity: 0.82,
    ior: 1.39,
    transmission: 0.13
  }),
  new THREE.MeshPhysicalMaterial({ color: 0x222b37 })  // back
];

const cube = new THREE.Mesh(geometry, materials);
scene.add(cube);

// ---- Texture for the front face with 4 edge labels ----
function makeFrontFaceTexture() {
  const size = 600;
  const ctxCanvas = document.createElement('canvas');
  ctxCanvas.width = ctxCanvas.height = size;
  const ctx = ctxCanvas.getContext('2d');

  // Background (glass-like, optional: add gradient for style)
  ctx.fillStyle = "#202735";
  ctx.fillRect(0, 0, size, size);

  // --- Text settings ---
  ctx.font = "bold 46px Segoe UI, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.shadowColor = "#000a";
  ctx.shadowBlur = 8;

  // Top (About Me)
  ctx.fillText("About Me", size/2, 56);

  // Bottom (Academics)
  ctx.fillText("Academics", size/2, size - 56);

  // Right (Personal Projects)
  ctx.save();
  ctx.translate(size - 56, size/2);
  ctx.rotate(Math.PI / 2);
  ctx.fillText("Personal Projects", 0, 0);
  ctx.restore();

  // Left (Contact Me)
  ctx.save();
  ctx.translate(56, size/2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Contact Me", 0, 0);
  ctx.restore();

  // Optionally: subtle lines for edge highlights
  ctx.strokeStyle = "#60b3ff88";
  ctx.lineWidth = 5;
  ctx.strokeRect(22, 22, size-44, size-44);

  return new THREE.CanvasTexture(ctxCanvas);
}

// ---- Animation (wobble/floating) ----
let targetRotation = { x: 0, y: 0 };
function animate() {
  cube.rotation.x += (targetRotation.x - cube.rotation.x) * 0.14;
  cube.rotation.y += (targetRotation.y - cube.rotation.y) * 0.14;

  const t = performance.now() * 0.001;
  cube.rotation.x += Math.sin(t * 1.13) * 0.005;
  cube.rotation.y += Math.cos(t * 1.37) * 0.005;
  cube.position.y = Math.sin(t * 1.35) * 0.07;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// ---- Menu region click detection ----
renderer.domElement.addEventListener('click', function(e) {
  const region = getMenuRegion(e);
  if (region !== null) showInfo(region);
});

// Helper to get menu region (top/right/bottom/left) from click position on front face
function getMenuRegion(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((e.clientX - rect.left) / rect.width) * 2 - 1,
    -((e.clientY - rect.top) / rect.height) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(cube);

  if (!intersects.length) return null;

  // Check if it's the front face (materialIndex 4)
  const face = intersects[0].face;
  if (face.materialIndex !== 4) return null;

  // Face UVs to pixel coordinates
  const uv = intersects[0].uv;
  const u = uv.x;
  const v = 1 - uv.y; // y-flip

  // Divide into four edge zones
  const edgeMargin = 0.26; // 26% from each edge
  if (v < edgeMargin) return 0; // Top: About Me
  if (u > 1 - edgeMargin) return 1; // Right: Personal Projects
  if (v > 1 - edgeMargin) return 2; // Bottom: Academics
  if (u < edgeMargin) return 3; // Left: Contact Me
  return null; // Not in any menu region
}

// ---- Keyboard navigation ----
document.addEventListener('keydown', e => {
  if (e.key === "ArrowUp") { showInfo(0); }
  if (e.key === "ArrowRight") { showInfo(1); }
  if (e.key === "ArrowDown") { showInfo(2); }
  if (e.key === "ArrowLeft") { showInfo(3); }
  if (e.key === "Escape") hideInfo();
});

// ---- Info panel logic ----
function showInfo(idx) {
  const infoDiv = document.getElementById('cube-info');
  infoDiv.textContent = menuRegions[idx].info;
  infoDiv.style.display = "block";

  // Optionally, rotate cube a little to highlight chosen edge
  if (idx === 0) targetRotation = { x: -Math.PI / 18, y: 0 };           // tilt forward (top)
  if (idx === 1) targetRotation = { x: 0, y: -Math.PI / 18 };            // tilt right
  if (idx === 2) targetRotation = { x: Math.PI / 18, y: 0 };             // tilt back (bottom)
  if (idx === 3) targetRotation = { x: 0, y: Math.PI / 18 };             // tilt left
}
function hideInfo() {
  document.getElementById('cube-info').style.display = "none";
  targetRotation = { x: 0, y: 0 };
}

// ---- Responsive canvas ----
window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight * 0.90;
  camera.aspect = width/height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});
