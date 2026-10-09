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

  const interactiveSelector = 'a, button, [role="button"], input, textarea, label, .project-card, .pl__card';
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
  '.nav__links > li > a', '.nav__drop-btn', '.pw-lightbox__close', '.pl__btn',
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
   18. Showreel bovenaan de home
   Kiest liggend of staand op basis van het scherm, speelt stil af
   en zet het geluid aan op verzoek.
───────────────────────────────────────── */
function initReel() {
  const video = document.getElementById('reelVideo');
  const btn   = document.getElementById('reelSound');
  if (!video) return;

  const tall   = window.matchMedia('(max-aspect-ratio: 1/1)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function pick() {
    const src = tall.matches ? video.dataset.srcTall : video.dataset.srcWide;
    if (video.dataset.current === src) return;
    video.poster = tall.matches ? video.dataset.posterTall : video.dataset.posterWide;
    video.src = src;
    video.dataset.current = src;
    if (!reduce || !video.muted) video.play().catch(() => {});
  }

  pick();
  tall.addEventListener('change', pick);

  if (!btn) return;
  const label = btn.querySelector('span');
  btn.addEventListener('click', () => {
    video.muted = !video.muted;
    if (!video.muted) video.play().catch(() => {});
    btn.setAttribute('aria-pressed', String(!video.muted));
    label.textContent = video.muted ? 'Geluid aan' : 'Geluid uit';
  });
}

/* ─────────────────────────────────────────
   Fotolijn: polaroids aan een doorhangende draad.
   Sleep de lijn (of gebruik de pijlen) en de afdrukken schuiven mee,
   slingeren aan hun knijper en veren terug. De middelste is de actieve;
   klik die nog een keer en hij opent groot.
───────────────────────────────────────── */
function initPhotoLine() {
  document.querySelectorAll('.pl').forEach(setupPhotoLine);
}

