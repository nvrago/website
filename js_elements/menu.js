// === GAMECUBE MENU - IMPROVED GLASS EFFECT ===

// ==================== CONFIG ====================
const SKIP_INTRO = false;
const INTRO_DURATION = 4500;

// ==================== SECTIONS ====================
const sections = [
  { face: "menu", draw: drawMainMenuFace },
  { face: "projects", label: "Personal Projects", 
    info: "Showcase of your personal projects.<br>Add images, descriptions, or links here.",
    draw: ctx => drawSectionFace(ctx, "Personal Projects", "Showcase of your personal projects.\nAdd images, descriptions, or links here.") },
  { face: "academics", label: "Academics", 
    info: "Your academic background and achievements.",
    draw: ctx => drawSectionFace(ctx, "Academics", "Your academic background and achievements.") },
  { face: "contact", label: "Contact Me", 
    info: "Ways to contact you (email, socials, etc).",
    draw: ctx => drawSectionFace(ctx, "Contact Me", "Ways to contact you (email, socials, etc).") },
  { face: "about", label: "About Me", 
    info: "Introduce yourself, skills, and interests.",
    draw: ctx => drawSectionFace(ctx, "About Me", "Introduce yourself, skills, and interests.") },
  { face: "empty", draw: ctx => drawBlankFace(ctx) }
];

// ==================== TEXTURE HELPERS ====================
function makeFaceTexture(drawFn) {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  drawFn(ctx, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 16;
  return tex;
}

function drawMainMenuFace(ctx, size) {
  // Darker, more transparent background
  ctx.fillStyle = "rgba(15, 10, 30, 0.85)";
  ctx.fillRect(0, 0, size, size);
  
  // Subtle inner glow
  const glow = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/1.2);
  glow.addColorStop(0, "rgba(120, 100, 200, 0.15)");
  glow.addColorStop(0.5, "rgba(80, 60, 160, 0.08)");
  glow.addColorStop(1, "rgba(20, 15, 40, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  ctx.font = "bold 36px 'Segoe UI', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#e8e8ff";
  ctx.shadowColor = "#a080ff";
  ctx.shadowBlur = 15;

  ctx.fillText("About Me", size/2, 52);
  ctx.fillText("Academics", size/2, size - 52);
  
  ctx.save();
  ctx.translate(size - 48, size/2);
  ctx.rotate(Math.PI / 2);
  ctx.fillText("Projects", 0, 0);
  ctx.restore();
  
  ctx.save();
  ctx.translate(48, size/2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Contact", 0, 0);
  ctx.restore();

  // Thin elegant border
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(180, 160, 255, 0.4)";
  ctx.lineWidth = 2;
  ctx.strokeRect(12, 12, size-24, size-24);
}

function drawSectionFace(ctx, title, content) {
  const size = 512;
  ctx.fillStyle = "rgba(15, 10, 30, 0.9)";
  ctx.fillRect(0, 0, size, size);
  
  const glow = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/1.3);
  glow.addColorStop(0, "rgba(120, 100, 200, 0.12)");
  glow.addColorStop(1, "rgba(20, 15, 40, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  ctx.font = "bold 38px 'Segoe UI', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#e8e8ff";
  ctx.shadowColor = "#a080ff";
  ctx.shadowBlur = 18;
  ctx.fillText(title, size/2, 65);

  ctx.font = "21px 'Segoe UI', Arial, sans-serif";
  ctx.shadowBlur = 8;
  let lines = content.replace(/<br\s*\/?>/g, "\n").split("\n");
  let y = 155;
  for (let line of lines) {
    ctx.fillText(line, size/2, y);
    y += 34;
  }

  ctx.font = "15px 'Segoe UI', Arial, sans-serif";
  ctx.fillStyle = "#9999cc";
  ctx.shadowBlur = 0;
  ctx.fillText("Press ESC or click to return", size/2, size - 48);
}

function drawBlankFace(ctx, size = 512) {
  ctx.fillStyle = "rgba(15, 10, 30, 0.85)";
  ctx.fillRect(0, 0, size, size);
}

// ==================== SCENE SETUP ====================
let width = window.innerWidth, height = window.innerHeight * 0.90;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(25, width/height, 0.1, 1000);
camera.position.set(0, 0.5, 6);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("cube-canvas"), 
  antialias: true, 
  alpha: true,
  powerPreference: "high-performance"
});
renderer.setClearColor(0x151520, 1);
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// ==================== HDR-LIKE ENVIRONMENT ====================
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// Create a more sophisticated environment map
function createEnvironmentMap() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size * 2;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Gradient sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, size);
  skyGrad.addColorStop(0, "#1a1a3a");
  skyGrad.addColorStop(0.3, "#2a2a5a");
  skyGrad.addColorStop(0.5, "#4a4a8a");
  skyGrad.addColorStop(0.7, "#3a3a6a");
  skyGrad.addColorStop(1, "#151530");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, size * 2, size);
  
  // Add some "city lights" spots for reflection interest
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * size * 2;
    const y = size * 0.4 + Math.random() * size * 0.4;
    const r = 2 + Math.random() * 8;
    const hue = 200 + Math.random() * 60;
    
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
    grad.addColorStop(0, `hsla(${hue}, 70%, 70%, 0.8)`);
    grad.addColorStop(0.5, `hsla(${hue}, 60%, 50%, 0.3)`);
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  return pmremGenerator.fromEquirectangular(texture).texture;
}

