      document.addEventListener('DOMContentLoaded', () => {
        if (typeof THREE === 'undefined') {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
          script.onload = initWave;
          document.head.appendChild(script);
        } else {
          initWave();
        }

        function initWave() {
          const container = document.getElementById('webgl-wave-container');
          if (!container) return;

          const scene = new THREE.Scene();
          const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 1, 10000);
          camera.position.z = 1000;
          camera.position.y = 300;
          camera.lookAt(scene.position);

          const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
          renderer.setPixelRatio(window.devicePixelRatio);
          renderer.setSize(container.clientWidth, container.clientHeight);
          container.appendChild(renderer.domElement);

          const SEPARATION = 70, AMOUNTX = 80, AMOUNTY = 60;
          const numParticles = AMOUNTX * AMOUNTY;
          const positions = new Float32Array(numParticles * 3);
          const scales = new Float32Array(numParticles);

          let i = 0, j = 0;
          for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {
              positions[i] = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2);
              positions[i + 1] = 0;
              positions[i + 2] = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2);
              scales[j] = 1;
              i += 3;
              j++;
            }
          }

          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

          const material = new THREE.ShaderMaterial({
            uniforms: {
              color: { value: new THREE.Color(0x33D2FF) },
            },
            vertexShader: `
              attribute float scale;
              void main() {
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = scale * (200.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
              }
            `,
            fragmentShader: `
              uniform vec3 color;
              void main() {
                if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.475) discard;
                gl_FragColor = vec4(color, 0.6);
              }
            `,
            transparent: true
          });

          const particles = new THREE.Points(geometry, material);
          scene.add(particles);

          let count = 0;
          function render() {
            requestAnimationFrame(render);
            const positions = particles.geometry.attributes.position.array;
            const scales = particles.geometry.attributes.scale.array;

            let i = 0, j = 0;
            for (let ix = 0; ix < AMOUNTX; ix++) {
              for (let iy = 0; iy < AMOUNTY; iy++) {
                positions[i + 1] = (Math.sin((ix + count) * 0.3) * 50) +
                                   (Math.sin((iy + count) * 0.5) * 50);
                scales[j] = (Math.sin((ix + count) * 0.3) + 1) * 4 +
                            (Math.sin((iy + count) * 0.5) + 1) * 4;
                i += 3;
                j++;
              }
            }

            particles.geometry.attributes.position.needsUpdate = true;
            particles.geometry.attributes.scale.needsUpdate = true;
            renderer.render(scene, camera);
            count += 0.04;
          }

          window.addEventListener('resize', () => {
            if(!container) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
          });

          render();
        }
      });
