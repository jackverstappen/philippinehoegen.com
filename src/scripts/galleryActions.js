/**
 * Gallery modal controller.
 * Handles keyboard navigation, focus trapping, and open/close lifecycle.
 *
 * @param {HTMLElement} root
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function initGallery(root) {
  const backdrop  = root.querySelector('[data-gallery-backdrop]');
  const modal     = root.querySelector('[data-gallery-modal]');
  const track     = root.querySelector('[data-gallery-track]');
  const dots      = root.querySelectorAll('[data-gallery-dot]');
  const captionEl = root.querySelector('[data-gallery-caption]');
  const titleEl   = root.querySelector('[data-gallery-title]');
  const counterEl = root.querySelector('[data-gallery-counter]');
  const thumbnails = root.querySelectorAll('[data-gallery-thumb]');

  if (!backdrop || !modal || !track) return;

  let current = 0;
  let previouslyFocused = null;
  const total = dots.length;

  // ─── Navigation ────────────────────────────────────────────────

  function goTo(index) {
    current = (index + total) % total;
    render();
  }

  function render() {
    if (track) {
      track.style.transform = `translateX(-${current * 100}%)`;
    }

    const slides = track.querySelectorAll('[data-gallery-slide]');
    slides.forEach((slide, i) => {
      slide.setAttribute('aria-hidden', String(i !== current));
      slide.setAttribute('aria-current', i === current ? 'true' : 'false');
    });

    dots.forEach((dot, i) => {
      const active = i === current;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-current', String(active));
    });

    const img = slides[current];
    if (titleEl)   titleEl.textContent   = img?.dataset.title   ?? '';
    if (captionEl) captionEl.textContent = img?.dataset.caption ?? '';
    if (counterEl) counterEl.textContent = `${current + 1} / ${total}`;
  }

  // ─── Open / close ──────────────────────────────────────────────

  function open(index) {
    previouslyFocused = document.activeElement;
    current = index;
    backdrop.removeAttribute('hidden');
    backdrop.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    render();
    requestAnimationFrame(() => modal.focus());
  }

  function close() {
    backdrop.setAttribute('hidden', '');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    previouslyFocused?.focus();
  }

  // ─── Focus trap ────────────────────────────────────────────────

  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const focusable = Array.from(modal.querySelectorAll(FOCUSABLE));
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // ─── Event listeners ───────────────────────────────────────────

  thumbnails.forEach((thumb, i) => {
    thumb.addEventListener('click', () => open(i));
    thumb.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(i);
      }
    });
  });

  root.querySelector('[data-gallery-close]')?.addEventListener('click', close);
  root.querySelector('[data-gallery-prev]')?.addEventListener('click', () => goTo(current - 1));
  root.querySelector('[data-gallery-next]')?.addEventListener('click', () => goTo(current + 1));

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => goTo(i));
  });

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });

  modal.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowLeft':  e.preventDefault(); goTo(current - 1); break;
      case 'ArrowRight': e.preventDefault(); goTo(current + 1); break;
      case 'Home':       e.preventDefault(); goTo(0);           break;
      case 'End':        e.preventDefault(); goTo(total - 1);   break;
      case 'Escape':     close();                                break;
      case 'Tab':        trapFocus(e);                           break;
    }
  });

  // Touch / pointer swipe
  let startX = 0;
  modal.addEventListener('pointerdown', (e) => { startX = e.clientX; });
  modal.addEventListener('pointerup',   (e) => {
    const delta = e.clientX - startX;
    if (Math.abs(delta) > 50) goTo(current + (delta < 0 ? 1 : -1));
  });
}

// Auto-initialise every gallery on the page
document.querySelectorAll('[data-gallery]').forEach(initGallery);