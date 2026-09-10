/* ═══════════════════════════════════════════════════════════════════════
   Access page — three strata and the comparison matrix. Prices are
   invented; the toggle simply recomputes the same invented number.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var OS = window.SalisOS;
  var $ = OS.$, $$ = OS.$$;

  var STRATA = [
    {
      name: 'Bay', forWho: 'One workshop', price: 1900, feature: false,
      note: 'Up to 4 bays on one node · 12 standings',
      has: ['All thirteen subsystems', 'All fourteen roles, 12 seats',
            'Customer and technician doors', 'One grid node, no mobile cell',
            'Core queries: 2,000 per cycle', 'Ledger held with us'],
      off: ['Printing licences', 'Sovereign ledger custody']
    },
    {
      name: 'Lattice', forWho: 'A group of branches', price: 6400, feature: true,
      note: 'Up to 9 bays per node, 5 nodes · 60 standings',
      has: ['All thirteen subsystems', 'All fourteen roles, 60 seats',
            'All three doors, including supplier', 'Five grid nodes and two mobile cells',
            'Core queries: unmetered', 'Printing licences at cost',
            'Bay negotiation across nodes'],
      off: ['Sovereign ledger custody']
    },
    {
      name: 'Sovereign', forWho: 'An operator with its own grid', price: null, feature: false,
      note: 'Unlimited nodes · custody held alone',
      has: ['Everything in Lattice', 'Unlimited nodes, cells and standings',
            'Ledger custody held by you alone', 'Your own print cores and libraries',
            'Core runs inside your boundary', 'Franchise and multi-operator layer'],
      off: []
    }
  ];

  var MATRIX = [
    ['— The fiction —', null, null, null],
    ['Bay negotiation', 'Single node', 'Across 5 nodes', 'Unlimited'],
    ['Mobile service cells', '—', '2', 'Unlimited'],
    ['In-bay printing', '—', 'At cost', 'Own cores'],
    ['Diagnostic core queries', '2,000 / cycle', 'Unmetered', 'Runs inside your boundary'],
    ['Ledger custody', 'With us', 'With us', 'Yours alone'],
    ['— What ships today —', null, null, null],
    ['Thirteen subsystems, 28 modules', 'All', 'All', 'All'],
    ['Fourteen roles, enforced per write', 'All', 'All', 'All'],
    ['ZATCA Phase 2 e-invoicing', 'Yes', 'Yes', 'Yes'],
    ['Arabic and English, RTL throughout', 'Yes', 'Yes', 'Yes'],
    ['Audit row per change', 'Yes', 'Yes', 'Yes'],
    ['Full export, any time', 'Yes', 'Yes', 'Yes'],
    ['Customer / technician / supplier portals', '2 doors', '3 doors', '3 doors']
  ];

  var mode = 'cycle';

  function priceOf(s) {
    if (s.price === null) return { big: 'By treaty', em: '', per: 'Negotiated per grid' };
    if (mode === 'year') {
      return { big: (Math.round(s.price * 12 * 0.85 / 100) * 100).toLocaleString('en-US'),
               em: 'SAR', per: 'per solar year · 15% held back' };
    }
    return { big: s.price.toLocaleString('en-US'), em: 'SAR', per: 'per 30-day cycle' };
  }

  function render() {
    $('#strataCards').innerHTML = STRATA.map(function (s) {
      var p = priceOf(s);
      return '<article class="panel stratum rise' + (s.feature ? ' feature' : '') + '">' +
        '<i class="corner tl"></i><i class="corner br"></i>' +
        '<div class="name">' + s.name + '</div>' +
        '<div class="for">' + s.forWho + '</div>' +
        '<div class="price">' + (p.em ? '<em>' + p.em + '</em>' : '') + p.big + '</div>' +
        '<div class="per">' + p.per + '</div>' +
        '<ul>' +
          s.has.map(function (h) { return '<li>' + h + '</li>'; }).join('') +
          s.off.map(function (o) { return '<li class="off">' + o + '</li>'; }).join('') +
        '</ul>' +
        '<a class="btn' + (s.feature ? '' : ' ghost') + '" href="channel.html">Open a channel</a>' +
        '<div class="foot-note">' + s.note + '<br/>Invented figure — see the real pricing</div>' +
      '</article>';
    }).join('');
  }

  function matrix() {
    $('#matrixRows').innerHTML = MATRIX.map(function (r) {
      if (r[1] === null) {
        return '<tr><th colspan="4" style="color:var(--cyan);font-family:\'SalisMono\',monospace;' +
               'font-size:10px;letter-spacing:.24em;text-transform:uppercase;background:rgba(11,179,255,.05)">' +
               r[0].replace(/—/g, '').trim() + '</th></tr>';
      }
      return '<tr><th>' + r[0] + '</th>' + r.slice(1).map(function (c) {
        return '<td class="' + (c === '—' ? 'no' : '') + '">' + c + '</td>';
      }).join('') + '</tr>';
    }).join('');
  }

  OS.start(function () {
    render();
    matrix();
    $$('#cycleToggle button').forEach(function (b) {
      b.addEventListener('click', function () {
        mode = b.getAttribute('data-mode');
        $$('#cycleToggle button').forEach(function (o) { o.classList.toggle('on', o === b); });
        render();
      });
    });
  });
})();
