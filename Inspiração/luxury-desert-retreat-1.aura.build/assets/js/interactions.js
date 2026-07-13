// === NAV: scroll-state + dark-mode over night sections ===
(function(){
  const nav = document.getElementById('nav');
  if (!nav) return;
  const updateNav = () => {
    const y = window.scrollY;
    if (y > 40) nav.classList.add('scrolled'); else nav.classList.remove('scrolled');
    // Dark nav when scrolled past first day section into night sections
    const transition = document.getElementById('transition');
    if (transition) {
      const top = transition.getBoundingClientRect().top;
      if (top < 80) nav.classList.add('nav-dark'); else nav.classList.remove('nav-dark');
    }
  };
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
})();

// === MOBILE NAV: hamburger toggle ===
(function(){
  const btn = document.querySelector('.nav-hamburger');
  const overlay = document.getElementById('mobileOverlay');
  if (!btn || !overlay) return;
  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    overlay.classList.toggle('active');
  });
  overlay.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    btn.classList.remove('active');
    overlay.classList.remove('active');
  }));
})();

// === SCROLL REVEAL: IntersectionObserver-based ===
(function(){
  const els = document.querySelectorAll('.reveal, .reveal-left, .stagger-up');
  if (!('IntersectionObserver' in window) || !els.length) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
  els.forEach(el => io.observe(el));
})();

// === STATS COUNTER: animate up to data-count value ===
(function(){
  const stats = document.querySelectorAll('.stat-value[data-count]');
  if (!stats.length) return;
  const animate = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    if (Number.isNaN(target)) return;
    const duration = 1600;
    const start = performance.now();
    const initial = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(initial + (target - initial) * eased);
      el.textContent = String(value);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = String(target);
    };
    requestAnimationFrame(tick);
  };
  if (!('IntersectionObserver' in window)) {
    stats.forEach(animate); return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  stats.forEach(el => io.observe(el));
})();

// === HERO PARALLAX: subtle translate on scroll ===
(function(){
  const bg = document.querySelector('.hero-bg');
  if (!bg) return;
  const onScroll = () => {
    const y = window.scrollY;
    if (y > window.innerHeight) return;
    bg.style.transform = `translateY(${y * 0.25}px)`;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
})();
