const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = document.querySelectorAll('[data-reveal]');
const progress = document.querySelector('#scroll-progress');
const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#primary-nav');
const year = document.querySelector('#year');
const parallaxItems = [...document.querySelectorAll('[data-parallax]')];
const rippleTargets = document.querySelectorAll('[data-ripple]');

if (year) year.textContent = new Date().getFullYear();

if ('IntersectionObserver' in window && !prefersReducedMotion) {
  document.documentElement.classList.add('motion-ready');
  requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add('page-entered')));
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
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(() => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
    if (!prefersReducedMotion) {
      parallaxItems.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const strength = Number(item.dataset.parallax) || 0.1;
        const distance = (window.innerHeight / 2 - (rect.top + rect.height / 2)) * strength;
        const boundedDistance = Math.max(-42, Math.min(42, distance));
        item.style.setProperty('--parallax-y', `${boundedDistance.toFixed(1)}px`);
      });
    }
    scrollFrame = 0;
  });
};
window.addEventListener('scroll', updateScrollProgress, { passive: true });
window.addEventListener('resize', updateScrollProgress, { passive: true });
updateScrollProgress();

rippleTargets.forEach((target) => {
  target.addEventListener('pointerdown', (event) => {
    if (prefersReducedMotion || event.button > 0) return;
    const bounds = target.getBoundingClientRect();
    const diameter = Math.max(bounds.width, bounds.height) * 1.8;
    const ripple = document.createElement('span');
    ripple.className = 'tap-ripple';
    ripple.setAttribute('aria-hidden', 'true');
    ripple.style.width = `${diameter}px`;
    ripple.style.height = `${diameter}px`;
    ripple.style.left = `${event.clientX - bounds.left}px`;
    ripple.style.top = `${event.clientY - bounds.top}px`;
    target.append(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  });
});

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
    artwork.style.setProperty('--pointer-x', `${(x * -8).toFixed(1)}px`);
    artwork.style.setProperty('--pointer-y', `${(y * -5).toFixed(1)}px`);
  });
  hero.addEventListener('pointerleave', () => {
    artwork.style.removeProperty('--pointer-x');
    artwork.style.removeProperty('--pointer-y');
  });
}

const htcLogo = document.querySelector('[data-htc-logo]');
if (htcLogo) {
  let rotationX = -7;
  let rotationY = -14;
  let dragOrigin = null;

  const setRotation = (x, y) => {
    htcLogo.style.setProperty('--logo-x', `${x.toFixed(1)}deg`);
    htcLogo.style.setProperty('--logo-y', `${y.toFixed(1)}deg`);
  };

  htcLogo.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    dragOrigin = { x: event.clientX, y: event.clientY, rotationX, rotationY, pointerId: event.pointerId };
    htcLogo.classList.add('is-dragging');
    htcLogo.setPointerCapture(event.pointerId);
  });

  htcLogo.addEventListener('pointermove', (event) => {
    const bounds = htcLogo.getBoundingClientRect();
    const localX = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const localY = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    htcLogo.style.setProperty('--shine-x', `${(localX * 100).toFixed(1)}%`);
    htcLogo.style.setProperty('--shine-y', `${(localY * 100).toFixed(1)}%`);

    if (dragOrigin && event.pointerId === dragOrigin.pointerId) {
      rotationY = dragOrigin.rotationY + (event.clientX - dragOrigin.x) * 0.9;
      rotationX = dragOrigin.rotationX - (event.clientY - dragOrigin.y) * 0.75;
      setRotation(rotationX, rotationY);
      return;
    }

    if (prefersReducedMotion || event.pointerType === 'touch') return;
    const tiltX = rotationX - (localY - 0.5) * 16;
    const tiltY = rotationY + (localX - 0.5) * 22;
    setRotation(tiltX, tiltY);
  });

  const finishRotation = (event) => {
    if (!dragOrigin || event.pointerId !== dragOrigin.pointerId) return;
    dragOrigin = null;
    htcLogo.classList.remove('is-dragging');
  };
  htcLogo.addEventListener('pointerup', finishRotation);
  htcLogo.addEventListener('pointercancel', finishRotation);
  htcLogo.addEventListener('lostpointercapture', finishRotation);
  htcLogo.addEventListener('pointerleave', () => {
    if (!dragOrigin) setRotation(rotationX, rotationY);
  });

  htcLogo.addEventListener('keydown', (event) => {
    const step = event.shiftKey ? 30 : 12;
    if (event.key === 'ArrowLeft') rotationY -= step;
    else if (event.key === 'ArrowRight') rotationY += step;
    else if (event.key === 'ArrowUp') rotationX -= step;
    else if (event.key === 'ArrowDown') rotationX += step;
    else if (event.key === 'Home') { rotationX = -7; rotationY = -14; }
    else return;
    event.preventDefault();
    setRotation(rotationX, rotationY);
  });
}
