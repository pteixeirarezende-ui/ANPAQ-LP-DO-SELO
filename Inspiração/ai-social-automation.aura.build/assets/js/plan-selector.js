(function() {
  const plans = {
    creator: {
      title: "Creator",
      price: "R$ 29,00",
      desc: "Ideal para criadores solo que querem automatizar postagens e engajamento diários.",
      features: [
        "Análise de Tendências com IA",
        "Bot de Auto-Resposta",
        "3 Conexões de Plataforma",
        "Relatório Semanal de Desempenho",
        "Preditor de Score Viral"
      ],
      cta: "Começar a Crescer"
    },
    pro: {
      title: "Pro Growth",
      price: "R$ 79,00",
      desc: "Perfeito para equipes em escala que precisam de análises avançadas e colaboração.",
      features: [
        "Tudo do Creator",
        "Colaboração em Equipe",
        "10 Conexões de Plataforma",
        "Análise de Concorrentes",
        "Suporte Prioritário"
      ],
      cta: "Escalar Agora"
    },
    agency: {
      title: "Agência",
      price: "R$ 199,00",
      desc: "Poder máximo para agências que gerenciam múltiplas marcas de clientes.",
      features: [
        "Tudo do Pro",
        "Relatórios White Label",
        "Conexões Ilimitadas",
        "Acesso à API",
        "Gerente de Conta Dedicado"
      ],
      cta: "Falar com Vendas"
    }
  };

  const activeBtnClass = "relative w-full flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_0_40px_-10px_rgba(249,115,22,0.4)] transition-transform hover:scale-[1.02] group border-t border-white/20";
  const inactiveBtnClass = "w-full flex items-center justify-between p-5 rounded-xl bg-[#181824] border border-white/5 text-neutral-200 hover:bg-[#20202e] hover:border-white/10 transition-all group text-left";

  window.selectPlan = function(planKey) {
    ['creator', 'pro', 'agency'].forEach(key => {
      const btn = document.getElementById('btn-' + key);
      const icon = btn.querySelector('svg');

      if (key === planKey) {
        btn.className = activeBtnClass;
        const textSpan = btn.querySelector('span');
        textSpan.className = "text-xl font-sans";
        icon.classList.remove('text-neutral-500');
        if (key === 'creator') icon.classList.add('fill-white/20');

        const dot = document.getElementById('active-dot');
        btn.appendChild(dot);
      } else {
        btn.className = inactiveBtnClass;
        const textSpan = btn.querySelector('span');
        textSpan.className = "text-xl group-hover:text-white font-sans";
        icon.classList.add('text-neutral-500');
        icon.classList.remove('fill-white/20');
      }
    });

    ['creator', 'pro', 'agency'].forEach(key => {
      const path = document.getElementById('path-' + key);
      if (key === planKey) {
        path.setAttribute('stroke', '#f97316');
        path.setAttribute('class', 'animate-flow shadow-[0_0_15px_rgba(249,115,22,0.5)]');
        path.setAttribute('stroke-dasharray', '8 8');
      } else {
        path.setAttribute('stroke', '#525252');
        path.setAttribute('class', 'opacity-20');
        path.setAttribute('stroke-dasharray', '6 6');
      }
    });

    const data = plans[planKey];
    const titleEl = document.getElementById('plan-title');
    const priceEl = document.getElementById('plan-price');
    const descEl = document.getElementById('plan-desc');
    const featuresEl = document.getElementById('plan-features');
    const ctaEl = document.getElementById('plan-cta');

    const elements = [titleEl, priceEl, descEl, featuresEl, ctaEl];
    elements.forEach(el => el.style.opacity = '0');
    elements.forEach(el => el.style.transition = 'opacity 0.2s ease');

    setTimeout(() => {
      titleEl.textContent = data.title;
      priceEl.textContent = data.price;
      descEl.textContent = data.desc;

      featuresEl.innerHTML = data.features.map(feat => `
        <div class="flex items-center gap-4 group/item">
          <div class="flex-none transition-transform group-hover/item:translate-x-1">
            <img src="assets/images/svg/triangle.svg" class="text-orange-500" alt=""/>
          </div>
          <span class="text-white text-sm font-sans">${feat}</span>
        </div>
      `).join('');

      ctaEl.innerHTML = `
        ${data.cta}
        <i data-lucide="arrow-right-circle" class="w-5 h-5 text-white/80 transition-transform group-hover/btn:translate-x-1"></i>
      `;
      if (window.lucide) lucide.createIcons();

      elements.forEach(el => el.style.opacity = '1');
    }, 200);
  }
})();