function setupPhotoLine(root) {
  const cards = [...root.querySelectorAll('.pl__card')];
  const n = cards.length;
  if (!n) return;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const path = root.querySelector('.pl__string path');
  const cap = root.querySelector('.pl__cap');
  const titleEl = root.querySelector('.pl__title');
  const subEl = root.querySelector('.pl__sub');
  const countEl = root.querySelector('.pl__count b');
  const srEl = root.querySelector('.pl__sr');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const autoplay = reduce ? 0 : Number(root.dataset.autoplay || 0);
  const SAG = 46;

  root.classList.add('is-live');

  const S = { off: 0, vel: 0, target: 0, a: new Array(n).fill(0), w: new Array(n).fill(0) };
  let W = 1200, H = 700, cw = 280, spacing = 300;
  let active = -1;
  let drag = null;
  const wheel = { active: false, v: 0, t: 0, timer: 0 };
  let lastTouch = 0;

  const nearestAt = (off) => clamp(Math.round(off / spacing), 0, n - 1);
  const goTo = (i) => { S.target = clamp(i, 0, n - 1) * spacing; };
  const step = (dir) => { lastTouch = performance.now(); goTo(active + dir); };

  function setActive(i) {
    if (i === active) return;
    active = i;
    cards.forEach((c, k) => {
      c.classList.toggle('is-on', k === i);
      c.setAttribute('aria-hidden', k === i ? 'false' : 'true');
    });
    const c = cards[i];
    titleEl.textContent = c.dataset.title || '';
    subEl.textContent = c.dataset.caption || '';
    countEl.textContent = String(i + 1);
    srEl.textContent = `Foto ${i + 1} van ${n}: ${c.dataset.title || ''}`;
    cap.classList.remove('is-in');
    void cap.offsetWidth; // animatie opnieuw starten
    cap.classList.add('is-in');
  }

  function measure() {
    const r = root.getBoundingClientRect();
    W = r.width;
    H = r.height;
    cw = Math.round(Math.max(170, Math.min(300, W * 0.6, H * 0.42)));
    spacing = cw * 1.08;
    root.style.setProperty('--pl-cw', `${cw}px`);
    const i = Math.max(0, active);
    S.off = S.target = i * spacing;
  }

  new ResizeObserver(measure).observe(root);
  measure();
  setActive(0);

  // de simulatie schrijft elk frame rechtstreeks naar de DOM
  let raf = 0;
  let visible = true;
  let prev = performance.now();

  function frame(now) {
    raf = 0;
    if (!visible) return;
    const dt = Math.min(0.033, (now - prev) / 1000);
    prev = now;
    const y0 = Math.max(36, H * 0.12);

    let lineVel;
    if (drag && drag.moved) {
      lineVel = drag.v * 1000;
    } else if (wheel.active) {
      lineVel = -wheel.v * 1000;
      wheel.v *= 0.85;
    } else {
      // kritisch gedempte veer naar de actieve afdruk
      const before = S.off;
      const k = 70, c = 2 * Math.sqrt(k);
      S.vel += (k * (S.target - S.off) - c * S.vel) * dt;
      S.off += S.vel * dt;
      lineVel = -(S.off - before) / Math.max(dt, 1e-3);
    }

    const g = reduce ? 0 : 1;
    const near = nearestAt(S.off);

    for (let i = 0; i < n; i++) {
      const el = cards[i];
      const x = W / 2 + i * spacing - S.off;
      if (x < -cw * 1.5 || x > W + cw * 1.5) {
        el.style.visibility = 'hidden';
        continue;
      }
      el.style.visibility = 'visible';
      // de afdruk blijft achter bij de beweging, zwaartekracht trekt hem terug
      const w = S.w[i] + (-38 * S.a[i] - 4.2 * S.w[i] + lineVel * 0.0034 * g) * dt;
      let a = clamp(S.a[i] + w * dt, -0.6, 0.6);
      S.w[i] = w;
      if (g) a += Math.sin(now / 1300 + i * 1.7) * 0.0009; // een licht briesje
      S.a[i] = a;
      const t = clamp(x / W, 0, 1);
      const y = y0 + 4 * SAG * t * (1 - t) - 6;
      el.style.transform = `translate(${(x - cw / 2).toFixed(1)}px, ${y.toFixed(1)}px) rotate(${a.toFixed(4)}rad)`;
      el.style.zIndex = String(i === near ? n + 1 : n - Math.abs(i - near));
    }

    path.setAttribute('d', `M0 ${y0} Q${W / 2} ${y0 + 2 * SAG} ${W} ${y0}`);
    setActive(near);
    raf = requestAnimationFrame(frame);
  }

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf) {
      prev = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }).observe(root);

  // autoplay; wacht zolang iemand aan het slepen of klikken is
  if (autoplay && n > 1) {
    setInterval(() => {
      if (document.hidden || drag || performance.now() - lastTouch < autoplay) return;
      goTo(active >= n - 1 ? 0 : active + 1);
    }, autoplay);
  }

  // groot bekijken
  const box = document.getElementById('plLightbox');
  const boxImg = box && box.querySelector('img');
  const boxTitle = box && box.querySelector('.pw-lightbox__title');
  function openPhoto(i) {
    if (!box || typeof box.showModal !== 'function') return;
    const c = cards[i];
    const img = c.querySelector('img');
    boxImg.src = c.dataset.full || img.src;
    boxImg.alt = img.alt;
    boxTitle.textContent = c.dataset.title || '';
    box.showModal();
  }
  if (box) {
    box.querySelector('.pw-lightbox__close').addEventListener('click', () => box.close());
    box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
  }

  // horizontaal swipen met twee vingers op het trackpad (of shift + scrollwiel)
  root.addEventListener('wheel', (e) => {
    const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
    if (!dx) return; // verticaal scrollen blijft gewoon de pagina scrollen
    e.preventDefault();
    const step = e.deltaMode === 1 ? dx * 16 : dx;
    const max = (n - 1) * spacing;
    let off = S.off + step;
    if (off < 0) off = S.off + step * 0.25;
    if (off > max) off = S.off + step * 0.25;
    S.off = clamp(off, -spacing * 0.4, max + spacing * 0.4);
    S.vel = 0;
    const now = performance.now();
    wheel.v = 0.6 * (step / Math.max(8, now - (wheel.t || now - 16))) + 0.4 * wheel.v;
    wheel.t = now;
    wheel.active = true;
    lastTouch = now;
    clearTimeout(wheel.timer);
    wheel.timer = setTimeout(() => {
      wheel.active = false;
      wheel.t = 0;
      goTo(nearestAt(S.off));
    }, 140);
  }, { passive: false });

  root.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.pl__bar')) return;
    lastTouch = performance.now();
    drag = { x: e.clientX, off: S.off, lx: e.clientX, lt: e.timeStamp, v: 0, moved: false };
  });

  root.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 5) {
      drag.moved = true;
      root.setPointerCapture(e.pointerId);
    }
    if (!drag.moved) return;
    const dt = Math.max(1, e.timeStamp - drag.lt);
    drag.v = 0.7 * ((e.clientX - drag.lx) / dt) + 0.3 * drag.v;
    drag.lx = e.clientX;
    drag.lt = e.timeStamp;
    const max = (n - 1) * spacing;
    let off = drag.off - dx;
    if (off < 0) off *= 0.35;
    if (off > max) off = max + (off - max) * 0.35;
    S.off = off;
  });

  function end(e) {
    const d = drag;
    drag = null;
    lastTouch = performance.now();
    if (!d) return;
    if (d.moved) {
      S.vel = -d.v * 1000;
      goTo(nearestAt(S.off - d.v * 180));
      return;
    }
    if (e.type !== 'pointerup') return;
    const card = e.target.closest('.pl__card');
    if (!card) return;
    const i = cards.indexOf(card);
    if (i === active) openPhoto(i);
    else goTo(i);
  }
  root.addEventListener('pointerup', end);
  root.addEventListener('pointercancel', end);

  root.querySelector('.pl__btn--prev').addEventListener('click', () => step(-1));
  root.querySelector('.pl__btn--next').addEventListener('click', () => step(1));

  root.addEventListener('keydown', (e) => {
    if (e.target !== root) return;
    if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'Enter') openPhoto(active);
    else return;
    e.preventDefault();
  });
}

