/* SALIS AUTO scenes: three lazy Three.js scenes (hero constellation, lifecycle rail,
 * ZATCA invoice). Loads the vendored Three only when a scene is near the viewport,
 * motion is allowed, the viewport is wide, and WebGL exists. Otherwise the static
 * SVG and HTML fallbacks in the markup stay exactly as they are. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var containers = [].slice.call(doc.querySelectorAll('.scene[data-scene]'));
  if (!containers.length) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || window.innerWidth < 860 || !('IntersectionObserver' in window) || !hasGL()) return;

  var me = doc.currentScript;
  var SRC = (me && me.dataset.three) || 'assets/vendor/three.min.js';
  var C = { navy: 0x0B1F3B, navy2: 0x1E3A5F, blue: 0x0A5ED7, bright: 0x0BB3FF, orange: 0xF97316, white: 0xFFFFFF };
  var rtl = function () { return root.dir === 'rtl'; };
  var pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', function (e) {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  function hasGL() {
    try { var c = doc.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl'))); } catch (e) { return false; }
  }
  function cssVar(name, fallback) {
    var v = getComputedStyle(root).getPropertyValue(name).trim();
    return v ? parseInt(v.replace('#', ''), 16) : fallback;
  }
  function seeded(seed) { return function () { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }; }

  /* The brand trace: horizontal, one 45 degree diagonal, horizontal. Shared by S1 and S4. */
  function rightAngle(T, a, b) {
    var dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
    var diag = Math.min(Math.abs(dy), Math.abs(dx) * 0.6);
    var x1 = a.x + (dx - Math.sign(dx) * diag) * 0.5;
    var p1 = new T.Vector3(x1, a.y, a.z + dz * 0.3);
    var p2 = new T.Vector3(x1 + Math.sign(dx) * diag, a.y + Math.sign(dy) * diag, a.z + dz * 0.7);
    var p3 = new T.Vector3(b.x, p2.y, b.z);
    var path = new T.CurvePath();
    path.add(new T.LineCurve3(a, p1)); path.add(new T.LineCurve3(p1, p2)); path.add(new T.LineCurve3(p2, p3));
    if (Math.abs(p3.y - b.y) > 0.01) path.add(new T.LineCurve3(p3, b));
    return path;
  }
  function traceMaterial(T, color, opacity) { return new T.MeshBasicMaterial({ color: color, transparent: true, opacity: opacity == null ? 0.85 : opacity }); }

  var loading = null;
  function loadThree() {
    if (window.THREE) return Promise.resolve();
    if (loading) return loading;
    loading = new Promise(function (res, rej) {
      var s = doc.createElement('script'); s.src = SRC; s.async = true;
      s.onload = res; s.onerror = rej; doc.head.appendChild(s);
    });
    return loading;
  }

  /* One renderer per scene; render only while visible and the tab is shown. */
  function stage(el, build) {
    var T = window.THREE;
    var renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);
    var scene = new T.Scene();
    var cam = new T.PerspectiveCamera(42, 1, 0.1, 100);
    var api = { T: T, scene: scene, cam: cam, el: el, renderer: renderer, w: 1, h: 1, t: 0 };
    var tick = build(api);
    var visible = false, raf = 0, last = 0;
    function size() {
      var w = el.clientWidth || 1, h = el.clientHeight || 1;
      api.w = w; api.h = h;
      renderer.setSize(w, h, false);
      cam.aspect = w / h; cam.updateProjectionMatrix();
    }
    function frame(now) {
      raf = 0;
      if (!visible || doc.hidden) return;
      var dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016; last = now;
      api.t += dt;
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      tick(dt, pointer);
      renderer.render(scene, cam);
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!raf && visible && !doc.hidden) { last = 0; raf = requestAnimationFrame(frame); } }
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; start(); }, { threshold: 0 }).observe(el.parentElement || el);
    doc.addEventListener('visibilitychange', start);
    el.parentElement.classList.add('has-scene');
    if ('ResizeObserver' in window) new ResizeObserver(size).observe(el); else window.addEventListener('resize', size);
    size();
    return api;
  }

  /* ---------- scene 1: the circuit constellation behind the hero ---------- */
  function hero(api) {
    var T = api.T, S = api.scene, rnd = seeded(7);
    api.cam.position.set(0, 0, 30);
    S.fog = new T.Fog(C.navy, 20, 46);
    var g = new T.Group(); S.add(g);
    var nodes = [], pts = [];
    var cols = 9, rows = 5;
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      if (rnd() < 0.2) continue;
      var p = new T.Vector3((c - (cols - 1) / 2) * 5 + (rnd() - 0.5) * 2.2, (r - (rows - 1) / 2) * 4.2 + (rnd() - 0.5) * 1.6, (rnd() - 0.5) * 10);
      pts.push(p);
    }
    var sphere = new T.SphereGeometry(0.24, 12, 12);
    var mats = { blue: new T.MeshBasicMaterial({ color: C.blue }), bright: new T.MeshBasicMaterial({ color: C.bright }), orange: new T.MeshBasicMaterial({ color: C.orange }) };
    pts.forEach(function (p, i) {
      var m = rnd() < 0.12 ? mats.orange : (rnd() < 0.5 ? mats.bright : mats.blue);
      var mesh = new T.Mesh(sphere, m); mesh.position.copy(p); g.add(mesh); nodes.push(mesh);
    });
    /* Right-angled traces: horizontal, a 45 degree diagonal, horizontal. */
    var paths = [];
    function trace(a, b, color) {
      var path = rightAngle(T, a, b);
      g.add(new T.Mesh(new T.TubeGeometry(path, 24, 0.055, 5, false), traceMaterial(T, color)));
      paths.push(path);
    }
    var used = {};
    pts.forEach(function (p, i) {
      var best = [];
      pts.forEach(function (q, j) { if (i !== j) best.push([p.distanceTo(q), j]); });
      best.sort(function (u, v) { return u[0] - v[0]; });
      for (var k = 0; k < 2 && k < best.length; k++) {
        var j = best[k][1], key = Math.min(i, j) + ':' + Math.max(i, j);
        if (used[key] || best[k][0] > 9) continue; used[key] = 1;
        trace(p, pts[j], rnd() < 0.15 ? C.orange : (rnd() < 0.5 ? C.bright : C.blue));
      }
    });
    /* Particles that travel the traces. */
    var N = Math.min(90, paths.length * 2), pos = new Float32Array(N * 3), state = [];
    for (var i = 0; i < N; i++) state.push({ p: paths[i % paths.length], t: rnd(), v: 0.05 + rnd() * 0.07 });
    var geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3));
    var dots = new T.Points(geo, new T.PointsMaterial({ color: C.white, size: 0.22, transparent: true, opacity: 0.9, sizeAttenuation: true }));
    g.add(dots);
    var tmp = new T.Vector3();
    return function (dt, ptr) {
      for (var i = 0; i < N; i++) {
        var s = state[i]; s.t += s.v * dt; if (s.t > 1) { s.t = 0; s.p = paths[Math.floor(rnd() * paths.length)]; }
        s.p.getPoint(s.t, tmp); pos[i * 3] = tmp.x; pos[i * 3 + 1] = tmp.y; pos[i * 3 + 2] = tmp.z;
      }
      geo.attributes.position.needsUpdate = true;
      var dir = rtl() ? -1 : 1;
      g.scale.x = dir;
      g.rotation.y += ((ptr.x * 0.16 * dir + Math.sin(api.t * 0.15) * 0.05) - g.rotation.y) * 0.05;
      g.rotation.x += ((-ptr.y * 0.1 + Math.sin(api.t * 0.11) * 0.03) - g.rotation.x) * 0.05;
      g.position.y = Math.sin(api.t * 0.3) * 0.5;
      g.position.x = (rtl() ? -3 : 3) + Math.cos(api.t * 0.2) * 0.4;
    };
  }

  /* ---------- scene 2: the six-stage rail in depth, driven by scroll ---------- */
  function rail(api) {
    var T = api.T, S = api.scene, el = api.el;
    api.cam.position.set(0, 2.6, 7.4); api.cam.lookAt(0, 0.35, 0);
    var g = new T.Group(); S.add(g);
    var stagesEl = el.parentElement.querySelectorAll('.rail6 a');
    var n = stagesEl.length || 6, pts = [];
    for (var i = 0; i < n; i++) pts.push(new T.Vector3((i - (n - 1) / 2) * 4.2, 0, Math.sin(i / (n - 1) * Math.PI) * 2.4 - 1.2));
    var curve = new T.CatmullRomCurve3(pts, false, 'catmullrom', 0.4);
    var card = cssVar('--card', 0xFFFFFF);
    g.add(new T.Mesh(new T.TubeGeometry(curve, 96, 0.06, 6, false), new T.MeshBasicMaterial({ color: C.blue })));
    var ringGeo = new T.TorusGeometry(0.42, 0.08, 8, 28), nodeGeo = new T.SphereGeometry(0.3, 14, 14);
    var nodeM = pts.map(function (p, i) {
      var col = i === n - 1 ? C.orange : (i === n - 2 ? C.bright : C.blue);
      var m = new T.Mesh(nodeGeo, new T.MeshBasicMaterial({ color: col })); m.position.copy(p); g.add(m);
      var ring = new T.Mesh(ringGeo, new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.35 })); ring.position.copy(p); ring.rotation.x = Math.PI / 2; g.add(ring);
      return m;
    });
    /* The job-card token: a slab with a blue rim. */
    var token = new T.Group();
    token.add(new T.Mesh(new T.BoxGeometry(1.9, 1.2, 0.14), new T.MeshBasicMaterial({ color: C.blue })));
    var face = new T.Mesh(new T.BoxGeometry(1.7, 1.0, 0.16), new T.MeshBasicMaterial({ color: card })); token.add(face);
    var bar = new T.Mesh(new T.BoxGeometry(1.7, 0.28, 0.18), new T.MeshBasicMaterial({ color: C.navy })); bar.position.y = 0.36; token.add(bar);
    [0.05, -0.15].forEach(function (y, i) { var l = new T.Mesh(new T.BoxGeometry(1.1 - i * 0.4, 0.07, 0.18), new T.MeshBasicMaterial({ color: 0xC3CBD6 })); l.position.set(-0.2 - i * 0.2, y, 0); token.add(l); });
    var dot = new T.Mesh(new T.SphereGeometry(0.09, 8, 8), new T.MeshBasicMaterial({ color: C.orange })); dot.position.set(0.62, -0.28, 0.1); token.add(dot);
    g.add(token);
    var driver = (el.dataset.driver && doc.querySelector(el.dataset.driver)) || el.parentElement;
    var prog = 0, target = 0, active = -1, tangent = new T.Vector3(), at = new T.Vector3();
    function progress() {
      var r = driver.getBoundingClientRect(), vh = window.innerHeight;
      var span = r.height + vh * 0.35;
      target = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / span));
    }
    window.addEventListener('scroll', progress, { passive: true }); progress();
    return function (dt, ptr) {
      prog += (target - prog) * 0.08;
      var p = Math.max(0.001, Math.min(0.999, prog));
      curve.getPointAt(p, at); curve.getTangentAt(p, tangent);
      token.position.set(at.x, at.y + 1.05 + Math.sin(api.t * 2) * 0.06, at.z);
      token.rotation.y = Math.atan2(tangent.x, tangent.z) - Math.PI / 2 + ptr.x * 0.15;
      token.rotation.x = -0.15 + ptr.y * 0.08;
      var idx = Math.round(p * (n - 1));
      if (idx !== active) {
        active = idx;
        for (var i = 0; i < stagesEl.length; i++) stagesEl[i].classList.toggle('is-active', i === idx);
        nodeM.forEach(function (m, i) { m.scale.setScalar(i === idx ? 1.45 : 1); });
      }
      g.scale.x = rtl() ? -1 : 1;
      g.rotation.y += ((ptr.x * 0.05) - g.rotation.y) * 0.05;
    };
  }

  /* ---------- scene 3: the ZATCA invoice card and its hash chain ---------- */
  function invoice(api) {
    var T = api.T, S = api.scene, el = api.el;
    api.cam.position.set(0, 0.6, 15);
    var g = new T.Group(); S.add(g);
    var cardCol = cssVar('--card', 0xFFFFFF);
    var card = new T.Group(); g.add(card);
    card.add(new T.Mesh(new T.BoxGeometry(6, 8.2, 0.16), new T.MeshBasicMaterial({ color: cardCol })));
    var bevel = new T.Mesh(new T.BoxGeometry(6.12, 8.32, 0.1), new T.MeshBasicMaterial({ color: 0xC3CBD6 })); bevel.position.z = -0.04; card.add(bevel);
    var head = new T.Mesh(new T.BoxGeometry(6, 1.1, 0.18), new T.MeshBasicMaterial({ color: C.navy })); head.position.set(0, 3.55, 0); card.add(head);
    var lineM = new T.MeshBasicMaterial({ color: 0xD9DFE7 });
    for (var i = 0; i < 6; i++) { var l = new T.Mesh(new T.BoxGeometry(2.4 - (i % 2) * 0.6, 0.12, 0.18), lineM); l.position.set(-1.6 + (i % 2) * 0.3, 2.3 - i * 0.55, 0); card.add(l); }
    var total = new T.Mesh(new T.BoxGeometry(5.2, 0.6, 0.18), new T.MeshBasicMaterial({ color: 0xE9EEF4 })); total.position.set(0, -3.4, 0); card.add(total);
    /* QR block: a deterministic module pattern drawn to a canvas texture. */
    var cv = doc.createElement('canvas'); cv.width = cv.height = 128; var ctx = cv.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 128, 128); ctx.fillStyle = '#0B1F3B';
    var rnd = seeded(42), m = 21, cell = 128 / (m + 2);
    for (var y = 0; y < m; y++) for (var x = 0; x < m; x++) { var finder = (x < 7 && y < 7) || (x >= m - 7 && y < 7) || (x < 7 && y >= m - 7); var on = finder ? ((x % 6 === 0 || y % 6 === 0 || (x % 6 >= 2 && x % 6 <= 4 && y % 6 >= 2 && y % 6 <= 4)) && x < 7 + (x >= m - 7 ? m : 0)) : rnd() < 0.45; if (on) ctx.fillRect((x + 1) * cell, (y + 1) * cell, cell - 0.4, cell - 0.4); }
    var qr = new T.Mesh(new T.PlaneGeometry(2.2, 2.2), new T.MeshBasicMaterial({ map: new T.CanvasTexture(cv) })); qr.position.set(1.6, 0.9, 0.1); card.add(qr);
    /* The hash chain behind: blocks and links that light in sequence on scroll. */
    var blocks = [], links = [], nb = 6;
    for (var b = 0; b < nb; b++) {
      var bm = new T.Mesh(new T.BoxGeometry(1.3, 0.9, 0.7), new T.MeshBasicMaterial({ color: C.navy2 }));
      bm.position.set(-7.5 + b * 3, -1.2 + Math.sin(b * 0.9) * 0.6, -5 - b * 0.35); g.add(bm); blocks.push(bm);
      if (b) { var lk = new T.Mesh(new T.BoxGeometry(1.7, 0.1, 0.1), new T.MeshBasicMaterial({ color: C.navy2 })); lk.position.set(bm.position.x - 1.5, bm.position.y - Math.sin(b * 0.9 - 0.9) * 0.3 + Math.sin(b * 0.9) * 0.3 - 0.0, bm.position.z + 0.17); lk.position.y = (bm.position.y + blocks[b - 1].position.y) / 2; lk.rotation.z = Math.atan2(bm.position.y - blocks[b - 1].position.y, 3); g.add(lk); links.push(lk); }
    }
    var driver = (el.dataset.driver && doc.querySelector(el.dataset.driver)) || el.closest('section') || el.parentElement;
    var target = 0, prog = 0, lit = -1;
    function progress() { var r = driver.getBoundingClientRect(), vh = window.innerHeight; target = Math.max(0, Math.min(1, (vh * 0.9 - r.top) / (r.height + vh * 0.6))); }
    window.addEventListener('scroll', progress, { passive: true }); progress();
    return function (dt, ptr) {
      prog += (target - prog) * 0.08;
      var idx = Math.floor(prog * (nb + 0.999)) - 1;
      if (idx !== lit) {
        lit = idx;
        blocks.forEach(function (bm, i) { bm.material.color.setHex(i <= idx ? (i === idx ? C.bright : C.blue) : C.navy2); });
        links.forEach(function (lk, i) { lk.material.color.setHex(i < idx ? C.bright : C.navy2); });
      }
      card.rotation.y += ((Math.sin(api.t * 0.35) * 0.32 + ptr.x * 0.25) - card.rotation.y) * 0.06;
      card.rotation.x += ((ptr.y * -0.12) - card.rotation.x) * 0.06;
      card.position.y = Math.sin(api.t * 0.8) * 0.12;
      g.scale.x = rtl() ? -1 : 1;
    };
  }

  /* ---------- scene 4: the region as a dotted map; Riyadh first, then the Kingdom, the Gulf, the region ---------- */
  function map(api) {
    var T = api.T, S = api.scene, el = api.el;
    var data = JSON.parse(el.dataset.map || '{}');
    var polys = data.polys || [], cities = data.cities || [], step = data.step || 0.9;
    var cx = 45, cy = 26, k = 0.34; /* degrees to world units */
    var X = function (lon) { return (lon - cx) * k; }, Y = function (lat) { return (lat - cy) * k; };
    function inside(poly, x, y) { var r = false; for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) { var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) r = !r; } return r; }
    api.cam.position.set(0, 0.6, 17); api.cam.lookAt(0, 0, 0);
    S.fog = new T.Fog(C.navy, 15, 32);
    var mapG = new T.Group(); S.add(mapG);
    mapG.rotation.x = -0.3;
    var pts = [];
    for (var lat = 12; lat <= 38; lat += step) for (var lon = 24; lon <= 62; lon += step) {
      for (var p = 0; p < polys.length; p++) if (inside(polys[p], lon, lat)) { pts.push(X(lon), Y(lat), 0); break; }
    }
    var pg = new T.BufferGeometry(); pg.setAttribute('position', new T.BufferAttribute(new Float32Array(pts), 3));
    mapG.add(new T.Points(pg, new T.PointsMaterial({ color: C.blue, size: 0.13, transparent: true, opacity: 0.55, sizeAttenuation: true })));
    var byName = {}, nodes = [];
    var nodeGeo = new T.SphereGeometry(0.16, 10, 10);
    cities.forEach(function (c) {
      var v = new T.Vector3(X(c[1]), Y(c[2]), 0.02);
      var mesh = new T.Mesh(nodeGeo, new T.MeshBasicMaterial({ color: c[3] === 0 ? C.orange : (c[3] === 3 ? C.bright : C.blue), transparent: true, opacity: c[3] === 0 ? 1 : 0.15 }));
      mesh.position.copy(v); mesh.scale.setScalar(c[3] === 0 ? 1.6 : 0.8); mapG.add(mesh);
      var halo = new T.Mesh(new T.RingGeometry(0.28, 0.36, 24), new T.MeshBasicMaterial({ color: C.orange, transparent: true, opacity: c[3] === 0 ? 0.6 : 0, side: T.DoubleSide }));
      halo.position.copy(v); mapG.add(halo);
      byName[c[0]] = { v: v, ring: c[3], mesh: mesh, halo: halo }; nodes.push(byName[c[0]]);
    });
    var traces = [];
    (data.links || []).forEach(function (l) {
      var a = byName[l[0]], b = byName[l[1]]; if (!a || !b) return;
      var path = rightAngle(T, a.v, b.v);
      var col = b.ring === 3 ? C.bright : (b.ring === 1 ? C.orange : C.bright);
      var m = traceMaterial(T, col, 0); var mesh = new T.Mesh(new T.TubeGeometry(path, 20, 0.04, 5, false), m); mapG.add(mesh);
      traces.push({ ring: b.ring, mat: m, max: b.ring === 3 ? 0.35 : 0.85, path: path });
    });
    /* Travelling points on lit traces. */
    var N = 60, pos = new Float32Array(N * 3), state = [], tmp = new T.Vector3();
    for (var i = 0; i < N; i++) state.push({ i: i % Math.max(1, traces.length), t: Math.random(), v: 0.08 + Math.random() * 0.1 });
    var dg = new T.BufferGeometry(); dg.setAttribute('position', new T.BufferAttribute(pos, 3));
    mapG.add(new T.Points(dg, new T.PointsMaterial({ color: C.white, size: 0.16, transparent: true, opacity: 0.9 })));
    /* Three orbiting capability nodes around the HTML slab, in front of the map. */
    var orbit = new T.Group(); S.add(orbit);
    var orbs = [C.bright, C.blue, C.orange].map(function (col, i) { var m = new T.Mesh(new T.SphereGeometry(0.13, 12, 12), new T.MeshBasicMaterial({ color: col })); orbit.add(m); return m; });
    var ringMesh = new T.Mesh(new T.TorusGeometry(1.5, 0.012, 6, 80), new T.MeshBasicMaterial({ color: C.bright, transparent: true, opacity: 0.35 })); orbit.add(ringMesh);
    var driver = (el.dataset.driver && doc.querySelector(el.dataset.driver)) || el.closest('section') || el.parentElement;
    var target = 0, prog = 0;
    function progress() { var r = driver.getBoundingClientRect(), vh = window.innerHeight; target = Math.max(0, Math.min(1, (vh * 0.95 - r.top) / (r.height * 0.9))); }
    window.addEventListener('scroll', progress, { passive: true }); progress();
    var ringAt = [0, 0.22, 0.5, 0.78];
    return function (dt, ptr) {
      prog += (target - prog) * 0.06;
      var halfH = api.cam.position.z * Math.tan(0.3665), halfW = halfH * (api.w / api.h);
      var side = rtl() ? -1 : 1;
      mapG.position.x = -side * halfW * 0.18; mapG.position.y = 0.2;
      orbit.position.set(side * halfW * 0.58, 0.1, 3);
      orbit.rotation.x = 1.15; orbit.rotation.z = -0.25 * side;
      var a = api.t * 0.55;
      orbs.forEach(function (m, i) { var ang = a + i * 2.094; m.position.set(Math.cos(ang) * 1.5, Math.sin(ang) * 1.5, 0); });
      nodes.forEach(function (n) {
        var on = prog >= ringAt[n.ring] ? 1 : 0, o = n.ring === 3 ? 0.55 : 1;
        n.mesh.material.opacity += ((on ? o : 0.15) - n.mesh.material.opacity) * 0.08;
        var sc = on ? (n.ring === 0 ? 1.6 : 1.1) : 0.8; n.mesh.scale.setScalar(n.mesh.scale.x + (sc - n.mesh.scale.x) * 0.08);
        if (n.ring === 0) n.halo.scale.setScalar(1 + Math.sin(api.t * 2) * 0.12);
      });
      traces.forEach(function (tr) { var on = prog >= ringAt[tr.ring]; tr.mat.opacity += ((on ? tr.max : 0) - tr.mat.opacity) * 0.06; });
      for (var i = 0; i < N; i++) {
        var s = state[i], tr = traces[s.i];
        if (!tr) continue;
        if (tr.mat.opacity < 0.2) { pos[i * 3 + 2] = -50; continue; }
        s.t += s.v * dt; if (s.t > 1) { s.t = 0; s.i = Math.floor(Math.random() * traces.length); }
        tr.path.getPoint(s.t, tmp); pos[i * 3] = tmp.x; pos[i * 3 + 1] = tmp.y; pos[i * 3 + 2] = 0.05;
      }
      dg.attributes.position.needsUpdate = true;
      mapG.rotation.y += ((ptr.x * 0.08) - mapG.rotation.y) * 0.05;
      mapG.rotation.x += ((-0.3 - ptr.y * 0.05) - mapG.rotation.x) * 0.05;
    };
  }

  var builders = { hero: hero, rail: rail, invoice: invoice, map: map };
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target.__scene; io.unobserve(e.target);
      loadThree().then(function () { if (builders[el.dataset.scene] && !el.dataset.live) { el.dataset.live = '1'; stage(el, builders[el.dataset.scene]); } }).catch(function (err) { if (window.console) console.error('scene failed', el.dataset.scene, err && err.message); });
    });
  }, { rootMargin: '100% 0px' });
  containers.forEach(function (el) { var host = el.parentElement || el; host.__scene = el; io.observe(host); });
})();
