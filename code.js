// code.js - Animated feathered white cloudlets over gradient background

const CLOUD_COUNT = 8;
const CLOUD_MIN_RADIUS = 40;
const CLOUD_MAX_RADIUS = 90;
const CLOUD_MIN_SPEED = 0.1;
const CLOUD_MAX_SPEED = 0.3;

const canvas = document.createElement('canvas');
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100vw';
canvas.style.height = '100vh';
canvas.style.pointerEvents = 'none';
canvas.style.zIndex = '0';
document.body.prepend(canvas);

const ctx = canvas.getContext('2d');
let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
});

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

function makeCloud() {
  return {
    x: randomBetween(0, width),
    y: randomBetween(0, height * 0.7),
    r: randomBetween(CLOUD_MIN_RADIUS, CLOUD_MAX_RADIUS),
    speed: randomBetween(CLOUD_MIN_SPEED, CLOUD_MAX_SPEED) * (Math.random() < 0.5 ? 1 : -1),
    alpha: randomBetween(0.18, 0.32),
    offset: randomBetween(-20, 20)
  };
}

let clouds = Array.from({length: CLOUD_COUNT}, makeCloud);

function drawCloud(cloud) {
  ctx.save();
  ctx.globalAlpha = cloud.alpha;
  let cx = cloud.x, cy = cloud.y, r = cloud.r;
  // Draw main ellipse
  let grad = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r);
  grad.addColorStop(0, 'rgba(255,255,255,0.9)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
  // Add a few feathered blobs
  for (let i = 0; i < 3; i++) {
    let angle = Math.PI * 2 * Math.random();
    let rx = cx + Math.cos(angle) * r * randomBetween(0.4, 0.8);
    let ry = cy + Math.sin(angle) * r * randomBetween(0.2, 0.5) + cloud.offset;
    let rr = r * randomBetween(0.3, 0.6);
    let g2 = ctx.createRadialGradient(rx, ry, rr * 0.5, rx, ry, rr);
    g2.addColorStop(0, 'rgba(255,255,255,0.7)');
    g2.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.arc(rx, ry, rr, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fillStyle = g2;
    ctx.fill();
  }
  ctx.restore();
}

function animate() {
  ctx.clearRect(0, 0, width, height);
  for (let cloud of clouds) {
    drawCloud(cloud);
    cloud.x += cloud.speed;
    if (cloud.x - cloud.r > width) cloud.x = -cloud.r;
    if (cloud.x + cloud.r < 0) cloud.x = width + cloud.r;
  }
  requestAnimationFrame(animate);
}

animate();