const envMap = createEnvironmentMap();
scene.environment = envMap;
scene.background = new THREE.Color(0x151520);

// ==================== LIGHTING ====================
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambient);

const keyLight = new THREE.SpotLight(0xffffff, 1.5);
keyLight.position.set(5, 8, 10);
keyLight.angle = Math.PI / 6;
keyLight.penumbra = 1;
scene.add(keyLight);

const fillLight = new THREE.PointLight(0x8080ff, 0.5);
fillLight.position.set(-5, -3, 5);
scene.add(fillLight);

const rimLight = new THREE.PointLight(0xff80ff, 0.3);
rimLight.position.set(0, 5, -5);
scene.add(rimLight);

// ==================== ROUNDED BOX GEOMETRY ====================
// Create rounded box using BufferGeometry manipulation
function createRoundedBoxGeometry(width, height, depth, radius, segments) {
  // Use a simpler approach: BoxGeometry with beveled edges via shader or just standard box
  // For true rounded corners, we'd need more complex geometry
  // Three.js doesn't have built-in RoundedBox, so we'll use regular box with material tricks
  return new THREE.BoxGeometry(width, height, depth, segments, segments, segments);
}

const geometry = createRoundedBoxGeometry(2.0, 2.0, 2.0, 0.1, 2);

// ==================== GLASS MATERIAL (Enhanced) ====================
function makeGlassMaterial(faceTexture, isIntro = false) {
  return new THREE.MeshPhysicalMaterial({
    map: faceTexture,
    
    // Transmission (glass effect)
    transparent: true,
    transmission: isIntro ? 0.95 : 0.85,
    opacity: 1,
    
    // Surface properties
    roughness: 0.05,
    metalness: 0,
    
    // Clearcoat (adds that polished layer)
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    
    // Refraction
    ior: 1.45,
    thickness: 0.5,
    
    // IRIDESCENCE - the rainbow shimmer!
    iridescence: 1.0,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [100, 800],
    
    // Reflections
    envMap: envMap,
    envMapIntensity: 1.5,
    reflectivity: 1.0,
    
    // Color tint
    color: isIntro ? 0xd0d0ff : 0xffffff,
    
    // Slight emission for that glow
    emissive: isIntro ? 0x301060 : 0x100830,
    emissiveIntensity: isIntro ? 0.3 : 0.1,
    
    // Render both sides for proper glass look
    side: THREE.FrontSide,
    
    // Better shadows
    depthWrite: true,
  });
}

// ==================== BACKSIDE CUBE (for transmission effect) ====================
// Create an inner cube that renders the backside
const backsideGeometry = new THREE.BoxGeometry(1.98, 1.98, 1.98);
const backsideMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x1a1030,
  transparent: true,
  opacity: 0.3,
  side: THREE.BackSide,
  roughness: 0.1,
});
const backsideCube = new THREE.Mesh(backsideGeometry, backsideMaterial);
scene.add(backsideCube);

// ==================== CREATE CUBES ====================
// Intro cube
function makeIntroTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = "rgba(20, 15, 40, 0.6)";
  ctx.fillRect(0, 0, size, size);
  
  const glow = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  glow.addColorStop(0, "rgba(150, 120, 255, 0.25)");
  glow.addColorStop(0.6, "rgba(100, 80, 200, 0.1)");
  glow.addColorStop(1, "rgba(30, 20, 60, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);
  
  return new THREE.CanvasTexture(canvas);
}

