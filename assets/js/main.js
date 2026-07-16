document.addEventListener('DOMContentLoaded', () => {

  // ─── REVEAL ON SCROLL ───
  // Smoother, faster, with staggered delays handled automatically
  const revealElements = document.querySelectorAll('.reveal, .reveal-pop, .reveal-left');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Minimal delay so animations feel instant but not janky
        requestAnimationFrame(() => {
          entry.target.classList.add('active');
        });
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px -8% 0px'
  });

  // Hero elements: activate immediately on load (no scroll needed)
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    const heroReveals = heroSection.querySelectorAll('.reveal, .reveal-pop');
    // Slight delay to let paint happen first
    setTimeout(() => {
      heroReveals.forEach(el => el.classList.add('active'));
    }, 100);
  }

  // All other reveals: observe for scroll
  setTimeout(() => {
    revealElements.forEach(el => {
      // Skip hero elements (already activated above)
      if (heroSection && heroSection.contains(el)) return;
      revealObserver.observe(el);
    });
  }, 200);

  // ─── COUNTER ANIMATION ───
  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = +entry.target.getAttribute('data-target');
        const duration = 1500;
        const startTime = performance.now();
        
        // Easing function for natural feel
        const easeOutQuart = t => 1 - Math.pow(1 - t, 4);
        
        const updateCounter = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = easeOutQuart(progress);
          const current = Math.ceil(easedProgress * target);
          
          entry.target.innerText = current;
          
          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            entry.target.innerText = target;
          }
        };
        
        // Wait for the reveal animation to start
        setTimeout(() => {
          requestAnimationFrame(updateCounter);
        }, 600);
        
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3, rootMargin: '0px 0px -5% 0px' });
  
  counters.forEach(counter => counterObserver.observe(counter));

  // ─── PARALLAX GLOW ───
  // Subtle parallax on the hero glow following scroll
  const heroGlow = document.querySelector('.hero-glow');
  if (heroGlow) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const parallax = scrollY * 0.3;
          heroGlow.style.transform = `translate(-50%, calc(-50% + ${parallax}px))`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ─── SMOOTH ANCHOR SCROLLING ───
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});