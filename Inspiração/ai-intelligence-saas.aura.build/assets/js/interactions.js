      document.addEventListener('DOMContentLoaded', () => {
        const header = document.getElementById('header');

        window.addEventListener('scroll', () => {
          if (window.scrollY > 50) header.classList.add('scrolled');
          else header.classList.remove('scrolled');
        });

        const revealObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
            }
          });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

        /* HERO GLOBE */
        const canvas = document.getElementById('hero-globe');
        const ctx = canvas.getContext('2d');
        let width, height;

        const globeNodes = [];
        const arcs = [];
        const numNodes = 800;
        const globeRadius = 220;

        const phi = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < numNodes; i++) {
          const y = 1 - (i / (numNodes - 1)) * 2;
          const radius = Math.sqrt(1 - y * y);
          const theta = phi * i;

          const x = Math.cos(theta) * radius;
          const z = Math.sin(theta) * radius;
          const isHighlight = Math.random() > 0.92;

          const depthOffset = 1 + (Math.random() * 0.06 - 0.03);

          globeNodes.push({
            x: x * depthOffset,
            y: y * depthOffset,
            z: z * depthOffset,
            baseRadius: isHighlight ? 2 : 1,
            color: isHighlight ? '#33D2FF' : 'rgba(74, 140, 255, 0.8)'
          });
        }

        for (let i = 0; i < 18; i++) {
          arcs.push({
            n1: Math.floor(Math.random() * numNodes),
            n2: Math.floor(Math.random() * numNodes),
            progress: Math.random(),
            speed: 0.002 + Math.random() * 0.005
          });
        }

        const orbitalRings = [
          { radius: 1.3, tiltX: 0.2, tiltZ: 0.5, speed: 0.001, angle: 0 },
          { radius: 1.45, tiltX: -0.4, tiltZ: 0.2, speed: -0.0015, angle: Math.PI / 3 },
          { radius: 1.2, tiltX: 0.5, tiltZ: -0.3, speed: 0.002, angle: Math.PI / 1.5 }
        ];

        function resizeCanvas() {
          const parent = canvas.parentElement;
          width = parent.clientWidth;
          height = parent.clientHeight;

          const dpr = window.devicePixelRatio || 1;
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;

          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.scale(dpr, dpr);
        }

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        let angleY = 0;
        let angleX = 0.2;

        function renderGlobe() {
          ctx.clearRect(0, 0, width, height);
          angleY += 0.002;

          const cx = width / 2;
          const cy = height / 2;
          const fov = 800;

          const gradient = ctx.createRadialGradient(cx, cy, globeRadius * 0.4, cx, cy, globeRadius * 1.6);
          gradient.addColorStop(0, 'rgba(51, 210, 255, 0.15)');
          gradient.addColorStop(0.5, 'rgba(51, 210, 255, 0.04)');
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);

          const sinY = Math.sin(angleY);
          const cosY = Math.cos(angleY);
          const sinX = Math.sin(angleX);
          const cosX = Math.cos(angleX);

          ctx.lineWidth = 1;
          ctx.strokeStyle = 'rgba(74, 140, 255, 0.1)';
          ctx.setLineDash([2, 4]);

          for (let lat = -4; lat <= 4; lat++) {
            const y = lat * 0.22;
            const r = Math.sqrt(1 - y * y) * globeRadius;
            ctx.beginPath();
            for (let lon = 0; lon <= Math.PI * 2.01; lon += 0.1) {
              const x = Math.cos(lon) * r;
              const z = Math.sin(lon) * r;

              const x1 = x * cosY - z * sinY;
              const z1 = x * sinY + z * cosY;

              const y1 = (y * globeRadius) * cosX - z1 * sinX;
              const z2 = (y * globeRadius) * sinX + z1 * cosX;

              const scale = fov / (fov + z2);
              const px = cx + x1 * scale;
              const py = cy + y1 * scale;

              if (lon === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.stroke();
          }

          for (let lon = 0; lon < Math.PI; lon += Math.PI / 6) {
            ctx.beginPath();
            for (let lat = -Math.PI/2; lat <= Math.PI/2 + 0.01; lat += 0.1) {
              const y = Math.sin(lat) * globeRadius;
              const r = Math.cos(lat) * globeRadius;
              const x = Math.cos(lon) * r;
              const z = Math.sin(lon) * r;

              const x1 = x * cosY - z * sinY;
              const z1 = x * sinY + z * cosY;

              const y1 = y * cosX - z1 * sinX;
              const z2 = y * sinX + z1 * cosX;

              const scale = fov / (fov + z2);
              const px = cx + x1 * scale;
              const py = cy + y1 * scale;

              if (lat === -Math.PI/2) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.stroke();
          }

          ctx.setLineDash([]);

          const projectedNodes = [];

          for (let i = 0; i < numNodes; i++) {
            const n = globeNodes[i];

            const x1 = n.x * cosY - n.z * sinY;
            const z1 = n.x * sinY + n.z * cosY;

            const y1 = n.y * cosX - z1 * sinX;
            const z2 = n.y * sinX + z1 * cosX;

            const scale = fov / (fov + z2 * globeRadius);
            const px = cx + x1 * globeRadius * scale;
            const py = cy + y1 * globeRadius * scale;

            projectedNodes.push({
              px,
              py,
              z: z2,
              scale,
              color: n.color,
              r: n.baseRadius
            });
          }

          orbitalRings.forEach(ring => {
            ring.angle += ring.speed;
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(51, 210, 255, 0.2)';
            ctx.lineWidth = 1;
            for (let i = 0; i <= Math.PI * 2.01; i += 0.05) {
              const x = Math.cos(i) * globeRadius * ring.radius;
              const z = Math.sin(i) * globeRadius * ring.radius;

              const ty = x * ring.tiltX + z * ring.tiltZ;

              const x1 = x * Math.cos(ring.angle) - z * Math.sin(ring.angle);
              const z1 = x * Math.sin(ring.angle) + z * Math.cos(ring.angle);

              const px_rot = x1 * cosY - z1 * sinY;
              const pz_rot = x1 * sinY + z1 * cosY;

              const py_rot = ty * cosX - pz_rot * sinX;
              const final_z = ty * sinX + pz_rot * cosX;

              const scale = fov / (fov + final_z);
              const px = cx + px_rot * scale;
              const py = cy + py_rot * scale;

              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.stroke();

            const dot_x = Math.cos(0) * globeRadius * ring.radius;
            const dot_z = Math.sin(0) * globeRadius * ring.radius;
            const dot_ty = dot_x * ring.tiltX + dot_z * ring.tiltZ;

            const dx1 = dot_x * Math.cos(ring.angle) - dot_z * Math.sin(ring.angle);
            const dz1 = dot_x * Math.sin(ring.angle) + dot_z * Math.cos(ring.angle);

            const px_rot_d = dx1 * cosY - dz1 * sinY;
            const pz_rot_d = dx1 * sinY + dz1 * cosY;
            const py_rot_d = dot_ty * cosX - pz_rot_d * sinX;
            const final_z_d = dot_ty * sinX + pz_rot_d * cosX;

            if (final_z_d > -globeRadius * 1.5) {
               const scale = fov / (fov + final_z_d);
               const pX = cx + px_rot_d * scale;
               const pY = cy + py_rot_d * scale;
               ctx.beginPath();
               ctx.arc(pX, pY, 2 * scale, 0, Math.PI * 2);
               ctx.fillStyle = '#33D2FF';
               ctx.fill();

               ctx.beginPath();
               ctx.arc(pX, pY, 6 * scale, 0, Math.PI * 2);
               ctx.fillStyle = 'rgba(51, 210, 255, 0.4)';
               ctx.fill();
            }
          });

          ctx.lineWidth = 1.5;

          arcs.forEach((arc) => {
            arc.progress += arc.speed;
            if (arc.progress > 1) arc.progress = 0;

            const pn1 = projectedNodes[arc.n1];
            const pn2 = projectedNodes[arc.n2];

            if (pn1.z > -0.5 && pn2.z > -0.5) {
              ctx.beginPath();
              ctx.moveTo(pn1.px, pn1.py);

              const mx = (pn1.px + pn2.px) / 2;
              const my = (pn1.py + pn2.py) / 2 - 20 * pn1.scale;

              ctx.quadraticCurveTo(mx, my, pn2.px, pn2.py);

              const grad = ctx.createLinearGradient(pn1.px, pn1.py, pn2.px, pn2.py);
              grad.addColorStop(0, 'rgba(51, 210, 255, 0)');
              grad.addColorStop(arc.progress, 'rgba(51, 210, 255, 0.8)');
              grad.addColorStop(Math.min(1, arc.progress + 0.1), 'rgba(51, 210, 255, 0)');

              ctx.strokeStyle = grad;
              ctx.stroke();
            }
          });

          projectedNodes.sort((a, b) => b.z - a.z);

          for (let i = 0; i < projectedNodes.length; i++) {
            const p = projectedNodes[i];
            const alpha = Math.min(1, Math.max(0.1, p.z + 1.2));

            const distFromCenter = Math.sqrt(Math.pow(p.px - cx, 2) + Math.pow(p.py - cy, 2));
            const edgeFactor = Math.min(1, distFromCenter / (globeRadius * 0.8));
            const finalAlpha = Math.min(1, alpha * (0.5 + edgeFactor * 0.5));

            ctx.beginPath();
            ctx.arc(p.px, p.py, p.r * p.scale, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = finalAlpha;
            ctx.fill();

            if (p.r > 1.5 && finalAlpha > 0.4) {
              ctx.beginPath();
              ctx.arc(p.px, p.py, p.r * 2.5 * p.scale, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(51, 210, 255, 0.3)';
              ctx.fill();
            }
          }

          ctx.globalAlpha = 1;
          requestAnimationFrame(renderGlobe);
        }

        renderGlobe();

        /* GRAVITY CARDS */
        const gContainer = document.getElementById('g-container');
        const gStack = document.getElementById('g-stack');
        const gLayers = document.querySelectorAll('.g-layer');

        let tX = 0;
        let tY = 0;
        let cX = [0, 0, 0];
        let cY = [0, 0, 0];
        const speeds = [0.1, 0.05, 0.02];

        if(gContainer) {
          gContainer.addEventListener('mousemove', (e) => {
            const rect = gContainer.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            gStack.style.transform = `rotateX(${-y * 15}deg) rotateY(${x * 15}deg)`;
            tX = x * 20;
            tY = y * 20;
          });

          gContainer.addEventListener('mouseleave', () => {
            gStack.style.transform = 'rotateX(0deg) rotateY(0deg)';
            tX = 0;
            tY = 0;
          });

          function renderGravity() {
            for (let i = 0; i < 3; i++) {
              cX[i] += (tX - cX[i]) * speeds[i];
              cY[i] += (tY - cY[i]) * speeds[i];

              const z = i === 0 ? 0 : i === 1 ? -20 : -40;
              const s = i === 0 ? 1 : i === 1 ? 0.95 : 0.9;
              gLayers[2 - i].style.transform = `translate3d(${cX[i]}px, ${cY[i]}px, ${z}px) scale(${s})`;
            }
            requestAnimationFrame(renderGravity);
          }

          renderGravity();
        }

        /* NEURAL PANEL */
        const inpFlux = document.getElementById('inp-flux');
        const valFlux = document.getElementById('val-flux');
        const modFlux = document.getElementById('mod-flux');
        const subFlux = document.getElementById('sub-flux');
        const pulseFlux = document.getElementById('pulse-flux');
        let fluxTimeout;

        if(inpFlux) {
          inpFlux.addEventListener('input', (e) => {
            valFlux.innerText = `${e.target.value}%`;
            pulseFlux.classList.remove('fire');
            void pulseFlux.offsetWidth;
            pulseFlux.classList.add('fire');

            modFlux.classList.add('active-blue');
            subFlux.innerText = `Ingesting ${e.target.value}TB...`;

            clearTimeout(fluxTimeout);
            fluxTimeout = setTimeout(() => {
              modFlux.classList.remove('active-blue');
              subFlux.innerText = `Steady at ${e.target.value}%.`;
            }, 800);
          });
        }

        const inpRelay = document.getElementById('inp-relay');
        const valRelay = document.getElementById('val-relay');
        const modRelay = document.getElementById('mod-relay');
        const subRelay = document.getElementById('sub-relay');
        const pulseRelay = document.getElementById('pulse-relay');
        let relayActive = false;

        if(inpRelay) {
          inpRelay.addEventListener('click', () => {
            relayActive = !relayActive;

            if (relayActive) {
              inpRelay.classList.add('active');
              valRelay.innerText = 'ON';
              valRelay.style.color = 'var(--accent-cyan)';
            } else {
              inpRelay.classList.remove('active');
              valRelay.innerText = 'OFF';
              valRelay.style.color = 'var(--text-dim)';
            }

            pulseRelay.classList.remove('fire');
            void pulseRelay.offsetWidth;
            pulseRelay.classList.add('fire');

            setTimeout(() => {
              if (relayActive) {
                modRelay.classList.add('active-cyan');
                subRelay.innerText = 'Bypass open. Traffic rerouted.';
              } else {
                modRelay.classList.remove('active-cyan');
                subRelay.innerText = 'Protocol locked.';
              }
            }, 400);
          });
        }

        /* TIMELINE */
        const tlItems = document.querySelectorAll('.tl-item');
        const tlProgress = document.getElementById('tl-progress');

        const tlObserver = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            if(tlProgress) tlProgress.style.height = '100%';
            tlItems.forEach((item, idx) => {
              setTimeout(() => item.classList.add('active'), 400 + idx * 500);
            });
            tlObserver.disconnect();
          }
        }, { threshold: 0.5 });

        const tlContainer = document.getElementById('tl-container');
        if(tlContainer) tlObserver.observe(tlContainer);

        /* SIGNAL BUTTON */
        const lsContainer = document.getElementById('ls-container');
        const lsBtn = document.getElementById('ls-btn');
        const lsText = document.getElementById('ls-text');

        if (lsText) {
          const textContent = lsText.innerText;
          lsText.innerHTML = '';

          function buildSignalText(text) {
            lsText.innerHTML = '';
            text.split('').forEach((char) => {
              const span = document.createElement('span');
              span.className = 'ls-char';
              span.innerText = char === ' ' ? '\u00A0' : char;
              span.style.setProperty('--rand', Math.random());
              lsText.appendChild(span);
            });
          }

          buildSignalText(textContent);

          if(lsBtn) {
            lsBtn.addEventListener('click', () => {
              const ring = document.createElement('div');
              ring.className = 'ls-burst-ring active';
              lsContainer.appendChild(ring);

              lsText.innerText = 'EXECUTING...';
              lsText.style.color = 'var(--accent-blue)';

              setTimeout(() => {
                buildSignalText(textContent);
                lsText.style.color = '#fff';
              }, 2000);

              setTimeout(() => ring.remove(), 800);
            });
          }
        }

        /* TESTIMONIALS */
        const orbitSystem = document.getElementById('orbit-system');
        const orbitRing = document.getElementById('orbit-ring');
        const orbitLines = document.getElementById('orbit-lines');
        const ocQuote = document.getElementById('oc-quote');
        const ocMeta = document.getElementById('oc-meta');
        const ocName = document.getElementById('oc-name');
        const ocRole = document.getElementById('oc-role');

        const testimonials = [
          {
            img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            name: 'Sarah Jenkins',
            role: 'CTO, Nexus Corp',
            text: '"Aura has completely removed our deployment latency. It feels like the platform predicts our scaling needs before the metrics even spike."'
          },
          {
            img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
            name: 'David Chen',
            role: 'Lead Architect, Synthetix',
            text: '"The spatial logic interfaces are game-changing. Our engineers visually orchestrate pipelines in minutes instead of days."'
          },
          {
            img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
            name: 'Elena Rostova',
            role: 'VP Engineering, Vektor',
            text: '"Never seen a platform map neural logic so intuitively. It is literally a living map of our infrastructure."'
          },
          {
            img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
            name: 'Marcus Cole',
            role: 'DevOps Lead, Omni',
            text: '"Deterministic deployments with a single genesis command. Aura represents the pinnacle of modern enterprise tooling."'
          }
        ];

        if(orbitSystem) {
          const radius = window.innerWidth < 768 ? 140 : 260;
          const centerOffset = window.innerWidth < 768 ? 200 : 300;
          const orbitNodes = [];
          const orbitLinesList = [];

          testimonials.forEach((t, i) => {
            const angle = (i / testimonials.length) * Math.PI * 2;

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', centerOffset);
            line.setAttribute('y1', centerOffset);
            line.setAttribute('x2', centerOffset + Math.cos(angle) * radius);
            line.setAttribute('y2', centerOffset + Math.sin(angle) * radius);
            line.classList.add('orbit-line');
            if (i === 0) line.classList.add('active');
            orbitLines.appendChild(line);
            orbitLinesList.push(line);

            const node = document.createElement('div');
            node.className = `orbit-node ${i === 0 ? 'active' : ''}`;

            const img = document.createElement('img');
            img.src = t.img;
            node.appendChild(img);

            node.style.left = `${centerOffset + Math.cos(angle) * radius}px`;
            node.style.top = `${centerOffset + Math.sin(angle) * radius}px`;

            node.addEventListener('click', () => activateTestimonial(i));
            orbitRing.appendChild(node);

            orbitNodes.push({ el: node, angle });
          });

          function activateTestimonial(index) {
            orbitNodes.forEach((n) => n.el.classList.remove('active'));
            orbitLinesList.forEach((l) => l.classList.remove('active'));
            orbitNodes[index].el.classList.add('active');
            orbitLinesList[index].classList.add('active');

            ocQuote.style.opacity = 0;
            ocMeta.style.opacity = 0;

            setTimeout(() => {
              ocQuote.innerText = testimonials[index].text;
              ocName.innerText = testimonials[index].name;
              ocRole.innerText = testimonials[index].role;
              ocQuote.style.opacity = 1;
              ocMeta.style.opacity = 1;
            }, 300);
          }

          let orbAngle = 0;
          let orbSpeed = 0.1;

          orbitSystem.addEventListener('mouseenter', () => { orbSpeed = 0.02; });
          orbitSystem.addEventListener('mouseleave', () => { orbSpeed = 0.1; });

          function renderOrbit() {
            orbAngle = (orbAngle + orbSpeed) % 360;
            orbitRing.style.transform = `rotate(${orbAngle}deg)`;
            orbitLines.style.transform = `rotate(${orbAngle}deg)`;

            orbitNodes.forEach((n) => {
              n.el.style.transform = `rotate(${-orbAngle}deg) scale(${n.el.classList.contains('active') ? 1.2 : 1})`;
            });

            requestAnimationFrame(renderOrbit);
          }

          renderOrbit();
        }
      });

      document.addEventListener('DOMContentLoaded', () => {
        const mobileBtn = document.getElementById('mobile-menu-btn');
        const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-cta a');

        if (mobileBtn) {
          mobileBtn.addEventListener('click', () => {
            document.body.classList.toggle('menu-open');
          });

          mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
              document.body.classList.remove('menu-open');
            });
          });
        }
      });
