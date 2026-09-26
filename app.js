'use strict';
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('.hero');
  const slides = [...document.querySelectorAll('.slide')];
  const dots = [...document.querySelectorAll('.slide-dots button')];
  const pause = document.querySelector('#pause');
  const captions = ['Twoja ekipa. Twój kort.', 'Jeszcze punkt. Jeszcze mecz.', 'Wszystko zaczyna się od piłki.'];
  let current = 0;
  let userPaused = reduceMotion.matches;
  let hovering = false;
  let focusPaused = false;
  let timer;

  function schedule() {
    window.clearTimeout(timer);
    hero.classList.toggle("carousel-paused", userPaused || hovering || focusPaused || document.hidden);
    if (!userPaused && !hovering && !focusPaused && !document.hidden && !reduceMotion.matches) {
      timer = window.setTimeout(() => show(current + 1), 7500);
    }
  }
  function show(index, announce = false) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === current);
      slide.setAttribute('aria-hidden', String(i !== current));
      dots[i].setAttribute('aria-pressed', String(i === current));
    });
    document.querySelector('#slide-caption').textContent = captions[current];
    document.querySelector('.caption-count').textContent = `0${current + 1} / 03`;
    if (announce) document.querySelector('#carousel-announcement').textContent = `Zdjęcie ${current + 1} z 3. ${captions[current]}`;
    schedule();
  }
  function syncPauseButton() {
    pause.textContent = userPaused ? '▷' : 'Ⅱ';
    pause.setAttribute('aria-label', userPaused ? 'Włącz automatyczną zmianę zdjęć' : 'Wstrzymaj automatyczną zmianę zdjęć');
    pause.hidden = reduceMotion.matches;
    document.body.classList.toggle('motion-enabled', !reduceMotion.matches);
    schedule();
  }
  document.querySelector('.carousel-controls').hidden = false;
  document.querySelector('#previous').addEventListener('click', () => show(current - 1, true));
  document.querySelector('#next').addEventListener('click', () => show(current + 1, true));
  dots.forEach((dot, i) => dot.addEventListener('click', () => show(i, true)));
  pause.addEventListener('click', () => { userPaused = !userPaused; syncPauseButton(); });
  hero.addEventListener('mouseenter', () => { hovering = true; schedule(); });
  hero.addEventListener('mouseleave', () => { hovering = false; schedule(); });
  // Autoplay pauses while keyboard focus is inside the carousel.
  hero.addEventListener('focusin', () => { focusPaused = true; schedule(); });
  hero.addEventListener('focusout', () => { focusPaused = false; schedule(); });
  document.querySelector('.carousel-controls').addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); show(current + (event.key === 'ArrowRight' ? 1 : -1), true);
    }
  });
  document.addEventListener('visibilitychange', schedule);
  reduceMotion.addEventListener('change', () => { userPaused = reduceMotion.matches; syncPauseButton(); });
  syncPauseButton();

  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.remove('reveal-pending');
          entry.target.classList.add('reveal-visible');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: .06 });
    document.querySelectorAll('.reveal').forEach(element => {
      if (element.getBoundingClientRect().top > window.innerHeight) element.classList.add('reveal-pending');
      observer.observe(element);
    });
  }
})();
