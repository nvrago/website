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
    draw: ctx => drawSectionFace(ctx, "Personal Projects", "Showcase of your personal projects.<br>Add images, descriptions, or links here.")
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
  const size = 600;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  drawFn(ctx, size);
  return new THREE.CanvasTexture(canvas);
}

function drawMainMenuFace(ctx, size) {
  ctx.fillStyle = "#202735";
  ctx.fillRect(0, 0, size, size);

  ctx.font = "bold 46px Segoe UI, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.shadowColor = "#000a";
  ctx.shadowBlur = 8;

  ctx.fillText("About Me", size/2, 56);
  ctx.fillText("Academics", size/2, size - 56);
  ctx.save();
  ctx.translate(size - 56, size/2);
  ctx.rotate(Math.PI / 2);
  ctx.fillText("Personal Projects", 0, 0);
  ctx.restore();
  ctx.save();
  ctx.translate(56, size/2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Contact Me", 0, 0);
  ctx.restore();

  ctx.strokeStyle = "#60b3ff88";
  ctx.lineWidth = 5;
  ctx.strokeRect(22, 22, size-44, size-44);
}

function drawSectionFace(ctx, title, content) {
  const size = 600;
  ctx.fillStyle = "#202735";
  ctx.fillRect(0, 0, size, size);

  ctx.font = "bold 44px Segoe UI, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#fff";
  ctx.shadowColor = "#000c";
  ctx.shadowBlur = 10;
  ctx.fillText(title, size/2, 80);

  ctx.font = "24px Segoe UI, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.shadowBlur = 4;
  let lines = content.replace(/<br\s*\/?>/g, "\n").split("\n");
  let y = 180;
  for (let line of lines) {
    ctx.fillText(line, size/2, y);
    y += 40;
  }
}

function drawBlankFace(ctx, size) {
  ctx.fillStyle = "#202735";
  ctx.fillRect(0, 0, size, size);
}

// === Iridescent Rim Texture for EmissiveMap ===
function makeIridescentRimTexture() {
  const size = 600;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  for (let i = 0; i < 16; ++i) {
    let color = `hsl(${200 + i * 9}, 86%, 65%)`;
    ctx.strokeStyle = color;
    ctx.lineWidth = 14 - i * 0.6;
    ctx.globalAlpha = 0.13 + i * 0.017;
    ctx.strokeRect(18 + i, 18 + i, size - (18 + i) * 2, size - (18 + i) * 2);
  }
  const grad = ctx.createRadialGradient(size/2, size/2, size/5, size/2, size/2, size/1.4);
  grad.addColorStop(0, "#b7f1ee20");
  grad.addColorStop(0.6, "#3e5ca822");
  grad.addColorStop(1, "#00000011");
  ctx.globalAlpha = 0.24;
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(c);
}

// === Scene/Renderer/Lighting ===
let width = window.innerWidth, height = window.innerHeight * 0.90;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 1000);
camera.position.z = 5.2;

const renderer = new THREE.WebGLRenderer({canvas: document.getElementById("cube-canvas"), antialias: true, alpha: true});
renderer.setClearColor(0x000000, 0);
renderer.setSize(width, height);

const pmremGenerator = new THREE.PMREMGenerator(renderer);
const gradientCanvas = document.createElement('canvas');
gradientCanvas.width = gradientCanvas.height = 128;
const gctx = gradientCanvas.getContext('2d');
const grad = gctx.createLinearGradient(0, 0, 128, 128);
grad.addColorStop(0, "#3851a9");
grad.addColorStop(0.4, "#6d49a4");
grad.addColorStop(0.7, "#88dfec");
grad.addColorStop(1, "#232254");
gctx.fillStyle = grad;
gctx.fillRect(0, 0, 128, 128);
const envMap = pmremGenerator.fromEquirectangular(new THREE.CanvasTexture(gradientCanvas)).texture;
scene.environment = envMap;

const ambient = new THREE.AmbientLight(0xffffff, 0.66);
scene.add(ambient);
const spot = new THREE.SpotLight(0xa4ccff, 1.12, 7, Math.PI/2, 0.4, 1.4);
spot.position.set(4, 6, 8);
scene.add(spot);

const rimTex = makeIridescentRimTexture();

function makeGCubeMat(faceTexture) {
  return new THREE.MeshPhysicalMaterial({
    map: faceTexture,
    transparent: true,
    roughness: 0.17,
    metalness: 0.58,
    clearcoat: 1,
    clearcoatRoughness: 0.10,
    reflectivity: 0.98,
    ior: 1.44,
    transmission: 0.43,
    thickness: 0.68,
    envMap: envMap,
    envMapIntensity: 1.25,
    emissiveMap: rimTex,
    emissiveIntensity: 0.32,
    emissive: 0x44baff
  });
}

// THIS LINE MUST COME BEFORE MATERIALS
const geometry = new THREE.BoxGeometry(2.2, 2.2, 2.2);

