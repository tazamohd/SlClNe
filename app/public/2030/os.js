/* ═══════════════════════════════════════════════════════════════════════
   SALIS AUTO // GARAGE OS 2030 — shared runtime.

   Every page in this site loads exactly two files: os.css and this one.
   The chrome — atmosphere, cold start, top bar with the site navigation,
   the section rail, the footer — is injected from here rather than copied
   into six HTML files, so there is one place to change it. Each page ships
   only its <main>, and the rail builds itself from the sections it finds.

   No dependencies, no network. Every figure anywhere on this site comes
   from the seeded generator below, so a reload tells the same story twice.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* mulberry32 — small, fast, deterministic. */
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var rand = rng(20300312);
  function pick(list) { return list[Math.floor(rand() * list.length)]; }
  function between(lo, hi) { return lo + rand() * (hi - lo); }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function esc(str) { return String(str).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  }); }

  /* ── The site ────────────────────────────────────────────────────── */
  var PAGES = [
    { file: 'index.html',   nav: 'The Floor', note: 'A Tuesday in 2030, from the counter out' },
    { file: 'system.html',  nav: 'System',    note: 'Thirteen subsystems, and what each one is today' },
    { file: 'grid.html',    nav: 'Network',   note: 'Parts, sourcing, portals and eleven branches' },
    { file: 'access.html',  nav: 'Pricing',   note: 'What it costs and what comes with it' },
    { file: 'origin.html',  nav: 'Origin',    note: 'Who builds this, what they believe, who they need' },
    { file: 'channel.html', nav: 'Contact',   note: 'Book a demo, ask a question, argue with the page' }
  ];

  function currentFile() {
    var f = window.location.pathname.split('/').pop();
    return (!f || f === '') ? 'index.html' : f;
  }

  /* ── Chrome ──────────────────────────────────────────────────────── */
  function injectChrome() {
    var here = currentFile();
    var body = document.body;

    var atmos = document.createElement('div');
    atmos.innerHTML =
      '<div class="atmos" aria-hidden="true"></div>' +
      '<div class="grain" aria-hidden="true"></div>' +
      '<div class="scan" aria-hidden="true"></div>';
    while (atmos.firstChild) body.insertBefore(atmos.firstChild, body.firstChild);

    var navHtml = PAGES.map(function (p) {
      return '<a href="' + p.file + '"' + (p.file === here ? ' class="here" aria-current="page"' : '') +
             '>' + p.nav + '</a>';
    }).join('');

    var menuHtml = PAGES.map(function (p) {
      return '<a href="' + p.file + '"' + (p.file === here ? ' class="here" aria-current="page"' : '') +
             '>' + p.nav + '<span>' + p.note + '</span></a>';
    }).join('');

    var top = document.createElement('div');
    top.className = 'hud hud-top';
    top.innerHTML =
      '<a class="brand" href="index.html" aria-label="SALIS AUTO 2030 home">' +
        '<img src="../assets/logo-blue-orange.png" alt="" />' +
        '<b>SALIS&nbsp;AUTO</b><span class="opt">/ 2030</span>' +
      '</a>' +
      '<nav class="nav" aria-label="Site">' + navHtml + '</nav>' +
      '<div class="rhs">' +
        '<span class="opt">LATENCY <b class="live" id="hudLat">—</b></span>' +
        '<span id="hudClock" class="live mono">—</span>' +
        '<span class="live"><i class="dot"></i>ONLINE</span>' +
        '<button class="menu-btn" id="menuBtn" type="button" aria-expanded="false" aria-controls="menuPanel">Menu</button>' +
      '</div>';
    body.appendChild(top);

    var panel = document.createElement('div');
    panel.className = 'menu-panel';
    panel.id = 'menuPanel';
    panel.innerHTML = menuHtml;
    body.appendChild(panel);

    var btn = $('#menuBtn', top);
    btn.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.textContent = open ? 'Close' : 'Menu';
    });

    /* The rail reads the page rather than being told about it. */
    var secs = $$('main > section[id][data-label]');
    if (secs.length > 1) {
      var railEl = document.createElement('nav');
      railEl.className = 'hud hud-rail';
      railEl.id = 'rail';
      railEl.setAttribute('aria-label', 'Section navigation');
      railEl.innerHTML = secs.map(function (s) {
        return '<a href="#' + s.id + '" data-label="' + esc(s.getAttribute('data-label')) + '"></a>';
      }).join('');
      body.appendChild(railEl);
    }

    var foot = document.createElement('div');
    foot.className = 'hud hud-foot';
    foot.innerHTML = '<span>SCROLL TO TRAVERSE</span><span class="dimtag">·</span>' +
                     '<span>A DESIGN STUDY — NOT A PRODUCT CLAIM</span>';
    body.appendChild(foot);
  }

  function injectFooter() {
    if ($('footer')) return;                       // a page may bring its own
    var here = currentFile();
    var links = PAGES.filter(function (p) { return p.file !== here; })
      .map(function (p) { return '<li><a href="' + p.file + '">' + p.nav + '</a></li>'; }).join('');

    var f = document.createElement('footer');
    f.innerHTML =
      '<div class="site-map">' +
        '<div><h5>This site</h5><ul>' + links + '</ul></div>' +
        '<div><h5>The real product</h5><ul>' +
          '<li><a href="../../public-portal/landing">Public site</a></li>' +
          '<li><a href="../../public-portal/pricing">Pricing</a></li>' +
          '<li><a href="../../public-portal/book-demo">Book a demo</a></li>' +
          '<li><a href="../../login">Sign in</a></li>' +
        '</ul></div>' +
        '<div><h5>Built on</h5><ul>' +
          '<li><a href="system.html">Thirteen subsystems</a></li>' +
          '<li><a href="system.html#roles">Fourteen roles</a></li>' +
          '<li><a href="grid.html#portals">Three portals</a></li>' +
          '<li><a href="index.html#chrono">2026 → 2030</a></li>' +
        '</ul></div>' +
        '<div><h5>Standing</h5><ul>' +
          '<li><a href="origin.html#principles">What we believe</a></li>' +
          '<li><a href="origin.html#roles">Open roles</a></li>' +
          '<li><a href="channel.html">Get in touch</a></li>' +
        '</ul></div>' +
      '</div>' +
      '<div class="big">FOUR YEARS OUT</div>' +
      '<p class="note">SALIS AUTO — 2030 · A DESIGN STUDY, NOT A PRICE LIST</p>' +
      '<p class="disclaimer">Every workshop, vehicle, plate and figure on this site is invented for ' +
      'the purpose of the study. What is not invented is the capability behind each claim: each one ' +
      'is a four-year extension of something the product ships today — check-in, inspection, ' +
      'estimate, repair, quality control, delivery, and an audit row for every change. Where a page ' +
      'states a number, read it as illustrative. Where it states a capability, the System page names ' +
      'exactly what would still have to be built.</p>';
    document.body.appendChild(f);
  }

  /* ── Cold start ──────────────────────────────────────────────────── */
  var BOOT = [
    ['SALIS AUTO', 'v2030.3 — workshop management'],
    ['opening the job board', '9 bays'],
    ['loading today\u2019s schedule', '31 jobs booked'],
    ['connecting OBD gateway', '18 vehicles reporting'],
    ['reading service history', '11 years on file'],
    ['ZATCA credentials', 'verified'],
    ['restoring technician profiles', '48 accounts'],
    ['checking parts against bookings', '6 shortfalls flagged'],
    ['WARN bay 04 lift', 'inspection due in 9 days'],
    ['ready', 'good morning']
  ];

  var booted = false, startFns = [];

  function endBoot() {
    if (booted) return;
    booted = true;
    var el = $('#boot');
    if (el) {
      el.classList.add('done');
      window.setTimeout(function () { el.style.display = 'none'; }, 950);
    }
    document.body.classList.remove('booting');
    startFns.forEach(function (fn) { try { fn(); } catch (e) { /* one page must not stop the rest */ } });
    /* Page scripts inject cards, rails and tables of their own. Sweep again so
       those reveal on scroll like everything that was in the HTML to begin with. */
    reveals();
  }

  function coldStart() {
    if (!document.body.hasAttribute('data-boot')) { endBoot(); return; }
    document.body.classList.add('booting');
    var el = document.createElement('div');
    el.id = 'boot';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML =
      '<div class="boot-inner">' +
        '<div class="boot-mark"><img src="../assets/logo-blue-orange.png" alt="" /><b>SALIS AUTO</b></div>' +
        '<div class="boot-log mono" id="bootLog"></div>' +
        '<div class="boot-bar"><span id="bootBar"></span></div>' +
        '<div class="boot-cta">' +
          '<button class="boot-skip" id="bootSkip" type="button">Skip cold start &rarr;</button>' +
          '<span class="tag dimtag" id="bootPct">00%</span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);
    $('#bootSkip').addEventListener('click', endBoot);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === 'Escape') endBoot();
    });

    var logEl = $('#bootLog'), barEl = $('#bootBar'), pctEl = $('#bootPct');
    if (reduced) { logEl.textContent = 'SALIS AUTO v2030.3 — ready.'; endBoot(); return; }

    var i = 0;
    (function step() {
      if (i >= BOOT.length) { window.setTimeout(endBoot, 620); return; }
      var line = BOOT[i], row = document.createElement('div');
      var warn = line[0].indexOf('WARN') === 0;
      row.innerHTML = '<i>' + (warn ? '' : '▸ ') + '</i>' +
        (warn ? '<s>' + line[0] + '</s>' : line[0]) + ' <i>·</i> ' +
        (warn ? '<s>' + line[1] + '</s>' : '<i>' + line[1] + '</i>');
      logEl.appendChild(row);
      logEl.scrollTop = logEl.scrollHeight;
      i++;
      var p = Math.round((i / BOOT.length) * 100);
      barEl.style.width = p + '%';
      pctEl.textContent = pad(p) + '%';
      window.setTimeout(step, i < 3 ? 260 : between(130, 340));
    })();
  }

  /* ── Clock, reveals, rail ────────────────────────────────────────── */
  function hud() {
    var now = new Date();
    var clock = $('#hudClock'), lat = $('#hudLat');
    if (clock) {
      clock.textContent = '2030·' + pad(now.getMonth() + 1) + '·' + pad(now.getDate()) + ' ' +
        pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
    }
    if (lat) lat.textContent = between(0.4, 2.9).toFixed(1) + ' MS';
  }

  function reveals() {
    var items = $$('.rise:not(.in), .era:not(.in)');
    if (!('IntersectionObserver' in window) || reduced) {
      items.forEach(function (n) { n.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (n, i) { n.style.transitionDelay = Math.min(i % 6, 5) * 70 + 'ms'; io.observe(n); });
  }

  function rail() {
    var links = $$('#rail a');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var secs = links.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var idx = secs.indexOf(e.target);
        links.forEach(function (a, i) { a.classList.toggle('on', i === idx); });
      });
    }, { threshold: 0.3 });
    secs.forEach(function (s) { io.observe(s); });
  }

  /* ── Public surface for the page scripts ─────────────────────────── */
  window.SalisOS = {
    reduced: reduced,
    $: $, $$: $$, rand: rand, pick: pick, between: between, pad: pad, esc: esc,
    /** Register work that should run once the cold start has cleared. */
    start: function (fn) { if (booted) fn(); else startFns.push(fn); }
  };

  function boot() {
    injectChrome();
    injectFooter();
    reveals();
    rail();
    hud();
    window.setInterval(hud, 1000);
    coldStart();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
