/* ═══════════════════════════════════════════════════════════
   ROELOF JUNIOR HAAR — PORTFOLIO
   script.js — NEO-BRUTALISM REBRAND

   TABLE OF CONTENTS
   1.  Custom Cursor
   2.  Navigation (hide on scroll down, show on scroll up)
   3.  Hero Entrance Animation
   4.  Scroll Reveal (IntersectionObserver)
   5.  Skill Bar Animation
   6.  Contact Form (async Formspree submission)
   7.  Stagger Animations
   8.  Magnetic Hover Effects
   9.  Video Fallback Links
   10. Init
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────
   1. Custom Cursor
───────────────────────────────────────── */
function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');

  if (!dot || !ring) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let mouseX = -100, mouseY = -100;
  let ringX  = -100, ringY  = -100;

  document.addEventListener('pointermove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
  }, { passive: true });

  const LERP = 0.12;

  function animateRing() {
    ringX += (mouseX - ringX) * LERP;
    ringY += (mouseY - ringY) * LERP;
    ring.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  const interactiveSelector = 'a, button, [role="button"], input, textarea, label, .project-card';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelector)) {
      document.body.classList.add('cursor--hover');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelector)) {
      document.body.classList.remove('cursor--hover');
    }
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });
}

/* ─────────────────────────────────────────
   2. Navigation
───────────────────────────────────────── */
function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  let lastScrollY = 0;
  let ticking     = false;
  const THRESHOLD = 80;

  function updateNav() {
    const currentY = window.scrollY;

    if (currentY > THRESHOLD) {
      if (currentY > lastScrollY) {
        nav.classList.add('nav--hidden');
      } else {
        nav.classList.remove('nav--hidden');
      }
    } else {
      nav.classList.remove('nav--hidden');
    }

    lastScrollY = currentY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });
}

/* ─────────────────────────────────────────
   3. Hero Entrance Animation
───────────────────────────────────────── */
function initHeroAnimation() {
  const words  = document.querySelectorAll('.hero__word');
  const role   = document.querySelector('.hero__role');
  const scroll = document.querySelector('.hero__scroll');
  const labels = document.querySelectorAll('.hero__label');

  const BASE_DELAY = 120;

  words.forEach((word, i) => {
    setTimeout(() => {
      word.classList.add('is-visible');
    }, BASE_DELAY + i * 120);
  });

  // Animate labels with stagger
  labels.forEach((label, i) => {
    label.style.opacity = '0';
    label.style.transform = 'scale(0.8)';
    label.style.transition = 'opacity 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    setTimeout(() => {
      label.style.opacity = '1';
      label.style.transform = 'scale(1)';
    }, 400 + i * 100);
  });

  if (role) {
    setTimeout(() => {
      role.classList.add('is-visible');
    }, BASE_DELAY + words.length * 120 + 200);
  }

  if (scroll) {
    setTimeout(() => {
      scroll.classList.add('is-visible');
    }, BASE_DELAY + words.length * 120 + 620);
  }
}

/* ─────────────────────────────────────────
   4. Scroll Reveal (IntersectionObserver)
───────────────────────────────────────── */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealEls.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealEls.forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────
   5. Skill Bar Animation
───────────────────────────────────────── */
function initSkillBars() {
  const bars = document.querySelectorAll('.skill__bar');
  if (!bars.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    bars.forEach(bar => {
      bar.style.width = `${bar.dataset.width || 0}%`;
    });
    return;
  }

  let animated = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          bars.forEach((bar, i) => {
            const target = bar.dataset.width || '0';
            setTimeout(() => {
              bar.style.width = `${target}%`;
            }, i * 150);
          });
          observer.disconnect();
        }
      });
    },
    { threshold: 0.4 }
  );

  const skillsContainer = document.querySelector('.skills') || document.querySelector('#about');
  if (skillsContainer) observer.observe(skillsContainer);
}

