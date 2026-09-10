/* ═══════════════════════════════════════════════════════════════════════
   SALIS AUTO // GARAGE OS 2060 — shared runtime.

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
  var rand = rng(20600314);
  function pick(list) { return list[Math.floor(rand() * list.length)]; }
  function between(lo, hi) { return lo + rand() * (hi - lo); }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function esc(str) { return String(str).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
  }); }

  /* ── The site ────────────────────────────────────────────────────── */
  var PAGES = [
    { file: 'index.html',   nav: 'Arrival', note: 'The lattice, and what it feels like to stand in it' },
    { file: 'system.html',  nav: 'System',  note: 'Thirteen subsystems, and what each one is today' },
    { file: 'grid.html',    nav: 'Grid',    note: 'Parts, printing, portals and the service mesh' },
    { file: 'access.html',  nav: 'Access',  note: 'What a cycle costs and what comes with it' },
    { file: 'origin.html',  nav: 'Origin',  note: 'Who builds this, what they believe, who they need' },
    { file: 'channel.html', nav: 'Channel', note: 'Open a channel — a demo, a question, a bay' }
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
      '<a class="brand" href="index.html" aria-label="SALIS AUTO — Garage OS 2060 home">' +
        '<img src="../assets/logo-blue-orange.png" alt="" />' +
        '<b>SALIS&nbsp;AUTO</b><span class="opt">/ OS 2060</span>' +
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
                     '<span>SPECULATIVE BUILD — NOT A PRODUCT CLAIM</span>';
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
          '<li><a href="index.html#chrono">2025 → 2060</a></li>' +
        '</ul></div>' +
        '<div><h5>Standing</h5><ul>' +
          '<li><a href="origin.html#principles">What we believe</a></li>' +
          '<li><a href="origin.html#roles">Open roles</a></li>' +
          '<li><a href="channel.html">Open a channel</a></li>' +
        '</ul></div>' +
      '</div>' +
      '<div class="big">END OF TRANSMISSION</div>' +
      '<p class="note">SALIS AUTO — GARAGE OS 2060 · A SPECULATIVE DESIGN STUDY</p>' +
      '<p class="disclaimer">Everything dated after 2025 on this site is invented for the purpose of the ' +
      'study — the bays, the grid, the figures, the year. What is real is the product underneath it and ' +
      'the shape of the work: check-in, inspection, estimate, repair, quality control, delivery. That ' +
      'order has not changed in a hundred years, and nothing here claims it will.</p>';
    document.body.appendChild(f);
  }

  /* ── Cold start ──────────────────────────────────────────────────── */
  var BOOT = [
    ['SALIS GARAGE OS', 'v20.60.3 — lattice kernel'],
    ['mounting bay substrate', 'ok'],
    ['negotiating with 9 neural bays', 'quorum reached'],
    ['spooling diagnostic core', '4.1 PFLOP reserved'],
    ['syncing chrono-ledger', 'notary chain intact'],
    ['handshake · autonomous service grid', '31 nodes'],
    ['restoring technician profiles', '48 signatures'],
    ['calibrating thermal envelope', 'nominal'],
    ['WARN thermal drift · bay 04', 'within tolerance'],
    ['lattice online', 'welcome back']
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
    if (reduced) { logEl.textContent = 'SALIS GARAGE OS v20.60.3 — lattice online.'; endBoot(); return; }

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
      clock.textContent = '2060·' + pad(now.getMonth() + 1) + '·' + pad(now.getDate()) + ' ' +
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