const introTexture = makeIntroTexture();
const introMaterials = Array(6).fill(null).map(() => makeGlassMaterial(introTexture, true));
const introCube = new THREE.Mesh(geometry, introMaterials);
introCube.visible = true;
scene.add(introCube);

// Menu cube
const menuMaterials = [
  makeGlassMaterial(makeFaceTexture(sections[1].draw)),
  makeGlassMaterial(makeFaceTexture(sections[3].draw)),
  makeGlassMaterial(makeFaceTexture(sections[4].draw)),
  makeGlassMaterial(makeFaceTexture(sections[2].draw)),
  makeGlassMaterial(makeFaceTexture(sections[0].draw)),
  makeGlassMaterial(makeFaceTexture(sections[5].draw)),
];
const menuCube = new THREE.Mesh(geometry, menuMaterials);
menuCube.visible = false;
scene.add(menuCube);

// ==================== MENU STATE ====================
let introActive = !SKIP_INTRO;
let introStartTime = 0;
let introPhase = 0;
let currentFace = 0;
let baseQuat = new THREE.Quaternion();
let targetQuat = new THREE.Quaternion();

const FACE_ROT = [
  new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)),
  new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI/2, 0)),
  new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI/2, 0, 0)),
  new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI/2, 0)),
  new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI/2, 0, 0)),
];

// ==================== AUDIO ====================
let audioContext = null;

function playStartupSound() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;
    
    [391.99, 523.25, 659.25, 783.99].forEach((freq, i) => {
      playTone(freq, now + i * 0.15, 0.3 - i * 0.05, 0.4);
    });
    playTone(98, now, 0.15, 1.2);
  } catch(e) {}
}

function playTone(freq, start, vol, dur) {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(vol, start + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start(start);
  osc.stop(start + dur);
}

// ==================== INTRO ANIMATION ====================
function updateIntro(time) {
  const elapsed = time - introStartTime;
  const progress = Math.min(elapsed / INTRO_DURATION, 1);
  
  if (progress < 0.2) {
    introPhase = 0;
    const p = progress / 0.2;
    const ease = 1 - Math.pow(1 - p, 3);
    
    camera.position.z = 12 - 6 * ease;
    introCube.rotation.x = p * Math.PI * 2;
    introCube.rotation.y = p * Math.PI * 3;
    introCube.scale.setScalar(0.2 + 0.8 * ease);
    backsideCube.scale.copy(introCube.scale);
    backsideCube.rotation.copy(introCube.rotation);
    
    introMaterials.forEach(m => {
      m.iridescence = 0.5 + p * 0.5;
      m.emissiveIntensity = 0.2 + p * 0.3;
    });
    
  } else if (progress < 0.6) {
    introPhase = 1;
    const p = (progress - 0.2) / 0.4;
    
    camera.position.z = 6;
    introCube.scale.setScalar(1);
    backsideCube.scale.setScalar(1);
    
    introCube.rotation.x = Math.PI * 2 + p * Math.PI * 0.5;
    introCube.rotation.y = Math.PI * 3 + p * Math.PI * 2;
    introCube.rotation.z = Math.sin(p * Math.PI) * 0.25;
    backsideCube.rotation.copy(introCube.rotation);
    
    const pulse = Math.sin(p * Math.PI * 5) * 0.3;
    introMaterials.forEach(m => {
      m.emissiveIntensity = 0.3 + pulse;
      m.iridescence = 0.8 + Math.sin(p * Math.PI * 3) * 0.2;
    });
    
  } else if (progress < 0.85) {
    introPhase = 2;
    const p = (progress - 0.6) / 0.25;
    const ease = 1 - Math.pow(1 - p, 2);
    const damp = Math.exp(-p * 4);
    const wobble = Math.sin(p * Math.PI * 8) * damp * 0.15;
    
    introCube.rotation.x = Math.PI * 2.5 * (1 - ease) + wobble;
    introCube.rotation.y = Math.PI * 5 * (1 - ease) + wobble;
    introCube.rotation.z = wobble * 0.5;
    backsideCube.rotation.copy(introCube.rotation);
    
    introMaterials.forEach(m => {
      m.emissiveIntensity = 0.5 - p * 0.3;
    });
    
  } else {
    introPhase = 3;
    const p = (progress - 0.85) / 0.15;
    
    introCube.rotation.set(0, 0, 0);
    backsideCube.rotation.set(0, 0, 0);
    
    introMaterials.forEach(m => {
      m.opacity = 1 - p;
      m.transmission = 0.95 - p * 0.3;
    });
    
    if (!menuCube.visible) {
      menuCube.visible = true;
      menuCube.quaternion.copy(FACE_ROT[0]);
    }
    
    menuMaterials.forEach(m => {
      m.opacity = p;
    });
  }
  
  const floatY = Math.sin(time * 0.002) * 0.08;
  introCube.position.y = floatY;
  backsideCube.position.y = floatY;
  
  return progress >= 1;
}

function endIntro() {
  introActive = false;
  introCube.visible = false;
  menuCube.visible = true;
  backsideCube.visible = true;
  
  menuMaterials.forEach(m => { m.opacity = 1; });
  
  if (window.hideIntroOverlay) window.hideIntroOverlay();
  
  const infoDiv = document.getElementById('cube-info');
  infoDiv.innerHTML = "<b>Welcome!</b><br>Use arrow keys or click edges to navigate";
  infoDiv.style.display = "block";
  setTimeout(() => { if (currentFace === 0) infoDiv.style.display = "none"; }, 3000);
}

// ==================== ANIMATION LOOP ====================
function animate(time) {
  requestAnimationFrame(animate);
  
  if (introActive) {
    if (introStartTime === 0) {
      introStartTime = time;
      document.addEventListener('click', () => { if (!audioContext) playStartupSound(); }, { once: true });
      document.addEventListener('keydown', () => { if (!audioContext) playStartupSound(); }, { once: true });
    }
    if (updateIntro(time)) endIntro();
  } else {
    baseQuat.slerp(targetQuat, 0.1);
    
    const t = time * 0.001;
    const wobbleX = Math.sin(t * 0.7) * 0.015;
    const wobbleY = Math.cos(t * 0.8) * 0.015;
    const wobbleQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(wobbleX, wobbleY, 0));
    
    menuCube.quaternion.copy(baseQuat).multiply(wobbleQ);
    menuCube.position.y = Math.sin(t * 0.6) * 0.04;
    
    backsideCube.quaternion.copy(menuCube.quaternion);
    backsideCube.position.copy(menuCube.position);
  }
  
  renderer.render(scene, camera);
}
animate(0);

