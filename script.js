/* ═══════════════════════════════════════════════════════════
   ROELOF JUNIOR HAAR — PORTFOLIO
   script.js · huisstijl "Golven" (2026-10)

   TABLE OF CONTENTS
   1.  Custom Cursor
   2.  Navigation (hide on scroll down, show on scroll up)
   3.  Scroll Reveal (IntersectionObserver)
   4.  Contact Form (async Formspree submission)
   5.  Video Fallback Links
   6.  Werk-dropdown
   7.  Licht dat de muis volgt (kaarten + regenboogknoppen)
   8.  Kopieer e-mail + lokale tijd
   9.  Init

   De hero-intrede zit volledig in CSS (geen JS nodig).
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
  let running = false;

  // de ring loopt snel bij (geen zweverig nasleepeffect) en de loop stopt zodra hij stilstaat
  const LERP = 0.38;

  function animateRing() {
    ringX += (mouseX - ringX) * LERP;
    ringY += (mouseY - ringY) * LERP;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    if (Math.abs(mouseX - ringX) > 0.2 || Math.abs(mouseY - ringY) > 0.2) {
      requestAnimationFrame(animateRing);
    } else {
      running = false;
    }
  }

  document.addEventListener('pointermove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    if (!running) {
      running = true;
      requestAnimationFrame(animateRing);
    }
  }, { passive: true });

  const interactiveSelector = 'a, button, [role="button"], input, textarea, label, .project-card';
  let hovering = false;

  // hover-status op de cursor zelf zetten: een class op body laat de hele pagina opnieuw stylen
  document.addEventListener('pointerover', (e) => {
    const on = !!e.target.closest(interactiveSelector);
    if (on !== hovering) {
      hovering = on;
      dot.classList.toggle('is-hover', on);
      ring.classList.toggle('is-hover', on);
    }
  }, { passive: true });

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

  const idleLabel = btn.innerHTML;

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
    btn.textContent = 'Versturen...';
    setStatus('', 'clear');

    try {
      const response = await fetch(form.action, {
        method:  'POST',
        body:    new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        btn.textContent = 'Verstuurd ✓';
        setStatus("Bedankt! Ik neem snel contact op.", 'success');
        form.reset();

        setTimeout(() => {
          btn.innerHTML = idleLabel;
          btn.disabled    = false;
          setStatus('', 'clear');
        }, 6000);

      } else {
        const data = await response.json().catch(() => ({}));
        const msg  = (data?.errors || []).map(err => err.message).join(', ')
          || 'Er ging iets mis. Probeer het opnieuw.';
        setStatus(msg, 'error');
        btn.innerHTML = idleLabel;
        btn.disabled    = false;
      }

    } catch (err) {
      console.error('Form error:', err);
      setStatus('Netwerkfout. Controleer je verbinding.', 'error');
      btn.innerHTML = idleLabel;
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
    status.classList.toggle('form-status--error', type === 'error');
    status.classList.toggle('form-status--success', type === 'success');
  }
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
   Licht dat de muis volgt: glow-kaarten en de regenboog-spot op knoppen.
   Eén listener voor de hele pagina; elke lichtbron in de keten krijgt --mx/--my.
   Houd deze selector gelijk aan de lijsten in style.css (sectie 8 en 9).
───────────────────────────────────────── */
const LIGHT_SELECTOR = [
  '.glow', '.project-card', '.bi-card',
  '.spot', '.btn', '.tool-chip', '.subpage__back', '.pw-filter', '.dv-link', '.video-block__cta',
  '.nav__links > li > a', '.nav__drop-btn', '.pw-lightbox__close',
].join(', ');

function initLight() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let last = null;
  let scheduled = false;

  document.addEventListener('pointermove', (e) => {
    last = e;
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      const ev = last;
      let el = ev.target instanceof Element ? ev.target.closest(LIGHT_SELECTOR) : null;
      while (el) {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${ev.clientX - r.left}px`);
        el.style.setProperty('--my', `${ev.clientY - r.top}px`);
        el = el.parentElement ? el.parentElement.closest(LIGHT_SELECTOR) : null;
      }
    });
  }, { passive: true });
}

/* ─────────────────────────────────────────
   Golven en zonnen staan stil zodra ze buiten beeld zijn
───────────────────────────────────────── */
function initPauseOffscreen() {
  const els = document.querySelectorAll('.waves, .page-showcase__art');
  if (!els.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle('is-paused', !entry.isIntersecting));
  }, { rootMargin: '100px 0px' });
  els.forEach((el) => io.observe(el));
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
   17. Kopieerknop bij een installatieregel
───────────────────────────────────────── */
function initCopyCommand() {
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    const code = btn.parentElement.querySelector('code');
    const label = btn.textContent;
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = 'Gekopieerd';
        btn.classList.add('is-done');
        setTimeout(() => {
          btn.textContent = label;
          btn.classList.remove('is-done');
        }, 2200);
      } catch {
        // geen klembord (http of geweigerd): selecteer de regel, dan werkt Cmd+C
        if (code) window.getSelection().selectAllChildren(code);
      }
    });
  });
}

/* ─────────────────────────────────────────
   11. Init
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initNav();
  initScrollReveal();
  initContactForm();
  initVideoFallbackLinks();
  initNavDropdown();
  initLight();
  initPauseOffscreen();
  initCopyEmail();
  initLocalTime();
  initShotFrames();
  initCopyCommand();
});
