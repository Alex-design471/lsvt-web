/* Shared immersive presentation; every feature is optional and progressively enhanced. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const curtain = document.createElement('div');
  curtain.className = 'race-transition';
  curtain.setAttribute('aria-hidden', 'true');
  curtain.innerHTML = '<span class="transition-brand">LS_VT.</span>';
  document.body.append(curtain);
  let navigating = false;
  function enter() {
    navigating = false;
    curtain.classList.remove('is-leaving', 'is-entering');
    if (!reduced.matches) curtain.classList.add('is-entering');
  }
  curtain.addEventListener('animationend', e => {
    if (e.animationName === 'curtain-open') curtain.classList.remove('is-entering');
  });
  enter();
  addEventListener('pageshow', e => { if (e.persisted) enter(); });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.hasAttribute('download') || a.target && a.target !== '_self' || reduced.matches) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\.html$/.test(url.pathname) || url.pathname === location.pathname && url.search === location.search) return;
    e.preventDefault();
    if (navigating) return;
    navigating = true;
    curtain.classList.remove('is-entering');
    curtain.classList.add('is-leaving');
    setTimeout(() => location.assign(url.href), 560);
  });
  const progress = document.createElement('div');
  progress.className = 'reading-progress'; progress.setAttribute('aria-hidden','true'); document.body.append(progress);
  let scheduled = false;
  const updateProgress = () => {
    const height = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${height > 0 ? scrollY / height : 0})`;
    scheduled = false;
  };
  addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateProgress); } }, {passive:true});
  updateProgress();
  if (!reduced.matches && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('motion-ready');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); }
    }), {threshold:.12});
    document.querySelectorAll('.portal,.work-strip').forEach(el => observer.observe(el));
    const hero = document.querySelector('.race-hero');
    if (hero && matchMedia('(pointer:fine)').matches) hero.addEventListener('pointermove', e => {
      hero.style.setProperty('--orbit-x', `${(e.clientX / innerWidth - .5) * 35}px`);
      hero.style.setProperty('--orbit-y', `${(e.clientY / innerHeight - .5) * 25}px`);
    }, {passive:true});
  }
  // Kapcsolat űrlap: az üzenet az adatbázisba kerül (admin felület); ha nincs backend, e-mail kézbesítés.
  const contact = document.getElementById('kf');
  if (contact) contact.addEventListener('submit', async e => {
    e.preventDefault(); const d = Object.fromEntries(new FormData(contact));
    const note = contact.querySelector('.form-note'), btn = contact.querySelector('button');
    if (typeof BACKEND === 'undefined' || !BACKEND.url) {
      location.href = `mailto:info@ls-vt.hu?subject=${encodeURIComponent(d.targy + ' – ' + d.nev)}&body=${encodeURIComponent(d.uzenet + '\n\n' + d.nev + ' <' + d.email + '>')}`;
      return;
    }
    btn.disabled = true; btn.textContent = 'Küldés…';
    try {
      await rpc('shop_send_message', { name: d.nev, email: d.email, subject: d.targy, message: d.uzenet });
      contact.reset(); note.className = 'form-note form-ok'; note.textContent = 'Köszönjük, megkaptuk az üzeneted! Hamarosan válaszolunk.';
    } catch (err) {
      note.className = 'form-note form-err'; note.textContent = `${err.message.replace(/[.!?]?$/, '.')} Írj az info@ls-vt.hu címre, vagy hívj: +36 20 314 5919.`;
    }
    btn.disabled = false; btn.textContent = 'Üzenet küldése';
  });
  // Start-light reaction game. All times are measured locally with performance.now().
  const start = document.getElementById('reaction-button');
  if (start) {
    const lights = [...document.querySelectorAll('.start-lights i')];
    const result = document.getElementById('reaction-result');
    const bestLabel = document.getElementById('reaction-best');
    let state = 'idle', timers = [], startedAt = 0, best = null;
    const clear = () => { timers.forEach(clearTimeout); timers = []; };
    const activate = () => {
      if (state === 'waiting') {
        clear(); state = 'idle'; lights.forEach(l => l.classList.remove('lit'));
        result.textContent = 'Korai rajt!'; start.textContent = 'Újra próbálom'; return;
      }
      if (state === 'go') {
        const elapsed = Math.round(performance.now() - startedAt);
        state = 'idle'; result.textContent = `${elapsed} ms`; start.textContent = 'Még egy rajt';
        best = best === null ? elapsed : Math.min(best, elapsed);
        bestLabel.textContent = `LEGJOBB RAJTOD: ${best} ms`; return;
      }
      state = 'waiting'; result.textContent = 'Várd meg a kialvást…'; start.textContent = 'RAJT!';
      lights.forEach(l => l.classList.remove('lit'));
      lights.forEach((light, i) => timers.push(setTimeout(() => light.classList.add('lit'), i * 350)));
      timers.push(setTimeout(() => {
        lights.forEach(l => l.classList.remove('lit')); startedAt = performance.now(); state = 'go'; result.textContent = 'MOST!';
      }, 2200 + Math.random() * 2200));
    };
    start.addEventListener('click', activate);
    start.addEventListener('keydown', e => { if (e.code === 'Space' && e.repeat) e.preventDefault(); });
    // A szóköz a gombon kívül is indít/megállít, ahogy a leírás ígéri (űrlapmezőkben nem).
    document.addEventListener('keydown', e => {
      if (e.code !== 'Space' || e.repeat || e.target === start || e.target.closest('input,textarea,select,button,a')) return;
      const r = start.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      e.preventDefault(); activate();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && state !== 'idle') { clear(); state = 'idle'; lights.forEach(l => l.classList.remove('lit')); result.textContent = 'Készen állsz?'; start.textContent = 'Indítás'; }
    });
    addEventListener('pagehide', clear);
  }
  const tech = {
    engine: ['01 / HAJTÁS','A gép szíve.','A motor, a hajtás és a hátsó tengely együtt dolgozik. A versenyhétvége a műhelyben, az előkészítéssel kezdődik.'],
    wheel: ['02 / TAPADÁS','Négy pont. Egy pálya.','A gumi az egyetlen kapcsolat az aszfalttal. Állapota, hőmérséklete és nyomása a gokart viselkedésének fontos része.'],
    telemetry: ['03 / ADATOK','A körnek nyoma van.','A kormányra szerelt műszer visszajelzést ad a pilótának. A körök összevetése és a versenyző tapasztalata együtt segíti a fejlődést.'],
    bodywork: ['04 / KARAKTER','A mi színeink.','Piros, fekete, fehér. Az LS_VT arculata a gokarton, a ruházaton és a paddockban is összeköti a csapatot.']
  };
  document.querySelectorAll('[data-tech]').forEach((button, i) => button.addEventListener('click', () => {
    document.querySelectorAll('[data-tech]').forEach(b => { b.classList.toggle('active',b === button); b.setAttribute('aria-pressed',String(b === button)); });
    const [label,title,description] = tech[button.dataset.tech];
    const image = document.getElementById('tech-image');
    image.src = `assets/img/${button.dataset.tech}.webp`; image.alt = title;
    document.getElementById('tech-label').textContent = label;
    document.getElementById('tech-title').textContent = title;
    document.getElementById('tech-description').textContent = description;
    document.getElementById('tech-index').textContent = `0${i+1} / 04`;
    if (!reduced.matches) image.animate([{opacity:.35,transform:'scale(1.04)'},{opacity:1,transform:'scale(1)'}],{duration:550,easing:'ease-out'});
  }));
  // Filterable photography and keyboard-accessible native lightbox.
  const shots = [...document.querySelectorAll('.gallery-shot')];
  const viewer = document.getElementById('photo-viewer');
  let current = 0;
  const show = index => {
    const visible = shots.filter(s => !s.hidden);
    current = (index + visible.length) % visible.length;
    const shot = visible[current];
    document.getElementById('viewer-image').src = `assets/img/${shot.dataset.photo}.webp`;
    document.getElementById('viewer-image').alt = shot.dataset.caption;
    document.getElementById('viewer-caption').textContent = `${current+1} / ${visible.length} — ${shot.dataset.caption}`;
  };
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(b => { b.classList.toggle('active',b === button); b.setAttribute('aria-pressed',String(b === button)); });
    shots.forEach(shot => { shot.hidden = button.dataset.filter !== 'all' && shot.dataset.category !== button.dataset.filter; });
  }));
  if (viewer) {
    shots.forEach(shot => shot.addEventListener('click', () => { show(shots.filter(s => !s.hidden).indexOf(shot)); viewer.showModal(); }));
    viewer.querySelector('.photo-close').addEventListener('click', () => viewer.close());
    viewer.querySelector('.photo-prev').addEventListener('click', () => show(current-1));
    viewer.querySelector('.photo-next').addEventListener('click', () => show(current+1));
    viewer.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); show(current+1); } if (e.key === 'ArrowLeft') { e.preventDefault(); show(current-1); } });
    viewer.addEventListener('click', e => { if (e.target === viewer) viewer.close(); });
  }
})();
