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
     'Rebuilt so Arabic and English are both first-class — right to left in the layout, not a stylesheet bolted on. A technician can work one-handed, in Arabic, on a phone.'],
    ['2025', 'Happened', 'ZATCA Phase 2, and the audit row',
     'E-invoicing with a QR and a hash on every invoice, and a rule that never got an exception: who changed what, when, from what, to what — for everything, forever.'],
    ['2026', 'Shipping now', 'Thirteen subsystems, fourteen roles',
     'Workshop, registry, finance, accounting, CRM, administration, authentication, AI, parts, call centre, reports, HR and portals. Twenty-eight modules, three portals, two languages.'],
    ['2028', 'Planned', 'The data starts paying us back',
     'Two years of job records is enough to forecast with. Stock stops being ordered against a floor and starts being ordered against next month&rsquo;s diary — the first time the system is trusted to reason about money.'],
    ['2030', 'You are here', 'The workshop stops guessing',
     'The board proposes and a human approves. The car&rsquo;s own data says what fails next. Eleven branches and nine vans on one diary. No invention in that list — only the four years above it.']
  ];

  var PRINCIPLES = [
    ['Arabic is not a feature', 'It is half the product. Anything that works in English works in Arabic, right to left, on the same day — or it does not ship.'],
    ['One write, one truth', 'A number is entered once. If two screens disagree, that is a bug of the highest severity, not a reconciliation task for a person.'],
    ['The refusal is logged too', 'Every permission check that says no is recorded as carefully as every change that says yes. A boundary you cannot audit is decoration.'],
    ['A second signature exists', 'Quality control is a different human. No automation, no seniority and no deadline has ever been allowed to collapse that into one.'],
    ['Your history is yours', 'Export runs whether or not the invoice is paid. A system that holds your data hostage is not a system, it is a hostage arrangement.'],
    ['Say what is real', 'Including on a page like this one. Every invented figure on this site is labelled as invented, and the System page names exactly what 2030 would still have to build.']
  ];

  var DISPATCHES = [
    ['2030·03', 'Field note', 'What the board gets wrong',
     'A month of reading the schedule&rsquo;s rejected suggestions. It is almost never wrong about capacity — it is wrong about what the advisor promised on the phone, which is a data problem wearing a scheduling costume.'],
    ['2029·11', 'Engineering', 'The audit row is the product',
     'Every feature we are proud of is downstream of one decision made in 2020: write who changed what, when, from what, to what — for everything, forever, with no exceptions for convenience.'],
    ['2029·04', 'Design', 'Against the dashboard',
     'Years of watching people use dashboards they did not ask for. What an owner wants is not twelve charts; it is one number and permission to stop worrying about it until it moves.'],
    ['2028·08', 'Field note', 'Arabic, one-handed, in a hot bay',
     'The interface constraint that shaped more of this product than any other: a technician holding a part, in gloves, in forty-six degrees, who needs the next instruction in three words.'],
    ['2027·10', 'Engineering', 'Why a prediction shows its confidence',
     'The first version of &ldquo;what breaks next&rdquo; gave a date and no doubt. Advisors stopped trusting it the first time it was wrong. A number with a confidence beside it survives being wrong; a number without one does not.'],
    ['2027·02', 'Policy', 'The export button is not a tier feature',
     'Written after a competitor&rsquo;s customers found out what an exit clause looks like when the data lives somewhere else. Ours is one button, it is not behind billing, and it never will be.']
  ];

  var OPEN = [
    ['Scheduling engineer', 'RUH · on the floor', 'You will be arguing with nine bays for a living. Constraint solving, and the patience to watch a real workshop for a week before writing a line.'],
    ['Arabic interface designer', 'RUH / remote', 'Right-to-left as a first thought, not a mirror. You have opinions about numerals in a mixed sentence and you are right about them.'],
    ['Data scientist — vehicle failure', 'RUH', 'Turning a diagnostic port and eleven years of service history into a ranked list of what fails next, and being honest in public about the confidence attached.'],
    ['Branch operations lead', 'Kingdom-wide · travel', 'Eleven branches, nine vans and the weather. Logistics for a workshop that has started leaving the building.'],
    ['Finance and compliance', 'RUH', 'ZATCA, VAT, and the question an auditor asks in year six. A prior life in tax or audit is an advantage, not a liability.'],
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
