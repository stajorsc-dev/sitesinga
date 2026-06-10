/* =========================================================
   Синга Сервис — script.js (v5 design)
   Безопасный фронтенд: НЕТ токенов и chat_id в коде.
   v5: fallback Telegram, единые ссылки, 4-шаговый квиз,
       поиск услуг, реальные ссылки отзывов и премиальный дизайн.
   ========================================================= */
(function () {
  'use strict';

  var defaults = {
    phone:        '+79281618789',
    phonePretty:  '8 928 161-87-89',
    telegram:     'https://t.me/+79281618789',
    telegramBot:  'https://t.me/+79281618789',
    yandexReviews:'https://yandex.ru/profile/3884649995?lang=ru&utm_source=copy_link&utm_medium=social&utm_campaign=share',
    gisReviews:   'https://go.2gis.com/SzQBu',
    endpoint:     '',
    ymCounter:    null,
    debug:        false
  };

  var CFG = window.SINGA = Object.assign({}, defaults, window.SINGA || {});

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };

  document.addEventListener('DOMContentLoaded', function () {
    initGlobalLinks();
    initHeader();
    initMobileMenu();
    initPhoneMask();
    initModal();
    initCalculator();
    initPriceTabs();
    initFaq();
    initReveal();
    initYear();
    initAnalyticsBindings();
    initScrollGoals();
    initCookieBanner();
    initMobileStickyBar();
    initAddressPicker();
    initServiceSearch();
    initLightbox();
  });

  /* ---------- Единые ссылки из CFG ---------- */
  function initGlobalLinks() {
    $$('[data-telegram-link], a[href*="t.me/"]').forEach(function (a) {
      if (a.tagName === 'A') a.href = CFG.telegram;
      a.setAttribute('data-goal', a.getAttribute('data-goal') || 'click_telegram');
    });
    $$('[data-phone-link], a[href^="tel:"]').forEach(function (a) {
      if (a.tagName === 'A') a.href = 'tel:' + CFG.phone;
      a.setAttribute('data-goal', a.getAttribute('data-goal') || 'click_phone');
    });
    $$('[data-phone-text]').forEach(function (el) { el.textContent = CFG.phonePretty; });

    $$('[data-review-yandex]').forEach(function (a) {
      if (CFG.yandexReviews && a.tagName === 'A') a.href = CFG.yandexReviews;
      if (!CFG.yandexReviews) disableAction(a, 'Ссылка на Яндекс будет добавлена');
    });
    $$('[data-review-2gis]').forEach(function (a) {
      if (CFG.gisReviews && a.tagName === 'A') a.href = CFG.gisReviews;
      if (!CFG.gisReviews) disableAction(a, 'Ссылка на 2ГИС будет добавлена');
    });
  }

  function disableAction(el, title) {
    el.removeAttribute('href');
    el.removeAttribute('target');
    el.setAttribute('aria-disabled', 'true');
    el.setAttribute('role', 'button');
    el.classList.add('btn--disabled');
    if (title) el.setAttribute('title', title);
  }

  /* ---------- Шапка ---------- */
  function initHeader() {
    var header = $('.header');
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Бургер / мобильное меню ---------- */
  function initMobileMenu() {
    var burger = $('.burger');
    var menu   = $('.mobile-menu');
    var scrim  = $('.scrim');
    var closeB = $('.mobile-menu__close');
    if (!burger || !menu) return;

    function open()  { burger.classList.add('is-open');  menu.classList.add('is-open');  if (scrim) scrim.classList.add('is-open');  document.body.style.overflow = 'hidden'; }
    function close() { burger.classList.remove('is-open'); menu.classList.remove('is-open'); if (scrim) scrim.classList.remove('is-open'); document.body.style.overflow = ''; }
    burger.addEventListener('click', function () { menu.classList.contains('is-open') ? close() : open(); });
    if (closeB) closeB.addEventListener('click', close);
    if (scrim)  scrim.addEventListener('click', close);
    $$('.mobile-menu nav a').forEach(function (a) { a.addEventListener('click', close); });
  }

  /* ---------- Маска телефона ---------- */
  function initPhoneMask() {
    $$('input[data-phone]').forEach(function (input) {
      input.addEventListener('input', function () {
        var d = input.value.replace(/\D/g, '');
        if (d.indexOf('8') === 0)  d = '7' + d.slice(1);
        if (d.indexOf('9') === 0 && d.length <= 10) d = '7' + d;
        d = d.slice(0, 11);
        var out = '+7';
        if (d.length > 1)  out += ' (' + d.slice(1, 4);
        if (d.length >= 4) out += ') ' + d.slice(4, 7);
        if (d.length >= 7) out += '-' + d.slice(7, 9);
        if (d.length >= 9) out += '-' + d.slice(9, 11);
        input.value = out;
      });
      input.addEventListener('focus', function () { if (!input.value) input.value = '+7 '; });
      input.addEventListener('blur',  function () { if (input.value.replace(/\D/g, '').length < 2) input.value = ''; });
    });
  }
  function isValidPhone(v) { return String(v || '').replace(/\D/g, '').length === 11; }
  function markError(input, on) {
    if (!input) return;
    input.classList.toggle('is-error', on);
    var err = input.closest('.field') && input.closest('.field').querySelector('.field__err');
    if (err) err.classList.toggle('show', on);
  }

  /* ---------- Единое открытие модального окна ---------- */
  function openRequestModal(topic, address, problem) {
    var modal = $('#requestModal');
    if (!modal) return;
    var form = $('#modalForm', modal);
    var done = $('.calc-done', modal);

    if (form && done) {
      form.style.display = '';
      done.classList.remove('show', 'is-success', 'is-fallback', 'is-error');
      setDoneText(done, 'Заявка на ремонт', 'Заполните форму — дальше заявка уйдёт на сервер или будет подготовлена для отправки в Telegram.');
    }

    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    if (topic   && $('#mTopic',   modal)) $('#mTopic',   modal).value = topic;
    if (problem && $('#mProblem', modal)) $('#mProblem', modal).value = problem;
    if (address && $('#mAddress', modal)) $('#mAddress', modal).value = address;

    track('open_modal', { topic: topic || '', address: address || '', problem: problem || '' });
  }

  function closeRequestModal() {
    var modal = $('#requestModal');
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  /* ---------- Модальное окно заявки ---------- */
  function initModal() {
    var modal = $('#requestModal');
    if (!modal) return;

    var form = $('#modalForm', modal);
    var done = $('.calc-done', modal);

    $$('[data-modal]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openRequestModal(
          btn.getAttribute('data-modal-topic') || '',
          btn.getAttribute('data-modal-address') || '',
          btn.getAttribute('data-modal-problem') || ''
        );
      });
    });
    $$('.modal__close, .modal__overlay', modal).forEach(function (el) { el.addEventListener('click', closeRequestModal); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeRequestModal(); });

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var hp = $('input[name="company"]', form);
        if (hp && hp.value) return;

        var phone = $('#mPhone', form);
        if (!isValidPhone(phone && phone.value)) { markError(phone, true); return; }
        markError(phone, false);

        var data = {
          source:   'Модальная заявка',
          name:     ($('#mName',    form) || {}).value || '',
          phone:    phone.value,
          topic:    ($('#mTopic',   form) || {}).value || '',
          problem:  ($('#mProblem', form) || {}).value || '',
          comment:  ($('#mComment', form) || {}).value || '',
          address:  ($('#mAddress', form) || {}).value || ''
        };

        track('submit_lead', data);
        setSubmitState(form, true);
        sendLead(data).then(function (result) {
          setSubmitState(form, false);
          showLeadResult(form, done, data, result);
        }).catch(function () {
          setSubmitState(form, false);
          showLeadResult(form, done, data, { ok: false, fallback: true, error: true });
        });
      });
    }
  }

  /* ---------- Калькулятор ---------- */
  function initCalculator() {
    var calc = $('#calcForm');
    if (!calc) return;

    var steps   = $$('.calc-step', calc);
    var bars    = $$('.calc__progress span', calc);
    var btnPrev = $('[data-calc-prev]', calc);
    var btnNext = $('[data-calc-next]', calc);
    var done    = $('.calc-done', calc.closest('.calc__form'));
    var current = 0;
    var answers = { device: '', problem: '', address: '', name: '', phone: '', comment: '' };

    function render() {
      steps.forEach(function (s, i) { s.classList.toggle('is-active', i === current); });
      bars.forEach(function (b, i)  { b.classList.toggle('is-done',   i <= current); });
      if (btnPrev) btnPrev.style.visibility = current === 0 ? 'hidden' : 'visible';
      if (btnNext) btnNext.textContent = current === steps.length - 1 ? 'Подготовить заявку' : 'Далее';
    }

    $$('.opt', calc).forEach(function (opt) {
      opt.addEventListener('click', function () {
        var step = opt.closest('.calc-step');
        $$('.opt', step).forEach(function (o) { o.classList.remove('is-sel'); });
        opt.classList.add('is-sel');
        var key = step.getAttribute('data-key');
        answers[key] = opt.getAttribute('data-val');
        if (key === 'device') track('select_device', { value: answers[key] });
        else if (key === 'address') track('select_address', { address: answers[key] });
        else track('select_problem', { value: answers[key] });
      });
    });

    if (btnPrev) btnPrev.addEventListener('click', function () {
      if (current > 0) { current--; render(); }
    });

    if (btnNext) btnNext.addEventListener('click', function () {
      var step = steps[current];
      if (step.getAttribute('data-key') && step.querySelector('.opt')) {
        if (!answers[step.getAttribute('data-key')]) { shake(step); return; }
      }
      if (current === steps.length - 1) {
        var nameI  = $('#calcName',  calc);
        var phoneI = $('#calcPhone', calc);
        var hp     = $('input[name="company"]', calc);
        if (hp && hp.value) return;

        var ok = true;
        if (!nameI.value.trim())         { markError(nameI, true);  ok = false; } else markError(nameI, false);
        if (!isValidPhone(phoneI.value)) { markError(phoneI, true); ok = false; } else markError(phoneI, false);
        if (!ok) return;

        answers.name  = nameI.value.trim();
        answers.phone = phoneI.value;
        var commentI = $('#calcComment', calc);
        if (commentI) answers.comment = commentI.value.trim();

        var payload = {
          source:  'Калькулятор стоимости',
          name:    answers.name,
          phone:   answers.phone,
          topic:   answers.device,
          problem: answers.problem,
          address: answers.address,
          comment: answers.comment
        };

        track('submit_lead', payload);
        setSubmitState(calc, true);
        sendLead(payload).then(function (result) {
          setSubmitState(calc, false);
          showLeadResult(calc, done, payload, result);
        }).catch(function () {
          setSubmitState(calc, false);
          showLeadResult(calc, done, payload, { ok: false, fallback: true, error: true });
        });
        return;
      }
      current++;
      render();
    });

    render();
  }

  function setSubmitState(form, isLoading) {
    $$('button[type="submit"], [data-calc-next]', form).forEach(function (btn) {
      btn.disabled = isLoading;
      if (isLoading) {
        btn.dataset.oldText = btn.textContent;
        btn.textContent = 'Отправляем...';
      } else if (btn.dataset.oldText) {
        btn.textContent = btn.dataset.oldText;
        delete btn.dataset.oldText;
      }
    });
  }

  function showLeadResult(form, done, data, result) {
    if (!done) return;
    form.style.display = 'none';
    done.classList.add('show');

    var tgLink = $('.modal-tg-fallback', done) || $('.modal-tg-fallback');
    if (tgLink) {
      tgLink.href = buildTelegramURL(data);
      tgLink.setAttribute('data-telegram-ready', '1');
      tgLink.onclick = function () {
        track('submit_lead_success', Object.assign({ via: 'telegram_fallback' }, data));
      };
    }

    if (result && result.ok) {
      done.classList.add('is-success');
      setDoneText(done, 'Заявка отправлена!', 'Мы получили вашу заявку и скоро свяжемся. Если вопрос срочный — позвоните или продублируйте сообщение в Telegram.');
      track('submit_lead_success', Object.assign({ via: 'endpoint' }, data));
    } else if (result && result.error) {
      done.classList.add('is-error');
      setDoneText(done, 'Не удалось отправить напрямую', 'Заявка подготовлена, но сервер сейчас не принял её. Нажмите кнопку ниже, чтобы отправить текст заявки в Telegram.');
    } else {
      done.classList.add('is-fallback');
      setDoneText(done, 'Заявка подготовлена', 'Нажмите кнопку ниже, чтобы отправить её в Telegram. Без этого данные не попадут в сервис автоматически.');
    }
  }

  function setDoneText(done, title, text) {
    var h = $('h3', done);
    var p = $('p', done);
    if (h) h.textContent = title;
    if (p) p.textContent = text;
  }

  function shake(el) {
    if (!el || !el.animate) return;
    el.animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-7px)' },
       { transform: 'translateX(7px)' }, { transform: 'translateX(0)' }],
      { duration: 280 }
    );
  }



  /* ====== БЫСТРЫЙ ПОИСК ПО УСЛУГАМ ====== */
  function initServiceSearch() {
    var input = $('#serviceSearch');
    var empty = $('[data-service-empty]');
    var cards = $$('[data-service-card]');
    if (!input || !cards.length) return;

    function norm(v) { return String(v || '').toLowerCase().replace(/ё/g, 'е').trim(); }
    function apply(value) {
      var q = norm(value);
      var visible = 0;
      cards.forEach(function (card) {
        var hay = norm((card.getAttribute('data-search') || '') + ' ' + card.textContent);
        var ok = !q || hay.indexOf(q) !== -1;
        card.classList.toggle('is-hidden-by-search', !ok);
        if (ok) visible++;
      });
      if (empty) empty.classList.toggle('show', visible === 0);
      track('service_search', { query: q });
    }

    input.addEventListener('input', function () { apply(input.value); });
    $$('[data-search-chip]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        input.value = chip.getAttribute('data-search-chip') || chip.textContent;
        apply(input.value);
        input.focus();
      });
    });
  }

  /* ---------- Вкладки цен ---------- */
  function initPriceTabs() {
    var tabs = $$('.price-tab');
    if (!tabs.length) return;
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-tab');
        tabs.forEach(function (t) { t.classList.remove('is-active'); });
        tab.classList.add('is-active');
        $$('.price-panel').forEach(function (p) {
          p.classList.toggle('is-active', p.getAttribute('data-panel') === target);
        });
      });
    });
  }

  /* ---------- FAQ ---------- */
  function initFaq() {
    $$('.faq-item').forEach(function (item) {
      var q = $('.faq-item__q', item);
      var a = $('.faq-item__a', item);
      if (!q || !a) return;
      q.addEventListener('click', function () {
        var open = item.classList.contains('is-open');
        $$('.faq-item').forEach(function (i) {
          i.classList.remove('is-open');
          var ans = $('.faq-item__a', i);
          if (ans) ans.style.maxHeight = null;
        });
        if (!open) {
          item.classList.add('is-open');
          a.style.maxHeight = a.scrollHeight + 'px';
        }
      });
    });
  }

  /* ---------- Появление при скролле ---------- */
  function initReveal() {
    var els = $$('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  function initYear() {
    var y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ====== АНАЛИТИКА ====== */
  function track(goal, payload) {
    try {
      if (window.ym && CFG.ymCounter) window.ym(CFG.ymCounter, 'reachGoal', goal, payload || {});
      if (window.gtag) window.gtag('event', goal, payload || {});
    } catch (e) { /* never break UI */ }
    if (CFG.debug) console.log('[goal]', goal, payload || {});
  }

  function initAnalyticsBindings() {
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-goal]');
      if (!t) return;
      if (t.classList.contains('btn--disabled') || t.getAttribute('aria-disabled') === 'true') {
        e.preventDefault();
        return;
      }
      var goal = t.getAttribute('data-goal');
      var extra = {};
      var v = t.getAttribute('data-goal-value');
      if (v) extra.value = v;
      track(goal, extra);
    });
  }

  function initScrollGoals() {
    var sent = { 50: false, 75: false, 90: false };
    function onScroll() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      if (max <= 0) return;
      var pct = (window.scrollY / max) * 100;
      [50, 75, 90].forEach(function (p) {
        if (!sent[p] && pct >= p) { sent[p] = true; track('scroll_' + p); }
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ====== COOKIE-ПЛАШКА ====== */
  function initCookieBanner() {
    var bar = $('#cookieBar');
    if (!bar) return;
    var KEY = 'singa_cookie_v1';
    try { if (localStorage.getItem(KEY) === '1') { bar.remove(); return; } } catch (e) {}
    bar.classList.add('is-shown');
    var accept = $('[data-cookie-accept]', bar);
    if (accept) accept.addEventListener('click', function () {
      try { localStorage.setItem(KEY, '1'); } catch (e) {}
      bar.classList.add('is-closing');
      setTimeout(function () { bar.remove(); document.body.classList.remove('has-cookie'); }, 300);
    });
    document.body.classList.add('has-cookie');
  }

  /* ====== ЛИПКАЯ МОБИЛЬНАЯ ПАНЕЛЬ ====== */
  function initMobileStickyBar() {
    var bar = $('#mStickyBar');
    if (!bar) return;
    function check() {
      if (window.scrollY > 400) bar.classList.add('is-shown');
      else bar.classList.remove('is-shown');
    }
    window.addEventListener('scroll', check, { passive: true });
    check();
  }

  /* ====== ВЫБОР АДРЕСА В ФОРМЕ ЗАЯВКИ ====== */
  function initAddressPicker() {
    $$('[data-pick-address]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var addr = btn.getAttribute('data-pick-address') || '';
        openRequestModal('', addr, '');
        track('select_address', { address: addr });
      });
    });
  }

  /* ====== ОТПРАВКА ЗАЯВКИ ====== */
  function sendLead(data) {
    if (CFG.endpoint) {
      return fetch(CFG.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (body) {
          if (r.ok && (body.ok === true || Object.keys(body).length === 0)) return { ok: true, body: body };
          return { ok: false, fallback: true, error: true, status: r.status, body: body };
        });
      }).catch(function (e) {
        if (CFG.debug) console.warn('Lead send failed:', e);
        return { ok: false, fallback: true, error: true };
      });
    }
    return Promise.resolve({ ok: false, fallback: true, static: true });
  }

  function buildTelegramURL(data) {
    var lines = [
      'Заявка с сайта «Синга Сервис»',
      'Имя: '      + (data.name    || '—'),
      'Телефон: '  + (data.phone   || '—'),
      'Техника: '  + (data.topic   || '—')
    ];
    if (data.problem) lines.push('Проблема: ' + data.problem);
    if (data.address) lines.push('Адрес / точка: ' + data.address);
    if (data.comment) lines.push('Комментарий: ' + data.comment);

    base = CFG.telegramBot || CFG.telegram;
    return base + (base.indexOf('?') === -1 ? '?' : '&') + 'text=' + encodeURIComponent(lines.join('\n'));
  }

  /* ====== LIGHTBOX (для фото-плейсхолдеров и примеров работ) ======
     Подключается автоматически:
     - Любой <a class="lightbox-link" data-lightbox-group="examples" href="full.jpg">
     - При замене .photo-card / .example-card на реальные фото добавьте класс has-img
       и оберните <img> в <a class="lightbox-link" data-lightbox-group="…" href="full.jpg">.
     Без внешних библиотек, без зависимостей. */
  function initLightbox() {
    var links = $$('.lightbox-link');
    if (!links.length) return;

    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Просмотр фото');
    box.innerHTML =
      '<button class="lightbox__close" type="button" aria-label="Закрыть">&#10005;</button>' +
      '<button class="lightbox__prev" type="button" aria-label="Предыдущее фото">&#8249;</button>' +
      '<button class="lightbox__next" type="button" aria-label="Следующее фото">&#8250;</button>' +
      '<figure class="lightbox__figure">' +
        '<img class="lightbox__img" alt="">' +
        '<figcaption class="lightbox__caption"></figcaption>' +
      '</figure>' +
      '<div class="lightbox__counter"></div>';
    document.body.appendChild(box);

    var img      = $('.lightbox__img',     box);
    var caption  = $('.lightbox__caption', box);
    var counter  = $('.lightbox__counter', box);
    var btnPrev  = $('.lightbox__prev',    box);
    var btnNext  = $('.lightbox__next',    box);

    var current = []; // current group of {href, alt}
    var idx = 0;

    function open(group, startIdx) {
      current = group;
      idx = startIdx;
      render();
      box.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      track('open_lightbox', { group: current.length, index: idx });
    }
    function close() {
      box.classList.remove('is-open');
      document.body.style.overflow = '';
    }
    function render() {
      var item = current[idx];
      img.src = item.href;
      img.alt = item.alt || '';
      caption.textContent = item.alt || '';
      counter.textContent = current.length > 1 ? (idx + 1) + ' / ' + current.length : '';
      btnPrev.style.display = current.length > 1 ? '' : 'none';
      btnNext.style.display = current.length > 1 ? '' : 'none';
    }
    function next() { idx = (idx + 1) % current.length; render(); }
    function prev() { idx = (idx - 1 + current.length) % current.length; render(); }

    // Build groups
    var groups = {};
    links.forEach(function (a) {
      var g = a.getAttribute('data-lightbox-group') || 'default';
      groups[g] = groups[g] || [];
      var alt = a.querySelector('img') ? a.querySelector('img').alt : (a.getAttribute('data-caption') || '');
      groups[g].push({ href: a.href, alt: alt, el: a });
    });

    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var g = a.getAttribute('data-lightbox-group') || 'default';
        var group = groups[g];
        var startIdx = 0;
        for (var i = 0; i < group.length; i++) {
          if (group[i].el === a) { startIdx = i; break; }
        }
        open(group, startIdx);
      });
    });

    box.addEventListener('click', function (e) {
      if (e.target === box || e.target.classList.contains('lightbox__figure')) close();
    });
    $('.lightbox__close', box).addEventListener('click', close);
    btnPrev.addEventListener('click', prev);
    btnNext.addEventListener('click', next);

    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('is-open')) return;
      if (e.key === 'Escape')      close();
      if (e.key === 'ArrowLeft')   prev();
      if (e.key === 'ArrowRight')  next();
    });
  }

})();
