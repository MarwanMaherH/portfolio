/* ============================================================
   MARWAN MAHER — PORTFOLIO SCRIPT
   Lenis smooth scroll + GSAP/ScrollTrigger reveals + Three.js hero
   ============================================================ */

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Lenis smooth scroll ---------- */
let lenis;
if (!prefersReduced && window.Lenis) {
  lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  lenis.on('scroll', ScrollTrigger && ScrollTrigger.update);
}

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  if (lenis) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time)=>{ lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
}

/* ---------- Scroll progress bar ---------- */
const progressLine = document.getElementById('progressLine');
function updateProgress(){
  const h = document.documentElement;
  const scrolled = (h.scrollTop || document.body.scrollTop);
  const height = h.scrollHeight - h.clientHeight;
  const pct = height > 0 ? (scrolled / height) * 100 : 0;
  if (progressLine) progressLine.style.width = pct + '%';
}
document.addEventListener('scroll', updateProgress, { passive:true });
if (lenis) lenis.on('scroll', updateProgress);

/* ---------- Nav compact on scroll ---------- */
const nav = document.getElementById('siteNav');
ScrollTrigger && ScrollTrigger.create({
  start: 80, end: 99999,
  onUpdate: (self) => { nav.classList.toggle('is-compact', self.scroll() > 80); }
});

/* ---------- Mobile menu ---------- */
const burger = document.getElementById('navBurger');
const mobileMenu = document.getElementById('mobileMenu');
if (burger) {
  burger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileMenu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', false);
  }));
}

/* ---------- Hero entrance (single orchestrated moment) ---------- */
window.addEventListener('DOMContentLoaded', () => {
  if (!window.gsap) return;
  const tl = gsap.timeline({ delay: 0.15, defaults: { ease: 'power3.out' } });
  tl.to('.hero__name .line span', { y: 0, duration: 1.1, stagger: 0.09 })
    .to('.hero__eyebrow', { opacity: 1, y: 0, duration: 0.7 }, '-=0.9')
    .to('.hero__underline path', { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, '-=0.75')
    .to('.hero__statement', { opacity: 0.82, y: 0, duration: 0.7 }, '-=0.7')
    .to('.hero__actions', { opacity: 1, y: 0, duration: 0.7 }, '-=0.55')
    .to('.hero__scene', { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, '-=0.6')
    .to('.hero__sparkles svg', { opacity: 1, scale: 1, duration: 0.6, stagger: 0.12, ease: 'back.out(2)' }, '-=0.7')
    .to('.hero__ghost', { opacity: 1, duration: 1.4 }, '-=1.1');

  if (window.gsap.utils) {
    gsap.to('.hero__sparkles svg', {
      y: '+=8', duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.3
    });
  }
});

/* ---------- Scroll reveals ---------- */
if (window.gsap && window.ScrollTrigger && !prefersReduced) {
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.fromTo(el, { opacity: 0, y: 26 }, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });

  /* Engineering flow steps light up in sequence while scrolling */
  const steps = gsap.utils.toArray('.eng-step');
  ScrollTrigger.create({
    trigger: '.eng-flow', start: 'top 70%', end: 'bottom 40%',
    onUpdate: (self) => {
      const idx = Math.floor(self.progress * steps.length);
      steps.forEach((s, i) => s.classList.toggle('is-active', i <= idx));
    }
  });
} else {
  document.querySelectorAll('[data-reveal]').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
}

/* ---------- Magnetic buttons ---------- */
if (!prefersReduced && window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.magnetic').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      gsap.to(el, { x: x * 0.28, y: y * 0.5, duration: 0.4, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

/* ---------- 3D tilt on project visuals ---------- */
if (!prefersReduced && window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    const inner = card.querySelector('.visual-canvas');
    const strength = 10; // max degrees of rotation
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;  // 0..1
      const py = (e.clientY - r.top) / r.height;  // 0..1
      const rotY = (px - 0.5) * strength * 2;
      const rotX = (0.5 - py) * strength * 2;
      card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(0)`;
      if (inner) inner.style.transform = `translateZ(28px) scale(1.04)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'rotateX(0deg) rotateY(0deg)';
      if (inner) inner.style.transform = 'translateZ(0) scale(1)';
    });
  });
}

