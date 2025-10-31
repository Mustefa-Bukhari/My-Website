// code.js - Animated feathered white cloudlets over gradient background
(function() {
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
  let canvasWidth = window.innerWidth;
  let canvasHeight = window.innerHeight;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  window.addEventListener('resize', () => {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
  });

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function makeCloud() {
    return {
      x: randomBetween(0, canvasWidth),
      y: randomBetween(0, canvasHeight * 0.7),
      r: randomBetween(CLOUD_MIN_RADIUS, CLOUD_MAX_RADIUS),
      speed: randomBetween(CLOUD_MIN_SPEED, CLOUD_MAX_SPEED) * (Math.random() < 0.5 ? 1 : -1),
      alpha: randomBetween(0.18, 0.32),
      offset: randomBetween(-20, 20)
    };
  }

  let clouds = Array.from({length: CLOUD_COUNT}, makeCloud);

  function drawCloud(cloud) {
    ctx.save();
    ctx.translate(cloud.x, cloud.y);
    ctx.beginPath();
    
    // Draw feathered cloud shape
    for(let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const x = Math.cos(angle) * cloud.r;
      const y = Math.sin(angle) * cloud.r + cloud.offset;
      
      if(i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    ctx.fillStyle = `rgba(255, 255, 255, ${cloud.alpha})`;
    ctx.fill();
    ctx.restore();
  }

  function updateCloud(cloud) {
    cloud.x += cloud.speed;
    
    // Wrap around screen
    if(cloud.speed > 0 && cloud.x - cloud.r > canvasWidth) {
      cloud.x = -cloud.r;
    } else if(cloud.speed < 0 && cloud.x + cloud.r < 0) {
      cloud.x = canvasWidth + cloud.r;
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    clouds.forEach(cloud => {
      updateCloud(cloud);
      drawCloud(cloud);
    });
    
    requestAnimationFrame(animate);
  }

  animate();
})();