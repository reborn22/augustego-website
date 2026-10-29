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
const progressBar = document.querySelector('.reading-progress');
const navSections = [...document.querySelectorAll('#about,#release,#film,#connect')];
const navLinks = [...document.querySelectorAll('.desktop-nav a')];
let scrollScheduled = false;
function paintScroll() {
  scrollScheduled = false;
  const trigger = innerHeight * .78;
  const heading = document.querySelector('.world-band').getBoundingClientRect();
  const progress = (trigger - heading.top) / (heading.height - innerHeight * .25);
  words.forEach((word, index) => word.classList.toggle('lit', reducedMotion.matches || progress > index / words.length));
  const currentSection = navSections.filter(section => section.getBoundingClientRect().top <= innerHeight * .4).at(-1);
  navLinks.forEach(link => {
    if (currentSection && link.hash === `#${currentSection.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  if (!reducedMotion.matches) {
    const scrollRange = document.documentElement.scrollHeight - innerHeight;
    progressBar.style.transform = `scaleX(${scrollRange > 0 ? Math.min(1,scrollY / scrollRange) : 0})`;
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
  document.querySelector('main').inert = open;
  document.querySelector('footer').inert = open;
  if (open) mobileMenu.querySelector('a').focus();
}
menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { setMenu(false); menuToggle.focus({preventScroll:true}); }));
document.querySelectorAll('.header a').forEach(a => a.addEventListener('click', () => {
  if (document.body.classList.contains('menu-open')) setMenu(false);
}));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { setMenu(false); menuToggle.focus(); }
  if (e.key === 'Tab' && document.body.classList.contains('menu-open')) {
    const controls = [menuToggle, ...mobileMenu.querySelectorAll('a')];
    const first = controls[0], last = controls.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
matchMedia('(max-width:760px)').addEventListener('change', e => { if (!e.matches) setMenu(false); });

const audio = document.querySelector('#audio');
const player = document.querySelector('#audio-player');
const playButton = document.querySelector('#play');
const seek = document.querySelector('#seek');
const time = document.querySelector('#time');
const audioStatus = document.querySelector('#audio-status');
const musicVideo = document.querySelector('#music-video');
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
  player.classList.add('playing'); document.body.classList.add('audio-playing'); playButton.setAttribute('aria-label', 'Приостановить SILA'); audioStatus.textContent = 'Играет «Сила» — AUGUSTEGO'; animateSound();
});
audio.addEventListener('playing', () => { player.classList.remove('loading'); audioStatus.textContent='Играет «Сила» — AUGUSTEGO'; });
function stopped() {
  player.classList.remove('playing','loading'); document.body.classList.remove('audio-playing'); playButton.setAttribute('aria-label', 'Включить SILA');
  audioStatus.textContent = audio.ended ? 'Трек закончился. Ещё раз?' : 'На паузе. Вернись к звуку.';
  cancelAnimationFrame(audioFrame); peaks.forEach(bar => { bar.style.transform = 'scaleY(.8)'; });
}
audio.addEventListener('pause', stopped); audio.addEventListener('ended', stopped);
audio.addEventListener('timeupdate', syncTime); audio.addEventListener('loadedmetadata', syncTime);
audio.addEventListener('waiting', () => { player.classList.add('loading'); audioStatus.textContent = 'Загружаем звук…'; });
audio.addEventListener('error', () => { stopped(); audioStatus.textContent = 'Не удалось загрузить трек. Открой SILA по кнопке «Слушать на площадках».'; });
seek.addEventListener('input', () => { if (Number.isFinite(audio.duration)) audio.currentTime = Number(seek.value) / 100 * audio.duration; syncTime(); });
musicVideo.addEventListener('play', () => audio.pause());
musicVideo.addEventListener('error', () => {
  document.querySelector('#video-error').textContent = 'Видео не загрузилось. Обнови страницу или послушай трек в разделе «Музыка».';
});
const filmDialog = document.querySelector('#film-dialog');
document.querySelector('#open-film').addEventListener('click', () => {
  audio.pause(); filmDialog.showModal(); document.body.classList.add('film-open');
  musicVideo.play().catch(() => {});
});
document.querySelector('#close-film').addEventListener('click', () => filmDialog.close());
filmDialog.addEventListener('click', event => { if (event.target === filmDialog && (event.clientX < filmDialog.getBoundingClientRect().left || event.clientX > filmDialog.getBoundingClientRect().right || event.clientY < filmDialog.getBoundingClientRect().top || event.clientY > filmDialog.getBoundingClientRect().bottom)) filmDialog.close(); });
filmDialog.addEventListener('close', () => { musicVideo.pause(); document.body.classList.remove('film-open'); document.querySelector('#open-film').focus({preventScroll:true}); });

reducedMotion.addEventListener('change', () => {
  paintScroll();
  if(reducedMotion.matches){cancelAnimationFrame(audioFrame);peaks.forEach(bar=>{bar.style.transform='scaleY(.8)';});}
  else if(!audio.paused)animateSound();
});
document.querySelector('#year').textContent = new Date().getFullYear();
