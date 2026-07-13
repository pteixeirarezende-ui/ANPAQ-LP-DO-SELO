/* Antigravity WebGL particle scenes — ported from the original Angular bundle
   (2fc03d683efdc380_main-QY6M2GAO.js). Two scenes:
   - MainParticlesScene  : hero / download "main particles" (ring-displacement field)
   - MorphingScene       : try-solutions "morphing particles" (image-shaped points)
   ES module — imports three.js r180 from the bundled vendor copy. */
import * as THREE from './vendor/three.module.min.js';
(function () {
  'use strict';
  var T = THREE;

  /* ---- GLSL simplex-noise helpers shared by both scenes ---- */
  var NOISE_GLSL = "\n  // MATHS\n  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }\n  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}\n  float permute(float x){return floor(mod(((x*34.0)+1.0)*x, 289.0));}\n\n  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}\n  float taylorInvSqrt(float r){return 1.79284291400159 - 0.85373472095314 * r;}\n\n  // SIMPLEX NOISES\n  // Simplex 2D noise\n  //\n  float snoise(vec2 v){\n    const vec4 C = vec4(0.211324865405187, 0.366025403784439,\n            -0.577350269189626, 0.024390243902439);\n    vec2 i  = floor(v + dot(v, C.yy) );\n    vec2 x0 = v -   i + dot(i, C.xx);\n    vec2 i1;\n    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\n    vec4 x12 = x0.xyxy + C.xxzz;\n    x12.xy -= i1;\n    i = mod(i, 289.0);\n    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))\n    + i.x + vec3(0.0, i1.x, 1.0 ));\n    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),\n      dot(x12.zw,x12.zw)), 0.0);\n    m = m*m ;\n    m = m*m ;\n    vec3 x = 2.0 * fract(p * C.www) - 1.0;\n    vec3 h = abs(x) - 0.5;\n    vec3 ox = floor(x + 0.5);\n    vec3 a0 = x - ox;\n    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );\n    vec3 g;\n    g.x  = a0.x  * x0.x  + h.x  * x0.y;\n    g.yz = a0.yz * x12.xz + h.yz * x12.yw;\n    return 130.0 * dot(m, g);\n  }\n\n  //\tSimplex 3D Noise\n  //\tby Ian McEwan, Ashima Arts\n  //\n  float snoise(vec3 v){\n    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);\n\n  // First corner\n    vec3 i  = floor(v + dot(v, C.yyy) );\n    vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n  // Other corners\n    vec3 g = step(x0.yzx, x0.xyz);\n    vec3 l = 1.0 - g;\n    vec3 i1 = min( g.xyz, l.zxy );\n    vec3 i2 = max( g.xyz, l.zxy );\n\n    //  x0 = x0 - 0. + 0.0 * C\n    vec3 x1 = x0 - i1 + 1.0 * C.xxx;\n    vec3 x2 = x0 - i2 + 2.0 * C.xxx;\n    vec3 x3 = x0 - 1. + 3.0 * C.xxx;\n\n  // Permutations\n    i = mod(i, 289.0 );\n    vec4 p = permute( permute( permute(\n              i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n            + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n  // Gradients\n  // ( N*N points uniformly over a square, mapped onto an octahedron.)\n    float n_ = 1.0/7.0; // N=7\n    vec3  ns = n_ * D.wyz - D.xzx;\n\n    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)\n\n    vec4 x_ = floor(j * ns.z);\n    vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n    vec4 x = x_ *ns.x + ns.yyyy;\n    vec4 y = y_ *ns.x + ns.yyyy;\n    vec4 h = 1.0 - abs(x) - abs(y);\n\n    vec4 b0 = vec4( x.xy, y.xy );\n    vec4 b1 = vec4( x.zw, y.zw );\n\n    vec4 s0 = floor(b0)*2.0 + 1.0;\n    vec4 s1 = floor(b1)*2.0 + 1.0;\n    vec4 sh = -step(h, vec4(0.0));\n\n    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n    vec3 p0 = vec3(a0.xy,h.x);\n    vec3 p1 = vec3(a0.zw,h.y);\n    vec3 p2 = vec3(a1.xy,h.z);\n    vec3 p3 = vec3(a1.zw,h.w);\n\n  //Normalise gradients\n    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n    p0 *= norm.x;\n    p1 *= norm.y;\n    p2 *= norm.z;\n    p3 *= norm.w;\n\n  // Mix final noise value\n    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n    m = m * m;\n    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),\n                                  dot(p2,x2), dot(p3,x3) ) );\n  }\n\n\n  //\tSimplex 4D Noise\n  //\tby Ian McEwan, Ashima Arts\n  //\n  vec4 grad4(float j, vec4 ip){\n    const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);\n    vec4 p,s;\n\n    p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;\n    p.w = 1.5 - dot(abs(p.xyz), ones.xyz);\n    s = vec4(lessThan(p, vec4(0.0)));\n    p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;\n\n    return p;\n  }\n\n  float snoise(vec4 v){\n    const vec2  C = vec2( 0.138196601125010504,  // (5 - sqrt(5))/20  G4\n                          0.309016994374947451); // (sqrt(5) - 1)/4   F4\n  // First corner\n    vec4 i  = floor(v + dot(v, C.yyyy) );\n    vec4 x0 = v -   i + dot(i, C.xxxx);\n\n  // Other corners\n\n  // Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)\n    vec4 i0;\n\n    vec3 isX = step( x0.yzw, x0.xxx );\n    vec3 isYZ = step( x0.zww, x0.yyz );\n  //  i0.x = dot( isX, vec3( 1.0 ) );\n    i0.x = isX.x + isX.y + isX.z;\n    i0.yzw = 1.0 - isX;\n\n  //  i0.y += dot( isYZ.xy, vec2( 1.0 ) );\n    i0.y += isYZ.x + isYZ.y;\n    i0.zw += 1.0 - isYZ.xy;\n\n    i0.z += isYZ.z;\n    i0.w += 1.0 - isYZ.z;\n\n    // i0 now contains the unique values 0,1,2,3 in each channel\n    vec4 i3 = clamp( i0, 0.0, 1.0 );\n    vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );\n    vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );\n\n    //  x0 = x0 - 0.0 + 0.0 * C\n    vec4 x1 = x0 - i1 + 1.0 * C.xxxx;\n    vec4 x2 = x0 - i2 + 2.0 * C.xxxx;\n    vec4 x3 = x0 - i3 + 3.0 * C.xxxx;\n    vec4 x4 = x0 - 1.0 + 4.0 * C.xxxx;\n\n  // Permutations\n    i = mod(i, 289.0);\n    float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);\n    vec4 j1 = permute( permute( permute( permute (\n              i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))\n            + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))\n            + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))\n            + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));\n  // Gradients\n  // ( 7*7*6 points uniformly over a cube, mapped onto a 4-octahedron.)\n  // 7*7*6 = 294, which is close to the ring size 17*17 = 289.\n\n    vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;\n\n    vec4 p0 = grad4(j0,   ip);\n    vec4 p1 = grad4(j1.x, ip);\n    vec4 p2 = grad4(j1.y, ip);\n    vec4 p3 = grad4(j1.z, ip);\n    vec4 p4 = grad4(j1.w, ip);\n\n  // Normalise gradients\n    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n    p0 *= norm.x;\n    p1 *= norm.y;\n    p2 *= norm.z;\n    p3 *= norm.w;\n    p4 *= taylorInvSqrt(dot(p4,p4));\n\n  // Mix contributions from the five corners\n    vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);\n    vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);\n    m0 = m0 * m0;\n    m1 = m1 * m1;\n    return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))\n                + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;\n\n  }\n";

  /* ---- 1D value noise (JS) used to drift the cursor when idle ---- */
  function ValueNoise() {
    this.MAX = 256; this.MASK = 255; this.amplitude = 1; this.scale = 1; this.r = [];
    for (var i = 0; i < this.MAX; i++) this.r.push(Math.random());
  }
  ValueNoise.prototype.lerp = function (a, b, t) { return a * (1 - t) + b * t; };
  ValueNoise.prototype.getVal = function (x) {
    var t = x * this.scale, i = Math.floor(t), f = t - i, s = f * f * (3 - 2 * f);
    var a = i % this.MASK, b = (a + 1) % this.MASK;
    return this.lerp(this.r[a], this.r[b], s) * this.amplitude;
  };

  /* ---- global cursor tracker (screen-space) ---- */
  var Cursor = (function () {
    var c = { x: 0, y: 0 };
    var o = { cursor: c, screenWidth: window.innerWidth, screenHeight: window.innerHeight };
    window.addEventListener('mousemove', function (e) { c.x = e.clientX; c.y = e.clientY; });
    window.addEventListener('resize', function () {
      o.screenWidth = window.innerWidth; o.screenHeight = window.innerHeight;
    });
    return o;
  })();

  /* ---- tiny tween helper (replaces GSAP for the morphing hover) ---- */
  function tweenTo(obj, prop, to, dur, delay) {
    delay = delay || 0;
    var from = obj[prop], start = null;
    function ease(t) { return 1 - Math.pow(1 - t, 3); }
    function step(ts) {
      if (start === null) start = ts;
      var e = (ts - start) / 1000 - delay;
      if (e < 0) { requestAnimationFrame(step); return; }
      var t = Math.min(1, e / dur);
      obj[prop] = from + (to - from) * ease(t);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function tweenFromTo(obj, prop, from, to, dur, delay) {
    obj[prop] = from; tweenTo(obj, prop, to, dur, delay);
  }

  /* =====================================================================
     PoissonDiskSampling (fixed-density only — enough for the main scene)
     Ported minimal version of the kdtorkild/poisson-disk-sampling lib.
     ===================================================================== */
  function moore(range, dim) {
    range = range || 1; dim = dim || 2;
    var size = range * 2 + 1, len = Math.pow(size, dim) - 1, out = new Array(len);
    for (var i = 0; i < len; i++) {
      var n = out[i] = new Array(dim), idx = i < len / 2 ? i : i + 1;
      for (var d = 1; d <= dim; d++) { var v = idx % Math.pow(size, d); n[d - 1] = v / Math.pow(size, d - 1) - range; idx -= v; }
    }
    return out;
  }
  function neighbourhood(dim) {
    var nb = moore(2, dim).filter(function (n) {
      var dist = 0; for (var d = 0; d < dim; d++) dist += Math.pow(Math.max(0, Math.abs(n[d]) - 1), 2);
      return dist < dim;
    });
    var origin = []; for (var i = 0; i < dim; i++) origin.push(0); nb.push(origin);
    nb.sort(function (a, b) { var s1 = 0, s2 = 0; for (var d = 0; d < dim; d++) { s1 += a[d] * a[d]; s2 += b[d] * b[d]; } return s1 - s2; });
    return nb;
  }
  function ndArray(shape) {
    var dims = shape.length, total = 1, stride = new Array(dims);
    for (var d = dims; d > 0; d--) { stride[d - 1] = total; total *= shape[d - 1]; }
    return { stride: stride, data: new Uint32Array(total) };
  }
  function PoissonDiskSampling(opts, rng) {
    this.shape = opts.shape; this.minDistance = opts.minDistance;
    this.maxDistance = opts.maxDistance || opts.minDistance * 2;
    this.maxTries = Math.ceil(Math.max(1, opts.tries || 30));
    this.rng = rng || Math.random;
    var maxShape = 0, i;
    for (i = 0; i < this.shape.length; i++) maxShape = Math.max(maxShape, this.shape[i]);
    var eps = 1e-14 * Math.max(1, maxShape / 128 | 0);
    this.dimension = this.shape.length;
    this.squaredMinDistance = this.minDistance * this.minDistance;
    this.minDistancePlusEpsilon = this.minDistance + eps;
    this.deltaDistance = Math.max(0, this.maxDistance - this.minDistancePlusEpsilon);
    this.cellSize = this.minDistance / Math.sqrt(this.dimension);
    this.neighbourhood = neighbourhood(this.dimension);
    this.currentPoint = null; this.processList = []; this.samplePoints = []; this.gridShape = [];
    for (i = 0; i < this.dimension; i++) this.gridShape.push(Math.ceil(this.shape[i] / this.cellSize));
    this.grid = ndArray(this.gridShape);
  }
  PoissonDiskSampling.prototype.addRandomPoint = function () {
    var p = new Array(this.dimension);
    for (var i = 0; i < this.dimension; i++) p[i] = this.rng() * this.shape[i];
    return this.directAddPoint(p);
  };
  PoissonDiskSampling.prototype.directAddPoint = function (p) {
    var idx = 0, st = this.grid.stride;
    this.processList.push(p); this.samplePoints.push(p);
    for (var i = 0; i < this.dimension; i++) idx += (p[i] / this.cellSize | 0) * st[i];
    this.grid.data[idx] = this.samplePoints.length;
    return p;
  };
  PoissonDiskSampling.prototype.inNeighbourhood = function (p) {
    var dim = this.dimension, st = this.grid.stride;
    for (var n = 0; n < this.neighbourhood.length; n++) {
      var idx = 0, ok = true;
      for (var d = 0; d < dim; d++) {
        var v = (p[d] / this.cellSize | 0) + this.neighbourhood[n][d];
        if (v < 0 || v >= this.gridShape[d]) { idx = -1; break; }
        idx += v * st[d];
      }
      if (idx !== -1 && this.grid.data[idx] !== 0) {
        var ex = this.samplePoints[this.grid.data[idx] - 1], sq = 0;
        for (var k = 0; k < dim; k++) sq += Math.pow(p[k] - ex[k], 2);
        if (sq < this.squaredMinDistance) return true;
      }
    }
    return false;
  };
  PoissonDiskSampling.prototype.next = function () {
    while (this.processList.length > 0) {
      if (this.currentPoint === null) this.currentPoint = this.processList.shift();
      var cur = this.currentPoint, tries;
      for (tries = 0; tries < this.maxTries; tries++) {
        var ok = true, dist = this.minDistancePlusEpsilon + this.deltaDistance * this.rng();
        var ang = this.rng() * Math.PI * 2, np = [Math.cos(ang), Math.sin(ang)];
        for (var d = 0; ok && d < this.dimension; d++) { np[d] = cur[d] + np[d] * dist; ok = np[d] >= 0 && np[d] < this.shape[d]; }
        if (ok && !this.inNeighbourhood(np)) return this.directAddPoint(np);
      }
      if (tries === this.maxTries) this.currentPoint = null;
    }
    return null;
  };
  PoissonDiskSampling.prototype.fill = function () {
    if (this.samplePoints.length === 0) this.addRandomPoint();
    while (this.next()) {}
    return this.samplePoints;
  };

  var linearMap = function (n, a, b, c, d) { return (n - a) * (d - c) / (b - a) + c; };

  /* =====================================================================
     MAIN PARTICLES — ring-displacement particle field (hero + download)
     ===================================================================== */
  function MainParticles(scene) {
    this.scene = scene;
    this.renderer = scene.renderer;
    this.camera = scene.camera;
    this.lastTime = 0;
    this.everRendered = false;
    this.ringPos = new T.Vector2(0, 0);
    this.cursorPos = new T.Vector2(0, 0);
    this.colorScheme = scene.theme === 'dark' ? 0 : 1;
    this.particleScale = scene.renderer.domElement.width / scene.pixelRatio / 2000 * scene.particlesScale;
    this.createPoints();
    this.init();
  }
  MainParticles.prototype.createPoints = function () {
    var pts = new PoissonDiskSampling({
      shape: [500, 500],
      minDistance: linearMap(this.scene.density, 0, 300, 10, 2),
      maxDistance: linearMap(this.scene.density, 0, 300, 11, 3),
      tries: 20
    }).fill();
    this.pointsData = [];
    for (var i = 0; i < pts.length; i++) { this.pointsData.push(pts[i][0] - 250, pts[i][1] - 250); }
    this.count = this.pointsData.length / 2;
  };
  MainParticles.prototype.createDataTexturePosition = function () {
    var data = new Float32Array(this.length * 4);
    for (var i = 0; i < this.count; i++) {
      var r = i * 4;
      data[r + 0] = this.pointsData[i * 2 + 0] * (1 / 250);
      data[r + 1] = this.pointsData[i * 2 + 1] * (1 / 250);
      data[r + 2] = 0; data[r + 3] = 0;
    }
    var tex = new T.DataTexture(data, this.size, this.size, T.RGBAFormat, T.FloatType);
    tex.needsUpdate = true;
    return tex;
  };
  MainParticles.prototype.createRenderTarget = function () {
    return new T.WebGLRenderTarget(this.size, this.size, {
      wrapS: T.RepeatWrapping, wrapT: T.RepeatWrapping,
      minFilter: T.NearestFilter, magFilter: T.NearestFilter,
      format: T.RGBAFormat, type: T.HalfFloatType,
      depthBuffer: false, stencilBuffer: false
    });
  };
  MainParticles.prototype.init = function () {
    this.size = 256;
    this.length = this.size * this.size;
    this.posTex = this.createDataTexturePosition();
    this.rt1 = this.createRenderTarget();
    this.rt2 = this.createRenderTarget();
    this.renderer.setRenderTarget(this.rt1); this.renderer.setClearColor(0, 0); this.renderer.clear();
    this.renderer.setRenderTarget(this.rt2); this.renderer.setClearColor(0, 0); this.renderer.clear();
    this.renderer.setRenderTarget(null);
    this.noise = new ValueNoise();
    this.simScene = new T.Scene();
    this.simCamera = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.simMaterial = new T.ShaderMaterial({
      uniforms: {
        uPosition: { value: this.posTex }, uPosRefs: { value: this.posTex },
        uRingPos: { value: new T.Vector2(0, 0) }, uRingRadius: { value: 0.2 },
        uDeltaTime: { value: 0 }, uRingWidth: { value: 0.05 }, uRingWidth2: { value: 0.015 },
        uRingDisplacement: { value: this.scene.ringDisplacement }, uTime: { value: 0 }
      },
      vertexShader: 'void main(){gl_Position=vec4(position,1.0);}',
      fragmentShader: [
        'precision highp float;',
        'uniform sampler2D uPosition;uniform sampler2D uPosRefs;',
        'uniform vec2 uRingPos;uniform float uTime;uniform float uDeltaTime;uniform float uRingRadius;',
        'uniform float uRingWidth;uniform float uRingWidth2;uniform float uRingDisplacement;',
        NOISE_GLSL,
        'void main(){',
        '  vec2 simTexCoords = gl_FragCoord.xy / vec2(' + this.size.toFixed(1) + ', ' + this.size.toFixed(1) + ');',
        '  vec4 pFrame = texture2D(uPosition, simTexCoords);',
        '  float scale = pFrame.z; float velocity = pFrame.w;',
        '  vec2 refPos = texture2D(uPosRefs, simTexCoords).xy;',
        '  float time = uTime * .5; vec2 curentPos = refPos;',
        '  vec2 pos = pFrame.xy; pos *= .8;',
        '  float dist = distance(curentPos.xy, uRingPos);',
        '  float noise0 = snoise(vec3(curentPos.xy * .2 + vec2(18.4924, 72.9744), time * 0.5));',
        '  float dist1 = distance(curentPos.xy + (noise0 * .005), uRingPos);',
        '  float t = smoothstep(uRingRadius - (uRingWidth * 2.), uRingRadius, dist) - smoothstep(uRingRadius, uRingRadius + uRingWidth, dist1);',
        '  float t2 = smoothstep(uRingRadius - (uRingWidth2 * 2.), uRingRadius, dist) - smoothstep(uRingRadius, uRingRadius + uRingWidth2, dist1);',
        '  float t3 = smoothstep(uRingRadius + uRingWidth2, uRingRadius, dist);',
        '  t = pow(t, 2.); t2 = pow(t2, 3.);',
        '  t += t2 * 3.; t += t3 * .4;',
        '  t += snoise(vec3(curentPos.xy * 30. + vec2(11.4924, 12.9744), time * 0.5)) * t3 * .5;',
        '  float nS = snoise(vec3(curentPos.xy * 2. + vec2(18.4924, 72.9744), time * 0.5));',
        '  t += pow((nS + 1.5) * .5, 2.) * .6;',
        '  float noise1 = snoise(vec3(curentPos.xy * 4. + vec2(88.494, 32.4397), time * 0.35));',
        '  float noise2 = snoise(vec3(curentPos.xy * 4. + vec2(50.904, 120.947), time * 0.35));',
        '  float noise3 = snoise(vec3(curentPos.xy * 20. + vec2(18.4924, 72.9744), time * .5));',
        '  float noise4 = snoise(vec3(curentPos.xy * 20. + vec2(50.904, 120.947), time * .5));',
        '  vec2 disp = vec2(noise1, noise2) * .03; disp += vec2(noise3, noise4) * .005;',
        '  disp.x += sin((refPos.x * 20.) + (time * 4.)) * .02 * clamp(dist, 0., 1.);',
        '  disp.y += cos((refPos.y * 20.) + (time * 3.)) * .02 * clamp(dist, 0., 1.);',
        '  pos -= (uRingPos - (curentPos + disp)) * pow(t2, .75) * uRingDisplacement;',
        '  float scaleDiff = t - scale; scaleDiff *= .2; scale += scaleDiff;',
        '  vec2 finalPos = curentPos + disp + (pos * .25);',
        '  velocity *= .5; velocity += scale * .25;',
        '  gl_FragColor = vec4(finalPos, scale, velocity);',
        '}'
      ].join('\n')
    });
    this.simScene.add(new T.Mesh(new T.PlaneGeometry(2, 2), this.simMaterial));

    var geo = new T.BufferGeometry();
    var uv = new Float32Array(this.count * 2);
    var posAttr = new Float32Array(this.count * 3);
    var seeds = new Float32Array(this.count * 4);
    for (var s = 0; s < this.count; s++) {
      var a = s % this.size, l = Math.floor(s / this.size);
      uv[s * 2] = a / this.size; uv[s * 2 + 1] = l / this.size;
    }
    for (var s2 = 0; s2 < this.count; s2++) {
      seeds[s2 * 4] = Math.random(); seeds[s2 * 4 + 1] = Math.random();
      seeds[s2 * 4 + 2] = Math.random(); seeds[s2 * 4 + 3] = Math.random();
    }
    geo.setAttribute('position', new T.BufferAttribute(posAttr, 3));
    geo.setAttribute('uv', new T.BufferAttribute(uv, 2));
    geo.setAttribute('seeds', new T.BufferAttribute(seeds, 4));

    this.renderMaterial = new T.ShaderMaterial({
      uniforms: {
        uPosition: { value: this.posTex }, uTime: { value: 0 },
        uColor1: { value: new T.Color(this.scene.colorControls.color1) },
        uColor2: { value: new T.Color(this.scene.colorControls.color2) },
        uColor3: { value: new T.Color(this.scene.colorControls.color3) },
        uAlpha: { value: 1 }, uRingPos: { value: new T.Vector2(0, 0) },
        uRez: { value: new T.Vector2(this.scene.renderer.domElement.width, this.scene.renderer.domElement.height) },
        uParticleScale: { value: this.particleScale }, uPixelRatio: { value: this.scene.pixelRatio },
        uColorScheme: { value: this.colorScheme }
      },
      vertexShader: [
        'precision highp float;',
        'attribute vec4 seeds;',
        'uniform sampler2D uPosition;uniform float uTime;uniform float uParticleScale;',
        'uniform float uPixelRatio;uniform int uColorScheme;',
        'varying vec4 vSeeds;varying float vVelocity;varying vec2 vLocalPos;varying vec2 vScreenPos;varying float vScale;',
        'void main(){',
        '  vec4 pos = texture2D(uPosition, uv); vSeeds = seeds;',
        '  vVelocity = pos.w; vScale = pos.z; vLocalPos = pos.xy;',
        '  vec4 viewSpace = modelViewMatrix * vec4(vec3(pos.xy, 0.), 1.0);',
        '  gl_Position = projectionMatrix * viewSpace; vScreenPos = gl_Position.xy;',
        '  gl_PointSize = ((vScale * 7.) * (uPixelRatio * 0.5) * uParticleScale);',
        '}'
      ].join('\n'),
      fragmentShader: [
        'precision highp float;',
        'varying vec4 vSeeds;varying vec2 vScreenPos;varying vec2 vLocalPos;varying float vScale;varying float vVelocity;',
        'uniform vec3 uColor1;uniform vec3 uColor2;uniform vec3 uColor3;',
        'uniform vec2 uRingPos;uniform vec2 uRez;uniform float uAlpha;uniform float uTime;uniform int uColorScheme;',
        NOISE_GLSL,
        '#define PI 3.1415926535897932384626433832795',
        'float sdRoundBox(in vec2 p,in vec2 b,in vec4 r){r.xy=(p.x>0.0)?r.xy:r.zw;r.x=(p.y>0.0)?r.x:r.y;vec2 q=abs(p)-b+r.x;return min(max(q.x,q.y),0.0)+length(max(q,0.0))-r.x;}',
        'vec2 rotate(vec2 v,float a){float s=sin(a);float c=cos(a);mat2 m=mat2(c,s,-s,c);return m*v;}',
        'void main(){',
        '  float uBorderSize = 0.2; vec2 center = vec2(.48, .4); float ratio = uRez.x / uRez.y;',
        '  float noiseAngle = snoise(vec3(vLocalPos * 10. + vec2(18.4924, 72.9744), uTime * .85));',
        '  float noiseColor = snoise(vec3(vLocalPos * 2. + vec2(74.664, 91.556), uTime * .5));',
        '  noiseColor = (noiseColor + 1.) * .5;',
        '  float angle = atan(vLocalPos.y - uRingPos.y, vLocalPos.x - uRingPos.x);',
        '  vec2 uv = gl_PointCoord.xy; uv -= vec2(0.5); uv.y *= -1.;',
        '  uv = rotate(uv, -angle + (noiseAngle * .5));',
        '  vec2 tuv = vScreenPos; tuv = rotate(tuv, uTime * 1.); tuv.y *= 1./ratio; tuv += .5;',
        '  float h = 0.8; float progress = smoothstep(0., .75, pow(noiseColor, 2.));',
        '  vec3 col = mix(mix(uColor1, uColor2, progress/h), mix(uColor2, uColor3, (progress - h)/(1.0 - h)), step(h, progress));',
        '  vec3 color = col;',
        '  float dist = sqrt(dot(uv, uv));',
        '  float dr = .5; float t = smoothstep(dr+(uBorderSize + .0001), dr-uBorderSize, dist); t = clamp(t, 0., 1.);',
        '  float rounded = sdRoundBox(uv, vec2(0.5, 0.2), vec4(.25)); rounded = smoothstep(.1, 0., rounded);',
        '  float a = uAlpha * rounded * smoothstep(0.1, 0.2, vScale);',
        '  if(a < 0.01){ discard; }',
        '  color = clamp(color, 0., 1.);',
        '  color = mix(color, color * clamp(vVelocity, 0., 1.), float(uColorScheme));',
        '  gl_FragColor = vec4(color, clamp(a, 0., 1.));',
        '  #ifdef SRGB_TRANSFER',
        '    gl_FragColor = sRGBTransferOETF( gl_FragColor );',
        '  #endif',
        '}'
      ].join('\n'),
      transparent: true, depthTest: false, depthWrite: false
    });
    this.mesh = new T.Points(geo, this.renderMaterial);
    this.mesh.position.set(0, 0, 0);
    this.mesh.scale.set(5, 5, 5);
    this.scene.scene.add(this.mesh);
  };
  MainParticles.prototype.resize = function () {
    this.renderMaterial.uniforms.uRez.value = new T.Vector2(this.scene.renderer.domElement.width, this.scene.renderer.domElement.height);
    this.renderMaterial.uniforms.uPixelRatio.value = this.scene.pixelRatio;
    this.renderMaterial.needsUpdate = true;
  };
  MainParticles.prototype.update = function () {
    var dt = this.scene.clock.getElapsedTime() - this.lastTime;
    this.lastTime = this.scene.clock.getElapsedTime();
    var nx = (this.noise.getVal(this.scene.time * 0.66 + 94.234) - 0.5) * 2;
    var ny = (this.noise.getVal(this.scene.time * 0.75 + 21.028) - 0.5) * 2;
    if (this.scene.isIntersecting) {
      this.cursorPos.set(this.scene.intersectionPoint.x * 0.175 + nx * 0.1, this.scene.intersectionPoint.y * 0.175 + ny * 0.1);
      this.ringPos.set(this.ringPos.x + (this.cursorPos.x - this.ringPos.x) * 0.02, this.ringPos.y + (this.cursorPos.y - this.ringPos.y) * 0.02);
    } else {
      this.cursorPos.set(nx * 0.2, ny * 0.1);
      this.ringPos.set(this.ringPos.x + (this.cursorPos.x - this.ringPos.x) * 0.01, this.ringPos.y + (this.cursorPos.y - this.ringPos.y) * 0.01);
    }
    this.particleScale = this.scene.renderer.domElement.width / this.scene.pixelRatio / 2000 * this.scene.particlesScale;
    this.simMaterial.uniforms.uPosition.value = this.everRendered ? this.rt1.texture : this.posTex;
    this.simMaterial.uniforms.uTime.value = this.scene.clock.getElapsedTime();
    this.simMaterial.uniforms.uDeltaTime.value = dt;
    this.simMaterial.uniforms.uRingRadius.value = 0.175 + Math.sin(this.scene.time * 1) * 0.03 + Math.cos(this.scene.time * 3) * 0.02;
    this.simMaterial.uniforms.uRingPos.value = this.ringPos;
    this.simMaterial.uniforms.uRingWidth.value = this.scene.ringWidth;
    this.simMaterial.uniforms.uRingWidth2.value = this.scene.ringWidth2;
    this.simMaterial.uniforms.uRingDisplacement.value = this.scene.ringDisplacement;
    this.renderer.setRenderTarget(this.rt2);
    this.renderer.render(this.simScene, this.simCamera);
    this.renderer.setRenderTarget(null);
    this.renderMaterial.uniforms.uPosition.value = this.everRendered ? this.rt2.texture : this.posTex;
    this.renderMaterial.uniforms.uTime.value = this.scene.clock.getElapsedTime();
    this.renderMaterial.uniforms.uRingPos.value = this.ringPos;
    this.renderMaterial.uniforms.uParticleScale.value = this.particleScale;
  };
  MainParticles.prototype.postRender = function () {
    var t = this.rt1; this.rt1 = this.rt2; this.rt2 = t; this.everRendered = true;
  };

  /* --- main particles scene wrapper --- */
  function MainParticlesScene(opts) {
    this.loaded = false;
    this.options = opts;
    this.theme = opts.theme || 'dark';
    this.interactive = opts.interactive || false;
    this.background = this.theme === 'dark' ? new T.Color(0) : new T.Color(0xffffff);
    this.pixelRatio = opts.pixelRatio || window.devicePixelRatio;
    this.particlesScale = opts.particlesScale || 1;
    this.density = opts.density || 200;
    this.scene = new T.Scene();
    this.scene.background = this.background;
    this.canvas = document.createElement('canvas');
    this.options.container.appendChild(this.canvas);
    this.canvas.width = this.options.container.offsetWidth || 1;
    this.canvas.height = this.options.container.offsetHeight || 1;
    T.ColorManagement.enabled = false;
    this.renderer = new T.WebGLRenderer({
      canvas: this.canvas, antialias: true, alpha: true,
      powerPreference: 'high-performance', preserveDrawingBuffer: true,
      stencil: false, precision: 'highp'
    });
    this.gl = this.renderer.getContext();
    this.renderer.extensions.get('EXT_color_buffer_float');
    this.renderer.setSize(this.canvas.width, this.canvas.height);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.initCamera();
    this.initScene();
    this.initEvents();
    this.clock = new T.Clock();
    this.time = 0; this.lastTime = 0; this.dt = 0;
    this.skipFrame = false; this.isPaused = false;
    this.raycaster = new T.Raycaster();
    this.mouse = new T.Vector2();
    this.intersectionPoint = new T.Vector3();
    this.isIntersecting = false; this.mouseIsOver = false;
    this.raycastPlane = new T.Mesh(new T.PlaneGeometry(12.5, 12.5), new T.MeshBasicMaterial({ color: 0xff0000, visible: false, side: T.DoubleSide }));
    this.scene.add(this.raycastPlane);
  }
  MainParticlesScene.prototype.initEvents = function () {
    var self = this;
    window.addEventListener('resize', function () { self.onWindowResize(); });
  };
  MainParticlesScene.prototype.onWindowResize = function () {
    this.canvas.width = this.options.container.offsetWidth || 1;
    this.canvas.height = this.options.container.offsetHeight || 1;
    this.renderer.setSize(this.canvas.width, this.canvas.height);
    this.camera.aspect = this.canvas.width / this.canvas.height;
    this.camera.updateProjectionMatrix();
    if (this.particles) this.particles.resize();
  };
  MainParticlesScene.prototype.initCamera = function () {
    this.camera = new T.PerspectiveCamera(40, this.gl.drawingBufferWidth / this.gl.drawingBufferHeight, 0.1, 1000);
    this.camera.position.z = 3.1;
  };
  MainParticlesScene.prototype.initScene = function () {
    this.colorControls = {
      color1: this.theme === 'dark' ? '#7189ff' : '#2c64ed',
      color2: this.theme === 'dark' ? '#3074f9' : '#f84242',
      color3: this.theme === 'dark' ? '#000000' : '#ffcf03'
    };
    this.ringWidth = this.options.ringWidth || 0.107;
    this.ringWidth2 = this.options.ringWidth2 || 0.05;
    this.ringDisplacement = this.options.ringDisplacement || 0.15;
    this.particles = new MainParticles(this);
    this.loaded = true;
  };
  MainParticlesScene.prototype.stop = function () { this.isPaused = true; this.clock.stop(); };
  MainParticlesScene.prototype.resume = function () { this.isPaused = false; this.clock.start(); };
  MainParticlesScene.prototype.preRender = function () {
    this.dt = this.clock.getElapsedTime() - this.lastTime;
    this.lastTime = this.clock.getElapsedTime();
    this.time += this.dt;
    this.particles.update();
    if (this.interactive && !this.skipFrame) {
      var r = this.canvas.getBoundingClientRect();
      this.mouse.x = (Cursor.cursor.x - r.left) * (Cursor.screenWidth / r.width);
      this.mouse.y = (Cursor.cursor.y - r.top) * (Cursor.screenHeight / r.height);
      this.mouse.x = this.mouse.x / Cursor.screenWidth * 2 - 1;
      this.mouse.y = -(this.mouse.y / Cursor.screenHeight) * 2 + 1;
      this.mouseIsOver = !(this.mouse.x < -1 || this.mouse.x > 1 || this.mouse.y < -1 || this.mouse.y > 1);
    }
    this.skipFrame = !this.skipFrame;
    if (this.skipFrame) return;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    var hits = this.raycaster.intersectObject(this.raycastPlane);
    if (hits.length > 0 && this.mouseIsOver) { this.intersectionPoint.copy(hits[0].point); this.isIntersecting = true; }
    else this.isIntersecting = false;
  };
  MainParticlesScene.prototype.render = function () {
    if (!this.loaded || this.isPaused) return;
    this.preRender();
    this.renderer.setRenderTarget(null);
    this.renderer.autoClear = false;
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    this.particles.postRender();
  };

  /* =====================================================================
     MORPHING PARTICLES — image-shaped points (try-solutions section)
     ===================================================================== */
  var WORKER_SRC = "\n                self.onmessage = function(e) {\n                    (function(f){if(typeof exports===\"object\"&&typeof module!==\"undefined\"){module.exports=f()}else if(typeof define===\"function\"&&define.amd){define([],f)}else{var g;if(typeof window!==\"undefined\"){g=window}else if(typeof global!==\"undefined\"){g=global}else if(typeof self!==\"undefined\"){g=self}else{g=this}g.PoissonDiskSampling=f()}})((function(){var define,module,exports;return function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c=\"function\"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error(\"Cannot find module '\"+i+\"'\");throw a.code=\"MODULE_NOT_FOUND\",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,(function(r){var n=e[i][1][r];return o(n||r)}),p,p.exports,r,e,n,t)}return n[i].exports}for(var u=\"function\"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r}()({1:[function(require,module,exports){module.exports=function moore(range,dimensions){range=range||1;dimensions=dimensions||2;var size=range*2+1;var length=Math.pow(size,dimensions)-1;var neighbors=new Array(length);for(var i=0;i<length;i++){var neighbor=neighbors[i]=new Array(dimensions);var index=i<length/2?i:i+1;for(var dimension=1;dimension<=dimensions;dimension++){var value=index%Math.pow(size,dimension);neighbor[dimension-1]=value/Math.pow(size,dimension-1)-range;index-=value}}return neighbors}},{}],2:[function(require,module,exports){\"use strict\";var tinyNDArray=require(\"./../tiny-ndarray\").integer,sphereRandom=require(\"./../sphere-random\"),getNeighbourhood=require(\"./../neighbourhood\");function squaredEuclideanDistance(point1,point2){var result=0,i=0;for(;i<point1.length;i++){result+=Math.pow(point1[i]-point2[i],2)}return result}function FixedDensityPDS(options,rng){if(typeof options.distanceFunction===\"function\"){throw new Error(\"PoissonDiskSampling: Tried to instantiate the fixed density implementation with a distanceFunction\")}this.shape=options.shape;this.minDistance=options.minDistance;this.maxDistance=options.maxDistance||options.minDistance*2;this.maxTries=Math.ceil(Math.max(1,options.tries||30));this.rng=rng||Math.random;var maxShape=0;for(var i=0;i<this.shape.length;i++){maxShape=Math.max(maxShape,this.shape[i])}var floatPrecisionMitigation=Math.max(1,maxShape/128|0);var epsilonDistance=1e-14*floatPrecisionMitigation;this.dimension=this.shape.length;this.squaredMinDistance=this.minDistance*this.minDistance;this.minDistancePlusEpsilon=this.minDistance+epsilonDistance;this.deltaDistance=Math.max(0,this.maxDistance-this.minDistancePlusEpsilon);this.cellSize=this.minDistance/Math.sqrt(this.dimension);this.neighbourhood=getNeighbourhood(this.dimension);this.currentPoint=null;this.processList=[];this.samplePoints=[];this.gridShape=[];for(var i=0;i<this.dimension;i++){this.gridShape.push(Math.ceil(this.shape[i]/this.cellSize))}this.grid=tinyNDArray(this.gridShape)}FixedDensityPDS.prototype.shape=null;FixedDensityPDS.prototype.dimension=null;FixedDensityPDS.prototype.minDistance=null;FixedDensityPDS.prototype.maxDistance=null;FixedDensityPDS.prototype.minDistancePlusEpsilon=null;FixedDensityPDS.prototype.squaredMinDistance=null;FixedDensityPDS.prototype.deltaDistance=null;FixedDensityPDS.prototype.cellSize=null;FixedDensityPDS.prototype.maxTries=null;FixedDensityPDS.prototype.rng=null;FixedDensityPDS.prototype.neighbourhood=null;FixedDensityPDS.prototype.currentPoint=null;FixedDensityPDS.prototype.processList=null;FixedDensityPDS.prototype.samplePoints=null;FixedDensityPDS.prototype.gridShape=null;FixedDensityPDS.prototype.grid=null;FixedDensityPDS.prototype.addRandomPoint=function(){var point=new Array(this.dimension);for(var i=0;i<this.dimension;i++){point[i]=this.rng()*this.shape[i]}return this.directAddPoint(point)};FixedDensityPDS.prototype.addPoint=function(point){var dimension,valid=true;if(point.length===this.dimension){for(dimension=0;dimension<this.dimension&&valid;dimension++){valid=point[dimension]>=0&&point[dimension]<this.shape[dimension]}}else{valid=false}return valid?this.directAddPoint(point):null};FixedDensityPDS.prototype.directAddPoint=function(point){var internalArrayIndex=0,stride=this.grid.stride,dimension;this.processList.push(point);this.samplePoints.push(point);for(dimension=0;dimension<this.dimension;dimension++){internalArrayIndex+=(point[dimension]/this.cellSize|0)*stride[dimension]}this.grid.data[internalArrayIndex]=this.samplePoints.length;return point};FixedDensityPDS.prototype.inNeighbourhood=function(point){var dimensionNumber=this.dimension,stride=this.grid.stride,neighbourIndex,internalArrayIndex,dimension,currentDimensionValue,existingPoint;for(neighbourIndex=0;neighbourIndex<this.neighbourhood.length;neighbourIndex++){internalArrayIndex=0;for(dimension=0;dimension<dimensionNumber;dimension++){currentDimensionValue=(point[dimension]/this.cellSize|0)+this.neighbourhood[neighbourIndex][dimension];if(currentDimensionValue<0||currentDimensionValue>=this.gridShape[dimension]){internalArrayIndex=-1;break}internalArrayIndex+=currentDimensionValue*stride[dimension]}if(internalArrayIndex!==-1&&this.grid.data[internalArrayIndex]!==0){existingPoint=this.samplePoints[this.grid.data[internalArrayIndex]-1];if(squaredEuclideanDistance(point,existingPoint)<this.squaredMinDistance){return true}}}return false};FixedDensityPDS.prototype.next=function(){var tries,angle,distance,currentPoint,newPoint,inShape,i;while(this.processList.length>0){if(this.currentPoint===null){this.currentPoint=this.processList.shift()}currentPoint=this.currentPoint;for(tries=0;tries<this.maxTries;tries++){inShape=true;distance=this.minDistancePlusEpsilon+this.deltaDistance*this.rng();if(this.dimension===2){angle=this.rng()*Math.PI*2;newPoint=[Math.cos(angle),Math.sin(angle)]}else{newPoint=sphereRandom(this.dimension,this.rng)}for(i=0;inShape&&i<this.dimension;i++){newPoint[i]=currentPoint[i]+newPoint[i]*distance;inShape=newPoint[i]>=0&&newPoint[i]<this.shape[i]}if(inShape&&!this.inNeighbourhood(newPoint)){return this.directAddPoint(newPoint)}}if(tries===this.maxTries){this.currentPoint=null}}return null};FixedDensityPDS.prototype.fill=function(){if(this.samplePoints.length===0){this.addRandomPoint()}while(this.next()){}return this.samplePoints};FixedDensityPDS.prototype.getAllPoints=function(){return this.samplePoints};FixedDensityPDS.prototype.getAllPointsWithDistance=function(){throw new Error(\"PoissonDiskSampling: getAllPointsWithDistance() is not available in fixed-density implementation\")};FixedDensityPDS.prototype.reset=function(){var gridData=this.grid.data,i=0;for(i=0;i<gridData.length;i++){gridData[i]=0}this.samplePoints=[];this.currentPoint=null;this.processList.length=0};module.exports=FixedDensityPDS},{\"./../neighbourhood\":4,\"./../sphere-random\":6,\"./../tiny-ndarray\":7}],3:[function(require,module,exports){\"use strict\";var tinyNDArray=require(\"./../tiny-ndarray\").array,sphereRandom=require(\"./../sphere-random\"),getNeighbourhood=require(\"./../neighbourhood\");function euclideanDistance(point1,point2){var result=0,i=0;for(;i<point1.length;i++){result+=Math.pow(point1[i]-point2[i],2)}return Math.sqrt(result)}function VariableDensityPDS(options,rng){if(typeof options.distanceFunction!==\"function\"){throw new Error(\"PoissonDiskSampling: Tried to instantiate the variable density implementation without a distanceFunction\")}this.shape=options.shape;this.minDistance=options.minDistance;this.maxDistance=options.maxDistance||options.minDistance*2;this.maxTries=Math.ceil(Math.max(1,options.tries||30));this.distanceFunction=options.distanceFunction;this.bias=Math.max(0,Math.min(1,options.bias||0));this.rng=rng||Math.random;var maxShape=0;for(var i=0;i<this.shape.length;i++){maxShape=Math.max(maxShape,this.shape[i])}var floatPrecisionMitigation=Math.max(1,maxShape/128|0);var epsilonDistance=1e-14*floatPrecisionMitigation;this.dimension=this.shape.length;this.minDistancePlusEpsilon=this.minDistance+epsilonDistance;this.deltaDistance=Math.max(0,this.maxDistance-this.minDistancePlusEpsilon);this.cellSize=this.maxDistance/Math.sqrt(this.dimension);this.neighbourhood=getNeighbourhood(this.dimension);this.currentPoint=null;this.currentDistance=0;this.processList=[];this.samplePoints=[];this.sampleDistance=[];this.gridShape=[];for(var i=0;i<this.dimension;i++){this.gridShape.push(Math.ceil(this.shape[i]/this.cellSize))}this.grid=tinyNDArray(this.gridShape)}VariableDensityPDS.prototype.shape=null;VariableDensityPDS.prototype.dimension=null;VariableDensityPDS.prototype.minDistance=null;VariableDensityPDS.prototype.maxDistance=null;VariableDensityPDS.prototype.minDistancePlusEpsilon=null;VariableDensityPDS.prototype.deltaDistance=null;VariableDensityPDS.prototype.cellSize=null;VariableDensityPDS.prototype.maxTries=null;VariableDensityPDS.prototype.distanceFunction=null;VariableDensityPDS.prototype.bias=null;VariableDensityPDS.prototype.rng=null;VariableDensityPDS.prototype.neighbourhood=null;VariableDensityPDS.prototype.currentPoint=null;VariableDensityPDS.prototype.currentDistance=null;VariableDensityPDS.prototype.processList=null;VariableDensityPDS.prototype.samplePoints=null;VariableDensityPDS.prototype.sampleDistance=null;VariableDensityPDS.prototype.gridShape=null;VariableDensityPDS.prototype.grid=null;VariableDensityPDS.prototype.addRandomPoint=function(){var point=new Array(this.dimension);for(var i=0;i<this.dimension;i++){point[i]=this.rng()*this.shape[i]}return this.directAddPoint(point)};VariableDensityPDS.prototype.addPoint=function(point){var dimension,valid=true;if(point.length===this.dimension){for(dimension=0;dimension<this.dimension&&valid;dimension++){valid=point[dimension]>=0&&point[dimension]<this.shape[dimension]}}else{valid=false}return valid?this.directAddPoint(point):null};VariableDensityPDS.prototype.directAddPoint=function(point){var internalArrayIndex=0,stride=this.grid.stride,pointIndex=this.samplePoints.length,dimension;this.processList.push(pointIndex);this.samplePoints.push(point);this.sampleDistance.push(this.distanceFunction(point));for(dimension=0;dimension<this.dimension;dimension++){internalArrayIndex+=(point[dimension]/this.cellSize|0)*stride[dimension]}this.grid.data[internalArrayIndex].push(pointIndex);return point};VariableDensityPDS.prototype.inNeighbourhood=function(point){var dimensionNumber=this.dimension,stride=this.grid.stride,neighbourIndex,internalArrayIndex,dimension,currentDimensionValue,existingPoint,existingPointDistance;var pointDistance=this.distanceFunction(point);for(neighbourIndex=0;neighbourIndex<this.neighbourhood.length;neighbourIndex++){internalArrayIndex=0;for(dimension=0;dimension<dimensionNumber;dimension++){currentDimensionValue=(point[dimension]/this.cellSize|0)+this.neighbourhood[neighbourIndex][dimension];if(currentDimensionValue<0||currentDimensionValue>=this.gridShape[dimension]){internalArrayIndex=-1;break}internalArrayIndex+=currentDimensionValue*stride[dimension]}if(internalArrayIndex!==-1&&this.grid.data[internalArrayIndex].length>0){for(var i=0;i<this.grid.data[internalArrayIndex].length;i++){existingPoint=this.samplePoints[this.grid.data[internalArrayIndex][i]];existingPointDistance=this.sampleDistance[this.grid.data[internalArrayIndex][i]];var minDistance=Math.min(existingPointDistance,pointDistance);var maxDistance=Math.max(existingPointDistance,pointDistance);var dist=minDistance+(maxDistance-minDistance)*this.bias;if(euclideanDistance(point,existingPoint)<this.minDistance+this.deltaDistance*dist){return true}}}}return false};VariableDensityPDS.prototype.next=function(){var tries,angle,distance,currentPoint,currentDistance,newPoint,inShape,i;while(this.processList.length>0){if(this.currentPoint===null){var sampleIndex=this.processList.shift();this.currentPoint=this.samplePoints[sampleIndex];this.currentDistance=this.sampleDistance[sampleIndex]}currentPoint=this.currentPoint;currentDistance=this.currentDistance;for(tries=0;tries<this.maxTries;tries++){inShape=true;distance=this.minDistancePlusEpsilon+this.deltaDistance*(currentDistance+(1-currentDistance)*this.bias);if(this.dimension===2){angle=this.rng()*Math.PI*2;newPoint=[Math.cos(angle),Math.sin(angle)]}else{newPoint=sphereRandom(this.dimension,this.rng)}for(i=0;inShape&&i<this.dimension;i++){newPoint[i]=currentPoint[i]+newPoint[i]*distance;inShape=newPoint[i]>=0&&newPoint[i]<this.shape[i]}if(inShape&&!this.inNeighbourhood(newPoint)){return this.directAddPoint(newPoint)}}if(tries===this.maxTries){this.currentPoint=null}}return null};VariableDensityPDS.prototype.fill=function(){if(this.samplePoints.length===0){this.addRandomPoint()}while(this.next()){}return this.samplePoints};VariableDensityPDS.prototype.getAllPoints=function(){return this.samplePoints};VariableDensityPDS.prototype.getAllPointsWithDistance=function(){var result=new Array(this.samplePoints.length),i=0,dimension=0,point;for(i=0;i<this.samplePoints.length;i++){point=new Array(this.dimension+1);for(dimension=0;dimension<this.dimension;dimension++){point[dimension]=this.samplePoints[i][dimension]}point[this.dimension]=this.sampleDistance[i];result[i]=point}return result};VariableDensityPDS.prototype.reset=function(){var gridData=this.grid.data,i=0;for(i=0;i<gridData.length;i++){gridData[i]=[]}this.samplePoints=[];this.currentPoint=null;this.processList.length=0};module.exports=VariableDensityPDS},{\"./../neighbourhood\":4,\"./../sphere-random\":6,\"./../tiny-ndarray\":7}],4:[function(require,module,exports){\"use strict\";var moore=require(\"moore\");function getNeighbourhood(dimensionNumber){var neighbourhood=moore(2,dimensionNumber),origin=[],dimension;neighbourhood=neighbourhood.filter((function(n){var dist=0;for(var d=0;d<dimensionNumber;d++){dist+=Math.pow(Math.max(0,Math.abs(n[d])-1),2)}return dist<dimensionNumber}));for(dimension=0;dimension<dimensionNumber;dimension++){origin.push(0)}neighbourhood.push(origin);neighbourhood.sort((function(n1,n2){var squareDist1=0,squareDist2=0,dimension;for(dimension=0;dimension<dimensionNumber;dimension++){squareDist1+=Math.pow(n1[dimension],2);squareDist2+=Math.pow(n2[dimension],2)}if(squareDist1<squareDist2){return-1}else if(squareDist1>squareDist2){return 1}else{return 0}}));return neighbourhood}var neighbourhoodCache={};function getNeighbourhoodMemoized(dimensionNumber){if(!neighbourhoodCache[dimensionNumber]){neighbourhoodCache[dimensionNumber]=getNeighbourhood(dimensionNumber)}return neighbourhoodCache[dimensionNumber]}module.exports=getNeighbourhoodMemoized},{moore:1}],5:[function(require,module,exports){\"use strict\";var FixedDensityPDS=require(\"./implementations/fixed-density\");var VariableDensityPDS=require(\"./implementations/variable-density\");function PoissonDiskSampling(options,rng){this.shape=options.shape;if(typeof options.distanceFunction===\"function\"){this.implementation=new VariableDensityPDS(options,rng)}else{this.implementation=new FixedDensityPDS(options,rng)}}PoissonDiskSampling.prototype.implementation=null;PoissonDiskSampling.prototype.addRandomPoint=function(){return this.implementation.addRandomPoint()};PoissonDiskSampling.prototype.addPoint=function(point){return this.implementation.addPoint(point)};PoissonDiskSampling.prototype.next=function(){return this.implementation.next()};PoissonDiskSampling.prototype.fill=function(){return this.implementation.fill()};PoissonDiskSampling.prototype.getAllPoints=function(){return this.implementation.getAllPoints()};PoissonDiskSampling.prototype.getAllPointsWithDistance=function(){return this.implementation.getAllPointsWithDistance()};PoissonDiskSampling.prototype.reset=function(){this.implementation.reset()};module.exports=PoissonDiskSampling},{\"./implementations/fixed-density\":2,\"./implementations/variable-density\":3}],6:[function(require,module,exports){\"use strict\";module.exports=sampleSphere;function sampleSphere(d,rng){var v=new Array(d),d2=Math.floor(d/2)<<1,r2=0,rr,r,theta,h,i;for(i=0;i<d2;i+=2){rr=-2*Math.log(rng());r=Math.sqrt(rr);theta=2*Math.PI*rng();r2+=rr;v[i]=r*Math.cos(theta);v[i+1]=r*Math.sin(theta)}if(d%2){var x=Math.sqrt(-2*Math.log(rng()))*Math.cos(2*Math.PI*rng());v[d-1]=x;r2+=Math.pow(x,2)}h=1/Math.sqrt(r2);for(i=0;i<d;++i){v[i]*=h}return v}},{}],7:[function(require,module,exports){\"use strict\";function tinyNDArrayOfInteger(gridShape){var dimensions=gridShape.length,totalLength=1,stride=new Array(dimensions),dimension;for(dimension=dimensions;dimension>0;dimension--){stride[dimension-1]=totalLength;totalLength=totalLength*gridShape[dimension-1]}return{stride:stride,data:new Uint32Array(totalLength)}}function tinyNDArrayOfArray(gridShape){var dimensions=gridShape.length,totalLength=1,stride=new Array(dimensions),data=[],dimension,index;for(dimension=dimensions;dimension>0;dimension--){stride[dimension-1]=totalLength;totalLength=totalLength*gridShape[dimension-1]}for(index=0;index<totalLength;index++){data.push([])}return{stride:stride,data:data}}module.exports={integer:tinyNDArrayOfInteger,array:tinyNDArrayOfArray}},{}]},{},[5])(5)}));\n\n                    const { imageData, pointsBase, index, density } = e.data;\n\n                    const distanceFunction = function (point, imageData) {\n                        const pixelRedIndex = (Math.round(point[0]) + Math.round(point[1]) * imageData.width) * 4;\n                        const pixel = imageData.data[pixelRedIndex] / 255;\n                        return pixel * pixel * pixel;\n                    }\n\n                    const linearMap = (x, a, b, c, d) => {\n                        return ((x - a) * (d - c)) / (b - a) + c\n                    }\n\n                    const maxDistance = linearMap(density, 0, 300, 10, 50);\n                    const poissonDisk = new PoissonDiskSampling({\n                        shape: [500, 500],\n                        minDistance: 1,\n                        maxDistance: maxDistance,\n                        tries: 20,\n                        distanceFunction: function (point) {\n                            return distanceFunction(point, imageData);\n                        }\n                    });\n                    const points = poissonDisk.fill();\n\n                    const nearestPoints = []\n                    for (let i = 0; i < pointsBase.length; i++) {\n                        let nearestPoint = null;\n                        let nearestDistance = Infinity;\n                        for (let j = 0; j < points.length; j++) {\n                            if( Math.random() < .75) { continue; }\n                            const distance = Math.sqrt(Math.pow(points[j][0] - pointsBase[i][0], 2) + Math.pow(points[j][1] - pointsBase[i][1], 2));\n                            const pixelRedValue = distanceFunction(points[j], imageData);\n                            // if (distance < nearestDistance) {\n                            if (pixelRedValue < 1 && distance < nearestDistance) {\n                                nearestDistance = distance;\n                                nearestPoint = points[j];\n                            }\n                        }\n                        nearestPoints.push(\n                            nearestPoint[0] - 250,\n                            nearestPoint[1] - 250\n                        );\n                    }\n\n                    self.postMessage({ nearestPoints, index });\n                };\n            ";

  function MorphingParticles(scene, textures) {
    this.scene = scene;
    this.renderer = scene.renderer;
    this.camera = scene.camera;
    this.textures = textures;
    this.lastTime = 0;
    this.everRendered = false;
    this.mousePos = new T.Vector2(0, 0);
    this.cursorPos = new T.Vector2(0, 0);
    this.colorScheme = scene.theme === 'dark' ? 0 : 1;
    this.particleScale = scene.renderer.domElement.width / scene.pixelRatio / 2000 * scene.particlesScale;
  }
  MorphingParticles.create = function (scene, textures) {
    var p = new MorphingParticles(scene, textures);
    p.createPoints();
    return p.createPointsFromImage().then(function () { p.init(); return p; });
  };
  MorphingParticles.prototype.getImageData = function (url) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = function () {
        var cv = document.createElement('canvas');
        cv.width = 500; cv.height = 500;
        var ctx = cv.getContext('2d');
        ctx.drawImage(img, 0, 0, 500, 500);
        resolve(ctx.getImageData(0, 0, 500, 500));
      };
      img.onerror = reject;
    });
  };
  MorphingParticles.prototype.createPoints = function () {
    var pts = new PoissonDiskSampling({
      shape: [500, 500],
      minDistance: linearMap(this.scene.density, 0, 300, 10, 2),
      maxDistance: linearMap(this.scene.density, 0, 300, 11, 3),
      tries: 20
    }).fill();
    this.pointsBaseData = pts;
    this.pointsData = [];
    for (var i = 0; i < pts.length; i++) { this.pointsData.push(pts[i][0] - 250, pts[i][1] - 250); }
    this.count = this.pointsData.length / 2;
  };
  MorphingParticles.prototype.createPointsFromImage = function () {
    var self = this;
    var imgPromises = this.textures.map(function (t) { return self.getImageData(t); });
    return Promise.all(imgPromises).then(function (imgs) {
      self.nearestPointsData = [];
      var tasks = imgs.map(function (img, idx) {
        return self.createPointsDistanceDataWorker(img, self.pointsBaseData, idx);
      });
      return Promise.all(tasks).then(function (results) {
        results.sort(function (a, b) { return a.index - b.index; });
        results.forEach(function (r) { self.nearestPointsData.push(r.nearestPoints); });
      });
    });
  };
  MorphingParticles.prototype.createPointsDistanceDataWorker = function (imageData, pointsBase, index) {
    var self = this;
    return new Promise(function (resolve, reject) {
      var blob = new Blob([WORKER_SRC], { type: 'application/javascript' });
      var url = URL.createObjectURL(blob);
      var w = new Worker(url);
      w.onmessage = function (e) {
        w.terminate(); URL.revokeObjectURL(url);
        resolve({ nearestPoints: e.data.nearestPoints, index: e.data.index });
      };
      w.onerror = function (err) { w.terminate(); URL.revokeObjectURL(url); reject(err); };
      w.postMessage({ imageData: imageData, pointsBase: pointsBase, index: index, density: self.scene.density });
    });
  };
  MorphingParticles.prototype.createDataTexturePosition = function (src) {
    var data = new Float32Array(this.length * 4);
    for (var i = 0; i < this.count; i++) {
      var r = i * 4;
      data[r + 0] = src[i * 2 + 0] * (1 / 250);
      data[r + 1] = src[i * 2 + 1] * (1 / 250);
      data[r + 2] = 0; data[r + 3] = 0;
    }
    var tex = new T.DataTexture(data, this.size, this.size, T.RGBAFormat, T.FloatType);
    tex.needsUpdate = true;
    return tex;
  };
  MorphingParticles.prototype.createRenderTarget = function () {
    return new T.WebGLRenderTarget(this.size, this.size, {
      wrapS: T.RepeatWrapping, wrapT: T.RepeatWrapping,
      minFilter: T.NearestFilter, magFilter: T.NearestFilter,
      format: T.RGBAFormat, type: T.HalfFloatType,
      depthBuffer: false, stencilBuffer: false
    });
  };
  MorphingParticles.prototype.setPointsTextureFromIndex = function (i) {
    this.posNearestTex = this.createDataTexturePosition(this.nearestPointsData[i]);
    this.posNearestTex.needsUpdate = true;
    this.simMaterial.uniforms.uPosNearest = { value: this.posNearestTex };
  };
  MorphingParticles.prototype.init = function () {
    this.size = 256;
    this.length = this.size * this.size;
    this.posTex = this.createDataTexturePosition(this.pointsData);
    this.posNearestTex = this.createDataTexturePosition(this.nearestPointsData[0]);
    this.rt1 = this.createRenderTarget();
    this.rt2 = this.createRenderTarget();
    this.renderer.setRenderTarget(this.rt1); this.renderer.setClearColor(0, 0); this.renderer.clear();
    this.renderer.setRenderTarget(this.rt2); this.renderer.setClearColor(0, 0); this.renderer.clear();
    this.renderer.setRenderTarget(null);
    this.noise = new ValueNoise();
    this.simScene = new T.Scene();
    this.simCamera = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.simMaterial = new T.ShaderMaterial({
      uniforms: {
        uPosition: { value: this.posTex }, uPosRefs: { value: this.posTex },
        uPosNearest: { value: this.posNearestTex }, uMousePos: { value: new T.Vector2(0, 0) },
        uRingRadius: { value: 0.2 }, uDeltaTime: { value: 0 },
        uRingWidth: { value: 0.05 }, uRingWidth2: { value: 0.015 },
        uIsHovering: { value: 0 }, uRingDisplacement: { value: this.scene.ringDisplacement },
        uTime: { value: 0 }
      },
      vertexShader: 'void main(){gl_Position=vec4(position,1.0);}',
      fragmentShader: [
        'precision highp float;',
        'uniform sampler2D uPosition;uniform sampler2D uPosRefs;uniform sampler2D uPosNearest;',
        'uniform vec2 uMousePos;uniform float uTime;uniform float uDeltaTime;uniform float uIsHovering;',
        'vec2 hash(vec2 p){p=vec2(dot(p,vec2(2127.1,81.17)),dot(p,vec2(1269.5,283.37)));return fract(sin(p)*43758.5453);}',
        'void main(){',
        '  vec2 simTexCoords = gl_FragCoord.xy / vec2(' + this.size.toFixed(1) + ', ' + this.size.toFixed(1) + ');',
        '  vec4 pFrame = texture2D(uPosition, simTexCoords);',
        '  float scale = pFrame.z; float velocity = pFrame.w;',
        '  vec2 refPos = texture2D(uPosRefs, simTexCoords).xy;',
        '  vec2 nearestPos = texture2D(uPosNearest, simTexCoords).xy;',
        '  float seed = hash(simTexCoords).x; float seed2 = hash(simTexCoords).y;',
        '  float time = uTime * .5;',
        '  float lifeEnd = 3. + sin(seed2 * 100.) * 1.;',
        '  float lifeTime = mod((seed * 100.) + time, lifeEnd);',
        '  vec2 disp = vec2(0., 0.); vec2 pos = pFrame.xy;',
        '  float distRadius = 0.15;',
        '  vec2 targetPos = refPos;',
        '  targetPos = mix(targetPos, nearestPos, uIsHovering * uIsHovering);',
        '  vec2 direction = normalize(targetPos - pos); direction *= .01;',
        '  float dist = length(targetPos - pos);',
        '  float distStrength = smoothstep(distRadius, 0., dist);',
        '  if(dist > 0.005){ pos += direction * distStrength; }',
        '  if(lifeTime < .01){ pos = refPos; pFrame.xy = refPos; scale = 0.; }',
        '  float targetScale = smoothstep(.01, 0.5, lifeTime) - smoothstep(0.5, 1., lifeTime/lifeEnd);',
        '  targetScale += smoothstep(0.1, 0., smoothstep(0.001, .1, dist)) * 1.5 * uIsHovering;',
        '  float scaleDiff = targetScale - scale; scaleDiff *= .1; scale += scaleDiff;',
        '  vec2 finalPos = pos + (disp * smoothstep(0.001, distRadius, dist));',
        '  vec2 diff = finalPos - pFrame.xy; diff *= .2;',
        '  velocity = smoothstep(distRadius, .001, dist) * uIsHovering;',
        '  gl_FragColor = vec4(pFrame.xy + diff, scale, velocity);',
        '}'
      ].join('\n')
    });
    this.simScene.add(new T.Mesh(new T.PlaneGeometry(2, 2), this.simMaterial));

    var geo = new T.BufferGeometry();
    var uv = new Float32Array(this.count * 2);
    var posAttr = new Float32Array(this.count * 3);
    var seeds = new Float32Array(this.count * 4);
    for (var s = 0; s < this.count; s++) {
      var a = s % this.size, l = Math.floor(s / this.size);
      uv[s * 2] = a / this.size; uv[s * 2 + 1] = l / this.size;
    }
    for (var s2 = 0; s2 < this.count; s2++) {
      seeds[s2 * 4] = Math.random(); seeds[s2 * 4 + 1] = Math.random();
      seeds[s2 * 4 + 2] = Math.random(); seeds[s2 * 4 + 3] = Math.random();
    }
    geo.setAttribute('position', new T.BufferAttribute(posAttr, 3));
    geo.setAttribute('uv', new T.BufferAttribute(uv, 2));
    geo.setAttribute('seeds', new T.BufferAttribute(seeds, 4));

    this.renderMaterial = new T.ShaderMaterial({
      uniforms: {
        uPosition: { value: this.posTex }, uTime: { value: 0 },
        uColor1: { value: new T.Color(this.scene.colorControls.color1) },
        uColor2: { value: new T.Color(this.scene.colorControls.color2) },
        uColor3: { value: new T.Color(this.scene.colorControls.color3) },
        uAlpha: { value: 1 }, uIsHovering: { value: 0 }, uPulseProgress: { value: 0 },
        uMousePos: { value: new T.Vector2(0, 0) },
        uRez: { value: new T.Vector2(this.scene.renderer.domElement.width, this.scene.renderer.domElement.height) },
        uParticleScale: { value: this.particleScale }, uPixelRatio: { value: this.scene.pixelRatio },
        uColorScheme: { value: this.colorScheme }
      },
      vertexShader: [
        'precision highp float;',
        'attribute vec4 seeds;',
        'uniform sampler2D uPosition;uniform float uTime;uniform float uParticleScale;',
        'uniform float uPixelRatio;uniform int uColorScheme;uniform float uIsHovering;uniform float uPulseProgress;',
        'varying vec4 vSeeds;varying float vVelocity;varying vec2 vLocalPos;varying vec2 vScreenPos;varying float vScale;',
        NOISE_GLSL,
        'void main(){',
        '  vec4 pos = texture2D(uPosition, uv); vSeeds = seeds;',
        '  float noiseX = snoise(vec3(vec2(pos.xy * 10.), uTime * .2 + 100.));',
        '  float noiseY = snoise(vec3(vec2(pos.xy * 10.), uTime * .2));',
        '  float noiseX2 = snoise(vec3(vec2(pos.xy * .5), uTime * .15 + 45.));',
        '  float noiseY2 = snoise(vec3(vec2(pos.xy * .5), uTime * .15 + 87.));',
        '  float cDist = length(pos.xy) * 1.; float progress = uPulseProgress;',
        '  float t = smoothstep(progress - .25, progress, cDist) - smoothstep(progress, progress + .25, cDist);',
        '  t *= smoothstep(1., .0, cDist); pos.xy *= 1. + (t * .02);',
        '  float dist = smoothstep(0., 0.9, pos.w); dist = mix(0., dist, uIsHovering);',
        '  pos.y += noiseY * 0.005 * dist; pos.x += noiseX * 0.005 * dist;',
        '  pos.y += noiseY2 * 0.02; pos.x += noiseX2 * 0.02;',
        '  vVelocity = pos.w; vScale = pos.z; vLocalPos = pos.xy;',
        '  vec4 viewSpace = modelViewMatrix * vec4(vec3(pos.xy, 0.), 1.0);',
        '  gl_Position = projectionMatrix * viewSpace; vScreenPos = gl_Position.xy;',
        '  float minScale = .25; minScale += float(uColorScheme) * .75;',
        '  gl_PointSize = ((vScale * 7.) * (uPixelRatio * 0.5) * uParticleScale) + (minScale * uPixelRatio);',
        '}'
      ].join('\n'),
      fragmentShader: [
        'precision highp float;',
        'varying vec4 vSeeds;varying vec2 vScreenPos;varying vec2 vLocalPos;varying float vScale;varying float vVelocity;',
        'uniform vec3 uColor1;uniform vec3 uColor2;uniform vec3 uColor3;',
        'uniform vec2 uMousePos;uniform vec2 uRez;uniform float uAlpha;uniform float uTime;uniform int uColorScheme;',
        NOISE_GLSL,
        '#define PI 3.1415926535897932384626433832795',
        'float sdRoundBox(in vec2 p,in vec2 b,in vec4 r){r.xy=(p.x>0.0)?r.xy:r.zw;r.x=(p.y>0.0)?r.x:r.y;vec2 q=abs(p)-b+r.x;return min(max(q.x,q.y),0.0)+length(max(q,0.0))-r.x;}',
        'vec2 rotate(vec2 v,float a){float s=sin(a);float c=cos(a);mat2 m=mat2(c,s,-s,c);return m*v;}',
        'void main(){',
        '  float uBorderSize = 0.2; vec2 center = vec2(.48, .4); float ratio = uRez.x / uRez.y;',
        '  float angle = atan(vLocalPos.y - uMousePos.y, vLocalPos.x - uMousePos.x);',
        '  vec2 uv = gl_PointCoord.xy; uv -= vec2(0.5); uv.y *= -1.;',
        '  vec2 tuv = vScreenPos; tuv = rotate(tuv, uTime * 1.); tuv.y *= 1./ratio; tuv += .5;',
        '  float h = 0.8; float progress = vVelocity;',
        '  vec3 col = mix(mix(uColor1, uColor2, progress/h), mix(uColor2, uColor3, (progress - h)/(1.0 - h)), step(h, progress));',
        '  vec3 color = col;',
        '  float dist = sqrt(dot(uv, uv));',
        '  float dr = .5; float t = smoothstep(dr+(uBorderSize + .0001), dr-uBorderSize, dist); t = clamp(t, 0., 1.);',
        '  float rounded = sdRoundBox(uv, vec2(0.5, 0.2), vec4(.25)); rounded = smoothstep(.1, 0., rounded);',
        '  float disc = smoothstep(.5, .45, length(uv));',
        '  float a = uAlpha * disc * smoothstep(0.1, 0.2, vScale);',
        '  if(a < 0.01){ discard; }',
        '  color = clamp(color, 0., 1.);',
        '  color = mix(color, color * clamp(vVelocity, 0., 1.), float(uColorScheme));',
        '  gl_FragColor = vec4(color, clamp(a, 0., 1.));',
        '  #ifdef SRGB_TRANSFER',
        '    gl_FragColor = sRGBTransferOETF( gl_FragColor );',
        '  #endif',
        '}'
      ].join('\n'),
      transparent: true, depthTest: false, depthWrite: false
    });
    this.mesh = new T.Points(geo, this.renderMaterial);
    this.mesh.position.set(0, 0, 0);
    this.mesh.scale.set(5, -5, 5);
    this.scene.scene.add(this.mesh);
  };
  MorphingParticles.prototype.resize = function () {
    this.renderMaterial.uniforms.uRez.value = new T.Vector2(this.scene.renderer.domElement.width, this.scene.renderer.domElement.height);
    this.renderMaterial.uniforms.uPixelRatio.value = this.scene.pixelRatio;
    this.renderMaterial.needsUpdate = true;
  };
  MorphingParticles.prototype.update = function () {
    var dt = this.scene.clock.getElapsedTime() - this.lastTime;
    this.lastTime = this.scene.clock.getElapsedTime();
    this.mousePos.set(this.scene.intersectionPoint.x * 0.175, this.scene.intersectionPoint.y * 0.175);
    this.particleScale = this.scene.renderer.domElement.width / this.scene.pixelRatio / 2000 * this.scene.particlesScale;
    this.simMaterial.uniforms.uPosition.value = this.everRendered ? this.rt1.texture : this.posTex;
    this.simMaterial.uniforms.uTime.value = this.scene.clock.getElapsedTime();
    this.simMaterial.uniforms.uDeltaTime.value = dt;
    this.simMaterial.uniforms.uRingRadius.value = 0.175 + Math.sin(this.scene.time * 1) * 0.03 + Math.cos(this.scene.time * 3) * 0.02;
    this.simMaterial.uniforms.uMousePos.value = this.mousePos;
    this.simMaterial.uniforms.uRingWidth.value = this.scene.ringWidth;
    this.simMaterial.uniforms.uRingWidth2.value = this.scene.ringWidth2;
    this.simMaterial.uniforms.uRingDisplacement.value = this.scene.ringDisplacement;
    this.simMaterial.uniforms.uIsHovering.value = this.scene.hoverProgress;
    this.simMaterial.uniforms.uPosNearest.value = this.posNearestTex;
    this.renderer.setRenderTarget(this.rt2);
    this.renderer.render(this.simScene, this.simCamera);
    this.renderer.setRenderTarget(null);
    this.renderMaterial.uniforms.uPosition.value = this.everRendered ? this.rt2.texture : this.posTex;
    this.renderMaterial.uniforms.uTime.value = this.scene.clock.getElapsedTime();
    this.renderMaterial.uniforms.uMousePos.value = this.mousePos;
    this.renderMaterial.uniforms.uParticleScale.value = this.particleScale;
    this.renderMaterial.uniforms.uIsHovering.value = this.scene.hoverProgress;
    this.renderMaterial.uniforms.uPulseProgress.value = this.scene.pushProgress;
  };
  MorphingParticles.prototype.postRender = function () {
    var t = this.rt1; this.rt1 = this.rt2; this.rt2 = t; this.everRendered = true;
  };

  /* --- morphing particles scene wrapper --- */
  function MorphingScene(opts) {
    this.loaded = false;
    this.textures = opts.textures || ['assets/0cfd6800ffc3ddab_cube.png'];
    this.color1 = opts.color1 || '#aecbfa';
    this.color2 = opts.color2 || '#aecbfa';
    this.color3 = opts.color3 || '#93bbfc';
    this.options = opts;
    this.theme = opts.theme || 'dark';
    this.interactive = false;
    this.background = this.theme === 'dark' ? new T.Color(0x121317) : new T.Color(0xffffff);
    this.pixelRatio = opts.pixelRatio || window.devicePixelRatio;
    this.particlesScale = opts.particlesScale || 0.5;
    this.density = opts.density || 150;
    this.cameraZoom = opts.cameraZoom || 3.5;
    this.onLoadedCallback = opts.onLoaded || null;
    this.isHovering = false;
    this.hoverProgress = 0;
    this.pushProgress = 0;
    this.scene = new T.Scene();
    this.scene.background = this.background;
    this.canvas = document.createElement('canvas');
    this.options.container.appendChild(this.canvas);
    this.canvas.width = this.options.container.offsetWidth || 1;
    this.canvas.height = this.options.container.offsetHeight || 1;
    T.ColorManagement.enabled = false;
    this.renderer = new T.WebGLRenderer({
      canvas: this.canvas, antialias: true, alpha: true,
      powerPreference: 'high-performance', preserveDrawingBuffer: true,
      stencil: false, precision: 'highp'
    });
    this.gl = this.renderer.getContext();
    this.renderer.extensions.get('EXT_color_buffer_float');
    this.renderer.setSize(this.canvas.width, this.canvas.height);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.initCamera();
    this.initScene();
    this.initEvents();
    this.clock = new T.Clock();
    this.time = 0; this.lastTime = 0; this.dt = 0;
    this.skipFrame = false; this.isPaused = false;
    this.raycaster = new T.Raycaster();
    this.mouse = new T.Vector2();
    this.intersectionPoint = new T.Vector3();
    this.isIntersecting = false; this.mouseIsOver = false;
  }
  MorphingScene.prototype.initEvents = function () {
    var self = this;
    window.addEventListener('resize', function () { self.onWindowResize(); });
  };
  MorphingScene.prototype.onWindowResize = function () {
    this.canvas.width = this.options.container.offsetWidth || 1;
    this.canvas.height = this.options.container.offsetHeight || 1;
    this.renderer.setSize(this.canvas.width, this.canvas.height);
    this.camera.aspect = this.canvas.width / this.canvas.height;
    this.camera.updateProjectionMatrix();
    if (this.particles) this.particles.resize();
  };
  MorphingScene.prototype.onHoverStart = function () {
    tweenTo(this, 'hoverProgress', 1, 0.5, 0);
    tweenFromTo(this, 'pushProgress', 0, 1, 2, 0.1);
  };
  MorphingScene.prototype.onHoverEnd = function () {
    tweenTo(this, 'hoverProgress', 0, 0.5, 0);
    tweenFromTo(this, 'pushProgress', 0, 1, 2, 0);
  };
  MorphingScene.prototype.initCamera = function () {
    this.camera = new T.PerspectiveCamera(40, this.gl.drawingBufferWidth / this.gl.drawingBufferHeight, 0.1, 1000);
    this.camera.position.z = this.cameraZoom;
  };
  MorphingScene.prototype.initScene = function () {
    var self = this;
    this.colorControls = {
      color1: this.theme === 'dark' ? '#318bf7' : this.color1,
      color2: this.theme === 'dark' ? '#bada4c' : this.color2,
      color3: this.theme === 'dark' ? '#e35058' : this.color3
    };
    this.ringWidth = this.options.ringWidth || 0.107;
    this.ringWidth2 = this.options.ringWidth2 || 0.05;
    this.ringDisplacement = this.options.ringDisplacement || 0.15;
    MorphingParticles.create(this, this.textures).then(function (p) {
      self.particles = p;
      self.loaded = true;
      if (typeof self.onLoadedCallback === 'function') self.onLoadedCallback(self);
    }).catch(function (e) { console.error('[particles] morphing init failed', e); });
  };
  MorphingScene.prototype.stop = function () { this.isPaused = true; this.clock.stop(); };
  MorphingScene.prototype.resume = function () { this.isPaused = false; this.clock.start(); };
  MorphingScene.prototype.preRender = function () {
    this.dt = this.clock.getElapsedTime() - this.lastTime;
    this.lastTime = this.clock.getElapsedTime();
    this.time += this.dt;
    this.particles.update();
    this.skipFrame = !this.skipFrame;
  };
  MorphingScene.prototype.render = function () {
    if (!this.loaded || this.isPaused) return;
    this.preRender();
    this.renderer.setRenderTarget(null);
    this.renderer.autoClear = false;
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    this.particles.postRender();
  };

  /* =====================================================================
     Component bootstrap — wire scenes to the <canvas> placeholders
     ===================================================================== */
  function visibilityPause(container, scene) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) scene.resume(); else scene.stop(); });
    }, { root: null, rootMargin: '0px', threshold: 0 });
    io.observe(container);
  }

  function initMainParticles(host) {
    var container = host.querySelector('.main-particles-container');
    if (!container) return;
    var stale = container.querySelector('canvas');
    if (stale) stale.remove();
    var theme = host.getAttribute('data-theme') || host.getAttribute('theme') || 'light';
    var scene = new MainParticlesScene({
      container: container, theme: theme,
      particlesScale: 0.75, density: 200, interactive: true,
      ringWidth: 0.15, ringWidth2: 0.05, ringDisplacement: 0.15
    });
    var visible = false;
    visibilityPause(container, { resume: function () { visible = true; scene.resume(); }, stop: function () { visible = false; scene.stop(); } });
    (function loop() { requestAnimationFrame(loop); if (visible) scene.render(); })();
  }

  function initMorphingParticles(host) {
    var container = host.querySelector('.morphing-particles-container');
    if (!container) return;
    var stale = container.querySelector('canvas');
    if (stale) stale.remove();
    var texture = host.getAttribute('data-texture') || 'assets/0cfd6800ffc3ddab_cube.png';
    var scene = new MorphingScene({
      container: container,
      theme: host.getAttribute('data-theme') || 'light',
      textures: [texture],
      particlesScale: 0.6, density: 50, cameraZoom: 8.8,
      color1: host.getAttribute('data-color1') || '#676A72',
      color2: host.getAttribute('data-color2') || '#FF4641',
      color3: host.getAttribute('data-color3') || '#346BF1'
    });
    var visible = false;
    visibilityPause(container, { resume: function () { visible = true; scene.resume(); }, stop: function () { visible = false; scene.stop(); } });
    (function loop() { requestAnimationFrame(loop); if (visible) scene.render(); })();
    // hover interaction on the surrounding solution content
    var section = host.closest('.solution-section');
    if (section) {
      var content = section.querySelector('.try-solutions-content');
      if (content) {
        content.addEventListener('mouseenter', function () { scene.onHoverStart(); });
        content.addEventListener('mouseleave', function () { scene.onHoverEnd(); });
      }
    }
  }

  function boot() {
    document.querySelectorAll('landing-main-particles-component').forEach(initMainParticles);
    document.querySelectorAll('landing-morphing-particles-component').forEach(initMorphingParticles);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
