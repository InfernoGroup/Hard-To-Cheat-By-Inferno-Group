const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = document.querySelectorAll('[data-reveal]');
const progress = document.querySelector('#scroll-progress');
const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#primary-nav');
const year = document.querySelector('#year');

if (year) year.textContent = new Date().getFullYear();

if ('IntersectionObserver' in window && !prefersReducedMotion) {
  document.documentElement.classList.add('motion-ready');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -36px 0px' });
  revealItems.forEach((item) => revealObserver.observe(item));
}

let scrollFrame = 0;
const updateScrollProgress = () => {
  if (!progress || scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(() => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
    scrollFrame = 0;
  });
};
window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();

if (menuToggle && navigation) {
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    navigation.classList.toggle('is-open', !isOpen);
  });
  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      navigation.classList.remove('is-open');
    });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    menuToggle.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
    menuToggle.focus();
  });
  document.addEventListener('pointerdown', (event) => {
    if (navigation.contains(event.target) || menuToggle.contains(event.target)) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
  });

  const navLinks = [...navigation.querySelectorAll('a[href^="#"]')];
  const navSections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  if ('IntersectionObserver' in window && navSections.length) {
    const visibleSections = new Set();
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visibleSections.add(entry.target);
        else visibleSections.delete(entry.target);
      });
      const activeSection = [...visibleSections]
        .sort((a, b) => Math.abs(a.getBoundingClientRect().top) - Math.abs(b.getBoundingClientRect().top))[0];
      navLinks.forEach((link) => link.removeAttribute('aria-current'));
      if (activeSection) {
        navigation.querySelector(`a[href="#${activeSection.id}"]`)?.setAttribute('aria-current', 'location');
      }
    }, { threshold: 0.01 });
    navSections.forEach((section) => sectionObserver.observe(section));
  }
}

const hero = document.querySelector('.hero');
if (hero && !prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
  const artwork = hero.querySelector('.hero__art');
  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    artwork.style.transform = `translate3d(${x * -8}px, ${y * -5}px, 0)`;
  });
  hero.addEventListener('pointerleave', () => { artwork.style.transform = ''; });
}
