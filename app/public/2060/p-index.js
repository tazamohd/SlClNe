/* ═══════════════════════════════════════════════════════════════════════
   Arrival page — the scenes that belong to it alone: the hero vehicle,
   the bay lattice, the diagnostic core, the service grid, the chrono rail,
   the ledger hologram and the command deck. Shared chrome lives in os.js.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var OS = window.SalisOS;
  var $ = OS.$, $$ = OS.$$, rand = OS.rand, pick = OS.pick, between = OS.between, pad = OS.pad;
  var reduced = OS.reduced;

  /* ── Substrate telemetry ─────────────────────────────────────────── */
  var METERS = [
    { v: '#rv1', b: '#rb1', lo: 58, hi: 92, unit: '%' },
    { v: '#rv2', b: '#rb2', lo: 41, hi: 78, unit: '%' },
    { v: '#rv3', b: '#rb3', lo: 66, hi: 97, unit: '%' },
    { v: '#rv4', b: '#rb4', lo: 22, hi: 61, unit: '%' }
  ];
  function telemetry() {
    METERS.forEach(function (m) {
      var n = Math.round(between(m.lo, m.hi));
      $(m.v).textContent = n + m.unit;
      $(m.b).style.width = n + '%';
    });
    var coreN = $('#coreN');
    if (coreN) coreN.textContent = between(96.2, 99.4).toFixed(1) + '%';
    $('#mFlow').textContent = Math.round(between(198, 302));
    $('#mTime').innerHTML = Math.round(between(8, 15)) + '<em>min</em>';
  }

  function spectrum() {
    var host = $('#spectrum');
    if (!host.children.length) {
      for (var i = 0; i < 40; i++) host.appendChild(document.createElement('i'));
    }
    Array.prototype.forEach.call(host.children, function (bar, i) {
      var base = Math.sin((i / 40) * Math.PI) * 62;
      bar.style.height = Math.max(3, base * between(0.35, 1.15)) + '%';
    });
  }

  /* ── Bay lattice ─────────────────────────────────────────────────── */
  var BAY_JOBS = [
    ['Drive-unit reseat', 'RUH 4821 · Sedan, printed chassis'],
    ['Cell balance + reflash', 'RUH 1157 · Fleet compact'],
    ['Suspension geometry', 'JED 9930 · Long-haul hauler'],
    ['Canopy seal renewal', 'DMM 2204 · Coastal duty'],
    ['Autonomy stack audit', 'NEO 0071 · Grid shuttle'],
    ['Thermal loop flush', 'RUH 6612 · Desert package'],
    ['Structural print · wing', 'ULA 3390 · Tourism unit'],
    ['Sensor array recalibration', 'TBK 8115 · Survey vehicle'],
    ['Full lifecycle intake', 'RUH 5540 · Walk-in, unidentified']
  ];
  var STATES = ['IN REPAIR', 'QUALITY CONTROL', 'PRINTING PART', 'DIAGNOSING', 'AWAITING SIGNATURE', 'DELIVERING'];

  function bays() {
    var host = $('#bays');
    var html = '';
    for (var i = 0; i < 9; i++) {
      var job = BAY_JOBS[i];
      var alert = (i === 3 || i === 8);
      var state = alert ? (i === 3 ? 'THERMAL DRIFT' : 'IDENTIFYING') : pick(STATES);
      html +=
        '<article class="panel bay rise' + (alert ? ' alert' : '') + '">' +
          '<i class="corner tl"></i><i class="corner br"></i>' +
          '<div class="id"><b>BAY ' + pad(i + 1) + '</b><span>LATTICE 09</span></div>' +
          '<h4>' + job[0] + '</h4>' +
          '<div class="sub">' + job[1] + '</div>' +
          '<div class="state"><i class="dot"></i>' + state + '</div>' +
          '<div class="foot"><span>ETA <b>' + Math.round(between(3, 26)) + ' min</b></span>' +
          '<span>CONF <b>' + between(91, 99.6).toFixed(1) + '%</b></span></div>' +
        '</article>';
    }
    host.innerHTML = html;
  }

  /* ── Diagnostic readout ──────────────────────────────────────────── */
  var DIAG = [
    ['Drive-unit bearing', 'Harmonic drift matched against 1.2 M km of the same unit.', '31 d', false],
    ['Cell pack asymmetry', 'Module 7 charges 40 s behind the pack. Not yet a fault.', 'Watch', false],
    ['Coolant loop', 'Two summers of Riyadh heat. Replace before June.', '92 d', false],
    ['Suspension bush, rear left', 'Road-surface history says the eastern route did this.', 'Now', true],
    ['Autonomy stack', 'Firmware two generations behind the fleet baseline.', 'Now', true]
  ];
  function diag() {
    $('#diagList').innerHTML = DIAG.map(function (d) {
      return '<div><div><div class="t">' + d[0] + '</div><div class="d">' + d[1] + '</div></div>' +
             '<div class="v' + (d[3] ? ' warn' : '') + '">' + d[2] + '</div></div>';
    }).join('');
  }

  /* ── Chrono rail ─────────────────────────────────────────────────── */
  var ERAS = [
    ['2025', 'Shipping today', 'The job card goes digital',
     'Check-in, multi-point inspection, an estimate signed on the customer’s phone, ZATCA Phase 2 e-invoicing, and an audit row for every change. Six stages, in order, each one gating the next.'],
    ['2031', 'Predicted', 'The workshop stops guessing at parts',
     'Stock ordering moves from a minimum level to a forecast: the shelf knows what next month’s bookings will consume before the bookings exist.'],
    ['2038', 'Predicted', 'The vehicle files its own job card',
     'Telemetry arrives ahead of the car. The advisor greets a customer whose estimate is already drafted, priced and waiting for a signature.'],
    ['2044', 'Predicted', 'Parts are printed in the bay',
     'The supplier catalogue becomes a geometry library. Lead time for a housing falls from eleven days to forty minutes, and the purchase order becomes a licence.'],
    ['2051', 'Predicted', 'The bay leaves the building',
     'Mobile service cells dock beside the vehicle overnight. The workshop’s footprint becomes a dispatch radius and the bay board becomes a map.'],
    ['2060', 'You are here', 'The lattice',
     'Nine bays negotiate their own queue. The diagnostic core reads a vehicle’s whole life as one signature. The invoice notarises itself and the customer keeps it. Nobody assigns work; the floor settles it.']
  ];
  function chrono() {
    $('#chronoRail').innerHTML = ERAS.map(function (e, i) {
      return '<article class="era' + (i === ERAS.length - 1 ? ' now' : '') + '">' +
        '<div class="yr">' + e[0] + '<small>' + e[1] + '</small></div>' +
        '<div><h3>' + e[2] + '</h3><p>' + e[3] + '</p></div></article>';
    }).join('');
  }

  /* ── Hero canvas: drifting field + a wireframe service vehicle ───── */
  function heroScene() {
    var cv = $('#heroCanvas'), ctx = cv.getContext('2d');
    if (!ctx) return;
    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

    /* Side profile of a low hovercar, extruded across the width. */
    var PROFILE = [
      [-2.60, 0.05], [-2.20, 0.44], [-0.90, 0.60], [0.20, 0.94], [1.10, 0.97],
      [2.00, 0.58], [2.62, 0.34], [2.72, 0.00], [2.20, -0.34], [0.60, -0.50],
      [-1.40, -0.50], [-2.40, -0.26]
    ];
    var verts = [], edges = [], n = PROFILE.length;
    [-0.95, 0.95].forEach(function (z, side) {
      PROFILE.forEach(function (p) { verts.push([p[0], p[1], z]); });
      for (var i = 0; i < n; i++) edges.push([side * n + i, side * n + ((i + 1) % n)]);
    });
    for (var i = 0; i < n; i += 2) edges.push([i, n + i]);            // rungs

    /* Cockpit ring, then four thruster hoops. */
    var ringStart = verts.length;
    for (var a = 0; a < 14; a++) {
      var th = (a / 14) * Math.PI * 2;
      verts.push([0.55 + Math.cos(th) * 0.62, 0.62 + Math.sin(th) * 0.30, 0]);
    }
    for (var a2 = 0; a2 < 14; a2++) edges.push([ringStart + a2, ringStart + ((a2 + 1) % 14)]);

    [[-1.70, -0.86], [-1.70, 0.86], [1.60, -0.86], [1.60, 0.86]].forEach(function (pod) {
      var s = verts.length;
      for (var k = 0; k < 10; k++) {
        var t = (k / 10) * Math.PI * 2;
        verts.push([pod[0] + Math.cos(t) * 0.40, -0.54, pod[1] + Math.sin(t) * 0.40]);
      }
      for (var k2 = 0; k2 < 10; k2++) edges.push([s + k2, s + ((k2 + 1) % 10)]);
    });

    var stars = [];
    function seedStars() {
      stars.length = 0;
      var count = Math.round(Math.min(190, (w * h) / 9000));
      for (var i = 0; i < count; i++) {
        stars.push({ x: rand() * w, y: rand() * h, r: between(0.4, 1.7), s: between(0.05, 0.34), o: between(0.14, 0.7) });
      }
    }
    function resize() {
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seedStars();
    }

    var stage = $('.hero-stage');
    var pointer = { x: 0, y: 0 };
    window.addEventListener('pointermove', function (e) {
      pointer.x = (e.clientX / window.innerWidth - 0.5);
      pointer.y = (e.clientY / window.innerHeight - 0.5);
    }, { passive: true });

    function project(v, ry, rx, cx, cy, scale) {
      var cosY = Math.cos(ry), sinY = Math.sin(ry);
      var x = v[0] * cosY - v[2] * sinY;
      var z = v[0] * sinY + v[2] * cosY;
      var cosX = Math.cos(rx), sinX = Math.sin(rx);
      var y = v[1] * cosX - z * sinX;
      z = v[1] * sinX + z * cosX;
      var d = 7.4 / (7.4 - z);
      return [cx + x * scale * d, cy - y * scale * d, z];
    }

    var t0 = performance.now();
    function frame(now) {
      var t = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);

      /* Field */
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        s.x -= s.s; if (s.x < -4) { s.x = w + 4; s.y = Math.random() * h; }
        ctx.globalAlpha = s.o;
        ctx.fillStyle = i % 9 === 0 ? '#F97316' : '#0BB3FF';
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      /* Horizon sweep */
      var hy = h * 0.78;
      var sweep = ((t * 0.16) % 1);
      ctx.strokeStyle = 'rgba(11,179,255,.10)'; ctx.lineWidth = 1;
      for (var g = 0; g < 16; g++) {
        var p = ((g / 16) + sweep) % 1;
        var yy = hy + Math.pow(p, 2.4) * (h - hy) * 1.5;
        if (yy > h) continue;
        ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(w, yy); ctx.stroke();
      }

      /* Vehicle — parked on the hero stage, wherever the layout put it. */
      var box = stage ? stage.getBoundingClientRect() : null;
      var cr = cv.getBoundingClientRect();
      var cx = box ? (box.left - cr.left) + box.width / 2 : w * 0.5;
      var cy = box ? (box.top - cr.top) + box.height / 2 : h * 0.5;
      var scale = box ? Math.min(box.width * 0.155, box.height * 0.30) : Math.min(w, h) * 0.10;
      var ry = t * 0.22 + pointer.x * 0.5;
      var rx = -0.16 + Math.sin(t * 0.4) * 0.05 + pointer.y * 0.22;
      var hover = Math.sin(t * 0.9) * scale * 0.05;

      var pts = verts.map(function (v) { return project(v, ry, rx, cx, cy + hover, scale); });

      ctx.lineWidth = 1.3;
      ctx.shadowColor = 'rgba(11,179,255,.85)';
      ctx.shadowBlur = 9;
      for (var e = 0; e < edges.length; e++) {
        var A = pts[edges[e][0]], B = pts[edges[e][1]];
        var depth = (A[2] + B[2]) / 2;
        var alpha = 0.22 + Math.max(0, (depth + 1) / 2) * 0.70;
        ctx.strokeStyle = 'rgba(11,179,255,' + alpha.toFixed(3) + ')';
        ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke();
      }
      ctx.shadowBlur = 0;
      /* Vertices, with one ember node travelling the hull. */
      var live = Math.floor(t * 3) % pts.length;
      for (var v2 = 0; v2 < pts.length; v2++) {
        var P = pts[v2];
        ctx.fillStyle = v2 === live ? '#F97316' : 'rgba(255,255,255,.55)';
        ctx.beginPath(); ctx.arc(P[0], P[1], v2 === live ? 3.2 : 1.2, 0, Math.PI * 2); ctx.fill();
      }
      /* Ground reflection pad */
      var grad = ctx.createRadialGradient(cx, cy + scale * 1.5, 0, cx, cy + scale * 1.5, scale * 2.6);
      grad.addColorStop(0, 'rgba(11,179,255,.16)');
      grad.addColorStop(1, 'rgba(11,179,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.ellipse(cx, cy + scale * 1.55, scale * 2.4, scale * 0.34, 0, 0, Math.PI * 2); ctx.fill();

      raf = requestAnimationFrame(frame);
    }

    var raf = 0;
    resize();
    window.addEventListener('resize', resize);
    if (reduced) { frame(performance.now()); cancelAnimationFrame(raf); }
    else raf = requestAnimationFrame(frame);
  }

  /* ── Fleet canvas: nodes and dispatch arcs ───────────────────────── */
  var NODES = [
    ['RIYADH · LATTICE 09', 0.52, 0.46, 1],
    ['JEDDAH · CELL 04', 0.24, 0.60, 0],
    ['DAMMAM · CELL 11', 0.78, 0.36, 0],
    ['NEOM · CELL 01', 0.14, 0.16, 1],
    ['MADINAH · RELAY', 0.28, 0.42, 0],
    ['ABHA · CELL 07', 0.30, 0.84, 0],
    ['TABUK · RELAY', 0.18, 0.22, 0],
    ['HAIL · RELAY', 0.38, 0.28, 0],
    ['AL-ULA · CELL 06', 0.25, 0.30, 0],
    ['EMPTY QUARTER · BEACON', 0.66, 0.78, 0],
    ['ORBITAL RING 7 · UPLINK', 0.86, 0.12, 1],
    ['KHOBAR · CELL 12', 0.80, 0.44, 0]
  ];

  function fleetScene() {
    var cv = $('#fleetCanvas'), ctx = cv.getContext('2d');
    if (!ctx) return;
    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function P(nd) { return [40 + nd[1] * (w - 80), 34 + nd[2] * (h - 78)]; }

    var arcs = [];
    function spawnArc() {
      var a = Math.floor(rand() * NODES.length), b = Math.floor(rand() * NODES.length);
      if (a === b) return;
      arcs.push({ a: a, b: b, t: 0, fade: 1, sp: between(0.22, 0.46), pri: NODES[a][3] === 1 || NODES[b][3] === 1 });
      if (arcs.length > 8) arcs.shift();
    }

    var t0 = performance.now(), lastSpawn = 0;
    function frame(now) {
      var dt = 1 / 60, t = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);

      /* Abstract territory: a soft polygon, drawn once per frame. */
      ctx.strokeStyle = 'rgba(11,179,255,.16)'; ctx.lineWidth = 1;
      ctx.beginPath();
      var shape = [[0.10, 0.18], [0.42, 0.06], [0.72, 0.14], [0.92, 0.34], [0.86, 0.62],
                   [0.62, 0.88], [0.34, 0.92], [0.16, 0.66], [0.08, 0.40]];
      shape.forEach(function (s, i) {
        var x = 40 + s[0] * (w - 80), y = 34 + s[1] * (h - 78);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.closePath(); ctx.stroke();
      ctx.fillStyle = 'rgba(10,94,215,.06)'; ctx.fill();

      if (!reduced && now - lastSpawn > 900) { spawnArc(); lastSpawn = now; }

      arcs = arcs.filter(function (arc) { return arc.fade > 0.02; });
      arcs.forEach(function (arc) {
        var A = P(NODES[arc.a]), B = P(NODES[arc.b]);
        var mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2 - Math.abs(B[0] - A[0]) * 0.28 - 20;
        if (arc.t < 1) arc.t = Math.min(1, arc.t + arc.sp * dt * 2.4);
        else arc.fade *= reduced ? 1 : 0.955;          // the run lands, then dims out
        var col = arc.pri ? '249,115,22' : '11,179,255';
        var f = arc.fade;

        /* Trail behind the runner, brightest at the head. */
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(' + col + ',' + (0.16 * f).toFixed(3) + ')';
        ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.quadraticCurveTo(mx, my, B[0], B[1]); ctx.stroke();

        function at(u) {
          var iu = 1 - u;
          return [iu * iu * A[0] + 2 * iu * u * mx + u * u * B[0],
                  iu * iu * A[1] + 2 * iu * u * my + u * u * B[1]];
        }
        var tail = Math.max(0, arc.t - 0.26);
        ctx.strokeStyle = 'rgba(' + col + ',' + (0.75 * f).toFixed(3) + ')';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (var q = 0; q <= 10; q++) {
          var pt = at(tail + (arc.t - tail) * (q / 10));
          if (q === 0) ctx.moveTo(pt[0], pt[1]); else ctx.lineTo(pt[0], pt[1]);
        }
        ctx.stroke();

        var head = at(arc.t);
        ctx.fillStyle = 'rgba(' + col + ',' + (0.95 * f).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(head[0], head[1], 2.6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(' + col + ',' + (0.16 * f).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(head[0], head[1], 9, 0, Math.PI * 2); ctx.fill();
      });

      NODES.forEach(function (nd, i) {
        var p = P(nd), pri = nd[3] === 1;
        var puls = pri ? 1 + Math.sin(t * 2 + i) * 0.35 : 1;
        ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(Math.PI / 4);
        ctx.strokeStyle = pri ? '#F97316' : '#0BB3FF'; ctx.lineWidth = 1.2;
        ctx.strokeRect(-3.4, -3.4, 6.8, 6.8);
        ctx.fillStyle = pri ? 'rgba(249,115,22,.9)' : 'rgba(11,179,255,.55)';
        ctx.fillRect(-1.6, -1.6, 3.2, 3.2);
        ctx.restore();
        if (pri) {
          ctx.strokeStyle = 'rgba(249,115,22,' + (0.35 / puls).toFixed(3) + ')';
          ctx.beginPath(); ctx.arc(p[0], p[1], 11 * puls, 0, Math.PI * 2); ctx.stroke();
        }
        if (w > 620) {
          ctx.font = '9px ui-monospace, monospace';
          ctx.fillStyle = 'rgba(141,160,184,.75)';
          ctx.fillText(nd[0], p[0] + 10, p[1] + 3);
        }
      });

      raf = requestAnimationFrame(frame);
    }

    var raf = 0;
    resize();
    window.addEventListener('resize', resize);
    for (var s = 0; s < 4; s++) spawnArc();
    if (reduced) { frame(performance.now()); cancelAnimationFrame(raf); }
    else raf = requestAnimationFrame(frame);
  }

  /* ── Dispatch log ────────────────────────────────────────────────── */
  var EVENTS = [
    ['Cell dispatched to', 'RUH 4821', 0], ['Overnight dock confirmed', 'JED 9930', 0],
    ['Signature captured en route', 'DMM 2204', 0], ['Part printed in transit', 'housing 41-B', 0],
    ['PRIORITY — thermal drift', 'bay 04', 1], ['Bay negotiation settled', 'bay 07 wins', 0],
    ['Ledger notarised', 'SAR 4,182.00', 0], ['Walk-in identified', 'RUH 5540', 0],
    ['PRIORITY — autonomy stack behind', 'NEO 0071', 1], ['Node handshake', 'ORBITAL RING 7', 0],
    ['Customer took delivery', 'RUH 1157', 0], ['Forecast reorder placed', '18 SKUs', 0]
  ];
  function logStream() {
    var ul = $('#logList'), last = -1;
    function push() {
      var idx = Math.floor(rand() * EVENTS.length);
      if (idx === last) idx = (idx + 1) % EVENTS.length;
      last = idx;
      var e = EVENTS[idx];
      var li = document.createElement('li');
      if (e[2]) li.className = 'e';
      var d = new Date();
      li.innerHTML = '<time>' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) +
                     '</time><span>' + e[0] + ' <b>' + e[1] + '</b></span>';
      ul.insertBefore(li, ul.firstChild);
      while (ul.children.length > 9) ul.removeChild(ul.lastChild);
    }
    for (var i = 0; i < 9; i++) push();
    if (!reduced) window.setInterval(push, 2600);
  }

  /* ── Ledger hologram tilt ────────────────────────────────────────── */
  function holoTilt() {
    var card = $('#holo'), stage = card.parentNode;
    function reset() { card.style.transform = 'rotateX(0deg) rotateY(0deg)'; }
    if (reduced) { reset(); return; }
    stage.addEventListener('pointermove', function (e) {
      var r = stage.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = 'rotateY(' + (px * 17).toFixed(2) + 'deg) rotateX(' + (-py * 13).toFixed(2) + 'deg)';
    }, { passive: true });
    stage.addEventListener('pointerleave', reset);
    window.setInterval(function () {
      var hex = '0123456789ABCDEF', out = [];
      for (var g = 0; g < 3; g++) {
        var s = '';
        for (var i = 0; i < 4; i++) s += hex[Math.floor(rand() * 16)];
        out.push(s);
      }
      $('#holoHash').textContent = out.join('·');
    }, 3400);
  }

  /* ── Command deck ────────────────────────────────────────────────── */
  var out = $('#deckOut');
  function say(html, cls) {
    var line = document.createElement('div');
    if (cls) line.className = cls;
    line.innerHTML = html;
    out.appendChild(line);
    out.scrollTop = out.scrollHeight;
  }

  var COMMANDS = {
    help: function () {
      say('<u>Known commands</u>');
      say('  <b>status</b>    lattice health, one line per subsystem');
      say('  <b>bays</b>      what all nine bays are doing right now');
      say('  <b>fleet</b>     node roll-call across the service grid');
      say('  <b>diag</b>      run the diagnostic core against a vehicle');
      say('  <b>ledger</b>    open the last notarised invoice');
      say('  <b>warp</b>      travel the chrono rail — try <b>warp 2038</b>');
      say('  <b>whoami</b>    your standing in the lattice');
      say('  <b>salis</b>     what this actually is');
      say('  <b>clear</b>     wipe the console');
    },
    status: function () {
      say('<u>LATTICE 09 — RIYADH</u>');
      say('  neural bays .......... <b>9/9 online</b>');
      say('  diagnostic core ...... <b>' + between(96.2, 99.4).toFixed(1) + '% confidence</b>');
      say('  service grid ......... <b>' + (28 + Math.floor(rand() * 6)) + ' nodes reachable</b>');
      say('  chrono-ledger ........ <b>notary chain intact</b>');
      say('  thermal envelope ..... <s>bay 04 drifting, within tolerance</s>');
    },
    bays: function () {
      $$('#bays .bay').forEach(function (b, i) {
        var name = $('h4', b).textContent, state = $('.state', b).textContent.trim();
        var alert = b.classList.contains('alert');
        say('  BAY ' + pad(i + 1) + '  ' + (alert ? '<s>' + state + '</s>' : '<b>' + state + '</b>') + '  —  ' + name);
      });
    },
    fleet: function () {
      NODES.forEach(function (nd) {
        say('  ' + (nd[3] ? '<s>◆</s>' : '<b>◆</b>') + '  ' + nd[0] +
            '  <b>' + Math.round(between(2, 40)) + '</b> units in flow');
      });
    },
    diag: function (arg) {
      var plate = (arg || 'RUH 4821').toUpperCase();
      say('▸ collapsing lifetime telemetry for <u>' + plate + '</u> …');
      DIAG.forEach(function (d) {
        say('  ' + (d[3] ? '<s>' : '<b>') + d[2] + (d[3] ? '</s>' : '</b>') + '  ' + d[0] + ' — ' + d[1]);
      });
      say('  signature confidence <b>' + between(96.2, 99.4).toFixed(1) + '%</b>');
    },
    ledger: function () {
      say('<u>INVOICE · ZATCA PHASE ∞ · NOTARISED 2060-03-14</u>');
      say('  bay 07, 11 min ....................... <b>SAR 1,240.00</b>');
      say('  printed cell · drive unit housing .... <b>SAR 1,905.00</b>');
      say('  core diagnosis ....................... <b>SAR   402.00</b>');
      say('  VAT 15% .............................. <b>SAR   635.00</b>');
      say('  total ................................ <b>SAR 4,182.00</b>');
      say('  notary chain <b>' + $('#holoHash').textContent + '</b> — held by the customer, not by us');
    },
    warp: function (arg) {
      var y = parseInt(arg, 10);
      var era = null;
      ERAS.forEach(function (e) { if (parseInt(e[0], 10) === y) era = e; });
      if (!era) {
        say('<s>no waypoint at ' + (arg || '—') + '.</s> the rail stops at: ' +
            ERAS.map(function (e) { return '<b>' + e[0] + '</b>'; }).join(', '));
        return;
      }
      say('▸ warping to <u>' + era[0] + '</u> — ' + era[1].toLowerCase());
      say('  <b>' + era[2] + '</b>');
      say('  ' + era[3]);
      document.getElementById('chrono').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    },
    whoami: function () {
      say('  visitor · <b>unauthenticated</b> · read-only');
      say('  the lattice has no record of you, which in 2060 is a compliment.');
    },
    salis: function () {
      say('<u>What this page actually is</u>');
      say('  A speculative design study for SALIS AUTO — an integrated automotive');
      say('  workshop system: scheduling, job cards, inspections, estimates, parts,');
      say('  ZATCA e-invoicing, CRM, HR and portals. That product is real and ships today.');
      say('  <s>Everything dated after 2025 on this page is invented.</s>');
      say('  The real site: <b>../../public-portal/landing</b>');
    },
    clear: function () { out.innerHTML = ''; }
  };
  COMMANDS.ls = COMMANDS.help;
  COMMANDS['?'] = COMMANDS.help;

  function runCommand(raw) {
    var input = raw.trim();
    if (!input) return;
    say('<span class="you">▸ ' + input.replace(/[<>&]/g, '') + '</span>');
    var parts = input.split(/\s+/);
    var cmd = parts.shift().toLowerCase();
    var arg = parts.join(' ');
    if (COMMANDS[cmd]) COMMANDS[cmd](arg);
    else say('<s>' + cmd + ': not a command in this lattice.</s> try <b>help</b>.');
    say('');
  }

  function deck() {
    say('SALIS GARAGE OS v20.60.3 — local shell.');
    say('No network, no backend, no vehicle data. Type <b>help</b>.');
    say('');
    $('#deckForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var el = $('#deckInput');
      runCommand(el.value);
      el.value = '';
    });
    var chips = ['help', 'status', 'bays', 'fleet', 'diag RUH 4821', 'warp 2038', 'salis'];
    $('#chips').innerHTML = chips.map(function (c) {
      return '<button class="chip" type="button" data-cmd="' + c + '">' + c + '</button>';
    }).join('');
    $$('#chips .chip').forEach(function (b) {
      b.addEventListener('click', function () { runCommand(b.getAttribute('data-cmd')); });
    });
  }

  /* ── Ignition ────────────────────────────────────────────────────── */
  OS.start(function () {
    bays(); diag(); chrono();
    telemetry(); spectrum();
    logStream(); deck(); holoTilt();
    heroScene(); fleetScene();

    $('#ctaEnter').addEventListener('click', function () {
      document.getElementById('lattice').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    });

    if (!reduced) {
      window.setInterval(telemetry, 3200);
      window.setInterval(spectrum, 260);
    }
  });
})();