// ==================== CONTROLS ====================
function skipIntro() {
  if (introActive && introPhase >= 1) {
    introActive = false;
    endIntro();
  }
}

document.addEventListener('keydown', e => {
  if (introActive) {
    if (["Enter", " ", "Escape"].includes(e.key)) skipIntro();
    return;
  }
  
  if (currentFace === 0) {
    if (e.key === "ArrowUp") gotoFace(4);
    if (e.key === "ArrowRight") gotoFace(1);
    if (e.key === "ArrowDown") gotoFace(2);
    if (e.key === "ArrowLeft") gotoFace(3);
  } else {
    if (currentFace === 4 && e.key === "ArrowDown") gotoFace(0);
    if (currentFace === 1 && e.key === "ArrowLeft") gotoFace(0);
    if (currentFace === 2 && e.key === "ArrowUp") gotoFace(0);
    if (currentFace === 3 && e.key === "ArrowRight") gotoFace(0);
    if (e.key === "Escape") gotoFace(0);
  }
});

renderer.domElement.addEventListener('click', function(e) {
  if (introActive) { skipIntro(); return; }
  
  const rect = renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((e.clientX - rect.left) / rect.width) * 2 - 1,
    -((e.clientY - rect.top) / rect.height) * 2 + 1
  );
  
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(menuCube);
  
  if (!intersects.length) return;
  if (currentFace !== 0) { gotoFace(0); return; }
  
  const face = intersects[0].face;
  if (face.materialIndex !== 4) return;
  
  const uv = intersects[0].uv;
  const u = uv.x, v = uv.y;
  const edge = 0.25, cMin = 0.35, cMax = 0.65;
  
  if (u > cMin && u < cMax && v > cMin && v < cMax) return;
  
  if (v > 1 - edge && u > cMin && u < cMax) gotoFace(4);
  else if (u > 1 - edge && v > cMin && v < cMax) gotoFace(1);
  else if (v < edge && u > cMin && u < cMax) gotoFace(2);
  else if (u < edge && v > cMin && v < cMax) gotoFace(3);
});

renderer.domElement.addEventListener('mousemove', function(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((e.clientX - rect.left) / rect.width) * 2 - 1,
    -((e.clientY - rect.top) / rect.height) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const target = introActive ? introCube : menuCube;
  renderer.domElement.style.cursor = raycaster.intersectObject(target).length ? 'pointer' : 'default';
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

window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight * 0.90;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});
