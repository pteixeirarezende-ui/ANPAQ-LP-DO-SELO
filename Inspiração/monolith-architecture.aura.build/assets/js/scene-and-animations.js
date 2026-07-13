// ==========================================
// THREE.JS SCENE
// ==========================================
const canvas = document.getElementById('three-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0a0b, 0.035);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 8);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

const ambientLight = new THREE.AmbientLight(0x404050, 0.5);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xfff5ee, 2);
mainLight.position.set(5, 8, 5);
mainLight.castShadow = true;
scene.add(mainLight);

const accentLight = new THREE.PointLight(0xff4500, 3, 20);
accentLight.position.set(-3, 2, 4);
scene.add(accentLight);

const rimLight = new THREE.PointLight(0x3366ff, 1.5, 15);
rimLight.position.set(4, -2, 3);
scene.add(rimLight);

const fillLight = new THREE.DirectionalLight(0x8888aa, 0.8);
fillLight.position.set(-5, -3, -5);
scene.add(fillLight);

const monolithGroup = new THREE.Group();
scene.add(monolithGroup);

const icoGeo = new THREE.IcosahedronGeometry(2, 1);
const icoWire = new THREE.WireframeGeometry(icoGeo);
const icoMat = new THREE.LineBasicMaterial({ color: 0xff4500, opacity: 0.35, transparent: true });
const icoLines = new THREE.LineSegments(icoWire, icoMat);
monolithGroup.add(icoLines);

const dodGeo = new THREE.DodecahedronGeometry(1.3, 0);
const dodWire = new THREE.WireframeGeometry(dodGeo);
const dodMat = new THREE.LineBasicMaterial({ color: 0xaaaacc, opacity: 0.2, transparent: true });
const dodLines = new THREE.LineSegments(dodWire, dodMat);
monolithGroup.add(dodLines);

const octGeo = new THREE.OctahedronGeometry(0.8, 0);
const octMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    metalness: 0.9,
    roughness: 0.1,
    emissive: 0xff4500,
    emissiveIntensity: 0.05
});
const octMesh = new THREE.Mesh(octGeo, octMat);
monolithGroup.add(octMesh);

const ringGeo = new THREE.TorusGeometry(3, 0.015, 8, 64);
const ringMat = new THREE.MeshStandardMaterial({ color: 0xff4500, emissive: 0xff4500, emissiveIntensity: 0.3, metalness: 1, roughness: 0.2 });
const ring = new THREE.Mesh(ringGeo, ringMat);
ring.rotation.x = Math.PI / 2;
monolithGroup.add(ring);

const ring2Geo = new THREE.TorusGeometry(3.5, 0.008, 8, 80);
const ring2Mat = new THREE.MeshStandardMaterial({ color: 0x666688, metalness: 1, roughness: 0.3 });
const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
ring2.rotation.x = Math.PI / 3;
ring2.rotation.y = Math.PI / 6;
monolithGroup.add(ring2);

const particleCount = 500;
const particleGeo = new THREE.SphereGeometry(0.015, 4, 4);
const particleMat = new THREE.MeshBasicMaterial({ color: 0x555566 });
const instancedParticles = new THREE.InstancedMesh(particleGeo, particleMat, particleCount);

const dummy = new THREE.Object3D();
const particleData = [];

for (let i = 0; i < particleCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 5 + Math.random() * 20;
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    dummy.position.set(x, y, z);
    const s = 0.5 + Math.random() * 2;
    dummy.scale.set(s, s, s);
    dummy.updateMatrix();
    instancedParticles.setMatrixAt(i, dummy.matrix);

    particleData.push({ x, y, z, speed: 0.0005 + Math.random() * 0.001, offset: Math.random() * Math.PI * 2 });
}
scene.add(instancedParticles);

const debrisCount = 60;
const debrisGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
const debrisMat = new THREE.MeshStandardMaterial({ color: 0x333344, metalness: 0.8, roughness: 0.3 });
const instancedDebris = new THREE.InstancedMesh(debrisGeo, debrisMat, debrisCount);
const debrisData = [];

for (let i = 0; i < debrisCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 4 + Math.random() * 8;
    const x = Math.cos(angle) * dist;
    const y = (Math.random() - 0.5) * 10;
    const z = Math.sin(angle) * dist;

    dummy.position.set(x, y, z);
    dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    const s = 0.3 + Math.random() * 1.5;
    dummy.scale.set(s, s, s * 2);
    dummy.updateMatrix();
    instancedDebris.setMatrixAt(i, dummy.matrix);

    debrisData.push({ x, y, z, rotSpeed: 0.001 + Math.random() * 0.003, angle: Math.random() * Math.PI * 2 });
}
scene.add(instancedDebris);

const gridHelper = new THREE.GridHelper(40, 40, 0x222233, 0x151520);
gridHelper.position.y = -4;
scene.add(gridHelper);

let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;

document.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

let scrollProgress = 0;
window.addEventListener('scroll', () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = window.scrollY / maxScroll;
});

