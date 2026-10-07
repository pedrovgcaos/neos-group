/* Neos Group — interações do site */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.dataLayer = window.dataLayer || [];

  /* cabeçalho ------------------------------------------------------------ */
  var hdr = document.getElementById('site-header');
  var onScroll = function () { if (hdr) hdr.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  function setNav(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
  }
  if (toggle) toggle.addEventListener('click', function () { setNav(toggle.getAttribute('aria-expanded') !== 'true'); });
  if (nav) nav.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (a && nav.classList.contains('is-open')) setNav(false);
  });
  document.querySelectorAll('.sub-toggle').forEach(function (b) {
    b.addEventListener('click', function () {
      var li = b.closest('.has-sub');
      var open = !li.classList.contains('is-open');
      document.querySelectorAll('.has-sub.is-open').forEach(function (x) { if (x !== li) { x.classList.remove('is-open'); x.querySelector('.sub-toggle').setAttribute('aria-expanded', 'false'); } });
      li.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-sub')) document.querySelectorAll('.has-sub.is-open').forEach(function (x) {
      if (window.innerWidth > 1100) { x.classList.remove('is-open'); x.querySelector('.sub-toggle').setAttribute('aria-expanded', 'false'); }
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    setNav(false);
    document.querySelectorAll('.has-sub.is-open').forEach(function (x) { x.classList.remove('is-open'); x.querySelector('.sub-toggle').setAttribute('aria-expanded', 'false'); });
  });

  /* revelação ao rolar + contadores --------------------------------------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;
    var pre = el.getAttribute('data-prefix') || '', suf = el.getAttribute('data-suffix') || '';
    var fmt = function (n) { return pre + Math.round(n).toLocaleString('en-US') + suf; };
    if (reduce) { el.textContent = fmt(target); return; }
    var t0 = null, dur = 1600;
    el.textContent = fmt(0);
    requestAnimationFrame(function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    });
  }

  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add('is-in');
        el.querySelectorAll('[data-count]').forEach(countUp);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el, i) {
      // pequeno escalonamento entre irmãos visíveis ao mesmo tempo
      var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      if (!reduce) el.style.transitionDelay = Math.min(sib, 5) * 70 + 'ms';
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* galeria (lightbox) ---------------------------------------------------- */
  var lb = document.getElementById('lightbox');
  if (lb && typeof lb.showModal === 'function') {
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-lightbox]');
      if (!b) return;
      lb.querySelector('img').src = b.getAttribute('data-lightbox');
      lb.querySelector('img').alt = b.getAttribute('data-caption') || '';
      lb.querySelector('p').textContent = b.getAttribute('data-caption') || '';
      lb.showModal();
    });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.closest('.lightbox__close')) lb.close(); });
  }

  /* formulários + dataLayer ----------------------------------------------- */
  var emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); };

  function setupForm(form, isNewsletter) {
    var status = form.querySelector('.form-status');
    var btn = form.querySelector('[data-submit]');
    var say = function (msg, kind) {
      if (!status) return;
      status.textContent = msg || '';
      status.className = 'form-status' + (kind ? ' is-' + kind : '');
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var data = {};
      fd.forEach(function (v, k) { data[k] = String(v).trim(); });

      // validação
      var bad = [];
      form.querySelectorAll('[required]').forEach(function (inp) {
        var v = inp.value.trim();
        var invalid = !v || (inp.type === 'email' && !emailOk(v));
        inp.classList.toggle('is-invalid', invalid);
        inp.setAttribute('aria-invalid', String(invalid));
        if (invalid) bad.push(inp);
      });
      if (bad.length) { say(form.getAttribute('data-msg-invalid'), 'error'); bad[0].focus(); return; }

      var formName = form.getAttribute('data-form-name') || 'contact_form';
      var evName = form.getAttribute('data-event') || 'form_submit';
      var base = {
        form_name: formName,
        form_type: isNewsletter ? 'newsletter' : 'contact',
        form_id: form.id || formName,
        page_path: location.pathname,
        page_language: form.getAttribute('data-lang') || document.documentElement.lang,
      };

      // dataLayer push no clique do botão de envio (formulário válido). Sem dados pessoais.
      window.dataLayer.push(Object.assign({ event: evName }, base));

      btn && (btn.disabled = true);
      say(form.getAttribute('data-msg-sending') || '', '');

      var payload = Object.assign({}, data, {
        type: isNewsletter ? 'newsletter' : 'contact',
        form: formName,
        lang: base.page_language,
        page: location.pathname,
      });

      fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok && j.ok }; }); })
        .then(function (r) {
          if (!r.ok) throw new Error('fail');
          window.dataLayer.push(Object.assign({ event: evName + '_success' }, base));
          say(form.getAttribute('data-msg-success'), 'success');
          form.reset();
          if (!isNewsletter) form.classList.add('is-sent');
          setTimeout(function () { form.classList.remove('is-sent'); btn && (btn.disabled = false); }, 4000);
        })
        .catch(function () {
          window.dataLayer.push(Object.assign({ event: evName + '_error' }, base));
          say(form.getAttribute('data-msg-error'), 'error');
          btn && (btn.disabled = false);
        });
    });

    form.addEventListener('input', function (e) {
      if (e.target.classList.contains('is-invalid')) {
        var v = e.target.value.trim();
        if (v && (e.target.type !== 'email' || emailOk(v))) { e.target.classList.remove('is-invalid'); e.target.removeAttribute('aria-invalid'); }
      }
    });
  }

  document.querySelectorAll('.lead-form').forEach(function (f) { setupForm(f, false); });
  document.querySelectorAll('.news-form').forEach(function (f) { setupForm(f, true); });
})();
