/* ============================================================
   MAIN INTERACTIONS — shared by all pages.
   Each block checks for its elements, so one file serves every page.
   ============================================================ */

// ---------- preloader ----------
const loader = document.getElementById('loader');
if (loader) {
  window.addEventListener('load', () => setTimeout(() => loader.classList.add('gone'), 1700));
  setTimeout(() => loader.classList.add('gone'), 3500); // safety net
}

// ---------- nav on scroll ----------
const nav = document.querySelector('nav:not(.fixed)');
if (nav) {
  addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40), { passive: true });
}

// ---------- mobile menu ----------
const navToggle = document.querySelector('.nav-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
if (navToggle && mobileMenu) {
  const setOpen = (open) => {
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open);
    if (open) { mobileMenu.hidden = false; requestAnimationFrame(() => mobileMenu.classList.add('open')); }
    else { mobileMenu.classList.remove('open'); setTimeout(() => mobileMenu.hidden = true, 350); }
    document.body.style.overflow = open ? 'hidden' : '';
  };
  navToggle.addEventListener('click', () => setOpen(!navToggle.classList.contains('open')));
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && navToggle.classList.contains('open')) setOpen(false); });
}

// ---------- marquee seamless loop ----------
const track = document.getElementById('track');
if (track) track.innerHTML += track.innerHTML;

// ---------- reveal on scroll ----------
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ---------- VIP form ----------
document.querySelectorAll('.vip form').forEach(f => {
  f.addEventListener('submit', e => {
    e.preventDefault();
    const btn = f.querySelector('button');
    btn.textContent = 'Welcome ✦';
    btn.disabled = true;
  });
});

/* PDP gallery, sizes, currency and add-to-bag now live in
   pdp.js + cart.js (data-driven). main.js stays page-agnostic. */
