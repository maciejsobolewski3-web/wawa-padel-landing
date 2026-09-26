'use strict';
(() => {
  const header = document.querySelector('.header');
  const nav = document.querySelector('#primary-nav');
  const toggle = document.querySelector('.menu-toggle');
  const smallScreen = window.matchMedia('(max-width: 980px)');
  let menuOpen = false;
  function setMenu(open, restoreFocus = false) {
    menuOpen = Boolean(open && smallScreen.matches);
    header.classList.toggle('menu-open', menuOpen);
    toggle.setAttribute('aria-expanded', String(menuOpen));
    toggle.querySelector('.menu-label').textContent = menuOpen ? 'Zamknij' : 'Menu';
    nav.hidden = smallScreen.matches && !menuOpen;
    if (restoreFocus) toggle.focus();
  }
  header.classList.add('nav-ready');
  toggle.hidden = false;
  setMenu(false);
  toggle.addEventListener('click', () => setMenu(!menuOpen));
  nav.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
  header.querySelector('.logo').addEventListener('click', () => setMenu(false));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menuOpen) setMenu(false, true); });
  document.addEventListener('click', event => { if (menuOpen && !header.contains(event.target)) setMenu(false); });
  header.addEventListener('focusout', () => {
    window.setTimeout(() => { if (menuOpen && !header.contains(document.activeElement)) setMenu(false); }, 0);
  });
  smallScreen.addEventListener('change', () => setMenu(false));
  const syncHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 48);
  window.addEventListener('scroll', syncHeader, { passive: true });
  syncHeader();

  // Motion is progressive enhancement: content remains visible without JS or observers.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopMotion = window.matchMedia('(min-width: 981px) and (hover: hover)');
  const seen = new WeakSet();
  const counted = new WeakSet();
  const activeCounters = new Map();
  const counters = [...document.querySelectorAll('[data-count]')];
  const progress = document.querySelector('.progress-track');
  let progressSeen = false;
  let revealObserver, countObserver, progressObserver, photoObserver;
  let photoFrame = 0;
  const visiblePhotos = new Set();
  const photos = [...document.querySelectorAll('.hero-image, .feature-image, .location')];

  // Keep the exact final number's width and one stable value for screen readers.
  counters.forEach(element => {
    const final = element.textContent;
    const value = document.createElement('b');
    value.className = 'count-value'; value.setAttribute('aria-hidden', 'true'); value.textContent = final;
    const stable = document.createElement('b');
    stable.className = 'count-final'; stable.textContent = final;
    element.replaceChildren(stable, value);
  });
  function finishCount(element) {
    cancelAnimationFrame(activeCounters.get(element));
    activeCounters.delete(element);
    element.querySelector('.count-value').textContent = element.dataset.count;
    counted.add(element);
  }
  function startCount(element) {
    if (counted.has(element) || activeCounters.has(element)) return;
    const start = performance.now();
    const value = element.querySelector('.count-value');
    const target = Number(element.dataset.count);
    value.textContent = '0';
    function tick(now) {
      const t = Math.min(1, (now - start) / 1050);
      value.textContent = String(Math.floor(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) activeCounters.set(element, requestAnimationFrame(tick));
      else finishCount(element);
    }
    activeCounters.set(element, requestAnimationFrame(tick));
  }

  // Reveal siblings in order; avoid double-animating parents and their children.
  document.querySelectorAll('.facts, .faq-list').forEach(el => el.classList.remove('reveal'));
  document.querySelectorAll('.facts > div, .faq details, .location-copy, .feature-image, .closing > .eyebrow, .closing > .button').forEach(el => el.classList.add('reveal'));
  document.querySelectorAll('.location-copy .reveal').forEach(el => el.classList.remove('reveal'));
  const reveals = [...document.querySelectorAll('.reveal')];
  document.querySelectorAll('.intro-grid, .facts, .play-grid, .signup, .survey, .cooperation, .faq-list').forEach(group => {
    [...group.children].filter(el => el.classList.contains('reveal')).forEach((el, i) => el.style.setProperty('--reveal-delay', `${Math.min(i, 3) * 85}ms`));
  });
  function show(element) {
    element.classList.remove('reveal-pending');
    element.classList.add('reveal-visible');
    seen.add(element);
    revealObserver?.unobserve(element);
  }
  // Keyboard navigation must never focus an invisible link or control.
  document.addEventListener('focusin', event => {
    const pending = event.target.closest('.reveal-pending');
    if (pending) { pending.style.setProperty('--reveal-delay', '0ms'); show(pending); }
  });
  function paintPhotos() {
    photoFrame = 0;
    if (reduceMotion.matches || !desktopMotion.matches || document.hidden) return;
    for (const element of visiblePhotos) {
      const rect = element.getBoundingClientRect();
      const offset = Math.max(-12, Math.min(12, ((innerHeight / 2 - rect.top - rect.height / 2) / innerHeight) * 24));
      element.style.setProperty('--photo-offset', `${offset.toFixed(2)}px`);
    }
  }
  function schedulePhotos() {
    if (!photoFrame && visiblePhotos.size && !reduceMotion.matches && desktopMotion.matches && !document.hidden) photoFrame = requestAnimationFrame(paintPhotos);
  }
  window.addEventListener('scroll', schedulePhotos, { passive: true });
  window.addEventListener('resize', schedulePhotos, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) [...activeCounters.keys()].forEach(finishCount);
    else schedulePhotos();
  });
  function syncPhotoMode() {
    photos.forEach(el => el.style.removeProperty('--photo-offset'));
    schedulePhotos();
  }
  desktopMotion.addEventListener('change', syncPhotoMode);
  function syncMotion() {
    const enabled = !reduceMotion.matches && 'IntersectionObserver' in window;
    document.body.classList.toggle('motion-enabled', enabled);
    [revealObserver, countObserver, progressObserver, photoObserver].forEach(observer => observer?.disconnect());
    cancelAnimationFrame(photoFrame); photoFrame = 0; visiblePhotos.clear();
    photos.forEach(el => el.style.removeProperty('--photo-offset'));
    if (!enabled) {
      reveals.forEach(show);
      counters.forEach(finishCount);
      progress.classList.remove('progress-pending');
      progressSeen = true;
      return;
    }
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) show(entry.target); });
    }, { threshold: .08 });
    reveals.forEach(element => {
      if (seen.has(element)) return;
      const rect = element.getBoundingClientRect();
      if (rect.top < innerHeight && rect.bottom > 0) show(element);
      else if (rect.bottom <= 0) show(element);
      else { element.classList.add('reveal-pending'); revealObserver.observe(element); }
    });
    countObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { startCount(entry.target); countObserver.unobserve(entry.target); } });
    }, { threshold: .8 });
    counters.filter(el => !counted.has(el)).forEach(el => countObserver.observe(el));
    if (!progressSeen) {
      progress.classList.add('progress-pending');
      progressObserver = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          progress.classList.remove('progress-pending'); progressSeen = true; progressObserver.disconnect();
        }
      }, { threshold: 1 });
      progressObserver.observe(progress);
    }
    photoObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) visiblePhotos.add(entry.target); else visiblePhotos.delete(entry.target); });
      schedulePhotos();
    });
    photos.forEach(el => photoObserver.observe(el));
  }
  reduceMotion.addEventListener('change', syncMotion);
  syncMotion();

  // Demonstration only: all answers remain in this page's memory. No network or storage.
  const questions = [
    { title: 'Jak długo grasz w padla?', options: ['Jeszcze nie gram, chcę spróbować', 'Zaczynam, mam za sobą kilka gier', 'Gram regularnie', 'Gram w turniejach lub lidze'] },
    { title: 'Kiedy najchętniej grasz?', options: ['Rano w tygodniu', 'W ciągu dnia w tygodniu', 'Wieczorami w tygodniu', 'W weekendy'] },
    { title: 'Z kim chcesz grać?', options: ['Mam już swoją ekipę', 'Chcę poznawać nowych partnerów do gry', 'Z rodziną lub znajomymi', 'Z osobami na podobnym poziomie'] },
    { title: 'Jaki format najbardziej Cię interesuje?', options: ['Swobodna gra i rezerwacja kortu', 'Nauka gry i treningi', 'Otwarte mecze i spotkania graczy', 'Turnieje i liga'] },
    { title: 'Co jest dla Ciebie najważniejsze w klubie?', options: ['Dostępność terminów', 'Atmosfera i ludzie', 'Możliwość rozwoju', 'Wygodny dojazd'] }
  ];
  const answers = Array(questions.length).fill(null);
  let step = 0;
  const ui = document.querySelector('#survey-ui');
  const options = document.querySelector('#survey-options');
  const question = document.querySelector('#survey-question');
  const next = document.querySelector('#survey-next');
  const back = document.querySelector('#survey-back');
  const error = document.querySelector('#survey-error');
  const result = document.querySelector('#survey-result');
  function render(focus = false) {
    question.textContent = questions[step].title;
    document.querySelector('#step-label').textContent = `Pytanie ${step + 1} z ${questions.length}`;
    document.querySelector('#step-fill').style.width = `${((step + 1) / questions.length) * 100}%`;
    options.replaceChildren();
    const legend = document.createElement('legend'); legend.className = 'sr-only'; legend.textContent = questions[step].title; options.append(legend);
    questions[step].options.forEach((text, i) => {
      const label = document.createElement('label');
      const input = document.createElement('input'); input.type = 'radio'; input.name = `question-${step}`; input.value = String(i); input.checked = answers[step] === i;
      input.addEventListener('change', () => { answers[step] = i; error.textContent = ''; });
      const span = document.createElement('span'); span.textContent = text;
      label.append(input, span); options.append(label);
    });
    back.disabled = step === 0;
    next.textContent = step === questions.length - 1 ? 'Zobacz podsumowanie' : 'Dalej';
    error.textContent = '';
    if (focus) question.focus({ preventScroll: true });
  }
  back.addEventListener('click', () => { if (step > 0) { step--; render(true); } });
  next.addEventListener('click', () => {
    if (answers[step] === null) { error.textContent = 'Wybierz jedną odpowiedź, aby przejść dalej.'; options.querySelector('input').focus({preventScroll:true}); return; }
    if (step < questions.length - 1) { step++; render(true); return; }
    const summary = document.querySelector('#answer-summary'); summary.replaceChildren();
    questions.forEach((q, i) => { const dt = document.createElement('dt'); dt.textContent = q.title; const dd = document.createElement('dd'); dd.textContent = q.options[answers[i]]; summary.append(dt, dd); });
    ui.hidden = true; result.hidden = false; document.querySelector('#result-heading').focus({ preventScroll: true });
  });
  document.querySelector('#survey-restart').addEventListener('click', () => { answers.fill(null); step = 0; result.hidden = true; ui.hidden = false; render(true); });
  ui.hidden = false;
  render();
})();
