/* ══════════════════════════════════════════════
   THREE.JS HERO ANIMATION
   - Floating gold particle field + rotating rings
══════════════════════════════════════════════ */
(function initThree() {
  const canvas = document.getElementById('three-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 5);

  // Gold color
  const goldColor = new THREE.Color(0xc9a84c);

  // ── Particle field
  const particleCount = 800;
  const pGeom = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 18;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    sizes[i] = Math.random() * 2 + 0.5;
  }
  pGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pGeom.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const pMat = new THREE.PointsMaterial({
    color: goldColor,
    size: 0.04,
    transparent: true,
    opacity: 0.45,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(pGeom, pMat);
  scene.add(particles);

  // ── Floating rings
  const rings = [];
  const ringData = [
    { radius: 2.5, tube: 0.005, opacity: 0.2, speed: 0.003 },
    { radius: 1.8, tube: 0.004, opacity: 0.15, speed: -0.005 },
    { radius: 3.5, tube: 0.003, opacity: 0.1,  speed: 0.002 },
  ];
  ringData.forEach(d => {
    const geom = new THREE.TorusGeometry(d.radius, d.tube, 16, 100);
    const mat  = new THREE.MeshBasicMaterial({ color: goldColor, transparent: true, opacity: d.opacity });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.rotation.x = Math.PI / 4 + Math.random() * 0.5;
    mesh.rotation.y = Math.random() * Math.PI;
    mesh.userData.speed = d.speed;
    scene.add(mesh);
    rings.push(mesh);
  });

  // ── Mouse parallax
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 0.5;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.5;
  });

  // ── Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ── Animation loop
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Drift particles slowly
    particles.rotation.y = t * 0.02;
    particles.rotation.x = t * 0.01;

    // Rotate rings
    rings.forEach(r => {
      r.rotation.z += r.userData.speed;
      r.rotation.y += r.userData.speed * 0.5;
    });

    // Mouse parallax on camera
    camera.position.x += (mouseX - camera.position.x) * 0.03;
    camera.position.y += (-mouseY - camera.position.y) * 0.03;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();
})();


/* ══════════════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════════════ */
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursor-ring');
let cx = 0, cy = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; cursor.style.left = cx + 'px'; cursor.style.top = cy + 'px'; });
(function animRing() { rx += (cx - rx) * 0.12; ry += (cy - ry) * 0.12; ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; requestAnimationFrame(animRing); })();


/* ══════════════════════════════════════════════
   NAVIGATION
══════════════════════════════════════════════ */
const navEl = document.getElementById('nav');
window.addEventListener('scroll', () => navEl.classList.toggle('scrolled', scrollY > 60));

const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
function closeMobileMenu() { mobileMenu.classList.remove('open'); }


/* ══════════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════════ */
document.querySelectorAll('.reveal').forEach(el => {
  new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 }).observe(el);
});


/* ══════════════════════════════════════════════
   HERO ENTRANCE ANIMATION
══════════════════════════════════════════════ */
['.hero-eyebrow', '.hero-title', '.hero-sub', '.hero-skills', '.hero-actions'].forEach((sel, i) => {
  const el = document.querySelector(sel);
  if (!el) return;
  el.style.opacity = '0';
  el.style.transform = 'translateY(36px)';
  setTimeout(() => {
    el.style.transition = 'opacity .9s ease, transform .9s ease';
    el.style.opacity = '1';
    el.style.transform = 'none';
  }, [200, 400, 620, 820, 1000][i]);
});


/* ══════════════════════════════════════════════
   COUNTER ANIMATION (Stats)
══════════════════════════════════════════════ */
document.querySelectorAll('[data-count]').forEach(el => {
  const target = parseInt(el.dataset.count);
  const observer = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    observer.disconnect();
    let current = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current + (target >= 100 ? '+' : '+');
      if (current >= target) clearInterval(timer);
    }, 25);
  });
  observer.observe(el);
});


/* ══════════════════════════════════════════════
   CAROUSEL FACTORY
   Creates a self-contained carousel for each section.
   Parameters:
     trackId  — id of the .carousel-track element
     prevId   — id of the prev button
     nextId   — id of the next button
     curId    — id of the current counter span
     totId    — id of the total counter span
     dotsId   — id of the dots container
     autoMs   — milliseconds between auto-scroll (0 = off)
══════════════════════════════════════════════ */
function makeCarousel(trackId, prevId, nextId, curId, totId, dotsId, autoMs) {
  const track  = document.getElementById(trackId);
  const slides = [...track.children];
  const N      = slides.length;

  // Set total counter
  document.getElementById(totId).textContent = String(N).padStart(2, '0');

  // Build dots
  const dotsContainer = document.getElementById(dotsId);
  slides.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(d);
  });

  let current = 0;

  // Calculate how wide one slide is (including gap)
  function slideWidth() {
    const gap = parseInt(getComputedStyle(track).gap) || 24;
    return slides[0].getBoundingClientRect().width + gap;
  }

  // Move to slide index
  function goTo(idx) {
    current = ((idx % N) + N) % N;
    track.style.transform = 'translateX(-' + (current * slideWidth()) + 'px)';
    document.getElementById(curId).textContent = String(current + 1).padStart(2, '0');
    dotsContainer.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  // Buttons
  document.getElementById(prevId).addEventListener('click', () => goTo(current - 1));
  document.getElementById(nextId).addEventListener('click', () => goTo(current + 1));

  // Recalculate on resize
  window.addEventListener('resize', () => goTo(current));

  // Drag / swipe support
  let dragStart = 0, dragDelta = 0, isDragging = false;
  track.addEventListener('pointerdown', e => {
    isDragging = true; dragStart = e.clientX;
    track.classList.add('dragging');
    track.setPointerCapture(e.pointerId);
  });
  track.addEventListener('pointermove', e => {
    if (!isDragging) return;
    dragDelta = e.clientX - dragStart;
    track.style.transform = 'translateX(' + (-(current * slideWidth()) + dragDelta) + 'px)';
  });
  track.addEventListener('pointerup', () => {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('dragging');
    if (dragDelta < -60) goTo(current + 1);
    else if (dragDelta > 60) goTo(current - 1);
    else goTo(current);
    dragDelta = 0;
  });
  track.addEventListener('pointercancel', () => { isDragging = false; track.classList.remove('dragging'); goTo(current); });

  // Auto-scroll
  if (autoMs > 0) {
    let timer = setInterval(() => goTo(current + 1), autoMs);
    // Pause on hover
    track.addEventListener('mouseenter', () => clearInterval(timer));
    track.addEventListener('mouseleave', () => { timer = setInterval(() => goTo(current + 1), autoMs); });
  }
}

// Initialize all 6 carousels with 4-second auto-scroll
makeCarousel('s1-track', 's1-prev', 's1-next', 's1-cur', 's1-tot', 's1-dots', 4000);
makeCarousel('s2-track', 's2-prev', 's2-next', 's2-cur', 's2-tot', 's2-dots', 4500);
makeCarousel('s3-track', 's3-prev', 's3-next', 's3-cur', 's3-tot', 's3-dots', 3800);
makeCarousel('s4-track', 's4-prev', 's4-next', 's4-cur', 's4-tot', 's4-dots', 5000);
makeCarousel('s5-track', 's5-prev', 's5-next', 's5-cur', 's5-tot', 's5-dots', 4200);
makeCarousel('s6-track', 's6-prev', 's6-next', 's6-cur', 's6-tot', 's6-dots', 3500);
