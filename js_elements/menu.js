// === GameCube Menu Cube Sections ===
const sections = [
  { // 0: FRONT (main menu)
    face: "menu",
    draw: drawMainMenuFace
  },
  { // 1: RIGHT
    face: "projects",
    label: "Personal Projects",
    info: "Showcase of your personal projects.<br>Add images, descriptions, or links here.",
    draw: ctx => drawSectionFace(ctx, "Personal Projects", "Showcase of your personal projects.\nAdd images, descriptions, or links here.")
  },
  { // 2: BOTTOM
    face: "academics",
    label: "Academics",
    info: "Your academic background and achievements.",
    draw: ctx => drawSectionFace(ctx, "Academics", "Your academic background and achievements.")
  },
  { // 3: LEFT
    face: "contact",
    label: "Contact Me",
    info: "Ways to contact you (email, socials, etc).",
    draw: ctx => drawSectionFace(ctx, "Contact Me", "Ways to contact you (email, socials, etc).")
  },
  { // 4: TOP
    face: "about",
    label: "About Me",
    info: "Introduce yourself, skills, and interests.",
    draw: ctx => drawSectionFace(ctx, "About Me", "Introduce yourself, skills, and interests.")
  },
  { // 5: BACK (not used)
    face: "empty",
    draw: ctx => drawBlankFace(ctx)
  }
];

// === Cube Face Drawing Helpers ===
function makeFaceTexture(drawFn) {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  drawFn(ctx, size);
  return new THREE.CanvasTexture(canvas);
}

function drawMainMenuFace(ctx, size) {
  // More GameCube-like purple/indigo background
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, size, size);

  // Inner subtle gradient
  const innerGrad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/1.5);
  innerGrad.addColorStop(0, "rgba(100, 80, 180, 0.15)");
  innerGrad.addColorStop(1, "rgba(20, 20, 50, 0)");
  ctx.fillStyle = innerGrad;
  ctx.fillRect(0, 0, size, size);

  ctx.font = "bold 38px 'Segoe UI', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#e0e0ff";
  ctx.shadowColor = "#8080ff";
  ctx.shadowBlur = 12;

  // Labels on edges
  ctx.fillText("About Me", size/2, 50);
  ctx.fillText("Academics", size/2, size - 50);
  
  ctx.save();
  ctx.translate(size - 45, size/2);
  ctx.rotate(Math.PI / 2);
  ctx.fillText("Projects", 0, 0);
  ctx.restore();
  
  ctx.save();
  ctx.translate(45, size/2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Contact", 0, 0);
  ctx.restore();

  // GameCube-style edge glow
  ctx.shadowBlur = 0;
  const edgeGrad = ctx.createLinearGradient(0, 0, size, size);
  edgeGrad.addColorStop(0, "#7b68ee");
  edgeGrad.addColorStop(0.5, "#9370db");
  edgeGrad.addColorStop(1, "#6a5acd");
  ctx.strokeStyle = edgeGrad;
  ctx.lineWidth = 3;
  ctx.strokeRect(15, 15, size-30, size-30);
}

function drawSectionFace(ctx, title, content) {
  const size = 512;
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, size, size);

  // Subtle gradient overlay
  const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/1.4);
  grad.addColorStop(0, "rgba(100, 80, 180, 0.12)");
  grad.addColorStop(1, "rgba(20, 20, 50, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  ctx.font = "bold 40px 'Segoe UI', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#e0e0ff";
  ctx.shadowColor = "#8080ff";
  ctx.shadowBlur = 15;
  ctx.fillText(title, size/2, 70);

  ctx.font = "22px 'Segoe UI', Arial, sans-serif";
  ctx.shadowBlur = 6;
  let lines = content.replace(/<br\s*\/?>/g, "\n").split("\n");
  let y = 160;
  for (let line of lines) {
    ctx.fillText(line, size/2, y);
    y += 36;
  }

  // Back hint
  ctx.font = "16px 'Segoe UI', Arial, sans-serif";
  ctx.fillStyle = "#8888bb";
  ctx.shadowBlur = 0;
  ctx.fillText("Press ESC or click center to return", size/2, size - 50);
}

