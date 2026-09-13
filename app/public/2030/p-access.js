/* ═══════════════════════════════════════════════════════════════════════
   Pricing page — three tiers and the comparison matrix. Prices are
   invented; the toggle simply recomputes the same invented number.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var OS = window.SalisOS;
  var $ = OS.$, $$ = OS.$$;

  var STRATA = [
    {
      name: 'Workshop', forWho: 'One site', price: 1450, feature: false,
      note: 'Up to 6 bays · 15 seats',
      has: ['All thirteen subsystems', 'All fourteen roles, 15 seats',
            'Customer and technician portals', 'ZATCA Phase 2 e-invoicing',
            'OBD reads at check-in', 'Stock with minimums and reorder points'],
      off: ['Group stock visibility', 'Service vans on the diary', 'Data inside your own boundary']
    },
    {
      name: 'Group', forWho: 'Several branches', price: 4900, feature: true,
      note: 'Up to 9 bays per site, 6 sites · 70 seats',
      has: ['Everything in Workshop', 'All fourteen roles, 70 seats',
            'Supplier portal as well', 'One stock view across every branch',
            'Service vans scheduled off the same diary', 'Forecast-led ordering',
            'Group reporting across sites'],
      off: ['Data inside your own boundary']
    },
    {
      name: 'Enterprise', forWho: 'An operator with its own rules', price: null, feature: false,
      note: 'Unlimited sites · your boundary, your agreements',
      has: ['Everything in Group', 'Unlimited sites, vans and seats',
            'Data inside your own boundary', 'Your own supplier agreements',
            'Franchise and multi-operator layer', 'Named support and an SLA'],
      off: []
    }
  ];

  var MATRIX = [
    ['— What 2030 adds —', null, null, null],
    ['Board proposes the schedule', 'Single site', 'Across sites', 'Unlimited'],
    ['Service vans on the diary', '—', '4', 'Unlimited'],
    ['One stock view across branches', '—', 'Yes', 'Yes'],
    ['&ldquo;What breaks next&rdquo; predictions', 'Yes', 'Yes', 'Yes'],
    ['Where the data lives', 'With us', 'With us', 'Your boundary'],
    ['— What ships today —', null, null, null],
    ['Thirteen subsystems, 28 modules', 'All', 'All', 'All'],
    ['Fourteen roles, enforced per write', 'All', 'All', 'All'],
    ['ZATCA Phase 2 e-invoicing', 'Yes', 'Yes', 'Yes'],
    ['Arabic and English, RTL throughout', 'Yes', 'Yes', 'Yes'],
    ['Audit row per change', 'Yes', 'Yes', 'Yes'],
    ['Full export, any time', 'Yes', 'Yes', 'Yes'],
    ['Customer / technician / supplier portals', '2 portals', '3 portals', '3 portals']
  ];

  var mode = 'cycle';

  function priceOf(s) {
    if (s.price === null) return { big: 'Let&rsquo;s talk', em: '', per: 'Priced against your sites' };
    if (mode === 'year') {
      return { big: (Math.round(s.price * 12 * 0.85 / 100) * 100).toLocaleString('en-US'),
               em: 'SAR', per: 'per branch, per year · 15% off' };
    }
    return { big: s.price.toLocaleString('en-US'), em: 'SAR', per: 'per branch, per month' };
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
        '<a class="btn' + (s.feature ? '' : ' ghost') + '" href="channel.html">Ask for a real number</a>' +
        '<div class="foot-note">' + s.note + '<br/>Illustrative figure — ask us for a real one</div>' +
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
