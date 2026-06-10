/* ════════════════════════════════════════════════════════════
   ROELOF JUNIOR HAAR / PORTFOLIO
   script.js / "ATELIER" v2 (no external libraries)

   1.  Custom cursor
   2.  Navigation (hide on scroll down)
   3.  Hero entrance + liquid canvas
   4.  Scroll reveals (IntersectionObserver)
   5.  Tool bars
   6.  Work list hover preview
   7.  YouTube facade (click-to-play)
   8.  Gallery lightbox
   9.  Contact form (Formspree)
   10. Init
   ════════════════════════════════════════════════════════════ */

'use strict';

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── 1. Custom cursor ─────────────────────────────────────── */
function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let mouseX = -100, mouseY = -100;
  let ringX  = -100, ringY  = -100;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
  });

  const LERP = 0.22;
  (function animateRing() {
    ringX += (mouseX - ringX) * LERP;
    ringY += (mouseY - ringY) * LERP;
    ring.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;
    requestAnimationFrame(animateRing);
  })();

  const interactive = 'a, button, [role="button"], input, textarea, label';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactive)) document.body.classList.add('cursor--hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactive)) document.body.classList.remove('cursor--hover');
  });
  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
}

/* ── 2. Navigation ────────────────────────────────────────── */
function initNav() {
  const nav = document.getElementById('siteNav');
  if (!nav) return;

  let lastY = 0, ticking = false;
  const THRESHOLD = 90;

  function update() {
    const y = window.scrollY;
    if (y > THRESHOLD && y > lastY) nav.classList.add('site-nav--hidden');
    else nav.classList.remove('site-nav--hidden');
    lastY = y;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
}

/* ── 3a. Hero entrance ────────────────────────────────────── */
function initHero() {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => document.body.classList.add('is-loaded'));
  });
}

/* split the hero name into letters for the per-letter hover */
function initHeroChars() {
  const inners = document.querySelectorAll('.hero__name .hero__line-inner');
  if (!inners.length) return;

  inners.forEach(inner => {
    const walker = document.createTreeWalker(inner, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.textContent.trim() && !node.parentElement.closest('.hero__period')) {
        textNodes.push(node);
      }
    }
    textNodes.forEach(node => {
      const frag = document.createDocumentFragment();
      for (const ch of node.textContent) {
        if (ch.trim()) {
          const span = document.createElement('span');
          span.className = 'hero__char';
          span.textContent = ch;
          frag.appendChild(span);
        } else {
          frag.appendChild(document.createTextNode(ch));
        }
      }
      node.replaceWith(frag);
    });
  });

  const period = document.querySelector('.hero__period');
  if (period) period.classList.add('hero__char');
}