const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    monolithGroup.rotation.y = time * 0.15 + mouseX * 0.3;
    monolithGroup.rotation.x = Math.sin(time * 0.1) * 0.1 + mouseY * 0.15;
    icoLines.rotation.y = -time * 0.08;
    icoLines.rotation.z = time * 0.05;
    dodLines.rotation.y = time * 0.12;
    dodLines.rotation.x = time * 0.07;
    octMesh.rotation.y = time * 0.2;
    octMesh.rotation.x = time * 0.15;
    ring.rotation.z = time * 0.1;
    ring2.rotation.z = -time * 0.07;
    ring2.rotation.x = Math.PI / 3 + time * 0.05;

    accentLight.position.x = Math.cos(time * 0.3) * 5;
    accentLight.position.z = Math.sin(time * 0.3) * 5;
    accentLight.position.y = Math.sin(time * 0.5) * 2;

    for (let i = 0; i < particleCount; i++) {
        const p = particleData[i];
        dummy.position.set(
            p.x + Math.sin(time * p.speed * 100 + p.offset) * 0.3,
            p.y + Math.cos(time * p.speed * 80 + p.offset) * 0.3,
            p.z + Math.sin(time * p.speed * 60 + p.offset + 1) * 0.3
        );
        const s = 0.5 + Math.sin(time + p.offset) * 0.3;
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();
        instancedParticles.setMatrixAt(i, dummy.matrix);
    }
    instancedParticles.instanceMatrix.needsUpdate = true;

    for (let i = 0; i < debrisCount; i++) {
        const d = debrisData[i];
        dummy.position.set(
            d.x + Math.sin(time * 0.2 + d.angle) * 0.5,
            d.y + Math.cos(time * 0.15 + d.angle) * 0.5,
            d.z
        );
        dummy.rotation.set(time * d.rotSpeed * 50, time * d.rotSpeed * 30, time * d.rotSpeed * 40);
        const s = 0.3 + Math.sin(time * 0.5 + d.angle) * 0.15;
        dummy.scale.set(s, s, s * 2);
        dummy.updateMatrix();
        instancedDebris.setMatrixAt(i, dummy.matrix);
    }
    instancedDebris.instanceMatrix.needsUpdate = true;

    const targetFov = 60 + scrollProgress * 15;
    camera.fov += (targetFov - camera.fov) * 0.05;
    camera.updateProjectionMatrix();

    const duskProgress = Math.max(0, (scrollProgress - 0.7) / 0.3);
    const bgR = 0x0a / 255 * (1 - duskProgress) + 0x12 / 255 * duskProgress;
    const bgG = 0x0a / 255 * (1 - duskProgress) + 0x08 / 255 * duskProgress;
    const bgB = 0x0b / 255 * (1 - duskProgress) + 0x18 / 255 * duskProgress;
    scene.background = new THREE.Color(bgR, bgG, bgB);
    scene.fog.color.set(bgR, bgG, bgB);

    accentLight.intensity = 3 + duskProgress * 2;
    mainLight.intensity = 2 - duskProgress * 0.8;

    const pulse = 1 + Math.sin(time * 0.5) * 0.02;
    monolithGroup.scale.set(pulse, pulse, pulse);

    camera.position.x = mouseX * 0.5;
    camera.position.y = -mouseY * 0.3;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ==========================================
// GSAP ANIMATIONS
// ==========================================
gsap.registerPlugin(ScrollTrigger);

gsap.to('#hero-badge', { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: 'power3.out' });
gsap.to('#hero-title', { opacity: 1, y: 0, duration: 1, delay: 0.5, ease: 'power3.out' });
gsap.to('#hero-sub', { opacity: 1, y: 0, duration: 1, delay: 0.7, ease: 'power3.out' });

const processInner = document.getElementById('process-inner');
const processCards = processInner.querySelectorAll('.process-card');

gsap.to(processInner, {
    x: () => -(processInner.scrollWidth - window.innerWidth + 100),
    ease: 'none',
    scrollTrigger: {
        trigger: '#process',
        start: 'top top',
        end: () => '+=' + (processInner.scrollWidth - window.innerWidth + 200),
        scrub: 1,
        pin: false,
        invalidateOnRefresh: true
    }
});

processCards.forEach((card, i) => {
    gsap.from(card, {
        opacity: 0,
        y: 40,
        scale: 0.95,
        scrollTrigger: {
            trigger: '#process',
            start: `top+=${i * 150} center`,
            end: `top+=${i * 150 + 300} center`,
            scrub: 1
        }
    });
});

// Gallery Items Animation
const galleryItems = document.querySelectorAll('.gallery-item');
galleryItems.forEach((item, i) => {
    gsap.from(item, {
        opacity: 0,
        y: 40,
        duration: 0.6,
        scrollTrigger: {
            trigger: item,
            start: 'top 90%',
            end: 'top 70%',
            scrub: 0.5
        }
    });
});

// Testimonials Animation
gsap.from('#testimonials .grid > div', {
    opacity: 0,
    y: 30,
    stagger: 0.2,
    duration: 0.8,
    scrollTrigger: {
        trigger: '#testimonials',
        start: 'top 80%',
    }
});

// Pricing Animation
gsap.from('#pricing .grid > div', {
    opacity: 0,
    y: 40,
    stagger: 0.2,
    duration: 0.8,
    scrollTrigger: {
        trigger: '#pricing',
        start: 'top 75%',
    }
});

gsap.from('#contact form', {
    opacity: 0,
    y: 50,
    duration: 1,
    scrollTrigger: {
        trigger: '#contact',
        start: 'top 70%',
        end: 'top 40%',
        scrub: 0.5
    }
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
