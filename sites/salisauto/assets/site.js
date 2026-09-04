/* SALIS AUTO site behaviour: language, header, mobile menu. No dependencies. */
(function () {
  var root = document.documentElement;
  var KEY = 'salisauto-lang';

  function apply(l) {
    root.lang = l;
    root.dir = l === 'ar' ? 'rtl' : 'ltr';
    var ttl = l === 'ar' ? root.dataset.titleAr : root.dataset.titleEn;
    if (ttl) document.title = ttl;
    try { localStorage.setItem(KEY, l); } catch (e) { /* storage may be unavailable */ }
  }

  var q = null;
  try { q = new URLSearchParams(location.search).get('lang'); } catch (e) { /* old browsers */ }
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) { /* storage may be unavailable */ }
  apply(q === 'ar' || q === 'en' ? q : (saved === 'ar' ? 'ar' : 'en'));

  var toggle = document.getElementById('langToggle');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (toggle) toggle.addEventListener('click', function () {
    var next = root.lang === 'ar' ? 'en' : 'ar';
    if (reduce) return apply(next);
    root.classList.add('lang-switching');
    setTimeout(function () { apply(next); requestAnimationFrame(function () { root.classList.remove('lang-switching'); }); }, 160);
  });

  /* Sticky header: shrink the wordmark and add a shadow after 24px, transform only. */
  var header = document.getElementById('site-header');
  var scrolled = false;
  function onScroll() {
    var s = (window.scrollY || document.documentElement.scrollTop) > 24;
    if (s !== scrolled) { scrolled = s; header.classList.toggle('is-scrolled', s); }
  }
  if (header) { onScroll(); window.addEventListener('scroll', onScroll, { passive: true }); }

  /* Mobile menu */
  var burger = document.getElementById('menuToggle');
  var menu = document.getElementById('mobile-menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.hidden;
      menu.hidden = !open;
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
  }

  /* Trace animation runs once on load; reduced motion is handled in CSS. */
  root.classList.add('is-ready');
})();

/* Motion layer: pointer tilt, scroll reveals, counted proof numbers. Transform and opacity only. */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(pointer: fine)').matches;

  /* Tilt: at most 5 degrees on cards, 6 on the hero mock; a highlight follows the pointer. */
  if (!reduce && fine) {
    var tilts = [].slice.call(document.querySelectorAll('.domains > div:not(.wide), .tier, .roles > div, .hero-mock'));
    tilts.forEach(function (el) {
      el.classList.add('tilt');
      var max = el.classList.contains('tilt-deep') ? 6 : 5;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--ry', ((px - 0.5) * 2 * max).toFixed(2) + 'deg');
        el.style.setProperty('--rx', ((0.5 - py) * 2 * max).toFixed(2) + 'deg');
        el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', function () { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
  }

  /* Reveals: only for blocks below the first viewport, so the page at rest is fully visible. */
  if (!reduce && 'IntersectionObserver' in window) {
    var vh = window.innerHeight;
    var blocks = [].slice.call(document.querySelectorAll('main section > .wrap > *, main section.wrap > *, .domains > div, .tier, .roles > div, .quotes > blockquote, .stage, .facts > li'));
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    blocks.forEach(function (el, i) {
      if (el.getBoundingClientRect().top < vh * 0.9) return;
      el.classList.add('reveal'); el.style.setProperty('--d', ((i % 6) * 60) + 'ms'); io.observe(el);
    });
  }

  /* Proof numbers count from the baseline to the result, once, when seen. */
  var counters = [].slice.call(document.querySelectorAll('[data-count]'));
  if (counters.length && !reduce && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; cio.unobserve(e.target);
        var el = e.target, to = +el.dataset.count, from = +el.dataset.from, unit = el.dataset.unit || '', pre = el.dataset.prefix || '';
        var t0 = null;
        function step(now) {
          if (!t0) t0 = now; var k = Math.min(1, (now - t0) / 1100); k = 1 - Math.pow(1 - k, 3);
          el.textContent = pre + Math.round(from + (to - from) * k) + unit;
          if (k < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* Paper to platform: the three papers fold into the slab once, when the AI stage enters view. */
  var stageEl = document.querySelector('.ai-stage');
  if (stageEl && 'IntersectionObserver' in window) {
    var fio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { stageEl.classList.add('in'); fio.disconnect(); } }, { threshold: 0.35 });
    fio.observe(stageEl);
  }

  root.classList.add('motion-ready');
})();
