(function() {
  let config = null;
  let configLoaded = false;

  const gate = document.getElementById('sound-gate');
  const audio = document.getElementById('audio');
  const player = document.getElementById('player');
  const plBtn = document.getElementById('pl-btn');
  const icoPause = document.getElementById('ico-pause');
  const icoPlay = document.getElementById('ico-play');

  async function loadConfig() {
    try {
      const res = await fetch('/api/config');
      config = await res.json();
      configLoaded = true;
      applyConfig();
    } catch (err) {
      console.warn('Failed to load config from backend');
    }
  }

  function applyConfig() {
    if (!config) return;

    // Download links
    const downloadLinks = [
      document.getElementById('nav-download-link'),
      document.getElementById('hero-download-link')
    ];
    downloadLinks.forEach(link => {
      if (link) {
        link.href = config.downloadUrl;
        link.removeAttribute('download');
      }
    });

    // Social links
    const heroTelegram = document.getElementById('hero-telegram');
    if (heroTelegram) heroTelegram.href = config.telegram;
    const heroTelegramChannel = document.getElementById('hero-telegram-channel');
    if (heroTelegramChannel) heroTelegramChannel.href = config.telegramChannel;
    const heroYoutube = document.getElementById('hero-youtube');
    if (heroYoutube) heroYoutube.href = config.youtube;

    const contactFacebook = document.getElementById('contact-facebook');
    if (contactFacebook) contactFacebook.href = config.facebook;
    const contactTelegram = document.getElementById('contact-telegram');
    if (contactTelegram) contactTelegram.href = config.telegram;
    const contactTelegramChannel = document.getElementById('contact-telegram-channel');
    if (contactTelegramChannel) contactTelegramChannel.href = config.telegramChannel;
    const contactYoutube = document.getElementById('contact-youtube');
    if (contactYoutube) contactYoutube.href = config.youtube;
    const contactInstagram = document.getElementById('contact-instagram');
    if (contactInstagram) contactInstagram.href = config.instagram;

    const vipTelegram = document.getElementById('vip-telegram-link');
    if (vipTelegram) vipTelegram.href = config.telegram;
    const largeTelegram = document.getElementById('large-telegram-btn');
    if (largeTelegram) largeTelegram.href = config.telegram;

    // Audio source
    if (config.audioUrl && !audio.src) {
      audio.src = config.audioUrl;
      audio.load();
    }

    // Video sources
    const shizukuVideo = document.getElementById('shizuku-video');
    if (shizukuVideo && config.tutorialShizukuUrl && !shizukuVideo.src) {
      shizukuVideo.src = config.tutorialShizukuUrl;
      shizukuVideo.load();
      shizukuVideo.addEventListener('error', () => {
        console.warn('Failed to load Shizuku tutorial video. Check URL.');
      });
    }
    const patchVideo = document.getElementById('patch-video');
    if (patchVideo && config.tutorialPatchUrl && !patchVideo.src) {
      patchVideo.src = config.tutorialPatchUrl;
      patchVideo.load();
      patchVideo.addEventListener('error', () => {
        console.warn('Failed to load Patching tutorial video. Check URL.');
      });
    }
  }

  async function playAudio() {
    if (!audio.src) {
      // Wait for config to set audio src
      if (!configLoaded) await loadConfig();
      if (!audio.src) return;
    }
    audio.volume = 0.45;
    try {
      await audio.play();
    } catch (err) {
      audio.addEventListener('canplaythrough', async function onCanPlay() {
        try {
          await audio.play();
        } catch (e) {}
        audio.removeEventListener('canplaythrough', onCanPlay);
      });
    }
  }

  async function startAudio(e) {
    e.stopPropagation();
    await playAudio();
    gate.classList.add('hide');
    setTimeout(() => { gate.style.display = 'none'; }, 550);
    player.classList.remove('hidden');
    document.removeEventListener('click', startAudio, true);
    document.removeEventListener('touchstart', startAudio, true);
  }

  gate.addEventListener('click', startAudio);
  document.addEventListener('click', startAudio, true);
  document.addEventListener('touchstart', startAudio, true);

  plBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (audio.paused) {
      audio.play();
      icoPause.classList.remove('hidden');
      icoPlay.classList.add('hidden');
    } else {
      audio.pause();
      icoPause.classList.add('hidden');
      icoPlay.classList.remove('hidden');
    }
  });

  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });

  const burger = document.getElementById('burger');
  const navMenu = document.getElementById('nav-menu');
  burger.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = navMenu.classList.toggle('open');
    burger.classList.toggle('open', open);
  });
  navMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navMenu.classList.remove('open');
      burger.classList.remove('open');
    });
  });
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) {
      navMenu.classList.remove('open');
      burger.classList.remove('open');
    }
  });

  const revealEls = document.querySelectorAll('.feat-col, .tut-card, .faq-item, .vip-price-card, .about-block, .dev-block, .contact-left, .contact-right');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = `${(i % 4) * 60}ms`;
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  revealEls.forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
  });

  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const PARTICLE_COUNT = 60;
  const MAX_SPEED = 0.25;
  const LINK_DISTANCE = 70;

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * MAX_SPEED,
        vy: (Math.random() - 0.5) * MAX_SPEED,
        radius: Math.random() * 1.5 + 1
      });
    }
  }

  function drawParticles() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#00E5FF';
    for (let p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.1)';
    ctx.lineWidth = 0.6;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DISTANCE) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function updateParticles() {
    for (let p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;
    }
  }

  function animate() {
    if (!canvas.isConnected) return;
    updateParticles();
    drawParticles();
    requestAnimationFrame(animate);
  }

  function setupParticles() {
    resizeCanvas();
    initParticles();
    animate();
  }

  window.addEventListener('resize', () => {
    resizeCanvas();
    initParticles();
  });

  setupParticles();

  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || (e.ctrlKey && e.key === 'U')) {
      e.preventDefault();
    }
  });

  loadConfig();
})();