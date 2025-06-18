// == Configurable menu faces ==
const faces = [
  { label: "About Me", color: "#6ea8ff" },
  { label: "Resume", color: "#a7c1fc" },
  { label: "Projects", color: "#ffda70" },
  { label: "Academics", color: "#f98d92" },
  { label: "Options", color: "#cfaaff" },
  { label: "Fun Stuff", color: "#b7f2c1" }
];

// == Scene setup ==
let width = window.innerWidth;
let height = window.innerHeight * 0.90; // match CSS

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 1000);
camera.position.z = 5.2;

const renderer = new THREE.WebGLRenderer({canvas: document.getElementById("cube-canvas"), antialias: true, alpha: true});
renderer.setClearColor(0x000000, 0); // transparent background
renderer.setSize(width, height);

// == Lighting ==
const ambient = new THREE.AmbientLight(0xffffff, 0.65);
scene.add(ambient);
const spot = new THREE.SpotLight(0xffffff, 1.2, 7, Math.PI/2, 0.4, 1.3);
spot.position.set(5, 6, 7);
scene.add(spot);

// == Create cube with labeled faces ==
const geometry = new THREE.BoxGeometry(2.2, 2.2, 2.2);
const materials = faces.map((face, i) => makeTextMaterial(face.label, face.color));
const cube = new THREE.Mesh(geometry, materials);
scene.add(cube);

// == Helpers for text faces ==
function makeTextMaterial(text, color) {
  const size = 350;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  // Face color gradient for depth
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, color + 'cc');
  grad.addColorStop(1, "#2226");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // White text with shadow
  ctx.font = "bold 42px Segoe UI, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "#000a";
  ctx.shadowBlur = 9;
  ctx.fillStyle = "#fff";
  ctx.fillText(text, size/2, size/2);

  // Slight glass border
  ctx.strokeStyle = "#d8f7fe88";
  ctx.lineWidth = 5.5;
  ctx.strokeRect(10, 10, size-20, size-20);

  const texture = new THREE.CanvasTexture(canvas);
  return new THREE.MeshPhysicalMaterial({
    map: texture,
    transparent: true,
    roughness: 0.16,
    metalness: 0.39,
    clearcoat: 1,
    clearcoatRoughness: 0.2,
    reflectivity: 0.85,
    ior: 1.3
  });
}

// == Cube rotation logic ==
let targetRotation = { x: 0, y: 0 };
let currentFace = 2; // front

function rotateToFace(faceIndex) {
  // 0: right, 1: left, 2: top/front, 3: bottom/back, 4: top, 5: bottom
  // You can map faces however you want.
  if (faceIndex === 0) { targetRotation = { x: 0, y: -Math.PI/2 }; }
  else if (faceIndex === 1) { targetRotation = { x: 0, y: Math.PI/2 }; }
  else if (faceIndex === 2) { targetRotation = { x: 0, y: 0 }; }
  else if (faceIndex === 3) { targetRotation = { x: 0, y: Math.PI }; }
  else if (faceIndex === 4) { targetRotation = { x: -Math.PI/2, y: 0 }; }
  else if (faceIndex === 5) { targetRotation = { x: Math.PI/2, y: 0 }; }
  currentFace = faceIndex;
}

function animate() {
  // Smoothly interpolate rotation
  cube.rotation.x += (targetRotation.x - cube.rotation.x) * 0.14;
  cube.rotation.y += (targetRotation.y - cube.rotation.y) * 0.14;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// == UI Events: arrow keys & click ==
document.addEventListener('keydown', e => {
  if (e.key === "ArrowRight") rotateToFace((currentFace + 1) % 6);
  if (e.key === "ArrowLeft") rotateToFace((currentFace + 5) % 6);
  if (e.key === "ArrowUp") rotateToFace(4);
  if (e.key === "ArrowDown") rotateToFace(5);
  if (e.key === "Enter") selectFace(currentFace);
});

// Simple click detection for cube faces
renderer.domElement.addEventListener('click', onCanvasClick);
function onCanvasClick(e) {
  // Find which face was clicked
  const rect = renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((e.clientX - rect.left) / rect.width) * 2 - 1,
    -((e.clientY - rect.top) / rect.height) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(cube);
  if (intersects.length) {
    const faceIdx = Math.floor(intersects[0].face.materialIndex);
    rotateToFace(faceIdx);
    setTimeout(() => selectFace(faceIdx), 650); // After animation
  }
}

// == Face selection callback ==
function selectFace(idx) {
  // Replace with your own links/actions
  switch (idx) {
    case 0: window.location.href = "about.html"; break;
    case 1: window.location.href = "resume.html"; break;
    case 2: window.location.href = "projects.html"; break;
    case 3: window.location.href = "academics.html"; break;
    case 4: window.location.href = "options.html"; break;
    case 5: window.location.href = "fun.html"; break;
  }
}

// == Responsive canvas ==
window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight * 0.90;
  camera.aspect = width/height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});