/* ─────────────────────────────────────────
   6. Contact Form
───────────────────────────────────────── */
function initContactForm() {
  const form   = document.getElementById('contactForm');
  const btn    = document.getElementById('formBtn');
  const status = document.getElementById('formStatus');

  if (!form || !btn || !status) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput    = form.querySelector('#name');
    const emailInput   = form.querySelector('#email');
    const messageInput = form.querySelector('#message');

    if (
      !nameInput.value.trim() ||
      !emailInput.value.trim() ||
      !messageInput.value.trim()
    ) {
      setStatus('Vul alle velden in.', 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
      setStatus('Vul een geldig e-mailadres in.', 'error');
      return;
    }

    btn.disabled    = true;
    btn.textContent = 'VERSTUREN...';
    setStatus('', 'clear');

    try {
      const response = await fetch(form.action, {
        method:  'POST',
        body:    new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        btn.textContent = 'VERSTUURD ✓';
        setStatus("Bedankt! Ik neem snel contact op.", 'success');
        form.reset();

        setTimeout(() => {
          btn.textContent = 'STUUR BERICHT →';
          btn.disabled    = false;
          setStatus('', 'clear');
        }, 6000);

      } else {
        const data = await response.json().catch(() => ({}));
        const msg  = (data?.errors || []).map(err => err.message).join(', ')
          || 'Er ging iets mis. Probeer het opnieuw.';
        setStatus(msg, 'error');
        btn.textContent = 'STUUR BERICHT →';
        btn.disabled    = false;
      }

    } catch (err) {
      console.error('Form error:', err);
      setStatus('Netwerkfout. Controleer je verbinding.', 'error');
      btn.textContent = 'STUUR BERICHT →';
      btn.disabled    = false;
    }
  });

  form.addEventListener('input', () => {
    if (status.textContent && !status.textContent.includes('✓')) {
      setStatus('', 'clear');
    }
  });

  function setStatus(msg, type) {
    status.textContent = msg;
    if (type === 'error')   status.style.color = '#FF4F81';
    if (type === 'success') status.style.color = '#06D6A0';
    if (type === 'clear')   status.style.color = '';
  }
}

/* ─────────────────────────────────────────
   7. Stagger Card Animations
───────────────────────────────────────── */
function initStaggerAnimations() {
  const cards = document.querySelectorAll('.project-card');
  if (!cards.length) return;

  cards.forEach((card, i) => {
    // Random slight rotation for brutalist feel
    const rotation = (Math.random() - 0.5) * 2;
    card.style.transform = `rotate(${rotation}deg)`;

    card.addEventListener('mouseenter', () => {
      card.style.transform = 'rotate(0deg) translate(-4px, -4px)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = `rotate(${rotation}deg)`;
    });
  });

  // Stagger section labels
  const sectionLabels = document.querySelectorAll('.section-label');
  sectionLabels.forEach((label, i) => {
    label.style.animationDelay = `${i * 0.5}s`;
  });
}

/* ─────────────────────────────────────────
   8. Parallax-light on scroll for decorative elements
───────────────────────────────────────── */
function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const hero = document.querySelector('.hero');
  if (!hero) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroHeight = hero.offsetHeight;

    if (scrollY < heroHeight) {
      const ratio = scrollY / heroHeight;
      // Parallax on hero pseudo-elements via CSS custom property
      hero.style.setProperty('--scroll-ratio', ratio);
    }
  }, { passive: true });
}

