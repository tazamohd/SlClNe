/* SALISCO site behaviour: language, header pill, mobile menu, tabs, the card stack, reveals, count-ups.
   No dependencies. Everything here is progressive: the page reads and navigates without it. */
(function () {
  var root = document.documentElement;
  var KEY = 'salisco-lang';
  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* no matchMedia */ }
  var wide = function () { return (window.innerWidth || root.clientWidth) > 768; };

  function apply(l) {
    root.lang = l;
    root.dir = l === 'ar' ? 'rtl' : 'ltr';
    var ttl = l === 'ar' ? root.dataset.titleAr : root.dataset.titleEn;
    if (ttl) document.title = ttl;
    try { localStorage.setItem(KEY, l); } catch (e) { /* storage may be unavailable */ }
    document.querySelectorAll('[data-tabs]').forEach(placeIndicator);
  }

  var q = null;
  try { q = new URLSearchParams(location.search).get('lang'); } catch (e) { /* old browsers */ }
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) { /* storage may be unavailable */ }

  /* ---------- tabs: roving tabindex, arrow keys, Home/End; the indicator slides, panels swap without motion ---------- */
  function placeIndicator(tabs) {
    var ind = tabs.querySelector('.ind');
    var on = tabs.querySelector('.tab[aria-selected="true"]');
    if (!ind || !on) return;
    ind.style.setProperty('--x', on.offsetLeft + 'px');
    ind.style.setProperty('--w', on.offsetWidth);
  }
  function select(tabs, tab, byPointer) {
    var list = tabs.querySelectorAll('.tab');
    var panels = tabs.querySelectorAll('.tabpanel');
    list.forEach(function (t, i) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var p = panels[i];
      if (!p) return;
      if (on) { p.removeAttribute('data-tab-hidden'); if (byPointer && !reduce) { p.classList.remove('enter'); void p.offsetWidth; p.classList.add('enter'); } }
      else { p.setAttribute('data-tab-hidden', ''); p.classList.remove('enter'); }
    });
    placeIndicator(tabs);
    if (tab.scrollIntoView) { try { tab.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { /* older signature */ } }
  }
  document.querySelectorAll('[data-tabs]').forEach(function (tabs) {
    var list = Array.prototype.slice.call(tabs.querySelectorAll('.tab'));
    list.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tabs, tab, true); });
      tab.addEventListener('keydown', function (e) {
        var rtl = root.dir === 'rtl';
        var next = null;
        if (e.key === 'ArrowRight') next = list[(i + (rtl ? -1 : 1) + list.length) % list.length];
        else if (e.key === 'ArrowLeft') next = list[(i + (rtl ? 1 : -1) + list.length) % list.length];
        else if (e.key === 'Home') next = list[0];
        else if (e.key === 'End') next = list[list.length - 1];
        if (!next) return;
        e.preventDefault();
        select(tabs, next, false);
        next.focus();
      });
    });
    placeIndicator(tabs);
  });
  window.addEventListener('resize', function () { document.querySelectorAll('[data-tabs]').forEach(placeIndicator); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { document.querySelectorAll('[data-tabs]').forEach(placeIndicator); });

  apply(q === 'ar' || q === 'en' ? q : (saved === 'ar' ? 'ar' : 'en'));
  var toggle = document.getElementById('langToggle');
  if (toggle) toggle.addEventListener('click', function () { apply(root.lang === 'ar' ? 'en' : 'ar'); });

  /* ---------- sticky header becomes a detached pill after 24px ---------- */
  var header = document.getElementById('site-header');
  var scrolled = false;
  function onScroll() {
    var s = (window.scrollY || root.scrollTop) > 24;
    if (s !== scrolled) { scrolled = s; header.classList.toggle('is-scrolled', s); }
  }
  if (header) { onScroll(); window.addEventListener('scroll', onScroll, { passive: true }); }

  /* ---------- mobile menu ---------- */
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

  /* ---------- the stack: each card rotates in with scroll progress and settles at 0° once it takes the viewport.
     Transform only. Off under 768px and under reduced motion (CSS zeroes the rotation there too). ---------- */
  var cards = Array.prototype.slice.call(document.querySelectorAll('.cards .card'));
  if (cards.length && !reduce && 'IntersectionObserver' in window) {
    var rots = cards.map(function (c) { return parseFloat(getComputedStyle(c).getPropertyValue('--rot')) || 0; });
    var locked = cards.map(function () { return false; });
    var ticking = false;
    function drive() {
      ticking = false;
      if (!wide()) { cards.forEach(function (c) { c.style.transform = ''; c.classList.remove('driving'); }); return; }
      var vh = window.innerHeight || root.clientHeight;
      cards.forEach(function (c, i) {
        if (locked[i]) return;
        var r = c.getBoundingClientRect();
        var p = Math.max(0, Math.min(1, (vh - r.top) / (r.height * 0.6)));
        c.classList.add('driving');
        c.style.transform = 'rotate(' + (rots[i] * (1 - p)).toFixed(3) + 'deg)';
      });
    }
    function onCardScroll() { if (!ticking) { ticking = true; requestAnimationFrame(drive); } }
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting || en.intersectionRatio < 0.6) return;
        var i = cards.indexOf(en.target);
        locked[i] = true;
        en.target.classList.remove('driving');
        en.target.style.transform = '';
        en.target.classList.add('settled');
        sio.unobserve(en.target);
      });
    }, { threshold: [0.6] });
    cards.forEach(function (c) { sio.observe(c); });
    window.addEventListener('scroll', onCardScroll, { passive: true });
    window.addEventListener('resize', onCardScroll);
    drive();
  }

  /* ---------- scroll reveals: only blocks that start below the first viewport, staggered by sibling index ---------- */
  if ('IntersectionObserver' in window && !reduce) {
    var candidates = document.querySelectorAll('.dk, .pc, .road li, .faq details, .acct a, .channel, .rgi, .facts li, .connect > a, .cta-end > *');
    var below = [];
    var vh0 = window.innerHeight || root.clientHeight;
    for (var i = 0; i < candidates.length; i++) {
      var el = candidates[i];
      if (el.getBoundingClientRect().top > vh0) {
        var idx = 0, sib = el;
        while ((sib = sib.previousElementSibling) && idx < 6) idx++;
        el.style.setProperty('--i', idx);
        el.classList.add('rv', 'pre');
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

  /* ---------- count-ups on the proof cards: from the baseline to the result, ease-out cubic, once ---------- */
  if ('IntersectionObserver' in window && !reduce) {
    var cells = document.querySelectorAll('.pc');
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

  /* Trace and hero reveals run once on load; reduced motion is handled in CSS. */
  root.classList.add('is-ready');
})();
