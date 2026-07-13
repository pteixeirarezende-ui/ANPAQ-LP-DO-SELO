      (function() {
        const stack = document.querySelector('.testimonial-stack-wrap');
        if (!stack) return;

        const cards = Array.from(stack.querySelectorAll('.testimonial-stack-card'));
        let stateIndices = [2, 1, 0];

        let isDragging = false;
        let startX = 0;
        let currentX = 0;

        function getResponsiveStates() {
          const w = window.innerWidth;
          if (w <= 767) {
            return [
              { id: 'front', top: 86, scale: 1, rot: 0, op: 1, z: 3 },
              { id: 'back-right', top: 34, scale: 0.98, rot: 4, op: 0.68, z: 2 },
              { id: 'back-left', top: 18, scale: 0.96, rot: -4, op: 0.55, z: 1 }
            ];
          } else if (w <= 1024) {
            return [
              { id: 'front', top: 108, scale: 1, rot: 0, op: 1, z: 3 },
              { id: 'back-right', top: 44, scale: 0.97, rot: 5, op: 0.68, z: 2 },
              { id: 'back-left', top: 26, scale: 0.95, rot: -5, op: 0.55, z: 1 }
            ];
          }
          return [
            { id: 'front', top: 120, scale: 1, rot: 0, op: 1, z: 3 },
            { id: 'back-right', top: 54, scale: 0.95, rot: 6, op: 0.68, z: 2 },
            { id: 'back-left', top: 36, scale: 0.93, rot: -6, op: 0.55, z: 1 }
          ];
        }

        function updateCards(progress = 0) {
          const states = getResponsiveStates();
          cards.forEach((card, i) => {
            const stateIdx = stateIndices[i];
            let currentState = states[stateIdx];
            let nextState;

            if (progress < 0) {
              nextState = states[stateIdx === 0 ? 2 : (stateIdx === 1 ? 0 : 1)];
            } else if (progress > 0) {
              nextState = states[stateIdx === 0 ? 1 : (stateIdx === 2 ? 0 : 2)];
            } else {
              nextState = currentState;
            }

            const p = Math.abs(progress);

            const top = currentState.top + (nextState.top - currentState.top) * p;
            const scale = currentState.scale + (nextState.scale - currentState.scale) * p;
            let rot = currentState.rot + (nextState.rot - currentState.rot) * p;
            const op = currentState.op + (nextState.op - currentState.op) * p;

            let tx = 0;
            if (stateIdx === 0) {
              tx = currentX - startX;
              rot += (tx * 0.04);
            }

            card.style.top = `${top}px`;
            card.style.zIndex = stateIdx === 0 ? 3 : (p > 0.5 && nextState.id === 'front' ? 4 : currentState.z);
            card.style.opacity = op;
            card.style.transform = `translateX(calc(-50% + ${tx}px)) rotate(${rot}deg) scale(${scale})`;
          });
        }

        function onStart(e) {
          const card = e.target.closest('.testimonial-stack-card');
          if (!card) return;

          const index = cards.indexOf(card);
          if (stateIndices[index] !== 0) {
            if (stateIndices[index] === 1) {
               stateIndices = stateIndices.map(s => s === 0 ? 2 : (s === 1 ? 0 : 1));
            } else if (stateIndices[index] === 2) {
               stateIndices = stateIndices.map(s => s === 0 ? 1 : (s === 2 ? 0 : 2));
            }
            resetStyles();
            return;
          }

          isDragging = true;
          startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
          currentX = startX;

          cards.forEach(c => {
             c.className = 'testimonial-stack-card no-transition';
          });
          updateCards(0);
        }

        function onMove(e) {
          if (!isDragging) return;
          currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
          let dragDist = currentX - startX;
          let progress = dragDist / (window.innerWidth * 0.35);
          progress = Math.max(-1, Math.min(1, progress));
          updateCards(progress);
        }

        function resetStyles() {
           const states = getResponsiveStates();
           cards.forEach((c, i) => {
              c.removeAttribute('style');
              c.className = `testimonial-stack-card card-${states[stateIndices[i]].id}`;
           });
        }

        function onEnd(e) {
          if (!isDragging) return;
          isDragging = false;
          let dragDist = currentX - startX;

          if (dragDist < -60) {
             stateIndices = stateIndices.map(s => s === 0 ? 2 : (s === 1 ? 0 : 1));
          } else if (dragDist > 60) {
             stateIndices = stateIndices.map(s => s === 0 ? 1 : (s === 2 ? 0 : 2));
          }

          resetStyles();
        }

        stack.addEventListener('mousedown', onStart);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onEnd);

        stack.addEventListener('touchstart', onStart, {passive: true});
        window.addEventListener('touchmove', onMove, {passive: true});
        window.addEventListener('touchend', onEnd);
      })();
