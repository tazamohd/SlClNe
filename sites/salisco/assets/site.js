/* SALISCO site behaviour: language, header pill, mobile menu, reveals, count-ups. No dependencies.
   Everything here is progressive: the page reads and navigates without it. */
(function () {
  var root = document.documentElement;
  var KEY = 'salisco-lang';
  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* no matchMedia */ }

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
  if (toggle) toggle.addEventListener('click', function () { apply(root.lang === 'ar' ? 'en' : 'ar'); });

  /* Sticky header becomes a detached pill after 24px. Class toggle only; CSS transitions do the rest. */
  var header = document.getElementById('site-header');
  var scrolled = false;
  function onScroll() {
    var s = (window.scrollY || root.scrollTop) > 24;
    if (s !== scrolled) { scrolled = s; header.classList.toggle('is-scrolled', s); }
  }
  if (header) { onScroll(); window.addEventListener('scroll', onScroll, { passive: true }); }

  /* Mobile menu: the burger folds into an X (CSS on aria-expanded); links stagger in and leave faster than they arrive. */
  var burger = document.getElementById('menuToggle');
  var menu = document.getElementById('mobile-menu');
  var closing = 0;
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.hidden || !menu.classList.contains('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) {
        clearTimeout(closing);
        menu.hidden = false;
        requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add('is-open'); }); });
      } else {
        menu.classList.remove('is-open');
        closing = setTimeout(function () { if (!menu.classList.contains('is-open')) menu.hidden = true; }, reduce ? 0 : 180);
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { burger.click(); burger.focus(); }
    });
  }

  /* Scroll reveals: only blocks that start below the first viewport, staggered by sibling index. */
  if ('IntersectionObserver' in window && !reduce) {
    var candidates = document.querySelectorAll('.line-row, .why > div, .map .line, .proof .cell, .channel, .roles > div, .facts li, .assume > div, .cta-end > *');
    var below = [];
    var vh = window.innerHeight || root.clientHeight;
    for (var i = 0; i < candidates.length; i++) {
      var el = candidates[i];
      if (el.getBoundingClientRect().top > vh) {
        var idx = 0, sib = el;
        while ((sib = sib.previousElementSibling) && idx < 6) idx++;
        el.style.setProperty('--i', idx);
        el.classList.add('reveal');
        below.push(el);
      }
    }
    if (below.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
      below.forEach(function (el) { io.observe(el); });
    }
  }

  /* Count-ups on the proof band: from the baseline to the result, ease-out cubic, once. */
  if ('IntersectionObserver' in window && !reduce) {
    var cells = document.querySelectorAll('.proof .cell');
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        var to = en.target.querySelector('.to');
        var from = en.target.querySelector('.from');
        if (!to) return;
        var m = to.textContent.match(/^([+\-]?)(\d+)(.*)$/);
        if (!m) return;
        var sign = m[1], end = parseInt(m[2], 10), unit = m[3];
        var start = 0;
        if (from) { var fm = from.textContent.match(/(\d+)/); if (fm) start = parseInt(fm[1], 10); }
        var t0 = null, dur = 900;
        function step(ts) {
          if (t0 === null) t0 = ts;
          var p = Math.min(1, (ts - t0) / dur);
          var e = 1 - Math.pow(1 - p, 3);
          var v = Math.round(start + (end - start) * e);
          to.textContent = sign + v + unit;
          if (p < 1) requestAnimationFrame(step); else to.textContent = sign + end + unit;
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    cells.forEach(function (c) { cio.observe(c); });
  }

  /* Trace animation runs once on load; reduced motion is handled in CSS. */
  root.classList.add('is-ready');
})();
