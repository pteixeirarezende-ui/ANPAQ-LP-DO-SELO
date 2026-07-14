document.addEventListener('DOMContentLoaded', () => {
      const revealElements = document.querySelectorAll('.reveal');
      
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Pequeno delay para a animação não ser engolida pela rolagem rápida
            setTimeout(() => {
              entry.target.classList.add('active');
            }, 50);
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1, 
        rootMargin: '0px 0px -20% 0px' /* Só ativa a animação quando o card já entrou bem na tela (20% acima do rodapé) */
      });

      // Primeiro delay para garantir o render do Hero
      setTimeout(() => {
        revealElements.forEach(el => revealObserver.observe(el));
      }, 50);

      // Counter Animation (Sutil count-up para estatísticas)
      const counters = document.querySelectorAll('.counter');
      const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = +entry.target.getAttribute('data-target');
            const duration = 1500; // 1.5s
            const increment = target / (duration / 16); 
            
            let current = 0;
            const updateCounter = () => {
              current += increment;
              if (current < target) {
                entry.target.innerText = Math.ceil(current);
                requestAnimationFrame(updateCounter);
              } else {
                entry.target.innerText = target;
              }
            };
            
            // Espera o card subir (0.8s da animação de reveal) para começar a contar
            setTimeout(() => {
              updateCounter();
            }, 800);
            
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5, rootMargin: '0px 0px -10% 0px' });
      
      counters.forEach(counter => counterObserver.observe(counter));
    });