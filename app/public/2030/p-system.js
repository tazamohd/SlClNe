/* ═══════════════════════════════════════════════════════════════════════
   The System page. One data table drives three views: the constellation,
   the card inventory and the honesty matrix — so the fiction and the fact
   can never drift apart in one place and not the other.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var OS = window.SalisOS;
  var $ = OS.$, $$ = OS.$$, esc = OS.esc, between = OS.between, reduced = OS.reduced;

  /* name    — what it is called in 2030
     then    — the module that ships today, verbatim from the product
     blurb   — what 2030 adds to it
     mods    — real capabilities, with the 2030 change on the right */
  var SUB = [
    { key: 'board', name: 'The Board', then: 'Workshop', ring: 0,
      blurb: 'Nine bays on one screen. The schedule proposes a plan from certifications, parts that actually landed and what the customer was promised — and a human approves it. Every move writes an audit row, so &ldquo;why is that car in bay 6&rdquo; has an answer.',
      mods: [['Job cards', 'unchanged'], ['Bay board', 'now proposes'], ['Inspection, multi-point with severity', 'unchanged']] },
    { key: 'record', name: 'Vehicle Record', then: 'Registry', ring: 0,
      blurb: 'Eleven years of what this car has had done, what it was doing when it went wrong, and who signed for it. The single thing every other subsystem hangs off.',
      mods: [['Vehicles, VIN decoding', 'unchanged'], ['Customers', 'unchanged'], ['Service history', 'now machine-read']] },
    { key: 'invoice', name: 'The Invoice', then: 'Finance', ring: 0,
      blurb: 'ZATCA Phase 2 today, ZATCA Phase 2 in 2030 — this one does not need to change. What changes is that nobody types it twice and the customer keeps a copy that outlives the car.',
      mods: [['ZATCA Phase 2 e-invoicing', 'unchanged'], ['VAT 15%', 'unchanged'], ['Payments, Mada', 'unchanged']] },
    { key: 'closing', name: 'Closing', then: 'Accounting', ring: 1,
      blurb: 'The journal entry comes from the invoice, which comes from the job card. The month closes because it was never open in the first place; a human reviews rather than reassembles.',
      mods: [['Chart of accounts', 'unchanged'], ['Journals from invoices', 'no re-keying'], ['Statements', 'continuous']] },
    { key: 'signal', name: 'Signal', then: 'CRM and marketing', ring: 1,
      blurb: 'The reminder goes out when the car is due rather than when the calendar says — because by 2030 the car&rsquo;s own data is what decides &ldquo;due&rdquo;.',
      mods: [['Service reminders', 'condition-based'], ['Campaigns: SMS, email, WhatsApp', 'unchanged'], ['Loyalty', 'unchanged']] },
    { key: 'bounds', name: 'Boundaries', then: 'Administration', ring: 1,
      blurb: 'Organisation, branch, user. Eleven branches on one tenancy, each seeing its own floor, with the group able to see all of it and nobody able to see across.',
      mods: [['Organisation, branch, user', 'unchanged'], ['14 roles, 28 modules', 'unchanged'], ['Branch settings', 'unchanged']] },
    { key: 'identity', name: 'Identity', then: 'Authentication', ring: 1,
      blurb: 'Who signed in, on what, and what they were allowed to do. The least glamorous subsystem on this page and the one a regulator asks about first.',
      mods: [['Password policy', 'unchanged'], ['SMS OTP', 'unchanged'], ['Session control', 'unchanged']] },
    { key: 'core', name: 'The Core', then: 'AI platform', ring: 0,
      blurb: 'Reads the diagnostic port and the history and says what fails next, with the confidence it earned. Answers questions in plain language over the workshop&rsquo;s own data — and cites the rows it used.',
      mods: [['Assistant', 'now cites its sources'], ['Knowledge base', 'unchanged'], ['Agents', 'proposes, never commits']] },
    { key: 'stock', name: 'Stock', then: 'Parts and inventory', ring: 1,
      blurb: 'Ordered against next month&rsquo;s bookings instead of a reorder level, visible across all eleven branches, and sourced same-day from whichever one already has it.',
      mods: [['Stock, minimums', 'forecast-led'], ['Purchase orders', 'unchanged'], ['Supplier catalogues', 'live pricing']] },
    { key: 'line', name: 'The Line', then: 'Call centre', ring: 2,
      blurb: 'Every conversation about a car — call, WhatsApp, walk-in — on one thread against one vehicle, with the follow-up booked before the call ends.',
      mods: [['Call logging', 'one thread'], ['Appointments', 'network-wide'], ['Follow-ups', 'never dropped']] },
    { key: 'readouts', name: 'Readouts', then: 'Reports and analytics', ring: 2,
      blurb: 'One number per role, and permission to stop worrying about it until it moves. The owner sees money; the advisor sees today; the technician sees the next hour.',
      mods: [['Role dashboards', 'unchanged'], ['Custom reports', 'ask in words'], ['KPIs, alerts', 'pushed, not pulled']] },
    { key: 'crew', name: 'The Crew', then: 'Team and HR', ring: 2,
      blurb: 'Records, Iqama dates, attendance and certifications — the last of which the board reads before it puts anyone on a job.',
      mods: [['Employee records, Iqama', 'unchanged'], ['Attendance', 'unchanged'], ['Performance', 'outcome-based']] },
    { key: 'doors', name: 'Three Doors', then: 'Portals', ring: 2,
      blurb: 'Customer, technician, supplier. Three ways in, each seeing its own slice and nothing next to it. All three exist today; 2030 only widens what is behind them.',
      mods: [['Customer app', 'unchanged'], ['Technician portal', 'unchanged'], ['Supplier portal', 'live stock']] }
  ];

  /* Every role the product actually defines. None of these change by 2030. */
  var ROLES = [
    ['Owner / CEO', 'all', 'Sees money, and the shape of every branch at once'],
    ['Super Admin', 'platform', 'Holds the platform itself, and is audited hardest'],
    ['Branch Manager', 'branch', 'Owns one branch and everything that happens in it'],
    ['Service Advisor', 'branch', 'Stands where the customer stands; signs nothing alone'],
    ['Technician', 'own', 'Sees the next hour, in Arabic, with one hand free'],
    ['QC Inspector', 'branch', 'The second signature. Cannot be the first'],
    ['Storekeeper', 'branch', 'Moves matter, and answers for every unit of it'],
    ['Accountant', 'all', 'Reads every ledger, writes to none of the bays'],
    ['HR Manager', 'all', 'Holds the crew records, and the fatigue signal'],
    ['Receptionist', 'branch', 'The gate. Identifies a walk-in without a session'],
    ['Call Center Agent', 'all', 'One thread per vehicle, across every branch'],
    ['Procurement Agent', 'all', 'Licences geometry, places orders, cannot receive them'],
    ['Supplier', 'external', 'Sees its own orders and nothing beside them'],
    ['Customer', 'self', 'Sees one life — the vehicle&rsquo;s — and owns the record of it']
  ];

  /* The honest column. Four years out, the gap is small enough to name
     precisely — which is a better argument than any adjective. */
  var TRUTH = [
    ['The board proposes the day&rsquo;s schedule', 'A bay board a human moves work across', 'Scheduling logic'],
    ['The car&rsquo;s port is read at every check-in', 'An OBD integration that already exists', 'Make it routine'],
    ['&ldquo;What breaks next&rdquo;, with a confidence', 'Inspection with severity, and full history', 'A model + 2 years of data'],
    ['Stock ordered against next month&rsquo;s diary', 'Stock with minimums and reorder points', 'A forecast'],
    ['Nine vans running off the branch diary', 'Appointments, check-in, branches', 'Vehicles and people'],
    ['One thread per car across every channel', 'Call logging and appointments', 'Channel integrations'],
    ['ZATCA Phase 2, VAT, journals from invoices', 'ZATCA Phase 2, VAT, journals from invoices', 'None — this ships'],
    ['Fourteen roles enforced on every write', 'Fourteen roles enforced on every write', 'None — this ships']
  ];

  /* ── Constellation ───────────────────────────────────────────────── */
  var CX = 500, CY = 372, RINGS = [172, 240, 292];

  function nodePos(i) {
    var a = (i / SUB.length) * Math.PI * 2 - Math.PI / 2;
    var r = RINGS[SUB[i].ring];
    return [CX + Math.cos(a) * r * 1.30, CY + Math.sin(a) * r * 0.90];
  }

  function drawConstellation() {
    var svg = $('#constelSvg');
    if (!svg) return;
    var parts = [];

    parts.push('<defs><radialGradient id="coreGlow"><stop offset="0%" stop-color="#0BB3FF" stop-opacity=".55"/>' +
               '<stop offset="100%" stop-color="#0BB3FF" stop-opacity="0"/></radialGradient></defs>');

    /* Spokes first, so nodes sit on top of them. */
    SUB.forEach(function (s, i) {
      var p = nodePos(i);
      parts.push('<line x1="' + CX + '" y1="' + CY + '" x2="' + p[0].toFixed(1) + '" y2="' + p[1].toFixed(1) +
                 '" stroke="rgba(11,179,255,.16)" stroke-width="1"/>');
    });
    /* A few neighbour links — the point being that these talk sideways. */
    [[0, 2], [2, 3], [0, 8], [4, 12], [7, 10], [1, 7], [9, 4], [5, 6]].forEach(function (pair) {
      var a = nodePos(pair[0]), b = nodePos(pair[1]);
      parts.push('<path d="M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + ' Q ' + CX + ' ' + CY + ' ' +
                 b[0].toFixed(1) + ' ' + b[1].toFixed(1) + '" fill="none" stroke="rgba(249,115,22,.16)" stroke-width="1"/>');
    });

    parts.push('<circle cx="' + CX + '" cy="' + CY + '" r="118" fill="url(#coreGlow)"/>');
    parts.push('<circle cx="' + CX + '" cy="' + CY + '" r="52" fill="rgba(5,7,14,.9)" stroke="rgba(11,179,255,.6)"/>');
    parts.push('<text x="' + CX + '" y="' + (CY - 2) + '" text-anchor="middle" fill="#fff" ' +
               'font-family="ui-monospace, monospace" font-size="17" letter-spacing="3">AL-MALAZ</text>');
    parts.push('<text x="' + CX + '" y="' + (CY + 14) + '" text-anchor="middle" fill="#0BB3FF" ' +
               'font-family="ui-monospace, monospace" font-size="13" letter-spacing="3">RIYADH</text>');

    SUB.forEach(function (s, i) {
      var p = nodePos(i), right = p[0] >= CX;
      /* A node sitting on the vertical axis has no room beside it — its label
         goes above or below instead, so the top and bottom nodes stay legible. */
      var axial = Math.abs(p[0] - CX) < 90;
      var lx = axial ? p[0] : p[0] + (right ? 20 : -20);
      var ly = axial ? p[1] + (p[1] < CY ? -20 : 30) : p[1] + 5;
      var anchor = axial ? 'middle' : (right ? 'start' : 'end');
      parts.push(
        '<g class="node-hit" data-i="' + i + '" tabindex="0" role="button" aria-label="' + esc(s.name) + '">' +
          '<circle class="halo" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="21" ' +
            'fill="rgba(11,179,255,.16)" opacity="0"/>' +
          '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="9" ' +
            'fill="#05070E" stroke="#0BB3FF" stroke-width="1.4"/>' +
          '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="2.6" fill="#0BB3FF"/>' +
          '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" ' +
            'text-anchor="' + anchor + '">' + esc(s.name) + '</text>' +
        '</g>');
    });

    svg.innerHTML = parts.join('');

    var chosen = -1;
    function select(i) {
      if (i === chosen) return;
      chosen = i;
      $$('.node-hit', svg).forEach(function (g, k) { g.classList.toggle('sel', k === i); });
      var s = SUB[i];
      $('#constelDetail').innerHTML =
        '<i class="corner tr"></i><i class="corner bl"></i>' +
        '<span class="tag">Subsystem ' + OS.pad(i + 1) + ' / 13</span>' +
        '<h3>' + s.name + '</h3>' +
        '<div class="then">Today: ' + s.then + '</div>' +
        '<p>' + s.blurb + '</p>' +
        '<ul>' + s.mods.map(function (m) {
          return '<li><span>' + m[0] + '</span><b>' + m[1] + '</b></li>';
        }).join('') + '</ul>' +
        '<div class="hint">Left column ships today &middot; right column is what 2030 adds</div>';
    }

    $$('.node-hit', svg).forEach(function (g) {
      var i = parseInt(g.getAttribute('data-i'), 10);
      g.addEventListener('click', function () { auto = false; select(i); });
      g.addEventListener('mouseenter', function () { if (auto) select(i); });
      g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); auto = false; select(i); }
      });
    });

    var auto = !reduced, k = 0;
    select(0);
    if (auto) {
      window.setInterval(function () {
        if (!auto) return;
        k = (k + 1) % SUB.length;
        select(k);
      }, 5200);
    }
  }

  /* ── Inventory, roles, honesty matrix ────────────────────────────── */
  function inventory() {
    $('#subsystemCards').innerHTML = SUB.map(function (s, i) {
      return '<article class="panel card rise">' +
        '<i class="corner tl"></i><i class="corner br"></i>' +
        '<div class="idx"><span>SUBSYSTEM ' + OS.pad(i + 1) + '</span><b>' +
          Math.round(between(96, 99.9) * 10) / 10 + '% UP</b></div>' +
        '<h3>' + s.name + '</h3>' +
        '<div class="then">' + s.then + '</div>' +
        '<p>' + s.blurb + '</p>' +
        '<ul>' + s.mods.map(function (m) { return '<li>' + m[0] + '</li>'; }).join('') + '</ul>' +
      '</article>';
    }).join('');
  }

  function roles() {
    $('#roleList').innerHTML = ROLES.map(function (r) {
      return '<div class="role"><div><h4>' + r[0] + '</h4><p>' + r[2] + '</p></div>' +
             '<div class="where">' + r[1] + '</div></div>';
    }).join('');
  }

  function truth() {
    $('#truthRows').innerHTML = TRUTH.map(function (t) {
      var real = t[2].indexOf('None') === 0;
      return '<tr><th>' + t[0] + '</th><td style="text-align:start;color:var(--mist)">' + t[1] + '</td>' +
             '<td class="' + (real ? '' : 'em') + '">' + t[2] + '</td></tr>';
    }).join('');
  }

  OS.start(function () {
    drawConstellation();
    inventory();
    roles();
    truth();
  });
})();