// === MATERIALS: Academics is now on the BOTTOM face (index 2 in sections) ===
const materials = [
  makeGCubeMat(makeFaceTexture(sections[1].draw)), // right (projects)   +X
  makeGCubeMat(makeFaceTexture(sections[3].draw)), // left (contact)    -X
  makeGCubeMat(makeFaceTexture(sections[4].draw)), // top (about)       +Y
  makeGCubeMat(makeFaceTexture(sections[2].draw)), // bottom (academics) -Y
  makeGCubeMat(makeFaceTexture(sections[0].draw)), // front (main menu) +Z
  makeGCubeMat(makeFaceTexture(sections[5].draw)), // back (blank)      -Z
];

const cube = new THREE.Mesh(geometry, materials);
scene.add(cube);

// === Menu State/Rotation Logic (Quaternion version with smooth transition) ===
let currentFace = 0; // 0 = front, 1 = right, 2 = bottom (academics), 3 = left, 4 = top
let baseQuat = new THREE.Quaternion().copy(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0))); // initial orientation
let targetQuat = baseQuat.clone();

// Target quaternions for each face
const FACE_ROT = [
  new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)),                     // FRONT
  new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 2, 0)),          // RIGHT
  new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)),           // BOTTOM (academics)
  new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI / 2, 0)),           // LEFT
  new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)),          // TOP (about)
];

// For "wobble"
let wobbleTime = 0;

// === Animation loop (slerp, then temp wobble for rendering) ===
function animate() {
  requestAnimationFrame(animate);

  // Smoothly slerp baseQuat toward targetQuat
  baseQuat.slerp(targetQuat, 0.13);

  // Compute wobble as extra rotation
  wobbleTime = performance.now() * 0.001;
  let wobbleX = Math.sin(wobbleTime * 1.12) * 0.035;
  let wobbleY = Math.cos(wobbleTime * 1.26) * 0.035;
  let wobbleEuler = new THREE.Euler(wobbleX, wobbleY, 0, "XYZ");
  let wobbleQ = new THREE.Quaternion().setFromEuler(wobbleEuler);

  // Apply: cube.quaternion = baseQuat * wobbleQ
  cube.quaternion.copy(baseQuat).multiply(wobbleQ);

  cube.position.y = Math.sin(wobbleTime * 1.13) * 0.07;
  renderer.render(scene, camera);
}
animate();

// === Keyboard Navigation with proper logic ===
document.addEventListener('keydown', e => {
  if (currentFace === 0) {
    if (e.key === "ArrowUp") gotoFace(4);     // About Me (top)
    if (e.key === "ArrowRight") gotoFace(1);  // Projects (right)
    if (e.key === "ArrowDown") gotoFace(2);   // Academics (bottom, flips up)
    if (e.key === "ArrowLeft") gotoFace(3);   // Contact (left)
  } else {
    // Each face returns with opposite direction only
    if (currentFace === 4 && e.key === "ArrowDown") gotoFace(0);   // About Me: Down returns
    if (currentFace === 1 && e.key === "ArrowLeft") gotoFace(0);   // Projects: Left returns
    if (currentFace === 2 && e.key === "ArrowUp") gotoFace(0);     // Academics: Up returns
    if (currentFace === 3 && e.key === "ArrowRight") gotoFace(0);  // Contact: Right returns
    if (e.key === "Escape") gotoFace(0);
  }
});

// === Mouse Click to Activate Edge ===
renderer.domElement.addEventListener('click', function(e) {
  if(currentFace !== 0) return;
  const rect = renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((e.clientX - rect.left) / rect.width) * 2 - 1,
    -((e.clientY - rect.top) / rect.height) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(cube);

  if (!intersects.length) return;

  const face = intersects[0].face;
  if (face.materialIndex !== 4) return; // Only respond if clicking front face

  const uv = intersects[0].uv;
  const u = uv.x;
  const v = 1 - uv.y;
  const edgeMargin = 0.26;
  if (v < edgeMargin) gotoFace(4); // Top = About Me
  else if (u > 1 - edgeMargin) gotoFace(1); // Right = Projects
  else if (v > 1 - edgeMargin) gotoFace(2); // Bottom = Academics
  else if (u < edgeMargin) gotoFace(3); // Left = Contact Me
});

function gotoFace(idx) {
  targetQuat.copy(FACE_ROT[idx]);
  currentFace = idx;
  updateInfoPanel(idx);
}

function updateInfoPanel(idx) {
  const infoDiv = document.getElementById('cube-info');
  if(idx === 0) {
    infoDiv.style.display = "none";
  } else {
    infoDiv.innerHTML = `<b>${sections[idx].label}</b><br>${sections[idx].info}`;
    infoDiv.style.display = "block";
  }
}

// === Responsive canvas ===
window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight * 0.90;
  camera.aspect = width/height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});