/* ---------- Subtle 3D depth tilt on the hero text ---------- */
if (!prefersReduced && window.matchMedia('(hover: hover)').matches) {
  const heroInner = document.querySelector('.hero__inner');
  const heroSection = document.getElementById('hero');
  if (heroInner && heroSection) {
    heroSection.style.perspective = '1200px';
    heroSection.addEventListener('mousemove', (e) => {
      const r = heroSection.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(heroInner, {
        rotateY: px * 4,
        rotateX: -py * 4,
        transformPerspective: 1200,
        duration: 0.6,
        ease: 'power2.out'
      });
    });
    heroSection.addEventListener('mouseleave', () => {
      gsap.to(heroInner, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'power3.out' });
    });
  }
}

/* ============================================================
   THREE.JS + WebGL SHADER — hero background: a living aurora
   field (custom GLSL) standing in for "structure becoming
   something" — replaces the old static wireframe grid
   ============================================================ */
(function initHeroCanvas(){
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || !window.THREE) return;
  if (prefersReduced) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 1.4, 6.2);

  function size(){
    const hero = document.getElementById('hero');
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (bgMesh) bgMesh.material.uniforms.uAspect.value = w / h;
  }

  /* -------- shader plane: animated aurora / plasma field -------- */
  const bgUniforms = {
    uTime: { value: 0 },
    uAspect: { value: 1 },
    uColorBg: { value: new THREE.Color(0x0a2a63) },   // deep sky blue
    uColorA: { value: new THREE.Color(0x5fb3ff) },    // mid sky blue
    uColorB: { value: new THREE.Color(0xffffff) }     // soft cloud white
  };
  const bgMat = new THREE.ShaderMaterial({
    uniforms: bgUniforms,
    depthWrite: false,
    vertexShader: `
      varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision mediump float;
      varying vec2 vUv;
      uniform float uTime;
      uniform float uAspect;
      uniform vec3 uColorBg;
      uniform vec3 uColorA;
      uniform vec3 uColorB;

      float hash(vec2 p){
        return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123);
      }
      float noise(vec2 p){
        vec2 i = floor(p), f = fract(p);
        float a = hash(i), b = hash(i + vec2(1.0,0.0));
        float c = hash(i + vec2(0.0,1.0)), d = hash(i + vec2(1.0,1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a,b,u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }
      float fbm(vec2 p){
        float v = 0.0, amp = 0.55;
        for(int i = 0; i < 5; i++){
          v += amp * noise(p);
          p *= 2.02;
          amp *= 0.55;
        }
        return v;
      }
      void main(){
        vec2 uv = vUv;
        vec2 p = vec2(uv.x * uAspect, uv.y) * 2.2;
        p.x += uTime * 0.045;
        float n1 = fbm(p + fbm(p + uTime * 0.06));
        float n2 = fbm(p * 1.7 - vec2(uTime * 0.05, uTime * 0.03));

        vec3 col = uColorBg;
        col = mix(col, uColorA, smoothstep(0.2, 0.75, n1) * 0.75);
        col = mix(col, uColorB, smoothstep(0.55, 0.95, n2) * 0.35);

        float vig = smoothstep(1.3, 0.15, distance(uv, vec2(0.5, 0.38)) * 1.15);
        col = mix(col * 0.75, col, vig);

        gl_FragColor = vec4(col, 1.0);
      }
    `
  });
  const bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), bgMat);
  bgMesh.scale.set(30, 18, 1);
  bgMesh.position.set(0, 0.6, -6);
  scene.add(bgMesh);

  size();
  window.addEventListener('resize', size);

  // Floating particles (small nodes = "ideas")
  const particleCount = 60;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++){
    pPos[i*3] = (Math.random() - 0.5) * 10;
    pPos[i*3+1] = Math.random() * 3.2;
    pPos[i*3+2] = (Math.random() - 0.5) * 8 - 1;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pBase = Float32Array.from(pPos);
  const pMat = new THREE.PointsMaterial({ color: 0xf5f3ee, size: 0.035, transparent: true, opacity: 0.6 });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  /* -------- Low-poly paper plane, gliding across the sky on a loop -------- */
  const plane = new THREE.Group();
  const bodyShape = new THREE.Shape();
  bodyShape.moveTo(0.9, 0);
  bodyShape.lineTo(-0.7, 0.32);
  bodyShape.lineTo(-0.4, 0);
  bodyShape.lineTo(-0.7, -0.32);
  bodyShape.closePath();
  const bodyGeo2 = new THREE.ShapeGeometry(bodyShape);
  const planeMat = new THREE.MeshBasicMaterial({
    color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.95
  });
  const wingTop = new THREE.Mesh(bodyGeo2, planeMat);
  const wingBottom = new THREE.Mesh(bodyGeo2, planeMat.clone());
  wingBottom.material.color.set(0x4fd1ff);
  wingBottom.material.opacity = 0.75;
  wingTop.rotation.x = 0.28;
  wingBottom.rotation.x = -0.5;
  plane.add(wingTop, wingBottom);
  plane.scale.setScalar(0.85);
  scene.add(plane);
  const eagle = plane; // keep variable name for the animation loop below
  const wingL = wingTop, wingR = wingBottom, body = null;

  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5);
    mouseY = (e.clientY / window.innerHeight - 0.5);
  });

  const clock = new THREE.Clock();
  let running = true;

  // Pause rendering when hero is off-screen (perf)
  const heroEl = document.getElementById('hero');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      running = entries[0].isIntersecting;
    }).observe(heroEl);
  }

  function animate(){
    requestAnimationFrame(animate);
    if (!running) return;
    const t = clock.getElapsedTime();

    bgUniforms.uTime.value = t;

    const arr = pGeo.attributes.position.array;
    for (let i = 0; i < arr.length; i += 3){
      arr[i+1] = pBase[i+1] + Math.sin(t * 0.6 + pBase[i] * 0.5 + pBase[i+2] * 0.5) * 0.18;
    }
    pGeo.attributes.position.needsUpdate = true;
    particles.rotation.y = t * 0.02;

    /* paper-plane flight path: a slow, looping glide with a gentle wing tilt */
    const cycle = 16; // seconds per full loop
    const p = (t % cycle) / cycle;
    const angle = p * Math.PI * 2;
    eagle.position.x = Math.sin(angle) * 4.6;
    eagle.position.z = Math.cos(angle) * 2.6 - 1.5;
    eagle.position.y = 1.6 + Math.sin(angle * 2) * 0.35;
    eagle.rotation.y = -angle + Math.PI / 2;
    eagle.rotation.z = Math.sin(t * 2.4) * 0.06;
    const flap = Math.sin(t * 7) * 0.5;
    wingL.rotation.z = flap * 0.5;
    wingR.rotation.z = -flap * 0.5;
    eagle.visible = eagle.position.z < 3.5;

    camera.position.x += (mouseX * 1.2 - camera.position.x) * 0.02;
    camera.position.y += (1.4 - mouseY * 0.6 - camera.position.y) * 0.02;
    camera.lookAt(0, 0.4, 0);

    renderer.render(scene, camera);
  }
  animate();
})();