function drawBlankFace(ctx, size = 512) {
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, size, size);
}

// === Scene/Renderer/Lighting ===
let width = window.innerWidth, height = window.innerHeight * 0.90;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, width/height, 0.1, 1000);
camera.position.z = 5.5;

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("cube-canvas"), 
  antialias: true, 
  alpha: true
});
renderer.setClearColor(0x000000, 0);
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Environment map for reflections - more purple GameCube-like
const pmremGenerator = new THREE.PMREMGenerator(renderer);
const envCanvas = document.createElement('canvas');
envCanvas.width = envCanvas.height = 256;
const ectx = envCanvas.getContext('2d');
const envGrad = ectx.createLinearGradient(0, 0, 256, 256);
envGrad.addColorStop(0, "#2a1a4a");
envGrad.addColorStop(0.3, "#4a3a7a");
envGrad.addColorStop(0.6, "#6a5aaa");
envGrad.addColorStop(1, "#1a1a3a");
ectx.fillStyle = envGrad;
ectx.fillRect(0, 0, 256, 256);
const envMap = pmremGenerator.fromEquirectangular(new THREE.CanvasTexture(envCanvas)).texture;
scene.environment = envMap;

// Lighting
const ambient = new THREE.AmbientLight(0x9090ff, 0.5);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xaaaaff, 0.8);
keyLight.position.set(3, 4, 5);
scene.add(keyLight);

const rimLight = new THREE.PointLight(0x8060ff, 0.6, 10);
rimLight.position.set(-3, 2, -3);
scene.add(rimLight);

// === GameCube-style Material ===
function makeGCubeMat(faceTexture) {
  return new THREE.MeshPhysicalMaterial({
    map: faceTexture,
    transparent: true,
    opacity: 0.92,
    roughness: 0.08,
    metalness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 1.0,
    ior: 1.5,
    transmission: 0.6,
    thickness: 1.5,
    envMap: envMap,
    envMapIntensity: 0.8,
    color: 0xd0d0ff,
    emissive: 0x201040,
    emissiveIntensity: 0.15,
    side: THREE.FrontSide
  });
}

const geometry = new THREE.BoxGeometry(2.1, 2.1, 2.1);

// Materials array: [+X, -X, +Y, -Y, +Z, -Z]
const materials = [
  makeGCubeMat(makeFaceTexture(sections[1].draw)), // +X right (projects)
  makeGCubeMat(makeFaceTexture(sections[3].draw)), // -X left (contact)
  makeGCubeMat(makeFaceTexture(sections[4].draw)), // +Y top (about)
  makeGCubeMat(makeFaceTexture(sections[2].draw)), // -Y bottom (academics)
  makeGCubeMat(makeFaceTexture(sections[0].draw)), // +Z front (main menu)
  makeGCubeMat(makeFaceTexture(sections[5].draw)), // -Z back (blank)
];

const cube = new THREE.Mesh(geometry, materials);
scene.add(cube);

// === Menu State/Rotation Logic ===
let currentFace = 0; // 0=front, 1=right, 2=bottom, 3=left, 4=top

let baseQuat = new THREE.Quaternion();
let targetQuat = new THREE.Quaternion();

// FIX: Corrected rotations - swapped TOP and BOTTOM X rotations
const FACE_ROT = [
  new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)),             // 0: FRONT
  new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI/2, 0)),    // 1: RIGHT
  new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI/2, 0, 0)),    // 2: BOTTOM (tilt forward)
  new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI/2, 0)),     // 3: LEFT
  new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI/2, 0, 0)),     // 4: TOP (tilt back)
];

