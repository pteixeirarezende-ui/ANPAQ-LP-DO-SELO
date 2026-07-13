        (function () {
          const stack = document.getElementById('pipeline-stack');
          const svg = document.getElementById('pipeline-svg');
          const pathBase = document.getElementById('pipeline-path-base');
          const pathGlow = document.getElementById('pipeline-path-glow');

          if (!stack) return;
          const cards = stack.querySelectorAll('.pipeline-card');

          // Function to dynamically draw the curved connecting line
          function drawCurve() {
            if (!svg || !pathBase || !pathGlow || cards.length < 2) return;

            const rect = stack.getBoundingClientRect();
            let d = '';

            // Calculate node positions relative to the SVG container
            const points = Array.from(cards).map(card => {
              const cardRect = card.getBoundingClientRect();
              const isLeft = card.classList.contains('self-start');
              // Node is horizontally centered on the edge (12px wide -> 6px offset)
              const x = isLeft ? (cardRect.right - rect.left) + 6 : (cardRect.left - rect.left) - 6;
              const y = (cardRect.top - rect.top) + (cardRect.height / 2);
              return { x, y, isLeft };
            });

            d += `M ${points[0].x} ${points[0].y} `;

            for (let i = 1; i < points.length; i++) {
              const prev = points[i - 1];
              const curr = points[i];

              // Adaptive curvature based on distance to ensure smooth sweeping curves
              const distY = curr.y - prev.y;
              const curveture = Math.max(Math.abs(curr.x - prev.x) * 0.45, distY * 0.4, 50);

              // Control points push horizontally outwards from the nodes
              const cp1x = prev.isLeft ? prev.x + curveture : prev.x - curveture;
              const cp2x = curr.isLeft ? curr.x + curveture : curr.x - curveture;

              d += `C ${cp1x} ${prev.y}, ${cp2x} ${curr.y}, ${curr.x} ${curr.y} `;
            }

            pathBase.setAttribute('d', d);
            pathGlow.setAttribute('d', d);

            // Prepare animation properties
            const length = pathBase.getTotalLength();
            pathGlow.style.strokeDasharray = length;
            updateScroll();
          }

          // Animate the line based on scroll progress
          function updateScroll() {
            if (!pathGlow) return;
            const rect = stack.getBoundingClientRect();
            const viewHeight = window.innerHeight;

            // Start animation when top of stack enters view, end when bottom is in middle
            const start = rect.top - (viewHeight * 0.7);
            const end = rect.bottom - (viewHeight * 0.4);
            const total = end - start;

            let progress = -start / total;
            progress = Math.max(0, Math.min(1, progress));

            const length = pathBase.getTotalLength();
            if (length > 0) {
                pathGlow.style.strokeDashoffset = length * (1 - progress);
            }
          }

          // Intersection Observer for revealing cards and lighting up nodes
          const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const card = entry.target;
                card.classList.remove('opacity-0', 'translate-y-8', 'scale-95');
                card.classList.add('opacity-100', 'translate-y-0', 'scale-100');

                const node = card.querySelector('.pipeline-side-node');
                if (node) {
                  node.classList.remove('border-white/20', 'bg-[#030304]');
                  node.classList.add(
                    'border-[#33D2FF]/60',
                    'bg-[#33D2FF]',
                    'shadow-[0_0_14px_rgba(51,210,255,0.6)]'
                  );
                }
                obs.unobserve(card);
              }
            });
          }, {
            threshold: 0.2,
            rootMargin: '0px 0px -15% 0px'
          });

          cards.forEach(card => observer.observe(card));

          // Re-draw curve on resize to keep connections exact
          if (window.ResizeObserver) {
            const resizeObs = new ResizeObserver(() => drawCurve());
            resizeObs.observe(stack);
          } else {
            window.addEventListener('resize', drawCurve);
          }

          window.addEventListener('scroll', updateScroll, { passive: true });

          // Initial calculation
          setTimeout(drawCurve, 100);
        })();
