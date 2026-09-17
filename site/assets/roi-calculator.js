/* ============================================================
   Salisco — ROI calculator
   ------------------------------------------------------------
   Every number in the formula is a visible input on the page —
   including the two "assumption" sliders (time-reduction and
   revenue-recovery rates). Nothing is hidden or hardcoded from a
   case study; change any input and the result changes with it.
   Shared by the English and Arabic pages — only the surrounding
   copy differs, the math and element ids are identical.
   ============================================================ */
(function roiCalculator() {
  const form = document.getElementById("roiForm");
  if (!form) return;

  const ids = [
    "jobs", "jobValue", "branches", "adminHours", "hourlyCost",
    "reductionPct", "atRiskPct", "recoveryPct",
  ];
  const el = {};
  ids.forEach((id) => { el[id] = document.getElementById(id); });

  const fmtSAR = (n) => "SAR " + Math.round(n).toLocaleString("en-US");
  const fmtHours = (n) => Math.round(n).toLocaleString("en-US");

  function syncOutput(input) {
    const out = document.getElementById(input.id + "-out");
    if (out) out.textContent = input.type === "range" ? input.value + "%" : Number(input.value).toLocaleString("en-US");
  }

  function compute() {
    const jobs = Math.max(0, Number(el.jobs.value) || 0);
    const jobValue = Math.max(0, Number(el.jobValue.value) || 0);
    const branches = Math.max(1, Number(el.branches.value) || 1);
    const adminHours = Math.max(0, Number(el.adminHours.value) || 0);
    const hourlyCost = Math.max(0, Number(el.hourlyCost.value) || 0);
    const reductionPct = Math.min(100, Math.max(0, Number(el.reductionPct.value) || 0)) / 100;
    const atRiskPct = Math.min(100, Math.max(0, Number(el.atRiskPct.value) || 0)) / 100;
    const recoveryPct = Math.min(100, Math.max(0, Number(el.recoveryPct.value) || 0)) / 100;

    const annualAdminHours = adminHours * 52 * branches;
    const hoursSaved = annualAdminHours * reductionPct;
    const adminSavingsSAR = hoursSaved * hourlyCost;

    const annualRevenue = jobs * jobValue * branches * 12;
    const revenueAtRisk = annualRevenue * atRiskPct;
    const revenueRecovered = revenueAtRisk * recoveryPct;

    const total = adminSavingsSAR + revenueRecovered;

    document.getElementById("res-hours").textContent = fmtHours(hoursSaved) + (document.documentElement.lang === "ar" ? " ساعة/سنة" : " hrs/yr");
    document.getElementById("res-admin").textContent = fmtSAR(adminSavingsSAR);
    document.getElementById("res-atrisk").textContent = fmtSAR(revenueAtRisk);
    document.getElementById("res-recovered").textContent = fmtSAR(revenueRecovered);
    document.getElementById("res-total").textContent = fmtSAR(total);
  }

  ids.forEach((id) => {
    el[id].addEventListener("input", () => { syncOutput(el[id]); compute(); });
    syncOutput(el[id]);
  });
  compute();
})();