// === Animation Loop ===
function animate() {
  requestAnimationFrame(animate);

  // Smooth rotation toward target
  baseQuat.slerp(targetQuat, 0.1);

  // Subtle floating wobble
  const t = performance.now() * 0.001;
  const wobbleX = Math.sin(t * 0.8) * 0.02;
  const wobbleY = Math.cos(t * 0.9) * 0.02;
  const wobbleQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(wobbleX, wobbleY, 0));

  cube.quaternion.copy(baseQuat).multiply(wobbleQ);
  cube.position.y = Math.sin(t * 0.7) * 0.05;

  renderer.render(scene, camera);
}
animate();

// === Keyboard Navigation ===
document.addEventListener('keydown', e => {
  if (currentFace === 0) {
    // On main menu - navigate to sections
    if (e.key === "ArrowUp") gotoFace(4);      // About Me (top)
    if (e.key === "ArrowRight") gotoFace(1);   // Projects (right)
    if (e.key === "ArrowDown") gotoFace(2);    // Academics (bottom)
    if (e.key === "ArrowLeft") gotoFace(3);    // Contact (left)
  } else {
    // On a section - return with opposite key or Escape
    if (currentFace === 4 && e.key === "ArrowDown") gotoFace(0);
    if (currentFace === 1 && e.key === "ArrowLeft") gotoFace(0);
    if (currentFace === 2 && e.key === "ArrowUp") gotoFace(0);
    if (currentFace === 3 && e.key === "ArrowRight") gotoFace(0);
    if (e.key === "Escape") gotoFace(0);
  }
});

// === Mouse Click Navigation (FIXED: works on all faces) ===
renderer.domElement.addEventListener('click', function(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((e.clientX - rect.left) / rect.width) * 2 - 1,
    -((e.clientY - rect.top) / rect.height) * 2 + 1
  );
  
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(cube);

  if (!intersects.length) return;

  // If on a section face, click anywhere to return to menu
  if (currentFace !== 0) {
    gotoFace(0);
    return;
  }

  // On front face - check which edge was clicked
  const face = intersects[0].face;
  if (face.materialIndex !== 4) return; // Only front face clickable for navigation

  const uv = intersects[0].uv;
  const u = uv.x;
  const v = uv.y; // Note: UV y is already correct orientation
  
  const edgeMargin = 0.25;
  const centerMin = 0.35;
  const centerMax = 0.65;
  
  // Check if click is in center (do nothing) or on an edge
  const inCenterX = u > centerMin && u < centerMax;
  const inCenterY = v > centerMin && v < centerMax;
  
  if (inCenterX && inCenterY) {
    // Clicked center - do nothing on main menu
    return;
  }
  
  // Determine which edge
  if (v > 1 - edgeMargin && inCenterX) {
    gotoFace(4); // Top edge = About Me
  } else if (u > 1 - edgeMargin && inCenterY) {
    gotoFace(1); // Right edge = Projects
  } else if (v < edgeMargin && inCenterX) {
    gotoFace(2); // Bottom edge = Academics
  } else if (u < edgeMargin && inCenterY) {
    gotoFace(3); // Left edge = Contact
  }
});

// Change cursor on hover
renderer.domElement.addEventListener('mousemove', function(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((e.clientX - rect.left) / rect.width) * 2 - 1,
    -((e.clientY - rect.top) / rect.height) * 2 + 1
  );
  
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(cube);
  
  if (intersects.length > 0) {
    renderer.domElement.style.cursor = 'pointer';
  } else {
    renderer.domElement.style.cursor = 'default';
  }
});

function gotoFace(idx) {
  targetQuat.copy(FACE_ROT[idx]);
  currentFace = idx;
  updateInfoPanel(idx);
}

function updateInfoPanel(idx) {
  const infoDiv = document.getElementById('cube-info');
  if (idx === 0) {
    infoDiv.style.display = "none";
  } else {
    infoDiv.innerHTML = `<b>${sections[idx].label}</b><br>${sections[idx].info}`;
    infoDiv.style.display = "block";
  }
}

// === Responsive Canvas ===
window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight * 0.90;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});
