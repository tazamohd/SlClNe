/* SALIS AUTO scenes, pass 2: four lazy Three.js scenes (hero constellation, lifecycle rail,
 * ZATCA invoice, AI-era map). Loads the vendored Three only when a scene is near the viewport,
 * motion is allowed, the viewport is wide, and WebGL exists. Otherwise the static SVG and HTML
 * fallbacks in the markup stay exactly as they are. Every per-frame path reuses its vectors;
 * nodes and dots are instanced or single point clouds; textures are drawn on canvas, never fetched. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var containers = [].slice.call(doc.querySelectorAll('.scene[data-scene]'));
  if (!containers.length) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || window.innerWidth < 860 || !('IntersectionObserver' in window) || !hasGL()) return;

  var me = doc.currentScript;
  var SRC = (me && me.dataset.three) || 'assets/vendor/three.min.js';
  var C = { navy: 0x0B1F3B, navy2: 0x1E3A5F, blue: 0x0A5ED7, bright: 0x0BB3FF, orange: 0xF97316, white: 0xFFFFFF, line: 0xC3CBD6 };
  var HEX = { 0x0A5ED7: '#0A5ED7', 0x0BB3FF: '#0BB3FF', 0xF97316: '#F97316', 0xFFFFFF: '#FFFFFF', 0x1E3A5F: '#1E3A5F' };
  var rtl = function () { return root.dir === 'rtl'; };
  var pointer = { x: 0, y: 0, tx: 0, ty: 0, px: 0, py: 0 };
  window.addEventListener('pointermove', function (e) {
    pointer.px = e.clientX; pointer.py = e.clientY;
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });
  var scrollY = 0;
  window.addEventListener('scroll', function () { scrollY = window.scrollY || root.scrollTop; }, { passive: true });

  function hasGL() {
    try { var c = doc.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl'))); } catch (e) { return false; }
  }
  function cssVar(name, fallback) {
    var v = getComputedStyle(root).getPropertyValue(name).trim();
    return /^#[0-9a-f]{6}$/i.test(v) ? parseInt(v.slice(1), 16) : fallback;
  }
  function seeded(seed) { return function () { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }; }
  var easeOut = function (k) { return 1 - Math.pow(1 - Math.max(0, Math.min(1, k)), 3); };

  /* ---------- shared: textures, materials, halos ---------- */
  var texCache = {};
  function glowTexture(T, hex) {
    var key = 'g' + hex; if (texCache[key]) return texCache[key];
    var cv = doc.createElement('canvas'); cv.width = cv.height = 64; var ctx = cv.getContext('2d');
    var gr = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, HEX[hex] || '#fff'); gr.addColorStop(0.35, HEX[hex] || '#fff'); gr.addColorStop(1, 'rgba(11,31,59,0)');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, 64, 64);
    var t = new T.CanvasTexture(cv); texCache[key] = t; return t;
  }
  function halo(T, hex, size, opacity) {
    var s = new T.Sprite(new T.SpriteMaterial({ map: glowTexture(T, hex), color: 0xffffff, transparent: true, opacity: opacity == null ? 0.55 : opacity, blending: T.AdditiveBlending, depthWrite: false }));
    s.scale.set(size, size, 1); return s;
  }
  function lit(T, hex, intensity) { return new T.MeshPhongMaterial({ color: hex, emissive: hex, emissiveIntensity: intensity == null ? 0.55 : intensity, shininess: 60 }); }
  function traceMaterial(T, color, opacity) { return new T.MeshBasicMaterial({ color: color, transparent: true, opacity: opacity == null ? 0.9 : opacity }); }
  function lights(T, S) {
    S.add(new T.AmbientLight(0xffffff, 0.55));
    var d = new T.DirectionalLight(0xffffff, 0.75); d.position.set(4, 6, 8); S.add(d);
    var p = new T.PointLight(C.bright, 0.6, 40); p.position.set(-6, 4, 10); S.add(p);
  }
  /* The job card, drawn once and shared by S2 and S4. */
  function jobCardTexture(T) {
    if (texCache.job) return texCache.job;
    var cv = doc.createElement('canvas'); cv.width = 512; cv.height = 320; var x = cv.getContext('2d');
    x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, 512, 320);
    x.fillStyle = '#0B1F3B'; x.fillRect(0, 0, 512, 78);
    x.fillStyle = '#FFFFFF'; x.font = '600 26px Poppins, Inter, sans-serif'; x.fillText('Job card', 28, 48);
    x.fillStyle = '#0BB3FF'; x.font = '500 26px "JetBrains Mono", monospace'; x.fillText('JC-4F2A', 340, 48);
    x.fillStyle = '#64748B'; x.font = '500 16px "JetBrains Mono", monospace'; x.fillText('PLATE', 28, 118); x.fillText('AMOUNT', 300, 118);
    x.fillStyle = '#0B1F3B'; x.font = '500 30px "JetBrains Mono", monospace'; x.fillText('RUH 4821', 28, 158); x.fillText('SAR 1,245.00', 300, 158);
    x.fillStyle = '#E2E8F0'; x.fillRect(28, 186, 456, 2);
    x.fillStyle = '#E9F0FB'; roundRect(x, 28, 214, 178, 48, 24); x.fill();
    x.fillStyle = '#0A5ED7'; x.font = '600 22px Poppins, Inter, sans-serif'; x.fillText('In repair', 52, 246);
    x.fillStyle = '#F97316'; x.beginPath(); x.arc(460, 238, 12, 0, 6.283); x.fill();
    x.fillStyle = '#64748B'; x.font = '400 18px Inter, sans-serif'; x.fillText('Bay 3 · 09:40', 300, 246);
    var t = new T.CanvasTexture(cv); t.anisotropy = 4; texCache.job = t; return t;
  }
  function qrInto(x, ox, oy, size) {
    var rnd = seeded(42), m = 21, cell = size / (m + 2);
    x.fillStyle = '#FFFFFF'; x.fillRect(ox, oy, size, size); x.fillStyle = '#0B1F3B';
    for (var yy = 0; yy < m; yy++) for (var xx = 0; xx < m; xx++) {
      var finder = (xx < 7 && yy < 7) || (xx >= m - 7 && yy < 7) || (xx < 7 && yy >= m - 7);
      var fx = xx % 7, fy = yy % 7, on;
      if (finder) { var lx = xx >= m - 7 ? xx - (m - 7) : fx, ly = yy >= m - 7 ? yy - (m - 7) : fy; on = lx === 0 || ly === 0 || lx === 6 || ly === 6 || (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4); }
      else on = rnd() < 0.45;
      if (on) x.fillRect(ox + (xx + 1) * cell, oy + (yy + 1) * cell, cell - 0.6, cell - 0.6);
    }
  }
  function invoiceTexture(T) {
    if (texCache.inv) return texCache.inv;
    var cv = doc.createElement('canvas'); cv.width = 512; cv.height = 700; var x = cv.getContext('2d');
    x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, 512, 700);
    x.fillStyle = '#0B1F3B'; x.fillRect(0, 0, 512, 92);
    x.fillStyle = '#FFFFFF'; x.font = '700 24px Montserrat, Inter, sans-serif'; x.fillText('SALIS AUTO', 28, 42);
    x.fillStyle = '#B7C4D6'; x.font = '400 16px Inter, sans-serif'; x.fillText('Tax invoice · فاتورة ضريبية', 28, 70);
    x.fillStyle = '#0BB3FF'; x.font = '500 18px "JetBrains Mono", monospace'; x.fillText('INV-88120', 370, 42);
    x.fillStyle = '#64748B'; x.font = '400 15px Inter, sans-serif';
    x.fillText('Seller  Riyadh Main Workshop', 28, 130); x.fillText('VAT no.  300012345600003', 28, 156); x.fillText('Issued  03 Sep 2026 · 09:42', 28, 182);
    qrInto(x, 340, 112, 144);
    x.fillStyle = '#E2E8F0'; x.fillRect(28, 290, 456, 2);
    var rows = [['Front brake pads, labour', 'SAR 640.00'], ['Oil filter, oil change', 'SAR 180.00'], ['VAT 15%', 'SAR 123.00']];
    x.font = '400 17px Inter, sans-serif';
    rows.forEach(function (r, i) { x.fillStyle = '#0B1F3B'; x.fillText(r[0], 28, 330 + i * 42); x.fillStyle = '#0B1F3B'; x.font = '500 17px "JetBrains Mono", monospace'; x.fillText(r[1], 340, 330 + i * 42); x.font = '400 17px Inter, sans-serif'; });
    x.fillStyle = '#E9EEF4'; x.fillRect(28, 470, 456, 56);
    x.fillStyle = '#0B1F3B'; x.font = '600 19px Inter, sans-serif'; x.fillText('Total incl. VAT', 44, 505);
    x.font = '600 22px "JetBrains Mono", monospace'; x.fillText('SAR 943.00', 330, 506);
    x.fillStyle = '#64748B'; x.font = '400 13px "JetBrains Mono", monospace'; x.fillText('hash  9f3c…e21a  ·  prev  4b71…08d3', 28, 566);
    x.fillStyle = '#0A5ED7'; x.font = '600 14px Inter, sans-serif'; x.fillText('Immutable after issue', 28, 600);
    x.fillStyle = '#64748B'; x.font = '400 12px Inter, sans-serif'; x.fillText('Illustrative. Figures are examples, not customer data.', 28, 660);
    var t = new T.CanvasTexture(cv); t.anisotropy = 4; texCache.inv = t; return t;
  }
  function labelTexture(T, en, ar) {
    var cv = doc.createElement('canvas'); cv.width = 256; cv.height = 96; var x = cv.getContext('2d');
    x.textAlign = 'center';
    x.fillStyle = 'rgba(11,31,59,.72)'; roundRect(x, 8, 8, 240, 80, 14); x.fill();
    x.strokeStyle = 'rgba(11,179,255,.45)'; x.lineWidth = 2; x.stroke();
    x.fillStyle = '#FFFFFF'; x.font = '600 26px Inter, sans-serif'; x.fillText(en, 128, 44);
    x.fillStyle = '#B7C4D6'; x.font = '500 24px "Noto Sans Arabic", sans-serif'; x.fillText(ar, 128, 76);
    return new T.CanvasTexture(cv);
  }
  function roundRect(x, l, t, w, h, r) { x.beginPath(); x.moveTo(l + r, t); x.arcTo(l + w, t, l + w, t + h, r); x.arcTo(l + w, t + h, l, t + h, r); x.arcTo(l, t + h, l, t, r); x.arcTo(l, t, l + w, t, r); x.closePath(); }
  function slab(T, w, h) {
    var g = new T.Group();
    var mats = [lit(T, C.blue, 0.5), lit(T, C.blue, 0.5), lit(T, C.blue, 0.5), lit(T, C.blue, 0.5), new T.MeshPhongMaterial({ map: jobCardTexture(T), shininess: 30 }), lit(T, C.navy, 0.2)];
    g.add(new T.Mesh(new T.BoxGeometry(w, h, 0.12), mats));
    var rim = new T.Mesh(new T.PlaneGeometry(w * 1.12, h * 1.18), new T.MeshBasicMaterial({ color: C.bright, transparent: true, opacity: 0.22, blending: T.AdditiveBlending, depthWrite: false }));
    rim.position.z = -0.09; g.add(rim);
    return g;
  }
  /* The brand trace: horizontal, one 45 degree diagonal, horizontal. */
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
  /* Draw-in for tube geometries: the index range grows with k in 0..1. */
  function drawTo(geo, k) { var n = geo.index ? geo.index.count : geo.attributes.position.count; geo.setDrawRange(0, Math.floor(n * easeOut(k))); }
  /* Cheap hover: distance from the pointer ray to a point. */
  function hoverer(api) {
    var T = api.T, rc = new T.Raycaster(), nd = new T.Vector2(), wp = new T.Vector3();
    return function (obj) {
      var r = api.el.getBoundingClientRect();
      nd.x = ((pointer.px - r.left) / r.width) * 2 - 1; nd.y = -((pointer.py - r.top) / r.height) * 2 + 1;
      if (nd.x < -1.2 || nd.x > 1.2 || nd.y < -1.2 || nd.y > 1.2) return 99;
      rc.setFromCamera(nd, api.cam);
      obj.getWorldPosition(wp);
      return rc.ray.distanceToPoint(wp);
    };
  }

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
    var cam = new T.PerspectiveCamera(42, 1, 0.1, 120);
    var api = { T: T, scene: scene, cam: cam, el: el, renderer: renderer, w: 1, h: 1, t: 0, born: 0 };
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
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible && !api.born) api.born = 1; start(); }, { threshold: 0 }).observe(el.parentElement || el);
    doc.addEventListener('visibilitychange', start);
    el.parentElement.classList.add('has-scene');
    if ('ResizeObserver' in window) new ResizeObserver(size).observe(el); else window.addEventListener('resize', size);
    size();
    return api;
  }

  /* ---------- scene 1: the circuit constellation behind the hero ---------- */
  function constellation(T, g, seed, spread, depth, dim, rnd) {
    var pts = [], cols = 9, rows = 5;
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      if (rnd() < 0.2) continue;
      pts.push(new T.Vector3(((c - (cols - 1) / 2) * 5 + (rnd() - 0.5) * 2.2) * spread, ((r - (rows - 1) / 2) * 4.2 + (rnd() - 0.5) * 1.6) * spread, (rnd() - 0.5) * 10 + depth));
    }
    var n = pts.length;
    var colors = pts.map(function () { return rnd() < 0.12 ? C.orange : (rnd() < 0.5 ? C.bright : C.blue); });
    var byCol = { }; [C.blue, C.bright, C.orange].forEach(function (col) { byCol[col] = []; });
    pts.forEach(function (p, i) { byCol[colors[i]].push(i); });
    var inst = [], mat4 = new T.Matrix4(), dummy = new T.Object3D();
    var sphere = new T.SphereGeometry(0.26, 14, 14);
    Object.keys(byCol).forEach(function (col) {
      var ids = byCol[col]; if (!ids.length) return;
      var m = new T.InstancedMesh(sphere, lit(T, +col, dim ? 0.35 : 0.7), ids.length);
      if (dim) { m.material.transparent = true; m.material.opacity = 0.55; }
      ids.forEach(function (id, k) { dummy.position.copy(pts[id]); dummy.scale.setScalar(0.001); dummy.updateMatrix(); m.setMatrixAt(k, dummy.matrix); });
      g.add(m); inst.push({ mesh: m, ids: ids });
    });
    var halos = pts.map(function (p, i) { var s = halo(T, colors[i], dim ? 1.6 : 2.2, dim ? 0.25 : 0.5); s.position.copy(p); s.scale.setScalar(0.001); g.add(s); return s; });
    var paths = [], tubes = [], used = {};
    pts.forEach(function (p, i) {
      var best = [];
      pts.forEach(function (q, j) { if (i !== j) best.push([p.distanceTo(q), j]); });
      best.sort(function (u, v) { return u[0] - v[0]; });
      for (var k = 0; k < 2 && k < best.length; k++) {
        var j = best[k][1], key = Math.min(i, j) + ':' + Math.max(i, j);
        if (used[key] || best[k][0] > 9 * spread) continue; used[key] = 1;
        var path = rightAngle(T, p, pts[j]);
        var geo = new T.TubeGeometry(path, 24, dim ? 0.045 : 0.06, 5, false); geo.setDrawRange(0, 0);
        var tube = new T.Mesh(geo, traceMaterial(T, rnd() < 0.15 ? C.orange : (rnd() < 0.5 ? C.bright : C.blue), dim ? 0.45 : 0.9));
        g.add(tube); paths.push(path); tubes.push(geo);
      }
    });
    return { pts: pts, n: n, inst: inst, halos: halos, paths: paths, tubes: tubes, dummy: dummy, mat4: mat4, colors: colors };
  }
  function hero(api) {
    var T = api.T, S = api.scene;
    api.cam.position.set(0, 0, 30);
    S.fog = new T.Fog(C.navy, 22, 60);
    lights(T, S);
    var near = new T.Group(), far = new T.Group(); S.add(far); S.add(near);
    var A = constellation(T, near, 7, 1, 0, false, seeded(7));
    var B = constellation(T, far, 11, 1.7, -16, true, seeded(11));
    /* Particles with three trailing points each, vertex colours fading along the trail. */
    var paths = A.paths, N = Math.min(70, paths.length * 2), TR = 4, pos = new Float32Array(N * TR * 3), col = new Float32Array(N * TR * 3), state = [], rnd = seeded(3);
    for (var i = 0; i < N; i++) { state.push({ p: paths[i % paths.length], t: rnd(), v: 0.06 + rnd() * 0.08 }); for (var k = 0; k < TR; k++) { var f = 1 - k / TR; col[(i * TR + k) * 3] = f; col[(i * TR + k) * 3 + 1] = f; col[(i * TR + k) * 3 + 2] = f; } }
    var geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('color', new T.BufferAttribute(col, 3));
    near.add(new T.Points(geo, new T.PointsMaterial({ map: glowTexture(T, C.white), vertexColors: true, size: 0.55, transparent: true, opacity: 0.95, blending: T.AdditiveBlending, depthWrite: false, sizeAttenuation: true })));
    var tmp = new T.Vector3(), age = 0, dist = hoverer(api), probe = new T.Object3D();
    var camZ = 30, camYaw = 0;
    function grow(K, age, delayMul) {
      K.inst.forEach(function (it) {
        it.ids.forEach(function (id, k) { var s = easeOut((age - id * 0.02 * delayMul) / 0.5); if (s <= 0) s = 0.001; K.dummy.position.copy(K.pts[id]); K.dummy.scale.setScalar(s); K.dummy.updateMatrix(); it.mesh.setMatrixAt(k, K.dummy.matrix); });
        it.mesh.instanceMatrix.needsUpdate = true;
      });
      K.halos.forEach(function (h, i) { var s = easeOut((age - i * 0.02 * delayMul) / 0.5); h.scale.setScalar(Math.max(0.001, s) * (K === A ? 2.2 : 1.6)); });
      K.tubes.forEach(function (t, i) { drawTo(t, (age - 0.25 - i * 0.03 * delayMul) / 0.7); });
    }
    return function (dt, ptr) {
      if (age < 3) { age += dt; grow(A, age, 1); grow(B, age - 0.3, 0.8); }
      for (var i = 0; i < N; i++) {
        var s = state[i]; s.t += s.v * dt; if (s.t > 1) { s.t = 0; s.p = paths[Math.floor(rnd() * paths.length)]; }
        for (var k = 0; k < TR; k++) { var tt = Math.max(0, s.t - k * 0.012); s.p.getPoint(tt, tmp); var o = (i * TR + k) * 3; pos[o] = tmp.x; pos[o + 1] = tmp.y; pos[o + 2] = tmp.z; }
      }
      geo.attributes.position.needsUpdate = true;
      /* Hover: halos near the pointer swell. */
      if (age > 1.5) for (var j = 0; j < A.n; j++) { probe.position.copy(A.pts[j]); near.localToWorld(probe.position); var d = dist(probe); var target = d < 2.4 ? 3.6 : 2.2; var h = A.halos[j]; h.scale.setScalar(h.scale.x + (target - h.scale.x) * 0.12); }
      var dir = rtl() ? -1 : 1;
      near.scale.x = dir; far.scale.x = dir;
      near.rotation.y += ((ptr.x * 0.16 * dir + Math.sin(api.t * 0.15) * 0.05) - near.rotation.y) * 0.05;
      near.rotation.x += ((-ptr.y * 0.1 + Math.sin(api.t * 0.11) * 0.03) - near.rotation.x) * 0.05;
      far.rotation.y = near.rotation.y * 0.45; far.rotation.x = near.rotation.x * 0.45;
      near.position.y = Math.sin(api.t * 0.3) * 0.5; far.position.y = near.position.y * 0.4;
      near.position.x = dir * 3 + Math.cos(api.t * 0.2) * 0.4; far.position.x = dir * 1.2;
      /* Scroll: a slow dolly in and a few degrees of yaw. */
      var k = Math.min(1, scrollY / 700);
      camZ += ((30 - k * 3.5) - camZ) * 0.05; camYaw += ((k * 0.06 * dir) - camYaw) * 0.05;
      api.cam.position.set(Math.sin(camYaw) * camZ, k * -1.2, Math.cos(camYaw) * camZ); api.cam.lookAt(0, 0, 0);
    };
  }

  /* ---------- scene 2: the six-stage rail in depth, driven by scroll ---------- */
  function rail(api) {
    var T = api.T, S = api.scene, el = api.el;
    lights(T, S);
    var camTarget = new T.Vector3(0, 0.35, 0), camLook = new T.Vector3(0, 0.35, 0);
    api.cam.position.set(0, 2.6, 7.4); api.cam.lookAt(camLook);
    var g = new T.Group(); S.add(g);
    var stagesEl = el.parentElement.querySelectorAll('.rail6 a');
    var n = stagesEl.length || 6, pts = [];
    for (var i = 0; i < n; i++) pts.push(new T.Vector3((i - (n - 1) / 2) * 4.2, 0, Math.sin(i / (n - 1) * Math.PI) * 2.4 - 1.2));
    var curve = new T.CatmullRomCurve3(pts, false, 'catmullrom', 0.4);
    var tubeGeo = new T.TubeGeometry(curve, 120, 0.07, 7, false); tubeGeo.setDrawRange(0, 0);
    g.add(new T.Mesh(tubeGeo, lit(T, C.blue, 0.6)));
    var glowGeo = new T.TubeGeometry(curve, 60, 0.16, 6, false); glowGeo.setDrawRange(0, 0);
    g.add(new T.Mesh(glowGeo, new T.MeshBasicMaterial({ color: C.bright, transparent: true, opacity: 0.16, blending: T.AdditiveBlending, depthWrite: false })));
    var ringGeo = new T.TorusGeometry(0.46, 0.07, 8, 32), nodeGeo = new T.SphereGeometry(0.3, 16, 16);
    var nodes = pts.map(function (p, i) {
      var col = i === n - 1 ? C.orange : (i === n - 2 ? C.bright : C.blue);
      var m = new T.Mesh(nodeGeo, lit(T, col, 0.7)); m.position.copy(p); m.scale.setScalar(0.001); g.add(m);
      var h = halo(T, col, 2.0, 0.45); h.position.copy(p); g.add(h);
      var ring = new T.Mesh(ringGeo, new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.3 })); ring.position.copy(p); ring.rotation.x = Math.PI / 2; g.add(ring);
      var pulse = new T.Mesh(ringGeo, new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false })); pulse.position.copy(p); pulse.rotation.x = Math.PI / 2; g.add(pulse);
      return { m: m, ring: ring, pulse: pulse, pt: 9 };
    });
    var token = slab(T, 2.0, 1.25); g.add(token);
    var driver = (el.dataset.driver && doc.querySelector(el.dataset.driver)) || el.parentElement;
    var prog = 0, target = 0, active = -1, tangent = new T.Vector3(), at = new T.Vector3(), age = 0;
    function progress() {
      var r = driver.getBoundingClientRect(), vh = window.innerHeight;
      target = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
    }
    window.addEventListener('scroll', progress, { passive: true }); progress();
    return function (dt, ptr) {
      if (age < 3) { age += dt; drawTo(tubeGeo, age / 1.4); drawTo(glowGeo, age / 1.4); nodes.forEach(function (nd, i) { var s = easeOut((age - 0.2 - i * 0.18) / 0.5); nd.m.scale.setScalar(Math.max(0.001, s)); }); }
      prog += (target - prog) * 0.08;
      var p = Math.max(0.001, Math.min(0.999, prog));
      curve.getPointAt(p, at); curve.getTangentAt(p, tangent);
      token.position.set(at.x, at.y + 1.1 + Math.sin(api.t * 2) * 0.06, at.z);
      token.rotation.y = Math.atan2(tangent.x, tangent.z) - Math.PI / 2 + ptr.x * 0.15;
      token.rotation.x = -0.18 + ptr.y * 0.08;
      token.rotation.z = -tangent.z * 0.3;
      var idx = Math.round(p * (n - 1));
      if (idx !== active) {
        active = idx;
        for (var i = 0; i < stagesEl.length; i++) stagesEl[i].classList.toggle('is-active', i === idx);
        nodes.forEach(function (nd, i) { nd.pt = i === idx ? 0 : nd.pt; });
      }
      nodes.forEach(function (nd, i) {
        var target = i === idx ? 1.45 : 1; nd.m.scale.setScalar(nd.m.scale.x + (target - nd.m.scale.x) * 0.1);
        if (nd.pt < 0.7) { nd.pt += dt; var k = nd.pt / 0.7; nd.pulse.scale.setScalar(1 + k * 1.6); nd.pulse.material.opacity = (1 - k) * 0.9; } else nd.pulse.material.opacity = 0;
      });
      camTarget.set(at.x * 0.35, 0.35, 0); camLook.lerp(camTarget, 0.05);
      api.cam.position.x += ((at.x * 0.3) - api.cam.position.x) * 0.05; api.cam.lookAt(camLook);
      g.scale.x = rtl() ? -1 : 1;
      g.rotation.y += ((ptr.x * 0.05) - g.rotation.y) * 0.05;
    };
  }

  /* ---------- scene 3: the ZATCA invoice card and its hash chain ---------- */
  function invoice(api) {
    var T = api.T, S = api.scene, el = api.el;
    lights(T, S);
    api.cam.position.set(0, 0.6, 15);
    var g = new T.Group(); S.add(g);
    var card = new T.Group(); g.add(card);
    var front = new T.Mesh(new T.PlaneGeometry(6, 8.2), new T.MeshBasicMaterial({ map: invoiceTexture(T) })); front.position.z = 0.09; card.add(front);
    card.add(new T.Mesh(new T.BoxGeometry(6, 8.2, 0.16), lit(T, C.navy, 0.15)));
    var bevel = new T.Mesh(new T.BoxGeometry(6.14, 8.34, 0.1), new T.MeshBasicMaterial({ color: C.line })); bevel.position.z = -0.04; card.add(bevel);
    var rim = new T.Mesh(new T.PlaneGeometry(6.7, 9.0), new T.MeshBasicMaterial({ color: C.bright, transparent: true, opacity: 0.2, blending: T.AdditiveBlending, depthWrite: false })); rim.position.z = -0.12; card.add(rim);
    var rimLight = new T.PointLight(C.bright, 1.2, 14); rimLight.position.set(5, 3, 2); S.add(rimLight);
    /* The hash chain behind: blocks and dashed links that flow toward the newest block. */
    var blocks = [], links = [], nb = 6, blockGeo = new T.BoxGeometry(1.3, 0.9, 0.7);
    for (var b = 0; b < nb; b++) {
      var bm = new T.Mesh(blockGeo, lit(T, C.navy2, 0.25)); bm.position.set(-7.5 + b * 3, -1.2 + Math.sin(b * 0.9) * 0.6, -5 - b * 0.35); g.add(bm);
      var h = halo(T, C.bright, 2.4, 0); h.position.copy(bm.position); g.add(h);
      blocks.push({ m: bm, halo: h, lit: false });
      if (b) {
        var lg = new T.BufferGeometry().setFromPoints([blocks[b - 1].m.position, bm.position]);
        var ln = new T.Line(lg, new T.LineBasicMaterial({ color: C.navy2, transparent: true, opacity: 0.6 })); g.add(ln); links.push(ln);
      }
    }
    /* Flow along lit links toward the newest block: six points per link, reused. */
    var FN = (nb - 1) * 6, fpos = new Float32Array(FN * 3), fstate = [], frnd = seeded(9);
    for (var f = 0; f < FN; f++) fstate.push({ l: Math.floor(f / 6), t: frnd() });
    var fg = new T.BufferGeometry(); fg.setAttribute('position', new T.BufferAttribute(fpos, 3));
    g.add(new T.Points(fg, new T.PointsMaterial({ color: C.bright, map: glowTexture(T, C.bright), size: 0.5, transparent: true, opacity: 0.95, blending: T.AdditiveBlending, depthWrite: false })));
    var lock = new T.Mesh(new T.TorusGeometry(1.1, 0.06, 8, 40), new T.MeshBasicMaterial({ color: C.bright, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false }));
    lock.position.copy(blocks[nb - 1].m.position); g.add(lock);
    var driver = (el.dataset.driver && doc.querySelector(el.dataset.driver)) || el.closest('section') || el.parentElement;
    var target = 0, prog = 0, litIdx = -1, lockT = 9;
    function progress() { var r = driver.getBoundingClientRect(), vh = window.innerHeight; target = Math.max(0, Math.min(1, (vh * 0.9 - r.top) / (r.height + vh * 0.6))); }
    window.addEventListener('scroll', progress, { passive: true }); progress();
    return function (dt, ptr) {
      prog += (target - prog) * 0.08;
      var idx = Math.floor(prog * (nb + 0.999)) - 1;
      if (idx !== litIdx) {
        litIdx = idx;
        blocks.forEach(function (bk, i) { var on = i <= idx; bk.m.material.color.setHex(on ? (i === idx ? C.bright : C.blue) : C.navy2); bk.m.material.emissive.setHex(on ? (i === idx ? C.bright : C.blue) : C.navy2); bk.m.material.emissiveIntensity = on ? 0.7 : 0.25; bk.halo.material.opacity = on ? (i === idx ? 0.6 : 0.3) : 0; });
        links.forEach(function (lk, i) { lk.material.color.setHex(i < idx ? C.bright : C.navy2); });
        if (idx === nb - 1) lockT = 0;
      }
      for (var f = 0; f < FN; f++) {
        var st = fstate[f];
        if (st.l >= litIdx) { fpos[f * 3 + 2] = -50; continue; }
        st.t += dt * 0.45; if (st.t > 1) st.t = 0;
        var pa = blocks[st.l].m.position, pb = blocks[st.l + 1].m.position;
        fpos[f * 3] = pa.x + (pb.x - pa.x) * st.t; fpos[f * 3 + 1] = pa.y + (pb.y - pa.y) * st.t; fpos[f * 3 + 2] = pa.z + (pb.z - pa.z) * st.t + 0.4;
      }
      fg.attributes.position.needsUpdate = true;
      if (lockT < 0.8) { lockT += dt; var k = lockT / 0.8; lock.scale.setScalar(0.4 + k * 1.8); lock.material.opacity = (1 - k) * 0.9; } else lock.material.opacity = 0;
      card.rotation.y += ((Math.sin(api.t * 0.35) * 0.3 + ptr.x * 0.28) - card.rotation.y) * 0.06;
      card.rotation.x += ((ptr.y * -0.12) - card.rotation.x) * 0.06;
      card.position.y = Math.sin(api.t * 0.8) * 0.12;
      rimLight.position.set(Math.cos(api.t * 0.5) * 6, 3, 3);
      g.scale.x = rtl() ? -1 : 1;
    };
  }

  /* ---------- scene 4: the region as a dotted map; Riyadh first, then the Kingdom, the Gulf, the region ---------- */
  var AR = { riyadh: 'الرياض', jeddah: 'جدة', dammam: 'الدمام', madinah: 'المدينة', abha: 'أبها', kuwait: 'الكويت', manama: 'المنامة', doha: 'الدوحة', abudhabi: 'أبوظبي', dubai: 'دبي', muscat: 'مسقط', amman: 'عمّان', cairo: 'القاهرة', baghdad: 'بغداد' };
  var EN = { riyadh: 'Riyadh', jeddah: 'Jeddah', dammam: 'Dammam', madinah: 'Madinah', abha: 'Abha', kuwait: 'Kuwait', manama: 'Manama', doha: 'Doha', abudhabi: 'Abu Dhabi', dubai: 'Dubai', muscat: 'Muscat', amman: 'Amman', cairo: 'Cairo', baghdad: 'Baghdad' };
  function map(api) {
    var T = api.T, S = api.scene, el = api.el;
    var data = JSON.parse(el.dataset.map || '{}');
    var polys = data.polys || [], cities = data.cities || [], step = data.step || 0.9;
    var cx = 45, cy = 26, k = 0.34;
    var X = function (lon) { return (lon - cx) * k; }, Y = function (lat) { return (lat - cy) * k; };
    function inside(poly, x, y) { var r = false; for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) { var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) r = !r; } return r; }
    function land(lon, lat) { for (var p = 0; p < polys.length; p++) if (inside(polys[p], lon, lat)) return true; return false; }
    lights(T, S);
    api.cam.position.set(0, 0.6, 17); api.cam.lookAt(0, 0, 0);
    S.fog = new T.Fog(C.navy, 16, 34);
    var mapG = new T.Group(); S.add(mapG);
    mapG.rotation.x = -0.3;
    /* Two dot tones: coast dots (any neighbour is sea) read the outline; inner dots fill. */
    var coast = [], inner = [];
    for (var lat = 12; lat <= 38; lat += step) for (var lon = 24; lon <= 62; lon += step) {
      if (!land(lon, lat)) continue;
      var edge = !land(lon + step, lat) || !land(lon - step, lat) || !land(lon, lat + step) || !land(lon, lat - step);
      (edge ? coast : inner).push(X(lon), Y(lat), 0);
    }
    function cloud(arr, color, size, opacity) { var gg = new T.BufferGeometry(); gg.setAttribute('position', new T.BufferAttribute(new Float32Array(arr), 3)); var p = new T.Points(gg, new T.PointsMaterial({ color: color, map: glowTexture(T, color), size: size, transparent: true, opacity: opacity, sizeAttenuation: true, depthWrite: false })); mapG.add(p); return p; }
    cloud(inner, C.blue, 0.26, 0.6); cloud(coast, C.bright, 0.34, 0.95);
    /* A faint grid under the map. */
    var gcv = doc.createElement('canvas'); gcv.width = gcv.height = 512; var gx = gcv.getContext('2d');
    gx.strokeStyle = 'rgba(11,179,255,.35)'; gx.lineWidth = 1; for (var i = 0; i <= 512; i += 32) { gx.beginPath(); gx.moveTo(i, 0); gx.lineTo(i, 512); gx.stroke(); gx.beginPath(); gx.moveTo(0, i); gx.lineTo(512, i); gx.stroke(); }
    var rg = gx.createRadialGradient(256, 256, 60, 256, 256, 256); rg.addColorStop(0, 'rgba(11,31,59,0)'); rg.addColorStop(1, 'rgba(11,31,59,1)'); gx.fillStyle = rg; gx.fillRect(0, 0, 512, 512);
    var grid = new T.Mesh(new T.PlaneGeometry(22, 22), new T.MeshBasicMaterial({ map: new T.CanvasTexture(gcv), transparent: true, opacity: 0.4, blending: T.AdditiveBlending, depthWrite: false })); grid.position.z = -0.25; mapG.add(grid);
    var byName = {}, nodes = [];
    var nodeGeo = new T.SphereGeometry(0.17, 12, 12);
    cities.forEach(function (c, ci) {
      var v = new T.Vector3(X(c[1]), Y(c[2]), 0.04), col = c[3] === 0 ? C.orange : (c[3] === 3 ? C.bright : C.blue);
      var mesh = new T.Mesh(nodeGeo, lit(T, col, 0.7)); mesh.material.transparent = true; mesh.material.opacity = c[3] === 0 ? 1 : 0.15;
      mesh.position.copy(v); mesh.scale.setScalar(c[3] === 0 ? 1.7 : 0.8); mapG.add(mesh);
      var h = halo(T, col, c[3] === 0 ? 3.2 : 2.2, c[3] === 0 ? 0.7 : 0); h.position.copy(v); mapG.add(h);
      var label = null;
      if (c[3] < 3) { label = new T.Sprite(new T.SpriteMaterial({ map: labelTexture(T, EN[c[0]] || c[0], AR[c[0]] || ''), transparent: true, opacity: c[3] === 0 ? 1 : 0, depthWrite: false })); label.scale.set(1.7, 0.64, 1); label.position.set(v.x, v.y + (ci % 2 ? -0.62 : 0.62), 0.4); mapG.add(label); }
      byName[c[0]] = { v: v, ring: c[3], mesh: mesh, halo: h, label: label, base: c[3] === 0 ? 3.2 : 2.2 }; nodes.push(byName[c[0]]);
    });
    /* Arcs above the map, revealed by draw range when their ring lights. */
    var traces = [], mid = new T.Vector3();
    (data.links || []).forEach(function (l) {
      var a = byName[l[0]], b = byName[l[1]]; if (!a || !b) return;
      mid.addVectors(a.v, b.v).multiplyScalar(0.5); mid.z = a.v.distanceTo(b.v) * 0.32 + 0.2;
      var path = new T.QuadraticBezierCurve3(a.v.clone(), mid.clone(), b.v.clone());
      var col = b.ring === 1 ? C.orange : C.bright;
      var geo = new T.TubeGeometry(path, 28, 0.035, 5, false); geo.setDrawRange(0, 0);
      var m = traceMaterial(T, col, 0); mapG.add(new T.Mesh(geo, m));
      traces.push({ ring: b.ring, mat: m, geo: geo, max: b.ring === 3 ? 0.4 : 0.9, path: path, k: 0 });
    });
    var N = 70, pos = new Float32Array(N * 3), state = [], tmp = new T.Vector3(), rnd = seeded(5);
    for (var i = 0; i < N; i++) state.push({ i: i % Math.max(1, traces.length), t: rnd(), v: 0.1 + rnd() * 0.12 });
    var dg = new T.BufferGeometry(); dg.setAttribute('position', new T.BufferAttribute(pos, 3));
    mapG.add(new T.Points(dg, new T.PointsMaterial({ color: C.white, map: glowTexture(T, C.white), size: 0.36, transparent: true, opacity: 0.95, blending: T.AdditiveBlending, depthWrite: false })));
    /* The job card in front, with three capability nodes orbiting and tethered to it. */
    var orbit = new T.Group(); S.add(orbit);
    var card = slab(T, 2.1, 1.3); card.scale.setScalar(0.001); orbit.add(card);
    var orbs = [C.bright, C.blue, C.orange].map(function (col) {
      var m = new T.Mesh(new T.SphereGeometry(0.14, 12, 12), lit(T, col, 0.8)); orbit.add(m);
      var h = halo(T, col, 1.4, 0.6); m.add(h);
      var lg = new T.BufferGeometry(); lg.setAttribute('position', new T.BufferAttribute(new Float32Array(6), 3));
      var ln = new T.Line(lg, new T.LineBasicMaterial({ color: col, transparent: true, opacity: 0.2 })); orbit.add(ln);
      return { m: m, line: ln, arr: lg.attributes.position.array, geo: lg };
    });
    var ringMesh = new T.Mesh(new T.TorusGeometry(1.6, 0.012, 6, 90), new T.MeshBasicMaterial({ color: C.bright, transparent: true, opacity: 0.35 })); orbit.add(ringMesh);
    var driver = (el.dataset.driver && doc.querySelector(el.dataset.driver)) || el.closest('section') || el.parentElement;
    var target = 0, prog = 0, age = 0, dist = hoverer(api), wp = new T.Vector3();
    function progress() { var r = driver.getBoundingClientRect(), vh = window.innerHeight; target = Math.max(0, Math.min(1, (vh * 0.95 - r.top) / (r.height * 0.9))); }
    window.addEventListener('scroll', progress, { passive: true }); progress();
    var ringAt = [0, 0.22, 0.5, 0.78];
    return function (dt, ptr) {
      age += dt;
      prog += (target - prog) * 0.06;
      var halfH = api.cam.position.z * Math.tan(0.3665), halfW = halfH * (api.w / api.h);
      var side = rtl() ? -1 : 1;
      mapG.position.x = -side * halfW * 0.18; mapG.position.y = 0.2;
      orbit.position.set(side * halfW * 0.58, 0.1, 3);
      orbit.rotation.x = 0.95; orbit.rotation.z = -0.25 * side;
      var cs = easeOut((age - 1.6) / 0.6); card.scale.setScalar(Math.max(0.001, cs)); card.rotation.x = -0.95; card.rotation.z = 0.25 * side; card.position.y = Math.sin(api.t * 1.5) * 0.08;
      var a = api.t * 0.55;
      orbs.forEach(function (o, i) {
        var ang = a + i * 2.094; o.m.position.set(Math.cos(ang) * 1.6, Math.sin(ang) * 1.6, 0);
        o.arr[0] = o.m.position.x; o.arr[1] = o.m.position.y; o.arr[2] = 0; o.geo.attributes.position.needsUpdate = true;
        o.line.material.opacity = 0.12 + 0.55 * Math.max(0, -Math.sin(ang)) * cs;
      });
      nodes.forEach(function (n) {
        var on = prog >= ringAt[n.ring] ? 1 : 0, o = n.ring === 3 ? 0.55 : 1;
        n.mesh.material.opacity += ((on ? o : 0.15) - n.mesh.material.opacity) * 0.08;
        var sc = on ? (n.ring === 0 ? 1.7 : 1.15) : 0.8; n.mesh.scale.setScalar(n.mesh.scale.x + (sc - n.mesh.scale.x) * 0.08);
        n.halo.material.opacity += ((on ? (n.ring === 0 ? 0.7 : 0.45) : 0) - n.halo.material.opacity) * 0.08;
        if (n.label) n.label.material.opacity += ((on ? 1 : 0) - n.label.material.opacity) * 0.08;
        var hs = n.base; if (on) { n.mesh.getWorldPosition(wp); if (dist(n.mesh) < 1.6) hs = n.base * 1.8; }
        if (n.ring === 0) hs *= 1 + Math.sin(api.t * 2) * 0.1;
        n.halo.scale.setScalar(n.halo.scale.x + (hs - n.halo.scale.x) * 0.15);
      });
      traces.forEach(function (tr) { var on = prog >= ringAt[tr.ring]; tr.k += ((on ? 1 : 0) - tr.k) * 0.06; drawTo(tr.geo, tr.k * 1.05); tr.mat.opacity += ((on ? tr.max : 0) - tr.mat.opacity) * 0.06; });
      for (var i = 0; i < N; i++) {
        var s = state[i], tr = traces[s.i];
        if (!tr || tr.k < 0.6) { pos[i * 3 + 2] = -50; continue; }
        s.t += s.v * dt; if (s.t > 1) { s.t = 0; s.i = Math.floor(rnd() * traces.length); }
        tr.path.getPoint(s.t, tmp); pos[i * 3] = tmp.x; pos[i * 3 + 1] = tmp.y; pos[i * 3 + 2] = tmp.z + 0.05;
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