/* ─────────────────────────────────────────
   9. Video fallback links
───────────────────────────────────────── */
function initVideoFallbackLinks() {
  const videoBlocks = document.querySelectorAll('.video-block');
  if (!videoBlocks.length) return;

  videoBlocks.forEach((block) => {
    if (block.querySelector('.video-block__cta')) return;

    const iframe = block.querySelector('iframe[src*="youtube.com/embed/"]');
    const info = block.querySelector('.video-block__info');
    if (!iframe || !info) return;

    const match = iframe.src.match(/embed\/([^?&"/]+)/);
    if (!match?.[1]) return;

    const videoId = match[1];
    const link = document.createElement('a');
    link.href = `https://www.youtube.com/watch?v=${videoId}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'video-block__cta';
    link.textContent = 'Bekijk op YouTube';

    info.appendChild(link);
  });
}

/* ─────────────────────────────────────────
   10. Snake Game
───────────────────────────────────────── */
function initSnakeGame() {
  const canvas   = document.getElementById('snakeCanvas');
  if (!canvas) return;

  const ctx      = canvas.getContext('2d');
  const GRID     = 20;
  const SIZE     = 280;
  canvas.width   = SIZE;
  canvas.height  = SIZE;
  const CELL     = SIZE / GRID; // 14px per cell

  const overlay  = document.getElementById('snakeOverlay');
  const titleEl  = document.getElementById('snakeOverlayTitle');
  const subEl    = document.getElementById('snakeOverlaySub');
  const startBtn = document.getElementById('snakeStartBtn');
  const scoreEl  = document.getElementById('snakeScore');

  if (!overlay || !titleEl || !subEl || !startBtn || !scoreEl) return;

  const C = {
    bg:        '#F5F0E8',
    grid:      'rgba(26,26,26,0.05)',
    border:    '#1A1A1A',
    head:      '#A855F7',
    food:      ['#FF4F81','#CCFF00','#FF6B35','#4361EE','#FFD600','#06D6A0'],
  };

  let state = 'idle';
  let snake, dir, nextDir, food, score, gameLoop, foodColor, highScore = 0;

  function resetGame() {
    snake    = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    dir      = { x: 1, y: 0 };
    nextDir  = { x: 1, y: 0 };
    score    = 0;
    scoreEl.textContent = '0';
    spawnFood();
  }

  function spawnFood() {
    let pos;
    do {
      pos = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    } while (snake.some(s => s.x === pos.x && s.y === pos.y));
    food      = pos;
    foodColor = C.food[Math.floor(Math.random() * C.food.length)];
  }

  function drawCell(x, y, fill, radius) {
    const px = x * CELL + 1.5;
    const py = y * CELL + 1.5;
    const sz = CELL - 3;
    ctx.fillStyle   = fill;
    ctx.strokeStyle = C.border;
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(px, py, sz, sz, radius);
    } else {
      ctx.rect(px, py, sz, sz);
    }
    ctx.fill();
    ctx.stroke();
  }

  function drawCanvas() {
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, SIZE, SIZE);

    // Subtle grid lines
    ctx.strokeStyle = C.grid;
    ctx.lineWidth   = 0.5;
    for (let i = 1; i < GRID; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(SIZE, i * CELL); ctx.stroke();
    }

    // Food
    drawCell(food.x, food.y, foodColor, 3);
    // Cross mark on food
    const fx = food.x * CELL + CELL / 2;
    const fy = food.y * CELL + CELL / 2;
    ctx.fillStyle = C.border;
    ctx.fillRect(fx - 1, fy - 4, 2, 8);
    ctx.fillRect(fx - 4, fy - 1, 8, 2);

    // Snake body (tail to head so head is on top)
    for (let i = snake.length - 1; i >= 0; i--) {
      const seg = snake[i];
      let fill;
      if (i === 0) {
        fill = C.head;
      } else {
        const t  = Math.min(i / snake.length, 1);
        const v  = Math.round(26 + t * 70);
        fill = `rgb(${v},${v},${v})`;
      }
      drawCell(seg.x, seg.y, fill, i === 0 ? 5 : 2);
    }
  }

  function step() {
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
      return gameOver();
    }
    if (snake.slice(0, -1).some(s => s.x === head.x && s.y === head.y)) {
      return gameOver();
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score++;
      if (score > highScore) highScore = score;
      scoreEl.textContent = score;
      spawnFood();
    } else {
      snake.pop();
    }

    drawCanvas();
  }

  function gameOver() {
    state = 'gameover';
    clearInterval(gameLoop);

    const wrap = canvas.closest('.snake-canvas-wrap');
    if (wrap) {
      wrap.style.borderColor = '#FF4F81';
      setTimeout(() => { wrap.style.borderColor = ''; }, 700);
    }

    titleEl.textContent  = 'GAME OVER';
    subEl.textContent    = `Score: ${score}${score > 0 && score === highScore ? ' ★' : ''}`;
    startBtn.textContent = 'OPNIEUW';
    overlay.style.display = 'flex';
  }

  function startGame() {
    resetGame();
    state = 'playing';
    overlay.style.display = 'none';
    drawCanvas();
    gameLoop = setInterval(step, 130);
  }

  startBtn.addEventListener('click', startGame);

  // Keyboard: WASD + arrow keys
  document.addEventListener('keydown', (e) => {
    if (state !== 'playing') {
      if (e.key === 'Enter') startGame();
      return;
    }
    switch (e.key) {
      case 'ArrowUp':    case 'w': case 'W': if (dir.y !== 1)  { nextDir = { x: 0, y: -1 }; e.preventDefault(); } break;
      case 'ArrowDown':  case 's': case 'S': if (dir.y !== -1) { nextDir = { x: 0, y:  1 }; e.preventDefault(); } break;
      case 'ArrowLeft':  case 'a': case 'A': if (dir.x !== 1)  { nextDir = { x: -1, y: 0 }; e.preventDefault(); } break;
      case 'ArrowRight': case 'd': case 'D': if (dir.x !== -1) { nextDir = { x:  1, y: 0 }; e.preventDefault(); } break;
    }
  });

  // D-pad buttons
  [
    ['snakeUp',    0, -1],
    ['snakeDown',  0,  1],
    ['snakeLeft', -1,  0],
    ['snakeRight', 1,  0],
  ].forEach(([id, dx, dy]) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    const move = () => {
      if (state !== 'playing') return;
      if (dx !== 0 && dir.x === -dx) return;
      if (dy !== 0 && dir.y === -dy) return;
      nextDir = { x: dx, y: dy };
    };
    btn.addEventListener('click', move);
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); move(); }, { passive: false });
  });

  // Render initial idle canvas
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.strokeStyle = C.grid;
  ctx.lineWidth   = 0.5;
  for (let i = 1; i < GRID; i++) {
    ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, SIZE); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(SIZE, i * CELL); ctx.stroke();
  }
}


/* ─────────────────────────────────────────
   12. Werk-dropdown (klik voor touch/keyboard, hover via CSS)
───────────────────────────────────────── */
function initNavDropdown() {
  document.querySelectorAll('.nav__item--dropdown').forEach((item) => {
    const btn = item.querySelector('.nav__drop-btn');
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', (e) => {
      if (!item.contains(e.target)) {
        item.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        item.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });
  });
}

/* ─────────────────────────────────────────
   13. 3D-tilt op projectkaarten
───────────────────────────────────────── */
function initCardTilt() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.querySelectorAll('.project-card__link').forEach((link) => {
    link.classList.add('tilt-3d');
    let raf = null;

    link.addEventListener('mousemove', (e) => {
      const r = link.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        link.style.transform = `rotateY(${px * 10}deg) rotateX(${py * -10}deg)`;
        raf = null;
      });
    });
    link.addEventListener('mouseleave', () => {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      link.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
      link.style.transform = 'rotateY(0deg) rotateX(0deg)';
      setTimeout(() => { link.style.transition = ''; }, 400);
    });
  });
}

/* ─────────────────────────────────────────
   14. 3D hero-camera parallax (volgt de muis)
───────────────────────────────────────── */
function initHero3D() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const scene = document.querySelector('.hero__camera-float');
  const hero = document.querySelector('.hero');
  if (!scene || !hero) return;

  // de CSS-drift-animatie overschrijft inline transforms — uitzetten,
  // de zweef-beweging zit nu in de JS-loop zelf
  scene.style.animation = 'none';

  let tx = 0, ty = 0, cx = 0, cy = 0;

  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 18;
    ty = ((e.clientY - r.top) / r.height - 0.5) * -18;
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; });

  (function loop(t) {
    cx += (tx - cx) * 0.09;
    cy += (ty - cy) * 0.09;
    const bobY = Math.sin((t || 0) / 1400) * 2.2;
    const bobX = Math.cos((t || 0) / 1900) * 1.4;
    scene.style.transform = `translateY(${bobY * 3}px) rotateY(${cx + bobX}deg) rotateX(${cy + bobY}deg)`;
    requestAnimationFrame(loop);
  })(0);
}

/* ─────────────────────────────────────────
   11. Init
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initNav();
  initHeroAnimation();
  initScrollReveal();
  initSkillBars();
  initContactForm();
  initStaggerAnimations();
  initParallax();
  initVideoFallbackLinks();
  initSnakeGame();
  initNavDropdown();
  initCardTilt();
  initHero3D();
});