/* ─────────────────────────────────────────
   Plannen: kalender + tijden uit /api/slots, boeken via /api/book.
   De afspraak komt in Roelofs Google Agenda; Google mailt de uitnodiging.
   Werkt de API niet, dan valt de kaart terug op mail en het contactformulier.
───────────────────────────────────────── */
function initBooking() {
  const card = document.getElementById('booking');
  if (!card) return;

  const grid = card.querySelector('.cal__grid');
  const monthEl = card.querySelector('.cal__month');
  const [prevBtn, nextBtn] = card.querySelectorAll('.cal__nav');
  const dayEl = document.getElementById('bookDay');
  const slotsEl = document.getElementById('bookSlots');
  const form = document.getElementById('bookForm');
  const pickedEl = document.getElementById('bookPicked');
  const btn = document.getElementById('bookBtn');
  const status = document.getElementById('bookStatus');
  const doneEl = document.getElementById('bookDone');
  const doneText = document.getElementById('bookDoneText');
  const btnLabel = btn.innerHTML;

  const TYPES = {
    kennismaking: { label: 'Kennismaking', minutes: 30, how: 'videocall' },
    bellen: { label: 'Belafspraak', minutes: 15, how: 'telefoon' },
    sessie: { label: 'Projectsessie', minutes: 60, how: 'videocall' },
  };

  const pad = (n) => String(n).padStart(2, '0');
  const iso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
  const parts = (s) => s.split('-').map(Number);
  const fmt = (s, opts) => {
    const [y, m, d] = parts(s);
    return new Intl.DateTimeFormat('nl-NL', { timeZone: 'UTC', ...opts }).format(new Date(Date.UTC(y, m - 1, d)));
  };
  const addMin = (t, min) => {
    const [h, m] = t.split(':').map(Number);
    const total = h * 60 + m + min;
    return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
  };

  const now = new Date();
  const todayIso = iso(now.getFullYear(), now.getMonth(), now.getDate());
  const firstMonth = { y: now.getFullYear(), m: now.getMonth() };

  const state = { type: 'kennismaking', y: firstMonth.y, m: firstMonth.m, date: null, time: null, days: {}, lastDay: null, autoAdvanced: false };
  const cache = new Map();
  let req = 0;

  function setState(name) { card.dataset.state = name; }
  card.dataset.type = state.type;

  async function load() {
    const id = ++req;
    const from = iso(state.y, state.m, 1);
    const to = iso(state.y, state.m, new Date(state.y, state.m + 1, 0).getDate());
    const key = `${state.type}:${from}`;
    grid.classList.add('is-loading');
    try {
      let data = cache.get(key);
      if (!data) {
        const res = await fetch(`/api/slots?type=${state.type}&from=${from}&to=${to}`, { headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(String(res.status));
        data = await res.json();
        cache.set(key, data);
      }
      if (id !== req) return;
      state.days = data.days || {};
      state.lastDay = data.lastDay || null;

      // geen plek meer deze maand: één keer doorschuiven naar de volgende
      if (!Object.keys(state.days).length && !state.autoAdvanced && state.y === firstMonth.y && state.m === firstMonth.m) {
        state.autoAdvanced = true;
        shiftMonth(1);
        return;
      }
      if (!state.date || !state.days[state.date]) state.date = Object.keys(state.days).sort()[0] || null;
      renderMonth();
      renderSlots();
    } catch (err) {
      if (id === req) setState('off');
    } finally {
      if (id === req) grid.classList.remove('is-loading');
    }
  }

  function renderMonth() {
    monthEl.textContent = new Intl.DateTimeFormat('nl-NL', { month: 'long', year: 'numeric' }).format(new Date(state.y, state.m, 1));
    const lead = (new Date(state.y, state.m, 1).getDay() + 6) % 7;
    const count = new Date(state.y, state.m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < lead; i++) cells.push('<span class="cal__day is-outside" aria-hidden="true"></span>');
    for (let d = 1; d <= count; d++) {
      const date = iso(state.y, state.m, d);
      const open = !!state.days[date];
      const cls = ['cal__day', open && 'is-open', date === todayIso && 'is-today', date === state.date && 'is-selected'].filter(Boolean).join(' ');
      const label = fmt(date, { weekday: 'long', day: 'numeric', month: 'long' }) + (open ? '' : ', niet beschikbaar');
      cells.push(`<button type="button" class="${cls}" data-date="${date}" aria-label="${label}" ${open ? '' : 'disabled'} ${date === state.date ? 'aria-pressed="true"' : ''}>${d}</button>`);
    }
    grid.innerHTML = cells.join('');
    grid.classList.remove('is-in');
    void grid.offsetWidth;
    grid.classList.add('is-in');

    prevBtn.disabled = state.y === firstMonth.y && state.m === firstMonth.m;
    if (state.lastDay) {
      const [ly, lm] = parts(state.lastDay);
      nextBtn.disabled = state.y > ly || (state.y === ly && state.m >= lm - 1);
    }
  }

  function renderSlots() {
    if (!state.date) {
      dayEl.textContent = 'Geen plek meer deze maand';
      dayEl.classList.add('is-empty');
      slotsEl.innerHTML = '';
      return;
    }
    dayEl.classList.remove('is-empty');
    dayEl.textContent = fmt(state.date, { weekday: 'long', day: 'numeric', month: 'long' });
    slotsEl.innerHTML = state.days[state.date]
      .map((t, i) => `<button type="button" class="book__slot${t === state.time ? ' is-picked' : ''}" data-time="${t}" style="--n:${i}">${t}</button>`)
      .join('');
  }

  function shiftMonth(dir) {
    const d = new Date(state.y, state.m + dir, 1);
    state.y = d.getFullYear();
    state.m = d.getMonth();
    state.date = null;
    load();
  }

  function pick(time) {
    state.time = time;
    renderSlots();
    const t = TYPES[state.type];
    pickedEl.innerHTML = '';
    pickedEl.append(`${fmt(state.date, { weekday: 'long', day: 'numeric', month: 'long' })}, ${time} tot ${addMin(time, t.minutes)}`);
    const sub = document.createElement('span');
    sub.textContent = `${t.label} · ${t.minutes} min · ${t.how}`;
    pickedEl.append(sub);
    setState('form');
    status.textContent = '';
    form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => form.querySelector('#bName').focus({ preventScroll: true }), 350);
  }

  prevBtn.addEventListener('click', () => shiftMonth(-1));
  nextBtn.addEventListener('click', () => shiftMonth(1));

  grid.addEventListener('click', (e) => {
    const b = e.target.closest('.cal__day.is-open');
    if (!b) return;
    state.date = b.dataset.date;
    state.time = null;
    setState('pick');
    renderMonth();
    renderSlots();
  });

  slotsEl.addEventListener('click', (e) => {
    const b = e.target.closest('.book__slot');
    if (b) pick(b.dataset.time);
  });

  card.querySelectorAll('input[name="bookType"]').forEach((r) => {
    r.addEventListener('change', () => {
      state.type = r.value;
      card.dataset.type = r.value;
      state.time = null;
      setState('pick');
      load();
    });
  });

  document.getElementById('bookChange').addEventListener('click', () => {
    state.time = null;
    setState('pick');
    renderSlots();
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  function say(msg, kind) {
    status.textContent = msg;
    status.className = 'form-status' + (kind ? ` form-status--${kind}` : '');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const t = TYPES[state.type];

    if (!data.name.trim() || !data.email.trim() || !data.message.trim()) return say('Vul je naam, e-mail en een korte toelichting in.', 'error');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) return say('Vul een geldig e-mailadres in.', 'error');
    if (state.type === 'bellen' && !/^[+0-9 ()-]{8,}$/.test((data.phone || '').trim())) return say('Vul een telefoonnummer in waarop ik je kan bellen.', 'error');

    btn.disabled = true;
    btn.textContent = 'Inplannen...';
    say('');

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...data, type: state.type, date: state.date, time: state.time }),
      });
      const out = await res.json().catch(() => ({}));

      if (res.status === 409) {
        cache.clear();
        say('Dit moment is net vergeven. Kies een ander tijdstip.', 'error');
        state.time = null;
        setState('pick');
        load();
        return;
      }
      if (!res.ok || !out.ok) throw new Error(out.error || String(res.status));

      const when = `${fmt(state.date, { weekday: 'long', day: 'numeric', month: 'long' })} om ${state.time}`;
      doneText.textContent = state.type === 'bellen'
        ? `Je belafspraak staat op ${when}. Ik bel je op ${data.phone.trim()}. De bevestiging is onderweg naar ${data.email.trim()}.`
        : `Je ${t.label.toLowerCase()} staat op ${when}. De uitnodiging met de link naar Google Meet is onderweg naar ${data.email.trim()}.`;
      setState('done');
      doneEl.focus({ preventScroll: true });
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // seintje in Roelofs inbox via hetzelfde Formspree-formulier als contact
      const contact = document.getElementById('contactForm');
      if (contact) {
        const note = new FormData();
        note.append('name', data.name);
        note.append('email', data.email);
        note.append('_subject', `Nieuwe afspraak: ${t.label}, ${when}`);
        const lines = [`${t.label} (${t.minutes} min) op ${when}`];
        if (data.company) lines.push(`Bedrijf: ${data.company}`);
        if (data.phone) lines.push(`Telefoon: ${data.phone}`);
        if (data.topic) lines.push(`Onderwerp: ${data.topic}`);
        lines.push('', data.message);
        note.append('message', lines.join('\n'));
        fetch(contact.action, { method: 'POST', body: note, headers: { Accept: 'application/json' } }).catch(() => {});
      }
    } catch (err) {
      say('Inplannen lukte niet. Probeer het nog eens of mail me op bemooks@gmail.com.', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = btnLabel;
    }
  });

  // pas laden als de sectie in de buurt komt: scheelt een API-call voor wie alleen het werk bekijkt
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((en) => en.isIntersecting)) { io.disconnect(); load(); }
    }, { rootMargin: '600px 0px' });
    io.observe(card);
  } else {
    load();
  }
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
  initReel();
  initPhotoLine();
  initBooking();
});
