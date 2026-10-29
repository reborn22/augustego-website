const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
document.documentElement.classList.add('js-ready');
const reveals = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) {
    entry.target.classList.add('visible');
    reveals.unobserve(entry.target);
  }
}, { threshold: .1 });
document.querySelectorAll('.reveal').forEach(el => reveals.observe(el));

const words = [...document.querySelectorAll('.word-reveal span')];
const heroArt = document.querySelector('.hero-art');
const ticker = document.querySelector('.ticker>div');
let scrollScheduled = false;
function paintScroll() {
  scrollScheduled = false;
  const trigger = innerHeight * .78;
  const heading = document.querySelector('.word-reveal').getBoundingClientRect();
  const progress = (trigger - heading.top) / (heading.height + innerHeight * .15);
  words.forEach((word, index) => word.classList.toggle('lit', reducedMotion.matches || progress > index / words.length));
  if (!reducedMotion.matches) {
    const y = Math.min(window.scrollY, 1100);
    heroArt.style.transform = `translate(-50%, ${y * .15}px)`;
    ticker.style.transform = `translateX(${-window.scrollY * .18}px)`;
  }
}
addEventListener('scroll', () => {
  if (!scrollScheduled) { scrollScheduled = true; requestAnimationFrame(paintScroll); }
}, { passive: true });
addEventListener('resize', paintScroll);
paintScroll();

const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
function setMenu(open) {
  document.body.classList.toggle('menu-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  mobileMenu.inert = !open;
  if (open) mobileMenu.querySelector('a').focus();
}
menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { setMenu(false); menuToggle.focus(); }
  if (e.key === 'Tab' && document.body.classList.contains('menu-open')) {
    const controls = [menuToggle, ...mobileMenu.querySelectorAll('a')];
    const first = controls[0], last = controls.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
matchMedia('(max-width:700px)').addEventListener('change', e => { if (!e.matches) setMenu(false); });
const navObserver = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) {
    document.querySelectorAll('.desktop-nav a').forEach(a => {
      if (a.hash === `#${entry.target.id}`) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
  }
}, { rootMargin: '-10% 0px -55% 0px' });
document.querySelectorAll('#release,#film,#connect').forEach(el => navObserver.observe(el));

const audio = document.querySelector('#audio');
const player = document.querySelector('#audio-player');
const playButton = document.querySelector('#play');
const seek = document.querySelector('#seek');
const time = document.querySelector('#time');
const audioStatus = document.querySelector('#audio-status');
const musicVideo = document.querySelector('#music-video');
const moonVideo = document.querySelector('.moon-video');
const waveform = document.querySelector('.waveform');
const formatTime = seconds => Number.isFinite(seconds) ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}` : '0:00';
let peaks = [];
let analyser, audioContext, spectrum, audioFrame;
function renderPeaks(values) {
  waveform.replaceChildren(...values.map(value => {
    const bar = document.createElement('i'); bar.style.height = `${Math.max(8, value * 100)}%`; return bar;
  }));
  peaks = [...waveform.children];
}
renderPeaks(Array.from({ length: 80 }, (_, i) => .16 + Math.abs(Math.sin(i * 1.7) * Math.cos(i * .23)) * .82));
fetch('assets/waveform.json').then(r => { if (!r.ok) throw new Error('waveform'); return r.json(); }).then(renderPeaks).catch(() => {});
function syncTime() {
  const duration = audio.duration || 126;
  time.textContent = `${formatTime(audio.currentTime)} / ${formatTime(duration)}`;
  seek.value = String(audio.currentTime / duration * 100);
  seek.setAttribute('aria-valuetext', `${formatTime(audio.currentTime)} из ${formatTime(duration)}`);
  peaks.forEach((bar, index) => bar.classList.toggle('heard', index / peaks.length <= audio.currentTime / duration));
}
function animateSound() {
  if (!analyser || audio.paused || reducedMotion.matches) return;
  analyser.getByteFrequencyData(spectrum);
  peaks.forEach((bar, index) => { bar.style.transform = `scaleY(${.4 + spectrum[Math.floor(index / peaks.length * spectrum.length)] / 255 * .8})`; });
  audioFrame = requestAnimationFrame(animateSound);
}
function setupAnalyser() {
  if (audioContext) { audioContext.resume().catch(() => {}); return; }
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser(); analyser.fftSize = 256;
    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser); analyser.connect(audioContext.destination);
    spectrum = new Uint8Array(analyser.frequencyBinCount);
    audioContext.resume().catch(() => {});
  } catch { /* Native audio remains available without a visualizer. */ }
}
playButton.addEventListener('click', async () => {
  if (!audio.paused) { audio.pause(); return; }
  musicVideo.pause(); setupAnalyser();
  try { await audio.play(); } catch { audioStatus.textContent = 'Не удалось включить трек. Попробуй ещё раз или открой релиз на площадке.'; }
});
audio.addEventListener('play', () => {
  player.classList.add('playing'); playButton.setAttribute('aria-label', 'Приостановить SILA'); audioStatus.textContent = 'Играет SILA — AUGUSTEGO'; animateSound();
});
function stopped() {
  player.classList.remove('playing'); playButton.setAttribute('aria-label', 'Включить SILA');
  audioStatus.textContent = audio.ended ? 'Трек закончился. Ещё раз?' : 'На паузе. Вернись к звуку.';
  cancelAnimationFrame(audioFrame); peaks.forEach(bar => { bar.style.transform = 'scaleY(.8)'; });
}
audio.addEventListener('pause', stopped); audio.addEventListener('ended', stopped);
audio.addEventListener('timeupdate', syncTime); audio.addEventListener('loadedmetadata', syncTime);
audio.addEventListener('waiting', () => { audioStatus.textContent = 'Загружаем звук…'; });
audio.addEventListener('error', () => { stopped(); audioStatus.textContent = 'Не удалось загрузить трек. Открой SILA по кнопке «Слушать на площадках».'; });
seek.addEventListener('input', () => { if (Number.isFinite(audio.duration)) audio.currentTime = Number(seek.value) / 100 * audio.duration; syncTime(); });
musicVideo.addEventListener('play', () => audio.pause());
musicVideo.addEventListener('error', () => {
  const message = document.createElement('p'); message.className = 'player-status'; message.textContent = 'Видео не загрузилось. Обнови страницу или послушай SILA в разделе «Музыка».'; musicVideo.after(message);
});
function syncMotion() {
  if (reducedMotion.matches) { moonVideo.pause(); heroArt.style.transform = ''; ticker.style.transform = ''; }
  else moonVideo.play().catch(() => {});
  paintScroll();
}
reducedMotion.addEventListener('change', syncMotion); syncMotion();
document.addEventListener('visibilitychange', () => { if (document.hidden) moonVideo.pause(); else syncMotion(); });
document.querySelector('#year').textContent = new Date().getFullYear();
