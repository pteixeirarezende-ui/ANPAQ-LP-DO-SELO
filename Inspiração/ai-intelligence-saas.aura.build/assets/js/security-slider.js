        (function () {
          const shell = document.getElementById('sec-slider-shell');
          const thumb = document.getElementById('sec-slider-thumb');
          const progress = document.getElementById('sec-slider-progress');
          const label = document.getElementById('sec-slider-label');

          if (!shell || !thumb || !progress || !label) return;

          let isDragging = false;
          let startX = 0;
          let currentX = 0;
          let maxX = 0;

          function updateBounds() {
            maxX = shell.clientWidth - thumb.offsetWidth - 8;
          }

          function setPosition(x) {
            const clamped = Math.max(0, Math.min(x, maxX));
            currentX = clamped;
            thumb.style.transform = `translateX(${clamped}px)`;
            progress.style.width = `${clamped + thumb.offsetWidth + 8}px`;

            const ratio = maxX > 0 ? clamped / maxX : 0;

            if (ratio > 0.92) {
              label.textContent = 'Armed';
              label.style.color = '#fff';
            } else if (ratio > 0.45) {
              label.textContent = 'Verifying...';
              label.style.color = '#d4d4d8';
            } else {
              label.textContent = 'Slide to Execute';
              label.style.color = '#a1a1aa';
            }
          }

          function resetSlider() {
            thumb.style.transition = 'transform 0.45s cubic-bezier(0.16,1,0.3,1)';
            progress.style.transition = 'width 0.45s cubic-bezier(0.16,1,0.3,1)';
            setPosition(0);
            setTimeout(() => {
              thumb.style.transition = '';
              progress.style.transition = '';
            }, 500);
          }

          function completeSlider() {
            thumb.style.transition = 'transform 0.35s cubic-bezier(0.16,1,0.3,1)';
            progress.style.transition = 'width 0.35s cubic-bezier(0.16,1,0.3,1)';
            setPosition(maxX);
            label.textContent = 'Executing';
            label.style.color = '#fff';

            setTimeout(() => {
              label.textContent = 'Consensus Locked';
            }, 900);

            setTimeout(() => {
              resetSlider();
            }, 2200);
          }

          function pointerX(event) {
            return event.touches ? event.touches[0].clientX : event.clientX;
          }

          function dragStart(event) {
            updateBounds();
            isDragging = true;
            thumb.style.transition = '';
            progress.style.transition = '';
            startX = pointerX(event) - currentX;
          }

          function dragMove(event) {
            if (!isDragging) return;
            const x = pointerX(event) - startX;
            setPosition(x);
          }

          function dragEnd() {
            if (!isDragging) return;
            isDragging = false;

            const ratio = maxX > 0 ? currentX / maxX : 0;
            if (ratio > 0.88) completeSlider();
            else resetSlider();
          }

          thumb.addEventListener('mousedown', dragStart);
          window.addEventListener('mousemove', dragMove);
          window.addEventListener('mouseup', dragEnd);

          thumb.addEventListener('touchstart', dragStart, { passive: true });
          window.addEventListener('touchmove', dragMove, { passive: true });
          window.addEventListener('touchend', dragEnd);

          window.addEventListener('resize', () => {
            updateBounds();
            resetSlider();
          });

          updateBounds();
          setPosition(0);
        })();
