document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  gsap.to('.reveal-word', {
    y: '0%',
    duration: 1.15,
    ease: 'power4.out',
    stagger: 0.045,
    delay: 0.08
  });

  gsap.to('.fade-in-up', {
    y: 0,
    opacity: 1,
    duration: 0.9,
    ease: 'power3.out',
    stagger: 0.08,
    delay: 0.25
  });

  gsap.utils.toArray('section').forEach((section) => {
    const sectionTitleWords = section.querySelectorAll('.section-reveal-word');
    const sectionCards = section.querySelectorAll('.fade-section');

    if (sectionTitleWords.length) {
      gsap.to(sectionTitleWords, {
        y: '0%',
        duration: 1.35,
        ease: 'power4.out',
        stagger: 0.055,
        scrollTrigger: {
          trigger: section,
          start: 'top 78%',
          once: true
        }
      });
    }

    if (sectionCards.length) {
      gsap.from(sectionCards, {
        y: 36,
        opacity: 0,
        duration: 1.05,
        ease: 'power3.out',
        stagger: 0.16,
        scrollTrigger: {
          trigger: sectionCards[0],
          start: 'top 84%',
          once: true
        }
      });
    }
  });

  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let width, height, particles = [];

  function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize); resize();

  class Particle {
    constructor() { this.x = Math.random() * width; this.y = Math.random() * height; this.size = Math.random() * 1.4 + .25; this.speedX = Math.random() * .35 - .175; this.speedY = Math.random() * .28 - .14; this.life = Math.random() * 100; }
    update() { this.x += this.speedX; this.y += this.speedY; this.life += .018; if (this.x < 0) this.x = width; if (this.x > width) this.x = 0; if (this.y < 0) this.y = height; if (this.y > height) this.y = 0; }
    draw() { const opacity = (Math.sin(this.life) + 1) / 2 * .32 + .06; ctx.fillStyle = `rgba(183,138,86,${opacity})`; ctx.beginPath(); ctx.rect(this.x, this.y, this.size, this.size); ctx.fill(); }
  }
  function init() { particles = []; const count = Math.min(150, Math.floor((width * height) / 14000)); for (let i = 0; i < count; i++) particles.push(new Particle()); }
  function animate() { ctx.clearRect(0, 0, width, height); particles.forEach(p => { p.update(); p.draw(); }); requestAnimationFrame(animate); }

  const heroMessages = [
    "Cada evento é tratado como um sistema encenado: fluxo de convidados, ritmo sensorial, timing de produção e revelação final.",
    "A atmosfera é construída antes da decoração: luz, som, movimento e serviço operam como uma única linguagem.",
    "A produção permanece invisível, para que o momento pareça natural da chegada até a despedida final."
  ];

  const heroCopy = document.getElementById("hero-rotating-copy");
  const heroDots = document.querySelectorAll(".hero-dot");
  let heroMessageIndex = 0;

  if (heroCopy && heroDots.length) {
    setInterval(() => {
      heroMessageIndex = (heroMessageIndex + 1) % heroMessages.length;

      heroCopy.style.opacity = "0";

      setTimeout(() => {
        heroCopy.textContent = heroMessages[heroMessageIndex];

        heroDots.forEach((dot, index) => {
          if (index === heroMessageIndex) {
            dot.classList.remove("bg-[#E7D8C8]");
            dot.classList.add("bg-[#B78A56]");
          } else {
            dot.classList.remove("bg-[#B78A56]");
            dot.classList.add("bg-[#E7D8C8]");
          }
        });

        heroCopy.style.opacity = "1";
      }, 350);
    }, 4600);
  }
  init(); animate(); window.addEventListener('resize', init);
});
