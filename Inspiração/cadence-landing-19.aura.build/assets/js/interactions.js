/* ─── WebGL Hero: Full-screen aurora/plasma shader ─── */
(function() {
  const canvas = document.getElementById('heroCanvas');
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false });
  if (!gl) return;

  let mx = 0.5, my = 0.5, tmx = 0.5, tmy = 0.5;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio, 1.5);
    const W = canvas.parentElement.clientWidth;
    const H = canvas.parentElement.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}`;
  const FRAG = `
precision highp float;
uniform float u_t;
uniform vec2 u_r;
uniform vec2 u_m;

// Simplex-style noise
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 perm(vec4 x){return mod289(((x*34.)+1.)*x);}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);
  const vec4 D=vec4(0,.5,1,2);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.-g;
  vec3 i1=min(g,l.zxy);
  vec3 i2=max(g,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=perm(perm(perm(i.z+vec4(0,i1.z,i2.z,1))+i.y+vec4(0,i1.y,i2.y,1))+i.x+vec4(0,i1.x,i2.x,1));
  float n_=1./7.;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;
  vec4 s1=floor(b1)*2.+1.;
  vec4 sh=-step(h,vec4(0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=1.79284291400159-.85373472095314*vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
  m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

float fbm(vec3 p){
  float v=0.,a=.5;
  for(int i=0;i<5;i++){
    v+=a*snoise(p);
    p*=2.1;
    a*=.48;
  }
  return v;
}

void main(){
  vec2 uv=(gl_FragCoord.xy)/u_r;
  vec2 p=uv*2.-1.;
  p.x*=u_r.x/u_r.y;

  // Mouse influence — warp the coordinate space
  vec2 mp=u_m*2.-1.;
  mp.x*=u_r.x/u_r.y;
  float md=length(p-mp);
  float mInfluence=smoothstep(1.5,0.,md)*0.6;
  p+=normalize(p-mp+.001)*mInfluence*0.45;

  float t=u_t*0.25;

  // Layer 1: slow flowing aurora
  float n1=fbm(vec3(p*1.2+vec2(t*0.4,t*0.3),t*0.2));
  // Layer 2: faster detail
  float n2=fbm(vec3(p*2.5+vec2(-t*0.6,t*0.5),t*0.35+5.));
  // Layer 3: mouse-reactive ripple
  float n3=fbm(vec3(p*1.8+mp*0.5,t*0.5+10.));
  // Layer 4: continuous pulsing wave (always visible)
  float wave=sin(length(p)*4.0-t*2.0)*0.5+0.5;
  float n4=fbm(vec3(p*0.8+vec2(t*0.2,-t*0.15),t*0.1+20.))*wave;

  // Combine
  float n=n1*0.55+n2*0.3+n3*mInfluence*1.5+n4*0.35;

  // Color: teal to cyan to dark
  vec3 c1=vec3(0.05,0.58,0.51); // dark teal
  vec3 c2=vec3(0.18,0.84,0.75); // bright teal
  vec3 c3=vec3(0.37,0.93,0.85); // cyan highlight

  float intensity=smoothstep(-0.2,0.8,n);
  vec3 col=mix(c1,c2,intensity);
  col=mix(col,c3,smoothstep(0.5,1.0,intensity)*0.6);

  // Mouse glow: bright spot near cursor
  float glow=exp(-md*md*2.5)*0.5;
  col+=c3*glow;

  // Vignette
  float vig=1.-smoothstep(0.4,1.5,length(uv*2.-1.));

  // Overall alpha: visible and atmospheric
  float alpha=intensity*0.32*vig+glow*0.7*vig;

  // Boost center area
  float centerGlow=exp(-dot(p,p)*0.6)*0.12;
  alpha+=centerGlow;

  gl_FragColor=vec4(col,alpha);
}
  `;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
    }
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  // Full-screen quad
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  const pLoc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(pLoc);
  gl.vertexAttribPointer(pLoc, 2, gl.FLOAT, false, 0, 0);

  const u_t = gl.getUniformLocation(prog, 'u_t');
  const u_r = gl.getUniformLocation(prog, 'u_r');
  const u_m = gl.getUniformLocation(prog, 'u_m');

  canvas.parentElement.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    tmx = (e.clientX - r.left) / r.width;
    tmy = 1.0 - (e.clientY - r.top) / r.height; // flip Y for GL
  });

  resize();
  window.addEventListener('resize', resize);

  function frame(t) {
    requestAnimationFrame(frame);
    // Smooth mouse interpolation
    mx += (tmx - mx) * 0.12;
    my += (tmy - my) * 0.12;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.useProgram(prog);
    gl.uniform1f(u_t, t * 0.001);
    gl.uniform2f(u_r, canvas.width, canvas.height);
    gl.uniform2f(u_m, mx, my);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  requestAnimationFrame(frame);
})();

/* ─── Dynamic year ─── */
document.getElementById('year').textContent = new Date().getFullYear();

/* ─── Mobile nav ─── */
const hamburger = document.getElementById('hamburger');
const navMobile = document.getElementById('navMobile');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navMobile.classList.toggle('open');
});

/* ─── Intersection Observer ─── */
const ioOptions = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');

      // Trigger chart animation when product UI visible
      if (entry.target.id === 'productUI') {
        setTimeout(() => {
          document.getElementById('chartLinePath').classList.add('drawn');
          document.getElementById('chartAreaPath').classList.add('shown');
        }, 400);
      }

    }
  });
}, ioOptions);

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger-up, #productUI').forEach(el => io.observe(el));

/* ─── Billing toggle ─── */
const toggle = document.getElementById('billingToggle');
let isAnnual = false;
const prices = { starter: [199, 159], growth: [599, 479] };
toggle.addEventListener('click', () => {
  isAnnual = !isAnnual;
  toggle.classList.toggle('on', isAnnual);
  document.querySelector('#pricing .pricing-card:nth-child(1) .price-val').textContent = isAnnual ? prices.starter[1] : prices.starter[0];
  document.getElementById('price-growth-val').textContent = isAnnual ? prices.growth[1] : prices.growth[0];
});

/* ─── Ambient bar chart animation ─── */
const bars = document.querySelectorAll('.widget-bar');
function animateBars() {
  bars.forEach(bar => {
    const h = Math.floor(Math.random() * 60) + 30;
    bar.style.height = h + '%';
  });
}
setInterval(animateBars, 2200);

/* ─── Signal feed cycling ─── */
const signalMessages = [
  { type: 'hot',  text: 'Acme Corp — churn risk detected' },
  { type: '',     text: 'TechFlow Inc — expansion signal' },
  { type: 'warn', text: 'Vertix — deal stalled 12 days' },
  { type: '',     text: 'Meridian Co — champion hired' },
  { type: 'hot',  text: 'NovaCorp — legal review delay' },
  { type: '',     text: 'Brex Ltd — upsell opportunity' },
  { type: 'warn', text: 'Aether — QBR overdue 5 days' },
  { type: '',     text: 'Cascade Inc — renewal signal' },
];
let sigIdx = 0;
const signalWidget = document.getElementById('signalWidget');
if (signalWidget) {
  setInterval(() => {
    const rows = signalWidget.querySelectorAll('.signal-row');
    const msg = signalMessages[sigIdx % signalMessages.length];
    const oldest = rows[rows.length - 1];
    const dot = oldest.querySelector('.signal-dot');
    dot.className = 'signal-dot ' + msg.type;
    // Replace text node (second child after the dot element)
    const textNode = Array.from(oldest.childNodes).find(n => n.nodeType === 3);
    if (textNode) textNode.textContent = msg.text;
    else oldest.appendChild(document.createTextNode(msg.text));
    signalWidget.insertBefore(oldest, rows[0]);
    sigIdx++;
  }, 2800);
}

/* ─── Pipeline stage bar ambient flicker ─── */
const stageValues = [
  [85, 64, 48, 30],
  [78, 71, 55, 38],
  [90, 58, 42, 25],
  [82, 67, 52, 34],
];
let stageFrame = 0;
const stageBars = document.querySelectorAll('.pipeline-stage-bar');
setInterval(() => {
  stageFrame = (stageFrame + 1) % stageValues.length;
  stageBars.forEach((bar, i) => {
    if (stageValues[stageFrame][i] !== undefined) {
      bar.style.width = stageValues[stageFrame][i] + '%';
    }
  });
}, 3000);

/* ─── How It Works: scroll-pinned controller ─── */
const howSection = document.getElementById('how');
const howSteps = [
  { num: '01', label: 'Step 1 of 4', title: 'Connect your stack' },
  { num: '02', label: 'Step 2 of 4', title: 'Analyze every signal' },
  { num: '03', label: 'Step 3 of 4', title: 'Predict with precision' },
  { num: '04', label: 'Step 4 of 4', title: 'Act on intelligence' },
];
const howPanels = document.querySelectorAll('.how-panel');
const howDots = document.querySelectorAll('.how-dot');
const howBigNum = document.getElementById('howBigNum');
const howBigNumFill = document.getElementById('howBigNumFill');
const howLabel = document.getElementById('howLabel');
const howTitle = document.getElementById('howTitle');
const howProgressFill = document.getElementById('howProgressFill');
const howOrb1 = document.getElementById('howOrb1');
const howOrb2 = document.getElementById('howOrb2');
let currentHowStep = -1;
let gaugeDrawn = false;

function updateHowStep(step) {
  if (step === currentHowStep) return;
  currentHowStep = step;
  const s = howSteps[step];

  // Big number
  howBigNum.textContent = s.num;
  howBigNumFill.textContent = s.num;
  howBigNumFill.classList.remove('visible');
  requestAnimationFrame(() => requestAnimationFrame(() => howBigNumFill.classList.add('visible')));

  // Label + title
  howLabel.classList.remove('visible');
  howTitle.classList.remove('visible');
  setTimeout(() => {
    howLabel.textContent = s.label;
    howTitle.textContent = s.title;
    howLabel.classList.add('visible');
    howTitle.classList.add('visible');
  }, 120);

  // Panels: 3D transitions
  howPanels.forEach((p, i) => {
    p.classList.remove('active', 'behind');
    if (i === step) p.classList.add('active');
    else if (i < step) p.classList.add('behind');
  });

  // Dots
  howDots.forEach((d, i) => d.classList.toggle('active', i === step));

  // Orb movement
  const ox = step * 15;
  const oy = step * 10;
  howOrb1.style.transform = `translate(${ox}px, ${-oy}px)`;
  howOrb2.style.transform = `translate(${-ox}px, ${oy}px)`;

  // Gauge animation on step 3
  if (step === 2 && !gaugeDrawn) {
    gaugeDrawn = true;
    const ring = document.getElementById('hwGaugeRing');
    if (ring) setTimeout(() => ring.classList.add('drawn'), 300);
  }
}

function onHowScroll() {
  const rect = howSection.getBoundingClientRect();
  const sectionH = howSection.offsetHeight;
  const viewH = window.innerHeight;
  // Progress: 0 at start of section, 1 at end
  const scrolled = -rect.top;
  const scrollRange = sectionH - viewH;
  if (scrollRange <= 0) return;
  const progress = Math.max(0, Math.min(1, scrolled / scrollRange));

  // Update progress bar
  howProgressFill.style.width = (progress * 100) + '%';

  // Map progress to steps (4 steps over the scroll range)
  const step = Math.min(3, Math.floor(progress * 4));
  updateHowStep(step);
}

window.addEventListener('scroll', onHowScroll, { passive: true });
// Initial call
onHowScroll();
