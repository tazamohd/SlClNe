/* ═══════════════════════════════════════════════════════════════════════
   Origin page — the company's own rail, its principles, its writing and
   the standings it is looking to fill.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var OS = window.SalisOS;
  var $ = OS.$, pad = OS.pad;

  var STORY = [
    ['2019', 'Happened', 'A Thursday in Riyadh',
     'One workshop, four systems and an accountant re-typing invoices after hours. The first version was a job card that wrote its own journal entry, and nothing else.'],
    ['2023', 'Happened', 'Arabic stops being a translation',
     'The product is rebuilt so Arabic and English are both first-class — right to left in the layout, not a stylesheet bolted on. A technician can work one-handed, in Arabic, on a phone.'],
    ['2025', 'Shipping', 'Thirteen subsystems, fourteen roles',
     'Workshop, registry, finance, accounting, CRM, administration, authentication, AI, parts, call centre, reports, HR and portals — with ZATCA Phase 2 e-invoicing and an audit row for every change.'],
    ['2031', 'Predicted', 'The forecast beats the minimum',
     'Stock stops being ordered against a floor and starts being ordered against next month&rsquo;s bookings. The first time the system is trusted to spend money on its own reasoning.'],
    ['2038', 'Predicted', 'The vehicle files first',
     'Telemetry arrives ahead of the car and the estimate is drafted before the customer is. The advisor&rsquo;s job changes from data entry to judgement, which is the whole thesis, thirteen years late.'],
    ['2047', 'Predicted', 'The walls come off',
     'Mobile cells outnumber fixed bays for the first time. The company stops describing itself as workshop software and starts describing itself as a grid operator.'],
    ['2060', 'You are here', 'The lattice',
     'Nine bays negotiating their own queue in Riyadh, thirty-one nodes across the kingdom, and one accountant somewhere who has never re-typed an invoice in her life and cannot imagine why anyone did.']
  ];

  var PRINCIPLES = [
    ['Arabic is not a feature', 'It is half the product. Anything that works in English works in Arabic, right to left, on the same day — or it does not ship.'],
    ['One write, one truth', 'A number is entered once. If two screens disagree, that is a bug of the highest severity, not a reconciliation task for a person.'],
    ['The refusal is logged too', 'Every permission check that says no is recorded as carefully as every change that says yes. A boundary you cannot audit is decoration.'],
    ['A second signature exists', 'Quality control is a different human. No automation, no seniority and no deadline has ever been allowed to collapse that into one.'],
    ['Your history is yours', 'Export runs whether or not the invoice is paid. A system that holds your data hostage is not a system, it is a hostage arrangement.'],
    ['Say what is real', 'Including on a page like this one. Every invented figure on this site is labelled as invented, because the alternative is a demo that lies.']
  ];

  var DISPATCHES = [
    ['2060·03', 'Field note', 'What nine bays argue about',
     'A week spent reading the negotiation log. The bays almost never disagree about capability — they disagree about whose customer said what about time, which turns out to be a data problem wearing a scheduling costume.'],
    ['2059·11', 'Engineering', 'The audit row is the product',
     'Every feature we are proud of is downstream of one decision made in 2020: write who changed what, when, from what, to what — for everything, forever, with no exceptions for convenience.'],
    ['2058·07', 'Design', 'Against the dashboard',
     'Six years of watching people use dashboards they did not ask for. What an owner wants is not twelve charts; it is one number and permission to stop worrying about it until it moves.'],
    ['2057·02', 'Field note', 'Arabic, one-handed, in a hot bay',
     'The interface constraint that shaped more of this product than any other: a technician holding a part, in gloves, in forty-six degrees, who needs the next instruction in three words.'],
    ['2056·09', 'Policy', 'Why we refuse to hold your ledger hostage',
     'A note written after a competitor&rsquo;s customers found out what an exit clause looks like when the data lives somewhere else. Ours is one button and it is not behind billing.'],
    ['2055·04', 'Engineering', 'The estimate that signs itself',
     'Thirty years of shaving a two-day loop down to four hours, then to forty minutes, then to before-you-arrive — and the only hard part, every single time, was trust rather than latency.']
  ];

  var OPEN = [
    ['Lattice negotiation engineer', 'RUH · on the floor', 'You will be arguing with nine bays for a living. Distributed systems, and the patience to watch a real workshop for a week before writing a line.'],
    ['Arabic interface designer', 'RUH / remote', 'Right-to-left as a first thought, not a mirror. You have opinions about numerals in a mixed sentence and you are right about them.'],
    ['Diagnostic core researcher', 'RUH · lab', 'Turning a vehicle&rsquo;s whole life into one signature, and being honest in public about the confidence attached to it.'],
    ['Grid operations lead', 'Kingdom-wide · travel', 'Thirty-one nodes, twelve cells and the weather. Logistics for a workshop that no longer has a car park.'],
    ['Ledger and compliance', 'RUH', 'Custody, notarisation and the question a regulator asks in year eleven. Prior life in tax or audit is an advantage, not a liability.'],
    ['Technician, bay 04', 'RUH · shift', 'Yes, really. Everyone who builds this spends time in a bay, and one of the bays has to be staffed by someone who actually knows what they are doing.']
  ];

  OS.start(function () {
    $('#storyRail').innerHTML = STORY.map(function (e, i) {
      return '<article class="era' + (i === STORY.length - 1 ? ' now' : '') + '">' +
        '<div class="yr">' + e[0] + '<small>' + e[1] + '</small></div>' +
        '<div><h3>' + e[2] + '</h3><p>' + e[3] + '</p></div></article>';
    }).join('');

    $('#principleCards').innerHTML = PRINCIPLES.map(function (p, i) {
      return '<article class="panel card rise"><i class="corner tl"></i><i class="corner br"></i>' +
        '<div class="idx"><span>PRINCIPLE ' + pad(i + 1) + '</span><b>HELD</b></div>' +
        '<h3>' + p[0] + '</h3><p>' + p[1] + '</p></article>';
    }).join('');

    $('#dispatchList').innerHTML = DISPATCHES.map(function (d) {
      return '<article class="dispatch rise">' +
        '<div class="meta"><b>' + d[0] + '</b>' + d[1] + '</div>' +
        '<div><h3>' + d[2] + '</h3><p>' + d[3] + '</p></div></article>';
    }).join('');

    $('#openRoles').innerHTML = OPEN.map(function (r) {
      return '<div class="role"><div><h4>' + r[0] + '</h4><p>' + r[2] + '</p></div>' +
             '<div class="where">' + r[1] + '</div></div>';
    }).join('');
  });
})();
