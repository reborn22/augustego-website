/* Original canvas logotype: echoes follow input and settle, with no perpetual render loop. */
(() => {
  const canvas = document.querySelector('#type-echo');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  const hero = document.querySelector('.hero');
  const world = document.querySelector('.world-band');
  const image = document.querySelector('.world-print');
  const shutter = document.querySelector('.world-shutter');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(pointer: fine)');
  const text = 'augustego';
  const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
  let width = 0, height = 0, fontSize = 128, frame = 0, ready = false;
  let currentX = 0, currentY = 0, targetX = 0, targetY = 0;
  let scroll = 0, active = true, intro = 0, lastTime = 0;
  let glyphs = [], textWidth = 0, horizontalScale = 1;

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width; height = bounds.height;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.font = '700 128px Wordmark';
    fontSize = Math.min(width * .94 / ctx.measureText(text).width * 128, height * .67);
    ctx.font = `700 ${fontSize}px Wordmark`;
    glyphs = [...text].map((letter, index) => ({letter, x: ctx.measureText(text.slice(0, index)).width}));
    textWidth = ctx.measureText(text).width;
    horizontalScale = Math.min(1.6, width * .94 / textWidth);
    textWidth *= horizontalScale;
    schedule();
  }

  function draw(time) {
    frame = 0;
    if (!ready || document.hidden) return;
    const dt = Math.min(40, lastTime ? time - lastTime : 16); lastTime = time;
    const easing = 1 - Math.pow(.86, dt / 16);
    currentX += (targetX - currentX) * easing;
    currentY += (targetY - currentY) * easing;
    intro = motion.matches ? 1 : Math.min(1, intro + dt / 1100);
    const entrance = 1 - Math.pow(1 - intro, 4);
    ctx.clearRect(0, 0, width, height);
    ctx.font = `700 ${fontSize}px Wordmark`;
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    const metrics = ctx.measureText(text);
    const glyphHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    const trail = Math.min(12, height * .035);
    const x = (width - textWidth) / 2;
    const y = (height - glyphHeight - trail * 5) / 2 + metrics.actualBoundingBoxAscent + (1 - entrance) * 24;
    const stretch = motion.matches ? 0 : scroll;
    const layers = motion.matches ? 3 : 7;

    for (let layer = layers; layer >= 0; layer--) {
      const depth = layer / layers;
      ctx.save();
      ctx.globalAlpha = entrance * (layer === 0 ? 1 : .7 - depth * .4);
      ctx.lineWidth = width < 600 ? .65 : .85;
      ctx.strokeStyle = layer === layers ? '#e43b3e' : '#c1bbb3';
      const ink = ctx.createLinearGradient(0, y - glyphHeight, width, y);
      ink.addColorStop(0, '#ffffff'); ink.addColorStop(1, '#a8a39e');
      ctx.fillStyle = ink;
      glyphs.forEach(({letter, x: offset}, index) => {
        const wave = Math.sin(index * .8 + currentX * .035);
        ctx.save();
        ctx.translate(x + offset * horizontalScale + currentX * depth * .65 + stretch * (index - 4) * depth * 5,
          y + layer * trail + currentY * depth * .65 + wave * (Math.abs(currentX) * .15 + stretch * 20) * depth);
        ctx.scale(horizontalScale, 1);
        if (layer === 0) ctx.fillText(letter, 0, 0); else ctx.strokeText(letter, 0, 0);
        ctx.restore();
      });
      ctx.restore();
    }
    const unsettled = Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > .05;
    if (active && !motion.matches && (unsettled || intro < 1)) schedule();
  }
  function schedule() { if (!frame && ready) frame = requestAnimationFrame(draw); }

  function updateScene() {
    const heroBounds = hero.getBoundingClientRect();
    active = heroBounds.bottom > 0 && heroBounds.top < innerHeight;
    scroll = motion.matches ? 0 : clamp(-heroBounds.top / heroBounds.height);
    if (active) schedule();
    if (motion.matches) { image.style.transform = ''; shutter.style.transform = ''; return; }
    const bounds = world.getBoundingClientRect();
    if (bounds.top < innerHeight && bounds.bottom > 0) {
      const enter = clamp((innerHeight - bounds.top) / innerHeight);
      const travel = clamp(-bounds.top / Math.max(1, bounds.height - innerHeight));
      image.style.transform = `translateY(${-travel * 80}px) rotate(${-8 + travel * 12}deg) scale(${1 + travel * .15})`;
      shutter.style.transform = `scaleY(${1 - enter})`;
    }
  }
  let scrollFrame = 0;
  addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; updateScene(); });
  }, {passive:true});
  hero.addEventListener('pointermove', event => {
    if (motion.matches || !finePointer.matches) return;
    const bounds = hero.getBoundingClientRect();
    targetX = ((event.clientX - bounds.left) / bounds.width - .5) * 48;
    targetY = ((event.clientY - bounds.top) / bounds.height - .5) * 32;
    schedule();
  }, {passive:true});
  hero.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; schedule(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
    else { updateScene(); schedule(); }
  });
  motion.addEventListener('change', () => { currentX = currentY = targetX = targetY = 0; intro = 1; updateScene(); schedule(); });
  const observer = new ResizeObserver(() => { resize(); updateScene(); });
  const excerpt = document.querySelector('.film-excerpt');
  let excerptVisible = false;
  function syncExcerpt() {
    if (excerptVisible && !motion.matches && !document.hidden && !document.querySelector('dialog').open) excerpt.play().catch(() => {});
    else excerpt.pause();
  }
  new IntersectionObserver(entries => {
    excerptVisible = entries[0].isIntersecting;
    syncExcerpt();
  }, {threshold:.15}).observe(excerpt);
  motion.addEventListener('change', syncExcerpt);
  document.addEventListener('visibilitychange', syncExcerpt);
  document.querySelector('#open-film').addEventListener('click', () => excerpt.pause());
  document.querySelector('dialog').addEventListener('close', syncExcerpt);
  document.fonts.load('700 128px Wordmark').then(() => {
    ready = true; observer.observe(canvas.parentElement); resize(); updateScene();
    document.documentElement.classList.add('echo-ready');
  }).catch(() => { /* The semantic, styled heading stays visible if the font fails. */ });
})();