/* ============================================================
   THREE.JS — engineering "layers" visual: stacked translucent
   planes (frontend / backend / infrastructure) that separate
   and rotate slightly as the section scrolls into view
   ============================================================ */
(function initStackCanvas(){
  const canvas = document.getElementById('stackCanvas');
  if (!canvas || !window.THREE) return;
  if (prefersReduced) return;

  const wrap = canvas.parentElement;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
  camera.position.set(2.4, 2.0, 4.2);
  camera.lookAt(0, 0, 0);

  function size(){
    const w = wrap.clientWidth, h = wrap.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  size();
  window.addEventListener('resize', size);

  const labels = ['Frontend', 'Backend', 'Infrastructure'];
  const colors = [0xf5f3ee, 0xc6a468, 0x8c8c86];
  const group = new THREE.Group();
  const layers = [];

  labels.forEach((label, i) => {
    const geo = new THREE.PlaneGeometry(2.4, 1.5, 12, 8);
    const mat = new THREE.MeshBasicMaterial({
      color: colors[i], wireframe: true, transparent: true, opacity: 0.5
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2.6;
    mesh.position.y = i * 0.55 - 0.5;
    mesh.userData.baseY = mesh.position.y;
    group.add(mesh);
    layers.push(mesh);
  });
  scene.add(group);
  group.rotation.y = 0.5;

  // Scroll-tied separation + rotation
  if (window.ScrollTrigger) {
    ScrollTrigger.create({
      trigger: '.eng-3d',
      start: 'top 85%',
      end: 'bottom 30%',
      scrub: 0.6,
      onUpdate: (self) => {
        layers.forEach((mesh, i) => {
          mesh.position.y = mesh.userData.baseY + self.progress * i * 0.35;
        });
        group.rotation.y = 0.5 + self.progress * 0.9;
      }
    });
  }

  let running = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => { running = entries[0].isIntersecting; })
      .observe(wrap);
  }

  const clock = new THREE.Clock();
  function animate(){
    requestAnimationFrame(animate);
    if (!running) return;
    const t = clock.getElapsedTime();
    group.position.y = Math.sin(t * 0.5) * 0.05;
    renderer.render(scene, camera);
  }
  animate();
})();

/* ============================================================
   THREE.JS — "differentiator" living 3D piece: a wireframe
   icosahedron (the idea) with a small satellite node orbiting it
   (the detail nobody asked for), in the contrast accent color
   ============================================================ */
(function initDiffCanvas(){
  const canvas = document.getElementById('diffCanvas');
  if (!canvas || !window.THREE) return;
  if (prefersReduced) return;

  const wrap = canvas.parentElement;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 20);
  camera.position.set(0, 0, 3.4);

  function size(){
    const w = wrap.clientWidth, h = wrap.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  size();
  window.addEventListener('resize', size);

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.85, 0),
    new THREE.MeshBasicMaterial({ color: 0x4fd1ff, wireframe: true, transparent: true, opacity: 0.75 })
  );
  scene.add(core);

  const satellite = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xf5f3ee })
  );
  const orbit = new THREE.Group();
  orbit.add(satellite);
  satellite.position.set(1.3, 0, 0);
  orbit.rotation.x = 0.5;
  scene.add(orbit);

  let running = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => { running = entries[0].isIntersecting; }).observe(wrap);
  }

  let targetRotX = 0.15, targetRotY = 0;
  wrap.addEventListener('mousemove', (e) => {
    const r = wrap.getBoundingClientRect();
    targetRotY = ((e.clientX - r.left) / r.width - 0.5) * 1.4;
    targetRotX = 0.15 - ((e.clientY - r.top) / r.height - 0.5) * 1.0;
  });

  const clock = new THREE.Clock();
  function animate(){
    requestAnimationFrame(animate);
    if (!running) return;
    const t = clock.getElapsedTime();
    core.rotation.x += (targetRotX - core.rotation.x) * 0.04;
    core.rotation.y += (targetRotY + t * 0.25 - core.rotation.y) * 0.04;
    orbit.rotation.y = t * 1.1;
    satellite.position.setLength(1.3 + Math.sin(t * 2) * 0.05);
    renderer.render(scene, camera);
  }
  animate();
})();