/* ── 3b. Hero liquid canvas ───────────────────────────────────
   Angular "liquid" shader in paper/terracotta tones that chases
   the pointer. Plain WebGL, no dependencies, DPR capped, paused
   when the hero is off screen. */
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  const hero = document.querySelector('.hero');
  if (!canvas || !hero) return;
  if (REDUCED_MOTION) { canvas.remove(); return; }

  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) { canvas.remove(); return; }

  const VERT = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }`;

  const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_t;
uniform vec2 u_m;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, amp = 0.5;
  for (int i = 0; i < 4; i++) { v += amp * noise(p); p *= 2.03; amp *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float asp = u_res.x / u_res.y;
  vec2 p = vec2(uv.x * asp, uv.y);
  vec2 m = vec2(u_m.x * asp, u_m.y);
  float t = u_t * 0.07;
  float dm = distance(p, m);

  /* domain warp, quantized for a faceted, angular feel */
  vec2 w = vec2(fbm(p * 2.0 + t), fbm(p * 2.0 - t + 5.2));
  w = floor(w * 5.0) / 5.0;
  float pull = smoothstep(0.95, 0.0, dm);
  float n = fbm(p * 2.4 + w * 1.5 + (m - p) * 0.45 * pull);
  float q = floor(n * 8.0) / 8.0;

  vec3 paper  = vec3(0.941, 0.933, 0.902);
  vec3 cream  = vec3(0.988, 0.984, 0.970);
  vec3 orange = vec3(0.851, 0.467, 0.341);
  vec3 ink    = vec3(0.078, 0.078, 0.075);

  vec3 col = mix(paper, cream, q * 0.9);

  /* faint facet edges */
  float e = abs(fract(n * 8.0) - 0.5) * 2.0;
  col = mix(col, ink, (1.0 - smoothstep(0.0, 0.22, e)) * 0.045);

  /* angular liquid blob chasing the pointer */
  float blob = smoothstep(0.46, 0.05, dm + (q - 0.5) * 0.30);
  col = mix(col, orange, blob * 0.5);

  /* warm halo around the blob */
  col = mix(col, orange, smoothstep(0.8, 0.22, dm) * 0.07);

  gl_FragColor = vec4(col, 1.0);
}`;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
    return s;
  }

  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) { canvas.remove(); return; }

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); return; }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, 'u_res');
  const uT   = gl.getUniformLocation(prog, 'u_t');
  const uM   = gl.getUniformLocation(prog, 'u_m');

  const DPR = Math.min(window.devicePixelRatio || 1, 1.25);
  function resize() {
    const w = Math.round(hero.clientWidth * DPR);
    const h = Math.round(hero.clientHeight * DPR);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  /* pointer tracking with snappy lerp; idle drift when untouched */
  let tx = 0.68, ty = 0.62, mx = tx, my = ty;
  let lastMove = 0;

  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width;
    ty = 1 - (e.clientY - r.top) / r.height;
    lastMove = performance.now();
  }, { passive: true });

  let visible = true;
  new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; }, { threshold: 0 }).observe(hero);

  const start = performance.now();
  (function frame(now) {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) return;

    const t = (now - start) / 1000;
    if (now - lastMove > 3000) {
      tx = 0.5 + 0.34 * Math.sin(t * 0.21);
      ty = 0.55 + 0.28 * Math.cos(t * 0.16);
    }
    mx += (tx - mx) * 0.22;
    my += (ty - my) * 0.22;

    resize();
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uT, t);
    gl.uniform2f(uM, mx, my);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  })(start);
}

/* ── 4. Scroll reveals ────────────────────────────────────── */
function initReveals() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  if (REDUCED_MOTION || !('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
  els.forEach(el => io.observe(el));
}

/* ── 5. Tool bars ─────────────────────────────────────────── */
function initToolBars() {
  const tools = document.querySelector('.tools');
  const bars = document.querySelectorAll('.tool__bar');
  if (!tools || !bars.length) return;

  const fill = () => bars.forEach((bar, i) => {
    setTimeout(() => { bar.style.width = `${bar.dataset.width || 0}%`; }, REDUCED_MOTION ? 0 : i * 90);
  });

  if (REDUCED_MOTION) return fill();

  const io = new IntersectionObserver((entries) => {
    if (entries.some(e => e.isIntersecting)) { fill(); io.disconnect(); }
  }, { threshold: 0.3 });
  io.observe(tools);
}

/* ── 6. Work list hover preview ───────────────────────────── */
function initWorkPreview() {
  const preview = document.getElementById('workPreview');
  const rows = document.querySelectorAll('.work-row[data-preview]');
  if (!preview || !rows.length) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const imgs = new Map();
  rows.forEach(row => {
    const img = document.createElement('img');
    img.src = row.dataset.preview;
    img.alt = '';
    img.decoding = 'async';
    preview.appendChild(img);
    imgs.set(row, img);
  });

  let targetX = 0, targetY = 0, x = 0, y = 0, raf = null;

  function loop() {
    x += (targetX - x) * 0.18;
    y += (targetY - y) * 0.18;
    preview.style.transform = `translate(${x}px, ${y}px) scale(1)`;
    raf = requestAnimationFrame(loop);
  }

  const list = document.querySelector('.work-list');
  list.addEventListener('mousemove', (e) => {
    targetX = e.clientX + 28;
    targetY = e.clientY - 100;
  });

  rows.forEach(row => {
    row.addEventListener('mouseenter', (e) => {
      imgs.forEach(img => img.classList.remove('is-current'));
      imgs.get(row).classList.add('is-current');
      x = targetX = e.clientX + 28;
      y = targetY = e.clientY - 100;
      preview.classList.add('is-active');
      if (!raf) loop();
    });
    row.addEventListener('mouseleave', () => {
      preview.classList.remove('is-active');
      cancelAnimationFrame(raf);
      raf = null;
    });
  });
}

/* ── 7. YouTube facade ────────────────────────────────────── */
function initYouTubeFacades() {
  document.querySelectorAll('.yt[data-id]').forEach(facade => {
    const btn = facade.querySelector('.yt__btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const id = facade.dataset.id;
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      iframe.title = facade.dataset.title || 'YouTube video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      facade.innerHTML = '';
      facade.appendChild(iframe);
    }, { once: true });
  });
}

