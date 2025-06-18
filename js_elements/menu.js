// --- Section titles/info for each face ---
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
  { // 2: BACK
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
  { // 5: BOTTOM
    face: "empty",
    draw: ctx => drawBlankFace(ctx)
  }
];

// -- Helper to make a canvas texture with custom drawing --
function makeFaceTexture(drawFn) {
  const size = 600;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  drawFn(ctx, size);
  return new THREE.CanvasTexture(canvas);
}

// -- Draw main menu face with 4 edge labels --
function drawMainMenuFace(ctx, size) {
  ctx.fillStyle = "#202735";
  ctx.fillRect(0, 0, size, size);

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

  // Border (optional)
  ctx.strokeStyle = "#60b3ff88";
  ctx.lineWidth = 5;
  ctx.strokeRect(22, 22, size-44, size-44);
}

// -- Draw a section face with a title and info/content (centered) --
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
  // Allow HTML in content
  let lines = content.replace(/<br\s*\/?>/g, "\n").split("\n");
  let y = 180;
  for (let line of lines) {
    ctx.fillText(line, size/2, y);
    y += 40;
  }
}

// -- Blank face for bottom (not used) --
function drawBlankFace(ctx, size) {
  ctx.fillStyle = "#202735";
  ctx.fillRect(0, 0, size, size);
}

// --- Create cube with each face a different section/menu ---
const geometry = new THREE.BoxGeometry(2.2, 2.2, 2.2);
const materials = [
  // Order: right, left, top, bottom, front, back
  new THREE.MeshPhysicalMaterial({ map: makeFaceTexture(sections[1].draw), ...sharedCubeMatProps() }), // right (projects)
  new THREE.MeshPhysicalMaterial({ map: makeFaceTexture(sections[3].draw), ...sharedCubeMatProps() }), // left (contact)
  new THREE.MeshPhysicalMaterial({ map: makeFaceTexture(sections[4].draw), ...sharedCubeMatProps() }), // top (about)
  new THREE.MeshPhysicalMaterial({ map: makeFaceTexture(sections[5].draw), ...sharedCubeMatProps() }), // bottom (blank)
  new THREE.MeshPhysicalMaterial({ map: makeFaceTexture(sections[0].draw), ...sharedCubeMatProps() }), // front (main menu)
  new THREE.MeshPhysicalMaterial({ map: makeFaceTexture(sections[2].draw), ...sharedCubeMatProps() })  // back (academics)
];

function sharedCubeMatProps() {
  return {
    transparent: true,
    roughness: 0.19,
    metalness: 0.43,
    clearcoat: 0.88,
    reflectivity: 0.82,
    ior: 1.39,
    transmission: 0.13
  };
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth/(window.innerHeight*0.9), 0.1, 1000);
camera.position.z = 5.2;

const renderer = new THREE.WebGLRenderer({canvas: document.getElementById("cube-canvas"), antialias: true, alpha: true});
renderer.setClearColor(0x000000, 0);
renderer.setSize(window.innerWidth, window.innerHeight * 0.90);

const ambient = new THREE.AmbientLight(0xffffff, 0.63);
scene.add(ambient);
const spot = new THREE.SpotLight(0xffffff, 1.3, 7, Math.PI/2, 0.4, 1.4);
spot.position.set(5, 6, 7);
scene.add(spot);

const cube = new THREE.Mesh(geometry, materials);
scene.add(cube);

// --- Menu state/rotation logic ---
let currentFace = 0; // 0 = main menu, 1 = projects, 2 = academics, 3 = contact, 4 = about
let targetRotation = { x: 0, y: 0 };

function getFaceRotation(idx) {
  // idx: 0=front(main menu), 1=right, 2=back, 3=left, 4=top, 5=bottom
  // We only use: 0 (front), 1 (right), 2 (back), 3 (left), 4 (top)
  switch(idx) {
    case 0: return { x: 0, y: 0 };                      // Main menu
    case 1: return { x: 0, y: -Math.PI / 2 };            // Right (projects)
    case 2: return { x: 0, y: Math.PI };                 // Back (academics)
    case 3: return { x: 0, y: Math.PI / 2 };             // Left (contact)
    case 4: return { x: -Math.PI / 2, y: 0 };            // Top (about)
    default: return { x: 0, y: 0 };
  }
}

function animate() {
  cube.rotation.x += (targetRotation.x - cube.rotation.x) * 0.14;
  cube.rotation.y += (targetRotation.y - cube.rotation.y) * 0.14;

  // Subtle floating/wobble effect only on main menu
  const t = performance.now() * 0.001;
  if(currentFace === 0) {
    cube.rotation.x += Math.sin(t * 1.13) * 0.005;
    cube.rotation.y += Math.cos(t * 1.37) * 0.005;
    cube.position.y = Math.sin(t * 1.35) * 0.07;
  } else {
    cube.position.y = 0;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// --- Keyboard navigation for rotating to sides ---
document.addEventListener('keydown', e => {
  // Only allow input when not animating
  if (currentFace === 0) { // main menu, go to sections
    if (e.key === "ArrowUp") gotoFace(4);
    if (e.key === "ArrowRight") gotoFace(1);
    if (e.key === "ArrowDown") gotoFace(2);
    if (e.key === "ArrowLeft") gotoFace(3);
  } else {
    if (e.key === "ArrowDown" || e.key === "Escape") gotoFace(0); // Return to main menu
  }
});

// Click to activate regions on main menu
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

  // Which region?
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
  targetRotation = getFaceRotation(idx);
  currentFace = idx;
  updateInfoPanel(idx);
}

// --- Info panel shows content for active face ---
function updateInfoPanel(idx) {
  const infoDiv = document.getElementById('cube-info');
  if(idx === 0) {
    infoDiv.style.display = "none";
  } else {
    infoDiv.innerHTML = `<b>${sections[idx].label}</b><br>${sections[idx].info}`;
    infoDiv.style.display = "block";
  }
}

// --- Responsive canvas ---
window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight * 0.90;
  camera.aspect = w/h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

