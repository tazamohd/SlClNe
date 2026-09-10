/* ═══════════════════════════════════════════════════════════════════════
   The Grid page — the supply mesh canvas, the three portals, and two
   synthetic feeds (orders and the print floor).
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var OS = window.SalisOS;
  var $ = OS.$, rand = OS.rand, pick = OS.pick, between = OS.between, pad = OS.pad, reduced = OS.reduced;

  /* ── The mesh: libraries → print core → bays ─────────────────────── */
  var LIBS = ['ALPHA GEOMETRY', 'GULF STRUCTURAL', 'OEM VAULT 7', 'DESERT DRIVETRAIN', 'OPEN LATTICE'];

  function mesh() {
    var cv = $('#meshCanvas'), ctx = cv && cv.getContext('2d');
    if (!ctx) return;
    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function libPos(i) { return [w * 0.14, h * (0.20 + (i / (LIBS.length - 1)) * 0.60)]; }
    function bayPos(i) { return [w * 0.87, h * (0.13 + (i / 8) * 0.74)]; }
    function corePos() { return [w * 0.50, h * 0.50]; }

    var packets = [];
    function spawn() {
      packets.push({
        from: Math.floor(rand() * LIBS.length),
        to: Math.floor(rand() * 9),
        t: 0,
        sp: between(0.30, 0.62),
        pri: rand() < 0.18
      });
      if (packets.length > 14) packets.shift();
    }

    var t0 = performance.now(), lastSpawn = 0;
    function frame(now) {
      var t = (now - t0) / 1000, dt = 1 / 60;
      ctx.clearRect(0, 0, w, h);
      var core = corePos();

      /* Static wiring, so the flow has something to run along. */
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(11,179,255,.13)';
      for (var i = 0; i < LIBS.length; i++) {
        var p = libPos(i);
        ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(core[0], core[1]); ctx.stroke();
      }
      for (var b = 0; b < 9; b++) {
        var q = bayPos(b);
        ctx.beginPath(); ctx.moveTo(core[0], core[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
      }

      if (!reduced && now - lastSpawn > 620) { spawn(); lastSpawn = now; }

      packets.forEach(function (pk) {
        if (pk.t < 2) pk.t = Math.min(2, pk.t + pk.sp * dt * 2.2);
        var col = pk.pri ? '249,115,22' : '11,179,255';
        var a, bb, u;
        if (pk.t <= 1) { a = libPos(pk.from); bb = core; u = pk.t; }
        else { a = core; bb = bayPos(pk.to); u = pk.t - 1; }
        var x = a[0] + (bb[0] - a[0]) * u;
        var y = a[1] + (bb[1] - a[1]) * u;
        var fade = pk.t >= 2 ? 0 : 1;
        if (!fade) return;
        ctx.strokeStyle = 'rgba(' + col + ',.55)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(a[0] + (bb[0] - a[0]) * Math.max(0, u - 0.16),
                   a[1] + (bb[1] - a[1]) * Math.max(0, u - 0.16));
        ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = 'rgba(' + col + ',.95)';
        ctx.beginPath(); ctx.arc(x, y, 2.7, 0, Math.PI * 2); ctx.fill();
      });
      packets = packets.filter(function (pk) { return pk.t < 2; });

      /* Libraries */
      ctx.font = '10px ui-monospace, monospace';
      for (var l = 0; l < LIBS.length; l++) {
        var lp = libPos(l);
        ctx.save(); ctx.translate(lp[0], lp[1]); ctx.rotate(Math.PI / 4);
        ctx.strokeStyle = '#0BB3FF'; ctx.lineWidth = 1.2; ctx.strokeRect(-4, -4, 8, 8);
        ctx.restore();
        if (w > 620) {
          ctx.fillStyle = 'rgba(141,160,184,.8)';
          ctx.textAlign = 'end';
          ctx.fillText(LIBS[l], lp[0] - 12, lp[1] + 3.5);
        }
      }

      /* Print core — a hexagon with a rotating inner ring */
      var r = Math.min(w, h) * 0.075;
      ctx.strokeStyle = 'rgba(11,179,255,.75)'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (var k = 0; k < 6; k++) {
        var ang = (k / 6) * Math.PI * 2 - Math.PI / 2;
        var px = core[0] + Math.cos(ang) * r, py = core[1] + Math.sin(ang) * r;
        if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.stroke();
      ctx.save();
      ctx.translate(core[0], core[1]);
      ctx.rotate(reduced ? 0 : t * 0.9);
      ctx.strokeStyle = 'rgba(249,115,22,.75)';
      ctx.beginPath(); ctx.arc(0, 0, r * 0.52, 0.3, 2.4); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, r * 0.52, 3.4, 5.6); ctx.stroke();
      ctx.restore();
      var glow = ctx.createRadialGradient(core[0], core[1], 0, core[0], core[1], r * 2.4);
      glow.addColorStop(0, 'rgba(11,179,255,.16)');
      glow.addColorStop(1, 'rgba(11,179,255,0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(core[0], core[1], r * 2.4, 0, Math.PI * 2); ctx.fill();
      if (w > 620) {
        ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.textAlign = 'center';
        ctx.fillText('PRINT CORE', core[0], core[1] + r + 20);
      }

      /* Bays */
      for (var n = 0; n < 9; n++) {
        var bp = bayPos(n);
        ctx.save(); ctx.translate(bp[0], bp[1]); ctx.rotate(Math.PI / 4);
        ctx.strokeStyle = 'rgba(11,179,255,.7)'; ctx.lineWidth = 1.1;
        ctx.strokeRect(-3.5, -3.5, 7, 7);
        ctx.restore();
        if (w > 620) {
          ctx.fillStyle = 'rgba(141,160,184,.8)'; ctx.textAlign = 'start';
          ctx.fillText('BAY ' + pad(n + 1), bp[0] + 12, bp[1] + 3.5);
        }
      }

      raf = requestAnimationFrame(frame);
    }

    var raf = 0;
    resize();
    window.addEventListener('resize', resize);
    for (var s = 0; s < 5; s++) spawn();
    if (reduced) { frame(performance.now()); cancelAnimationFrame(raf); }
    else raf = requestAnimationFrame(frame);
  }

  /* ── Three doors ─────────────────────────────────────────────────── */
  var PORTALS = [
    { name: 'The customer door', then: 'Customer app',
      body: 'One life — the vehicle&rsquo;s. Bookings, the estimate waiting for a signature, the ' +
            'service history the customer owns outright, and the invoice they keep after we forget it.',
      sees: ['Their own vehicles and no one else&rsquo;s', 'Estimates, to sign or decline',
             'Appointments and reminders', 'Invoices, held for the vehicle&rsquo;s life'] },
    { name: 'The technician door', then: 'Technician portal',
      body: 'Short, unambiguous instructions on a phone, in Arabic, operable with one hand — because ' +
            'the other one is holding the part. Time clock, the next hour, and nothing about money.',
      sees: ['Only jobs assigned to them', 'Parts request against the job', 'Time clock and attendance',
             'Guides and documentation'] },
    { name: 'The supplier door', then: 'Supplier portal',
      body: 'Geometry in, orders out. A supplier sees the licences drawn against its own library and ' +
            'the orders placed with it — and nothing at all about the workshop beside it.',
      sees: ['Its own orders only', 'Its own catalogue and prices', 'Delivery and licence state',
             'No customer data, ever'] }
  ];

  function portals() {
    $('#portalCards').innerHTML = PORTALS.map(function (p, i) {
      return '<article class="panel card rise">' +
        '<i class="corner tl"></i><i class="corner br"></i>' +
        '<div class="idx"><span>DOOR ' + pad(i + 1) + '</span><b>SCOPED</b></div>' +
        '<h3>' + p.name + '</h3><div class="then">' + p.then + '</div>' +
        '<p>' + p.body + '</p>' +
        '<ul>' + p.sees.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' +
      '</article>';
    }).join('');
  }

  /* ── Synthetic feeds ─────────────────────────────────────────────── */
  var PARTS = [
    ['Drive-unit housing 41-B', 'OEM VAULT 7'], ['Canopy seal, long', 'GULF STRUCTURAL'],
    ['Suspension bush set', 'DESERT DRIVETRAIN'], ['Cell module clamp', 'ALPHA GEOMETRY'],
    ['Sensor mast, survey', 'OPEN LATTICE'], ['Thermal loop coupler', 'GULF STRUCTURAL'],
    ['Lift-pod vane ×4', 'ALPHA GEOMETRY'], ['Brake caliper shell', 'OEM VAULT 7']
  ];
  var STATES = [['Printing', ''], ['Curing', ''], ['Certifying', ''], ['Awaiting approval', 'em'], ['Booked out', '']];
  var NODES = [
    ['Riyadh · Lattice 09', 'Lattice', 9], ['Jeddah · Cell 04', 'Cell', 4], ['Dammam · Cell 11', 'Cell', 3],
    ['NEOM · Cell 01', 'Cell', 6], ['Madinah · Relay', 'Relay', 0], ['Abha · Cell 07', 'Cell', 2],
    ['Tabuk · Relay', 'Relay', 0], ['Hail · Relay', 'Relay', 0], ['Al-Ula · Cell 06', 'Cell', 2],
    ['Empty Quarter · Beacon', 'Beacon', 0], ['Orbital Ring 7 · Uplink', 'Uplink', 1],
    ['Khobar · Cell 12', 'Cell', 3]
  ];

  function orders() {
    var rows = '';
    for (var i = 0; i < 8; i++) {
      var part = PARTS[i], st = STATES[Math.floor(rand() * STATES.length)];
      var node = NODES[Math.floor(rand() * NODES.length)];
      rows += '<tr><th>' + part[0] + '</th>' +
        '<td style="text-align:start">' + part[1] + '</td>' +
        '<td style="text-align:start;color:var(--mist)">' + node[0] + '</td>' +
        '<td class="' + st[1] + '">' + st[0] + '</td>' +
        '<td>' + Math.round(between(4, 58)) + ' min</td></tr>';
    }
    $('#orderRows').innerHTML = rows;
  }

  function printLog() {
    var ul = $('#printLog');
    var LINES = [
      ['Geometry licensed', 'housing 41-B', 0], ['Print started', 'bay 07', 0],
      ['Tolerance check passed', '±0.04 mm', 0], ['PRIORITY — material batch low', 'polymer 9', 1],
      ['Certificate written', 'part 41-B', 0], ['Booked out of stock', 'SAR 1,905.00', 0],
      ['Second signature', 'QC inspector', 0], ['PRIORITY — approval waiting', 'PO 4471', 1],
      ['Library synced', 'ALPHA GEOMETRY', 0], ['Cure complete', 'bay 03', 0]
    ];
    var last = -1;
    function push() {
      var i = Math.floor(rand() * LINES.length);
      if (i === last) i = (i + 1) % LINES.length;
      last = i;
      var e = LINES[i], d = new Date(), li = document.createElement('li');
      if (e[2]) li.className = 'e';
      li.innerHTML = '<time>' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) +
                     '</time><span>' + e[0] + ' <b>' + e[1] + '</b></span>';
      ul.insertBefore(li, ul.firstChild);
      while (ul.children.length > 9) ul.removeChild(ul.lastChild);
    }
    for (var i = 0; i < 9; i++) push();
    if (!reduced) window.setInterval(push, 2800);
  }

  function nodeTable() {
    $('#nodeRows').innerHTML = NODES.map(function (n) {
      var standing = n[1] === 'Relay' || n[1] === 'Beacon' ? 'Holding' : 'Serving';
      return '<tr><th>' + n[0] + '</th>' +
        '<td style="text-align:start">' + n[1] + '</td>' +
        '<td>' + (n[2] || '—') + '</td>' +
        '<td>' + Math.round(between(2, 44)) + '</td>' +
        '<td class="' + (standing === 'Holding' ? 'no' : '') + '">' + standing + '</td></tr>';
    }).join('');
  }

  OS.start(function () { mesh(); portals(); orders(); printLog(); nodeTable(); });
})();