/* ── 8. Gallery lightbox ──────────────────────────────────── */
function initLightbox() {
  const items = Array.from(document.querySelectorAll('.gallery__item img'));
  if (!items.length) return;

  const box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-label', 'Fotoweergave');
  box.innerHTML = `
    <button class="lightbox__btn lightbox__btn--prev" type="button" aria-label="Vorige foto">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
    <img class="lightbox__img" alt="" />
    <button class="lightbox__btn lightbox__btn--next" type="button" aria-label="Volgende foto">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>
    </button>
    <button class="lightbox__close" type="button" aria-label="Sluiten">✕</button>
    <span class="lightbox__counter"></span>`;
  document.body.appendChild(box);

  const imgEl    = box.querySelector('.lightbox__img');
  const counter  = box.querySelector('.lightbox__counter');
  const prevBtn  = box.querySelector('.lightbox__btn--prev');
  const nextBtn  = box.querySelector('.lightbox__btn--next');
  const closeBtn = box.querySelector('.lightbox__close');

  let index = 0;

  function show(i) {
    index = (i + items.length) % items.length;
    imgEl.src = items[index].src;
    imgEl.alt = items[index].alt || '';
    counter.textContent = `${index + 1} / ${items.length}`;
  }
  function open(i) {
    show(i);
    box.classList.add('is-open');
    document.body.classList.add('lightbox-open');
  }
  function close() {
    box.classList.remove('is-open');
    document.body.classList.remove('lightbox-open');
  }

  items.forEach((img, i) => {
    img.closest('.gallery__item').addEventListener('click', () => open(i));
  });

  prevBtn.addEventListener('click', () => show(index - 1));
  nextBtn.addEventListener('click', () => show(index + 1));
  closeBtn.addEventListener('click', close);
  box.addEventListener('click', (e) => { if (e.target === box) close(); });

  document.addEventListener('keydown', (e) => {
    if (!box.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });

  /* swipe on touch */
  let startX = null;
  box.addEventListener('pointerdown', (e) => { startX = e.clientX; }, { passive: true });
  box.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    startX = null;
  }, { passive: true });
}

/* ── 9. Contact form ──────────────────────────────────────── */
function initContactForm() {
  const form   = document.getElementById('contactForm');
  const btn    = document.getElementById('formBtn');
  const status = document.getElementById('formStatus');
  if (!form || !btn || !status) return;

  const IDLE_LABEL = 'Stuur bericht →';

  function setStatus(msg, type) {
    status.textContent = msg;
    status.style.color = type === 'error' ? '#E8A48E' : type === 'success' ? '#D97757' : '';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name    = form.querySelector('#name');
    const email   = form.querySelector('#email');
    const message = form.querySelector('#message');

    if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
      return setStatus('Vul alle velden in.', 'error');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      return setStatus('Vul een geldig e-mailadres in.', 'error');
    }

    btn.disabled = true;
    btn.textContent = 'Versturen…';
    setStatus('', 'clear');

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        btn.textContent = 'Verstuurd ✓';
        setStatus('Bedankt! Ik neem snel contact op.', 'success');
        form.reset();
        setTimeout(() => {
          btn.textContent = IDLE_LABEL;
          btn.disabled = false;
          setStatus('', 'clear');
        }, 6000);
      } else {
        const data = await res.json().catch(() => ({}));
        const msg = (data?.errors || []).map(err => err.message).join(', ')
          || 'Er ging iets mis. Probeer het opnieuw.';
        setStatus(msg, 'error');
        btn.textContent = IDLE_LABEL;
        btn.disabled = false;
      }
    } catch (err) {
      setStatus('Netwerkfout. Controleer je verbinding.', 'error');
      btn.textContent = IDLE_LABEL;
      btn.disabled = false;
    }
  });

  form.addEventListener('input', () => {
    if (status.textContent && !status.textContent.includes('✓')) setStatus('', 'clear');
  });
}

/* ── 10. Init ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initNav();
  initHero();
  initHeroChars();
  initHeroCanvas();
  initReveals();
  initToolBars();
  initWorkPreview();
  initYouTubeFacades();
  initLightbox();
  initContactForm();
});
