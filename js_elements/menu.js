// === GAMECUBE STARTUP ANIMATION + MENU SYSTEM ===

// ==================== CONFIGURATION ====================
const SKIP_INTRO = false; // Set to true to skip during development
const INTRO_DURATION = 4500; // Total intro time in ms

// ==================== SECTIONS DATA ====================
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
  return new THREE.CanvasTexture(canvas);
}

function drawMainMenuFace(ctx, size) {
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, size, size);
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

  ctx.font = "16px 'Segoe UI', Arial, sans-serif";
  ctx.fillStyle = "#8888bb";
  ctx.shadowBlur = 0;
  ctx.fillText("Press ESC or click to return", size/2, size - 50);
}

function drawBlankFace(ctx, size = 512) {
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, size, size);
}

// ==================== SCENE SETUP ====================
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

// Environment map
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

// ==================== CUBE MATERIAL ====================
function makeGCubeMat(faceTexture, introMode = false) {
  return new THREE.MeshPhysicalMaterial({
    map: faceTexture,
    transparent: true,
    opacity: introMode ? 0.7 : 0.92,
    roughness: 0.08,
    metalness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 1.0,
    ior: 1.5,
    transmission: introMode ? 0.8 : 0.6,
    thickness: 1.5,
    envMap: envMap,
    envMapIntensity: introMode ? 1.2 : 0.8,
    color: 0xd0d0ff,
    emissive: introMode ? 0x4020a0 : 0x201040,
    emissiveIntensity: introMode ? 0.4 : 0.15,
    side: THREE.FrontSide
  });
}

// ==================== CREATE CUBES ====================
const geometry = new THREE.BoxGeometry(2.1, 2.1, 2.1);

// Intro cube (plain, glowing)
function makeIntroCubeTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = "#1a1030";
  ctx.fillRect(0, 0, size, size);
  
  // Subtle G pattern hint
  const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  grad.addColorStop(0, "rgba(130, 100, 220, 0.3)");
  grad.addColorStop(0.5, "rgba(80, 60, 160, 0.2)");
  grad.addColorStop(1, "rgba(30, 20, 60, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  
  return new THREE.CanvasTexture(canvas);
}

const introTexture = makeIntroCubeTexture();
const introMaterials = Array(6).fill(null).map(() => makeGCubeMat(introTexture, true));
const introCube = new THREE.Mesh(geometry, introMaterials);
introCube.visible = true;
scene.add(introCube);

// Menu cube (hidden initially)
const menuMaterials = [
  makeGCubeMat(makeFaceTexture(sections[1].draw)),
  makeGCubeMat(makeFaceTexture(sections[3].draw)),
  makeGCubeMat(makeFaceTexture(sections[4].draw)),
  makeGCubeMat(makeFaceTexture(sections[2].draw)),
  makeGCubeMat(makeFaceTexture(sections[0].draw)),
  makeGCubeMat(makeFaceTexture(sections[5].draw)),
];
const menuCube = new THREE.Mesh(geometry, menuMaterials);
menuCube.visible = false;
scene.add(menuCube);

// ==================== INTRO STATE ====================
let introActive = !SKIP_INTRO;
let introStartTime = 0;
let introPhase = 0; // 0: zoom in, 1: spin, 2: settle, 3: transition

// ==================== MENU STATE ====================
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

// ==================== AUDIO (Optional) ====================
let audioContext = null;

function playStartupSound() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create a synthesized GameCube-like startup sound
    const now = audioContext.currentTime;
    
    // Main chime
    playTone(391.99, now, 0.8, 0.3);        // G4
    playTone(523.25, now + 0.15, 0.6, 0.25); // C5
    playTone(659.25, now + 0.3, 0.5, 0.3);   // E5
    playTone(783.99, now + 0.5, 0.4, 0.5);   // G5
    
    // Bass undertone
    playTone(98, now, 0.2, 1.2);             // G2 bass
    
  } catch(e) {
    console.log("Audio not supported");
  }
}

function playTone(freq, startTime, volume, duration) {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.type = 'sine';
  osc.frequency.value = freq;
  
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  
  osc.connect(gain);
  gain.connect(audioContext.destination);
  
  osc.start(startTime);
  osc.stop(startTime + duration);
}

