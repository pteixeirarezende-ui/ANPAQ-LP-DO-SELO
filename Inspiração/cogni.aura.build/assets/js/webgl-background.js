/* Fundo WebGL animado: feixes de luz e fumaca gerados por shader (canvas #webgl-bg) */
(function () {
  const canvas = document.getElementById('webgl-bg');
  if (!canvas) return;

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return;

  let animationFrameId;

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  window.addEventListener('resize', resize);
  resize();

  const vsSource = `
    attribute vec2 position;
    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fsSource = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_time;

    float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }
    float noise(vec2 x) {
        vec2 i = floor(x);
        vec2 f = fract(x);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    float fbm(vec2 x) {
        float v = 0.0; float a = 0.5; vec2 shift = vec2(100);
        mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
        for (int i = 0; i < 4; ++i) {
            v += a * noise(x); x = rot * x * 2.0 + shift; a *= 0.5;
        }
        return v;
    }

    void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        float aspect = u_resolution.x / u_resolution.y;
        vec2 uv_correct = vec2(uv.x * aspect, uv.y);

        vec3 color = vec3(0.0);

        vec3 col1 = vec3(1.0, 0.0, 0.5); // Magenta
        vec3 col2 = vec3(0.0, 0.8, 1.0); // Cyan
        vec3 col3 = vec3(0.2, 0.0, 0.8); // Deep Purple

        float pos1 = (0.3 * aspect) + sin(u_time * 0.4 + uv.y * 3.0) * 0.05;
        float dist1 = abs(uv_correct.x - pos1);
        float line1 = 0.001 / (dist1 + 0.0001);
        float glow1 = exp(-dist1 * 10.0);
        color += (line1 + glow1 * 0.1) * col1;

        float pos2 = (0.7 * aspect) - cos(u_time * 0.3 + uv.y * 2.5) * 0.08;
        float dist2 = abs(uv_correct.x - pos2);
        float line2 = 0.001 / (dist2 + 0.0001);
        float glow2 = exp(-dist2 * 8.0);
        color += (line2 + glow2 * 0.15) * col2;

        float centerDist = abs(uv.x - 0.5);
        float smokeFalloff = smoothstep(0.5, 0.0, centerDist);

        vec2 smokeUV = uv * 3.0 + vec2(0.0, -u_time * 0.1);
        float smoke = fbm(smokeUV + fbm(smokeUV * 2.0));

        vec3 smokeTint = mix(col3, col1 * 0.3, smoke);
        color += smoke * smokeFalloff * 0.25 * smokeTint;

        float vignette = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
        vignette = clamp(pow(16.0 * vignette, 0.25), 0.0, 1.0);
        color *= vignette;

        gl_FragColor = vec4(color, 1.0);
    }
  `;

  const createShader = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const vertexShader = createShader(gl.VERTEX_SHADER, vsSource);
  const fragmentShader = createShader(gl.FRAGMENT_SHADER, fsSource);
  if (!vertexShader || !fragmentShader) return;

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    return;
  }
  gl.useProgram(program);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  const timeLocation = gl.getUniformLocation(program, 'u_time');

  const startTime = Date.now();
  const render = () => {
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform1f(timeLocation, (Date.now() - startTime) * 0.001);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    animationFrameId = requestAnimationFrame(render);
  };
  render();
})();
