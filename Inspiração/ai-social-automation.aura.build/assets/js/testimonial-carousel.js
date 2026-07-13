(function() {
  const testimonials = [
    {
      quote: "\"Já assisti a 36 MasterClasses sintonizando enquanto como e faço tarefas pela casa. Aprendi a viver com paixão, garra, humildade e um processo que torna minha jornada de vida algo para saborear.\"",
      author: "Clarissa",
      role: "Fundadora e Professora",
      image: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/649a17f7-ce90-412e-bc8c-6227953b3ba4_1600w.webp"
    },
    {
      quote: "\"O Luminous transformou completamente minha abordagem para mídias sociais. Os insights automatizados me permitem focar na criação enquanto a plataforma cuida da estratégia de engajamento perfeitamente.\"",
      author: "David Chen",
      role: "Artista Digital",
      image: "https://images.unsplash.com/photo-1640906152676-dace6710d24b?w=2160&q=80"
    },
    {
      quote: "\"As métricas de velocidade de crescimento são insanas. Saí de lutar para conseguir 100 visualizações para alcançar consistentemente mais de 50k em cada reel em apenas duas semanas usando os recursos de piloto automático.\"",
      author: "Sarah Jenkins",
      role: "Vlogger de Lifestyle",
      image: "https://images.unsplash.com/photo-1629946832022-c327f74956e0?w=2160&q=80"
    }
  ];

  let currentIndex = 0;

  window.nextTestimonial = function() {
    currentIndex = (currentIndex + 1) % testimonials.length;
    updateTestimonial();
  };

  window.prevTestimonial = function() {
    currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
    updateTestimonial();
  };

  function updateTestimonial() {
    const data = testimonials[currentIndex];
    const quoteEl = document.getElementById('t-quote');
    const authorEl = document.getElementById('t-author');
    const roleEl = document.getElementById('t-role');
    const imageEl = document.getElementById('t-image');

    [quoteEl, authorEl, roleEl, imageEl].forEach(el => el.style.opacity = '0');

    setTimeout(() => {
      quoteEl.innerText = data.quote;
      authorEl.innerText = data.author;
      roleEl.innerHTML = `${data.role} <span class="inline-block w-4 h-3 rounded-[1px] bg-gradient-to-r from-blue-600 via-white to-red-600 shadow-sm opacity-80"></span>`;
      imageEl.src = data.image;

      [quoteEl, authorEl, roleEl, imageEl].forEach(el => el.style.opacity = '1');
    }, 300);
  }
})();
