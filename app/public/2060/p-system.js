/* ═══════════════════════════════════════════════════════════════════════
   The System page. One data table drives three views: the constellation,
   the card inventory and the honesty matrix — so the fiction and the fact
   can never drift apart in one place and not the other.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var OS = window.SalisOS;
  var $ = OS.$, $$ = OS.$$, esc = OS.esc, between = OS.between, reduced = OS.reduced;

  /* name    — what it is called in 2060
     then    — the module that ships today, verbatim from the product
     blurb   — the fiction
     mods    — real capabilities, with the 2060 gloss on the right */
  var SUB = [
    { key: 'lattice', name: 'Bay Lattice', then: 'Workshop', ring: 0,
      blurb: 'Nine bays that bid for work against each other with tool availability, technician fatigue and the hour the customer said they would return. Nobody assigns anything; the floor settles it and writes the audit row afterwards.',
      mods: [['Job cards', 'bid tickets'], ['Bay board', 'the negotiation'], ['Inspection, multi-point with severity', 'continuous']] },
    { key: 'memory', name: 'Vehicle Memory', then: 'Registry', ring: 0,
      blurb: 'Every vehicle carries its own history and hands it over at the gate. The workshop stops being the archive and becomes a reader of one.',
      mods: [['Vehicles, VIN decoding', 'identity'], ['Customers', 'the other half'], ['Service history', 'the whole life']] },
    { key: 'ledger', name: 'Chrono-Ledger', then: 'Finance', ring: 0,
      blurb: 'The invoice notarises itself at the moment of issue and is held by the customer, not by us. Disputes are resolved by reading, not by arguing.',
      mods: [['ZATCA Phase 2 e-invoicing', 'Phase &infin;'], ['VAT 15%', 'unchanged'], ['Payments, Mada', 'instant settle']] },
    { key: 'books', name: 'Self-Closing Books', then: 'Accounting', ring: 1,
      blurb: 'The journal entry is the invoice, written once. The month closes itself and a human reviews rather than reassembles.',
      mods: [['Chart of accounts', 'fixed spine'], ['Journals from invoices', 'no re-keying'], ['Statements', 'continuous']] },
    { key: 'signal', name: 'Signal', then: 'CRM and marketing', ring: 1,
      blurb: 'The service reminder arrives when the vehicle says it should, in the language the customer reads, on the channel they answer.',
      mods: [['Service reminders', 'vehicle-triggered'], ['Campaigns: SMS, email, WhatsApp', 'one voice'], ['Loyalty', 'earned in bay time']] },
    { key: 'sov', name: 'Sovereignty', then: 'Administration', ring: 1,
      blurb: 'Organisation, branch, user. The boundaries a workshop draws around itself, enforced by the substrate rather than by a policy document nobody has read.',
      mods: [['Organisation, branch, user', 'territory'], ['14 roles, 28 modules', 'standing'], ['Branch settings', 'local law']] },
    { key: 'identity', name: 'Identity Mesh', then: 'Authentication', ring: 1,
      blurb: 'You are recognised before you speak, and the lattice can prove afterwards that it was you. Sessions end themselves when the person walks away from the bay.',
      mods: [['Password policy', 'legacy path'], ['SMS OTP', 'still the fallback'], ['Session control', 'presence-bound']] },
    { key: 'core', name: 'The Core', then: 'AI platform', ring: 0,
      blurb: 'Collapses a vehicle&rsquo;s whole operating history into one signature and answers questions in the workshop&rsquo;s own words, over the workshop&rsquo;s own data.',
      mods: [['Assistant', 'natural language'], ['Knowledge base', 'institutional memory'], ['Agents', 'audited autonomy']] },
    { key: 'matter', name: 'Matter', then: 'Parts and inventory', ring: 1,
      blurb: 'The supplier catalogue became a geometry library. A housing is licensed, printed in the bay in forty minutes, and booked out of stock as it cools.',
      mods: [['Stock, minimums', 'forecast, not floor'], ['Purchase orders', 'licences'], ['Supplier catalogues', 'geometry']] },
    { key: 'voice', name: 'The Voice', then: 'Call centre', ring: 2,
      blurb: 'Every conversation with a customer, wherever it happened, lands in one thread against one vehicle — and the follow-up is scheduled before the call ends.',
      mods: [['Call logging', 'one thread'], ['Appointments', 'grid-aware'], ['Follow-ups', 'never dropped']] },
    { key: 'oracle', name: 'Oracle', then: 'Reports and analytics', ring: 2,
      blurb: 'Dashboards that answer the question the role actually has. The owner sees money, the advisor sees today, the technician sees the next hour.',
      mods: [['Role dashboards', 'per standing'], ['Custom reports', 'ask in words'], ['KPIs, alerts', 'pushed, not pulled']] },
    { key: 'crew', name: 'The Crew', then: 'Team and HR', ring: 2,
      blurb: 'Records, attendance and performance for people whose work is now half physical and half supervisory — and a fatigue signal the lattice is required to respect.',
      mods: [['Employee records, Iqama', 'unchanged'], ['Attendance', 'presence-derived'], ['Performance', 'measured in outcomes']] },
    { key: 'doors', name: 'Three Doors', then: 'Portals', ring: 2,
      blurb: 'Customer, technician, supplier. Three ways in, each seeing exactly its own slice and nothing adjacent to it.',
      mods: [['Customer app', 'the vehicle&rsquo;s own view'], ['Technician portal', 'one hand, in Arabic'], ['Supplier portal', 'geometry and orders']] }
  ];

  /* Every role the product actually defines. The 2060 line is the gloss. */
  var ROLES = [
    ['Owner / CEO', 'all', 'Sees money, and the shape of every branch at once'],
    ['Super Admin', 'platform', 'Holds the platform itself, and is audited hardest'],
    ['Branch Manager', 'branch', 'Owns one lattice and everything that happens in it'],
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

  var TRUTH = [
    ['Nine bays negotiate their own queue', 'A bay board a human moves work across', 'A scheduler'],
    ['The core reads a vehicle&rsquo;s life as one signature', 'Multi-point inspection with severity, recorded per visit', 'A model'],
    ['The invoice notarises itself and the customer holds it', 'ZATCA Phase 2 e-invoicing with a QR and a hash', 'Custody'],
    ['Mobile cells dock beside the vehicle overnight', 'Appointments, check-in and a physical workshop', 'A fleet'],
    ['Parts are printed in the bay in forty minutes', 'Purchase orders against supplier catalogues', 'A printer'],
    ['The lattice recognises you before you speak', 'Password policy, SMS OTP, session control', 'Sensors'],
    ['Fourteen standings enforced at the substrate', 'Fourteen roles enforced on every screen and write', 'None &mdash; this one is real']
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
               'font-family="ui-monospace, monospace" font-size="17" letter-spacing="3">LATTICE</text>');
    parts.push('<text x="' + CX + '" y="' + (CY + 14) + '" text-anchor="middle" fill="#0BB3FF" ' +
               'font-family="ui-monospace, monospace" font-size="13" letter-spacing="3">09</text>');

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
        '<div class="hint">Left column ships today &middot; right column is the fiction</div>';
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
      var real = t[2].indexOf('real') !== -1;
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
