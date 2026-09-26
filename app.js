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

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const syncMotion = () => document.body.classList.toggle('motion-enabled', !reduceMotion.matches);
  reduceMotion.addEventListener('change', syncMotion);
  syncMotion();
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.remove('reveal-pending');
        entry.target.classList.add('reveal-visible');
        observer.unobserve(entry.target);
      }
    }, { threshold: .06 });
    document.querySelectorAll('.reveal').forEach(element => {
      if (element.getBoundingClientRect().top > innerHeight) element.classList.add('reveal-pending');
      observer.observe(element);
    });
  }

  // Demonstration only: all answers remain in this page's memory. No network or storage.
  const questions = [
    { title: 'Jak długo grasz w padla?', options: ['Jeszcze nie gram — chcę spróbować', 'Zaczynam, mam za sobą kilka gier', 'Gram regularnie', 'Gram w turniejach lub lidze'] },
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
    next.textContent = step === questions.length - 1 ? 'Zobacz podsumowanie' : 'Dalej →';
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
