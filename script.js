/* ═══════════════════════════════════════════════════════════
   ROELOF JUNIOR HAAR — PORTFOLIO
   script.js — NEO-BRUTALISM REBRAND

   TABLE OF CONTENTS
   1.  Custom Cursor
   2.  Navigation (hide on scroll down, show on scroll up)
   3.  Hero Entrance Animation
   4.  Scroll Reveal (IntersectionObserver)
   5.  Contact Form (async Formspree submission)
   6.  Stagger Animations
   7.  Video Fallback Links
   8.  Werk-dropdown
   9.  3D-tilt + hero-camera
   10. Kopieer e-mail + lokale tijd
   11. Init
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
    // na de intrede mag de regel weer overlopen (de lime stip achter de punt)
    setTimeout(() => {
      word.closest('.hero__line')?.classList.add('is-open');
    }, BASE_DELAY + i * 120 + 700);
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
      // threshold 0: ook secties die hoger zijn dan het scherm komen tevoorschijn
      threshold: 0,
      rootMargin: '0px 0px -60px 0px',
    }
  );

  revealEls.forEach(el => observer.observe(el));
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
   15. Klik-om-te-kopiëren op het e-mailadres
───────────────────────────────────────── */
function initCopyEmail() {
  const link = document.querySelector('.contact__email');
  if (!link || !navigator.clipboard) return;

  const email = link.textContent.trim();
  const hint = document.createElement('span');
  hint.className = 'contact__copy-hint';
  hint.textContent = 'klik om te kopiëren';
  link.insertAdjacentElement('afterend', hint);

  link.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(email);
      hint.textContent = 'gekopieerd ✓';
      hint.classList.add('is-done');
      setTimeout(() => {
        hint.textContent = 'klik om te kopiëren';
        hint.classList.remove('is-done');
      }, 2200);
    } catch {
      window.location.href = link.href;
    }
  });
}

/* ─────────────────────────────────────────
   16. Lokale tijd in het hero-label
───────────────────────────────────────── */
function initLocalTime() {
  const el = document.getElementById('heroTime');
  if (!el) return;
  const fmt = new Intl.DateTimeFormat('nl-NL', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Amsterdam',
  });
  const tick = () => { el.textContent = `${fmt.format(new Date())} NL`; };
  tick();
  setInterval(tick, 30000);
}

/* ─────────────────────────────────────────
   17. Doova-screenshots: badge alleen als er echt iets te scrollen valt
───────────────────────────────────────── */
function initShotFrames() {
  document.querySelectorAll('.dv-shot__frame').forEach((frame) => {
    const img = frame.querySelector('img');
    if (!img) return;
    const check = () => {
      if (img.naturalHeight && img.clientHeight >= img.naturalHeight * (img.clientWidth / img.naturalWidth) - 2) {
        frame.classList.add('dv-shot__frame--fits');
      }
    };
    if (img.complete) check(); else img.addEventListener('load', check, { once: true });
  });
}

/* ─────────────────────────────────────────
   11. Init
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initNav();
  initHeroAnimation();
  initScrollReveal();
  initContactForm();
  initStaggerAnimations();
  initVideoFallbackLinks();
  initNavDropdown();
  initCardTilt();
  initHero3D();
  initCopyEmail();
  initLocalTime();
  initShotFrames();
});
