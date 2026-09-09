/* ═══════════════════════════════════════════════════════════════════════
   Channel page — a carrier-signal canvas and a form that deliberately
   goes nowhere. The submit handler reads the values back and drops them;
   there is no fetch on this page, and there never should be.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var OS = window.SalisOS;
  var $ = OS.$, esc = OS.esc, between = OS.between, pad = OS.pad, rand = OS.rand, reduced = OS.reduced;

  function signal() {
    var cv = $('#signalCanvas'), ctx = cv && cv.getContext('2d');
    if (!ctx) return;
    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    var t0 = performance.now(), drift = $('#sigDrift'), lastDrift = 0;

    function frame(now) {
      var t = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(11,179,255,.10)'; ctx.lineWidth = 1;
      for (var g = 1; g < 4; g++) {
        var y = (h / 4) * g;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      /* Two carriers: a steady one and a slower envelope that beats against it. */
      for (var pass = 0; pass < 2; pass++) {
        ctx.beginPath();
        for (var x = 0; x <= w; x += 2) {
          var u = x / w;
          var env = Math.sin(u * Math.PI);
          var v = Math.sin(u * 34 - t * (pass ? 1.6 : 2.6)) * (pass ? 0.30 : 0.42) +
                  Math.sin(u * 9 - t * 0.8) * 0.20;
          var y2 = h / 2 + v * env * h * 0.42;
          if (x === 0) ctx.moveTo(x, y2); else ctx.lineTo(x, y2);
        }
        ctx.strokeStyle = pass ? 'rgba(249,115,22,.42)' : 'rgba(11,179,255,.9)';
        ctx.lineWidth = pass ? 1 : 1.6;
        ctx.stroke();
      }

      if (drift && now - lastDrift > 900) {
        drift.textContent = between(0.02, 0.94).toFixed(2);
        lastDrift = now;
      }
      raf = requestAnimationFrame(frame);
    }

    var raf = 0;
    resize();
    window.addEventListener('resize', resize);
    if (reduced) { frame(performance.now()); cancelAnimationFrame(raf); if (drift) drift.textContent = '0.00'; }
    else raf = requestAnimationFrame(frame);
  }

  function form() {
    var f = $('#channelForm');
    if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#fName').value.trim() || 'unnamed caller';
      var mail = $('#fMail').value.trim();
      var role = $('#fRole').value;
      var bays = $('#fBays').value;
      var msg  = $('#fMsg').value.trim();
      var hex = '0123456789ABCDEF', id = '';
      for (var i = 0; i < 6; i++) id += hex[Math.floor(rand() * 16)];
      var d = new Date();

      $('#receipt').innerHTML =
        '▸ CHANNEL <b>' + id + '</b> OPENED ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) + '<br/>' +
        '  caller ....... <b>' + esc(name) + '</b><br/>' +
        '  standing ..... <b>' + esc(role) + '</b>, ' + esc(bays) + '<br/>' +
        (mail ? '  return path .. <b>' + esc(mail) + '</b><br/>' : '') +
        (msg ? '  payload ...... ' + esc(msg.slice(0, 220)) + (msg.length > 220 ? '…' : '') + '<br/>' : '') +
        '<br/>▸ TRANSMITTED TO: <b>nowhere</b>. This page has no network. Your text was read back ' +
        'from the form and has not been stored, sent or logged. To reach a person about the real ' +
        'product, use the live contact page linked beside this form.';
      $('#receipt').classList.add('on');
      $('#receipt').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  OS.start(function () { signal(); form(); });
})();
