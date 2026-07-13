        (function () {
          const container = document.getElementById("g-container");
          const stack = document.getElementById("g-stack");
          if (!container || !stack) return;

          const layer1 = stack.querySelector(".g-layer-1");
          const layer2 = stack.querySelector(".g-layer-2");
          const layer3 = stack.querySelector(".g-layer-3");

          let expanded = false;
          let rect = stack.getBoundingClientRect();

          const state = {
            mx: 0,
            my: 0,
            tx: 0,
            ty: 0,
            l1x: 0,
            l1y: 0,
            l2x: 0,
            l2y: 0,
            l3x: 0,
            l3y: 0
          };

          function updateRect() {
            rect = stack.getBoundingClientRect();
          }

          function animate() {
            state.tx += (state.mx - state.tx) * 0.08;
            state.ty += (state.my - state.ty) * 0.08;

            state.l1x += (state.ty - state.l1x) * 0.12;
            state.l1y += (state.tx - state.l1y) * 0.12;

            state.l2x += (state.ty * 0.7 - state.l2x) * 0.08;
            state.l2y += (state.tx * 0.7 - state.l2y) * 0.08;

            state.l3x += (state.ty * 0.45 - state.l3x) * 0.06;
            state.l3y += (state.tx * 0.45 - state.l3y) * 0.06;

            if (!expanded) {
              stack.style.transform = `rotateX(${-state.tx}deg) rotateY(${state.ty}deg)`;
              layer1.style.transform = `translate3d(0, 0, 0) rotateX(${state.l1x * 0.35}deg) rotateY(${state.l1y * 0.35}deg)`;
              layer2.style.transform = `translate3d(0, 28px, -60px) scale(0.97) rotateX(${state.l2x * 0.25}deg) rotateY(${state.l2y * 0.25}deg)`;
              layer3.style.transform = `translate3d(0, 54px, -120px) scale(0.94) rotateX(${state.l3x * 0.2}deg) rotateY(${state.l3y * 0.2}deg)`;
            } else {
              stack.style.transform = `rotateX(${-state.tx * 0.35}deg) rotateY(${state.ty * 0.35}deg)`;
            }

            requestAnimationFrame(animate);
          }

          container.addEventListener("mousemove", (e) => {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const px = (x / rect.width - 0.5) * 2;
            const py = (y / rect.height - 0.5) * 2;

            state.my = px * 10;
            state.mx = py * 8;
          });

          container.addEventListener("mouseleave", () => {
            state.mx = 0;
            state.my = 0;
          });

          container.addEventListener("click", () => {
            expanded = !expanded;
            stack.classList.toggle("is-expanded", expanded);
          });

          window.addEventListener("resize", updateRect);
          updateRect();
          animate();
        })();