// ==================== INTRO ANIMATION ====================
function updateIntro(time) {
  const elapsed = time - introStartTime;
  const progress = Math.min(elapsed / INTRO_DURATION, 1);
  
  // Phase timing
  if (progress < 0.2) {
    // Phase 0: Cube flies in from distance, spinning
    introPhase = 0;
    const p = progress / 0.2;
    const eased = 1 - Math.pow(1 - p, 3);
    
    camera.position.z = 15 - (9.5 * eased);
    introCube.rotation.x = p * Math.PI * 2;
    introCube.rotation.y = p * Math.PI * 3;
    introCube.scale.setScalar(0.3 + 0.7 * eased);
    
    // Glow intensity
    introMaterials.forEach(m => {
      m.emissiveIntensity = 0.2 + 0.4 * p;
    });
    
  } else if (progress < 0.6) {
    // Phase 1: Signature spin (like the GC logo reveal)
    introPhase = 1;
    const p = (progress - 0.2) / 0.4;
    const eased = p;
    
    camera.position.z = 5.5;
    introCube.scale.setScalar(1);
    
    // Iconic rotation
    introCube.rotation.x = Math.PI * 2 + eased * Math.PI * 0.5;
    introCube.rotation.y = Math.PI * 3 + eased * Math.PI * 2;
    introCube.rotation.z = Math.sin(eased * Math.PI) * 0.3;
    
    // Pulsing glow
    const pulse = Math.sin(p * Math.PI * 4) * 0.2;
    introMaterials.forEach(m => {
      m.emissiveIntensity = 0.4 + pulse;
    });
    
  } else if (progress < 0.85) {
    // Phase 2: Settle into position
    introPhase = 2;
    const p = (progress - 0.6) / 0.25;
    const eased = 1 - Math.pow(1 - p, 2);
    
    // Damped oscillation settle
    const damping = Math.exp(-p * 3);
    const wobble = Math.sin(p * Math.PI * 6) * damping * 0.2;
    
    introCube.rotation.x = Math.PI * 2.5 * (1 - eased) + wobble;
    introCube.rotation.y = Math.PI * 5 * (1 - eased) + wobble;
    introCube.rotation.z = wobble * 0.5;
    
    introMaterials.forEach(m => {
      m.emissiveIntensity = 0.4 - 0.25 * p;
    });
    
  } else {
    // Phase 3: Crossfade to menu cube
    introPhase = 3;
    const p = (progress - 0.85) / 0.15;
    const eased = p * p;
    
    introCube.rotation.set(0, 0, 0);
    
    // Fade out intro cube
    introMaterials.forEach(m => {
      m.opacity = 0.92 * (1 - eased);
    });
    
    // Show and fade in menu cube
    if (!menuCube.visible) {
      menuCube.visible = true;
      menuCube.quaternion.copy(FACE_ROT[0]);
    }
    menuMaterials.forEach(m => {
      m.opacity = 0.92 * eased;
    });
  }
  
  // Floating motion during intro
  const floatY = Math.sin(time * 0.002) * 0.1;
  introCube.position.y = floatY;
  
  return progress >= 1;
}

function endIntro() {
  introActive = false;
  introCube.visible = false;
  menuCube.visible = true;
  
  // Reset menu cube materials to full opacity
  menuMaterials.forEach(m => {
    m.opacity = 0.92;
  });
  
  // Hide the HTML intro overlay
  if (window.hideIntroOverlay) {
    window.hideIntroOverlay();
  }
  
  // Enable controls hint
  const infoDiv = document.getElementById('cube-info');
  infoDiv.innerHTML = "<b>Welcome!</b><br>Use arrow keys or click edges to navigate";
  infoDiv.style.display = "block";
  
  setTimeout(() => {
    if (currentFace === 0) {
      infoDiv.style.display = "none";
    }
  }, 3000);
}

// ==================== MAIN ANIMATION LOOP ====================
function animate(time) {
  requestAnimationFrame(animate);
  
  if (introActive) {
    if (introStartTime === 0) {
      introStartTime = time;
      // Play sound on first user interaction
      document.addEventListener('click', () => {
        if (!audioContext) playStartupSound();
      }, { once: true });
      document.addEventListener('keydown', () => {
        if (!audioContext) playStartupSound();
      }, { once: true });
    }
    
    const done = updateIntro(time);
    if (done) endIntro();
    
  } else {
    // Menu mode
    baseQuat.slerp(targetQuat, 0.1);
    
    const t = time * 0.001;
    const wobbleX = Math.sin(t * 0.8) * 0.02;
    const wobbleY = Math.cos(t * 0.9) * 0.02;
    const wobbleQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(wobbleX, wobbleY, 0));
    
    menuCube.quaternion.copy(baseQuat).multiply(wobbleQ);
    menuCube.position.y = Math.sin(t * 0.7) * 0.05;
  }
  
  renderer.render(scene, camera);
}
animate(0);

// ==================== SKIP INTRO ON CLICK/KEY ====================
function skipIntro() {
  if (introActive && introPhase >= 1) {
    introActive = false;
    endIntro();
  }
}

document.addEventListener('keydown', e => {
  if (introActive) {
    if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
      skipIntro();
    }
    return;
  }
  
  // Menu navigation
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

// ==================== MOUSE CONTROLS ====================
renderer.domElement.addEventListener('click', function(e) {
  if (introActive) {
    skipIntro();
    return;
  }
  
  const rect = renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((e.clientX - rect.left) / rect.width) * 2 - 1,
    -((e.clientY - rect.top) / rect.height) * 2 + 1
  );
  
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(menuCube);

  if (!intersects.length) return;

  if (currentFace !== 0) {
    gotoFace(0);
    return;
  }

  const face = intersects[0].face;
  if (face.materialIndex !== 4) return;

  const uv = intersects[0].uv;
  const u = uv.x, v = uv.y;
  const edge = 0.25, cMin = 0.35, cMax = 0.65;
  const inCX = u > cMin && u < cMax;
  const inCY = v > cMin && v < cMax;
  
  if (inCX && inCY) return;
  
  if (v > 1 - edge && inCX) gotoFace(4);
  else if (u > 1 - edge && inCY) gotoFace(1);
  else if (v < edge && inCX) gotoFace(2);
  else if (u < edge && inCY) gotoFace(3);
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
  const intersects = raycaster.intersectObject(target);
  
  renderer.domElement.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
});

// ==================== NAVIGATION HELPERS ====================
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

// ==================== RESPONSIVE ====================
window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight * 0.90;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});
