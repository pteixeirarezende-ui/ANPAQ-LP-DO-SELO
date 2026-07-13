/* Interacoes da pagina Cognix: navbar, menu mobile, scroll reveal, parallax, modulos e spotlight */
(function () {
  'use strict';

  /* --- Navbar: estado "scrolled" --- */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const scrolledClasses = ['py-4', 'bg-[#0A0A1A]/70', 'backdrop-blur-xl', 'border', 'border-white/10', 'shadow-[0_10px_40px_rgba(0,0,0,0.5)]', 'mt-4'];
    const topClasses = ['py-8', 'border-b', 'border-transparent', 'mt-0'];
    const applyNav = () => {
      const scrolled = window.scrollY > 20;
      navbar.classList.toggle(scrolled ? 'py-4' : 'py-8', true);
      scrolledClasses.forEach((c) => navbar.classList.toggle(c, scrolled));
      topClasses.forEach((c) => navbar.classList.toggle(c, !scrolled));
    };
    window.addEventListener('scroll', applyNav, { passive: true });
    applyNav();
  }

  /* --- Menu mobile --- */
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('menu-icon');
  if (menuToggle && mobileMenu) {
    let open = false;
    const openClasses = ['opacity-100', 'scale-y-100', 'p-4', 'gap-4'];
    const closeClasses = ['opacity-0', 'scale-y-0', 'h-0', 'p-0', 'gap-0'];
    const sync = () => {
      openClasses.forEach((c) => mobileMenu.classList.toggle(c, open));
      closeClasses.forEach((c) => mobileMenu.classList.toggle(c, !open));
      if (menuIcon) menuIcon.setAttribute('icon', open ? 'solar:close-circle-linear' : 'solar:hamburger-menu-linear');
    };
    menuToggle.addEventListener('click', () => { open = !open; sync(); });
    mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => { open = false; sync(); }));
    sync();
  }

  /* --- Scroll reveal via IntersectionObserver --- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    revealEls.forEach((el) => observer.observe(el));
  }

  /* --- Parallax do mouse --- */
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length) {
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 40;
      const y = (e.clientY / window.innerHeight - 0.5) * 40;
      parallaxEls.forEach((el) => {
        const factor = parseFloat(el.getAttribute('data-parallax')) || 0;
        el.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
      });
    });
  }

  /* --- Trocador de modulos do app (showcase) --- */
  const moduleData = [
    { title: 'Vias Neurais', desc: 'Conecte as sequências para estabelecer conexões estáveis.', icon: 'lucide:network', textClass: 'text-cyan-400', bgClass: 'bg-cyan-500/20', gradient: 'from-cyan-400 to-blue-600' },
    { title: 'Lógica Quântica', desc: 'Resolva equações complexas de estado com múltiplas variáveis rapidamente.', icon: 'lucide:cpu', textClass: 'text-orange-400', bgClass: 'bg-orange-500/20', gradient: 'from-orange-400 to-red-600' },
    { title: 'Fluxo Sináptico', desc: 'Mantenha estados de fluxo contínuo sob interferência.', icon: 'lucide:infinity', textClass: 'text-fuchsia-400', bgClass: 'bg-fuchsia-500/20', gradient: 'from-fuchsia-400 to-purple-600' }
  ];
  const showcase = document.getElementById('module-showcase');
  if (showcase) {
    const slides = showcase.querySelectorAll('[data-module-slide]');
    const buttons = showcase.querySelectorAll('[data-module-btn]');
    const titleEl = showcase.querySelector('#module-title');
    const titleIcon = showcase.querySelector('#module-title-icon');
    const descEl = showcase.querySelector('#module-desc');
    let active = 0;

    const setActive = (idx) => {
      active = idx;
      const mod = moduleData[idx];
      slides.forEach((s, i) => {
        const on = i === idx;
        s.classList.toggle('opacity-70', on);
        s.classList.toggle('scale-100', on);
        s.classList.toggle('opacity-0', !on);
        s.classList.toggle('scale-110', !on);
        s.classList.toggle('pointer-events-none', !on);
      });
      buttons.forEach((b, i) => {
        const on = i === idx;
        const m = moduleData[i];
        const wrap = b;
        const inner = b.querySelector('[data-module-bg]');
        const icon = b.querySelector('iconify-icon');
        m.gradient.split(' ').forEach((c) => wrap.classList.toggle(c, on));
        ['from-white/10', 'to-white/5', 'hover:-translate-y-1', 'hover:from-white/20'].forEach((c) => wrap.classList.toggle(c, !on));
        wrap.classList.toggle('-translate-y-2', on);
        wrap.classList.toggle('shadow-lg', on);
        if (inner) { inner.className = `absolute inset-0 transition-opacity duration-300 ${on ? m.bgClass : 'bg-transparent'}`; }
        if (icon) { icon.className = `text-2xl transition-colors duration-300 ${on ? m.textClass : 'text-gray-500'}`; }
      });
      if (titleEl) titleEl.textContent = mod.title;
      if (titleIcon) { titleIcon.setAttribute('icon', mod.icon); titleIcon.className = `text-2xl ${mod.textClass} transition-colors duration-300`; }
      if (descEl) descEl.textContent = mod.desc;
    };
    buttons.forEach((b, i) => b.addEventListener('click', () => setActive(i)));
    showcase.querySelectorAll('[data-module-target]').forEach((el) => {
      el.addEventListener('click', () => setActive(parseInt(el.getAttribute('data-module-target'), 10)));
    });
    setActive(0);
  }

  /* --- Spotlight cards: brilho que segue o cursor --- */
  document.querySelectorAll('[data-spotlight]').forEach((card) => {
    const sheen = card.querySelector('[data-spotlight-sheen]');
    const glow = card.querySelector('[data-spotlight-glow]');
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (sheen) sheen.style.background = `radial-gradient(400px circle at ${x}px ${y}px, rgba(255,255,255,0.4), transparent 40%)`;
      if (glow) { glow.style.left = x + 'px'; glow.style.top = y + 'px'; }
    });
    card.addEventListener('mouseenter', () => {
      if (sheen) sheen.style.opacity = '1';
      if (glow) glow.style.opacity = '0.5';
    });
    card.addEventListener('mouseleave', () => {
      if (sheen) sheen.style.opacity = '0';
      if (glow) glow.style.opacity = '0';
    });
  });
})();
