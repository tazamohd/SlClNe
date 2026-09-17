/* ============================================================
   Salisco — demo request form
   ------------------------------------------------------------
   Honest, configurable submission adapter.

   There is no deployed backend for saleisco.com today — the
   repository's own deployment audit (docs/29_OPERATIONS_DEVOPS/
   ENVIRONMENTS_AND_DEPLOYMENT.md §6.2) records the API as
   "assumed, not defined": no host, no database, no live URL.

   The SALIS AUTO server already defines exactly the endpoint this
   form needs — POST /public/leads (server/src/routes/public.ts),
   validated by the shared `publicLeadCreate` contract
   (packages/contract/src/entities/public.ts): name (required,
   <=160 chars), email or phone (at least one, validated), company
   (<=200), message (<=2000), source (<=64). This form mirrors that
   contract exactly so it starts working the moment an owner points
   LEAD_API_BASE at a deployed instance — no field changes needed.

   Until then, LEAD_API_BASE is empty and the form degrades to a
   pre-filled mailto: draft. That is a real, working outcome (a
   human reads it), not a fake success screen.
   ============================================================ */
(function demoRequestForm() {
  const form = document.getElementById("demoForm");
  if (!form) return;

  // Set this once server/ is deployed and reachable from the browser,
  // e.g. "https://api.salisauto.sa" — see the deployment doc above.
  const LEAD_API_BASE = "";
  const FALLBACK_EMAIL = "hello@salisco.sa";

  const note = document.getElementById("demoFormNote");
  const submitBtn = form.querySelector('button[type="submit"]');
  const submitLabel = submitBtn?.querySelector(".btn-label");
  const isAr = document.documentElement.lang === "ar";

  const T = isAr ? {
    name: "أدخل اسمك.", nameLen: "احرص ألا يتجاوز 160 حرفًا.",
    emailOrPhone: "يرجى إدخال بريد إلكتروني أو رقم هاتف للرد عليك.",
    email: "أدخل بريدًا إلكترونيًا صحيحًا.", phone: "أدخل رقم هاتف صحيحًا.",
    company: "أدخل اسم الشركة أو الورشة.", type: "اختر نوع النشاط.",
    consent: "يرجى تأكيد رغبتك في أن نتواصل معك.",
    fixFields: "يرجى تصحيح الحقول المظلَّلة.", sending: "جارٍ الإرسال…",
    sentApi: "شكرًا — سيتواصل معك فريقنا قريبًا.",
    apiError: "تعذّر الوصول إلى خادمنا الآن — يرجى استخدام رابط البريد أدناه بدلًا من ذلك.",
    mailto: "جارٍ فتح تطبيق البريد لإرسال هذا إلى فريقنا…",
  } : {
    name: "Enter your name.", nameLen: "Keep it under 160 characters.",
    emailOrPhone: "Provide an email or a phone number so we can reply.",
    email: "Enter a valid email address.", phone: "Enter a valid phone number.",
    company: "Enter a company or workshop name.", type: "Select a business type.",
    consent: "Please confirm you'd like us to contact you.",
    fixFields: "Please fix the highlighted fields.", sending: "Sending…",
    sentApi: "Thanks — our team will be in touch shortly.",
    apiError: "We couldn't reach our server just now — please use the email link below instead.",
    mailto: "Opening your email app to send this to our team…",
  };

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_RE = /^[+0-9][0-9\s-]{6,20}$/;

  function fieldError(id, msg) {
    const el = document.getElementById(id + "-err");
    const input = document.getElementById(id);
    if (el) el.textContent = msg || "";
    if (input) input.setAttribute("aria-invalid", msg ? "true" : "false");
  }

  function validate(data) {
    let ok = true;
    if (!data.name) { fieldError("df-name", T.name); ok = false; } else fieldError("df-name");
    if (data.name.length > 160) { fieldError("df-name", T.nameLen); ok = false; }

    const hasEmail = !!data.email, hasPhone = !!data.phone;
    if (!hasEmail && !hasPhone) {
      fieldError("df-email", T.emailOrPhone);
      ok = false;
    } else {
      fieldError("df-email", hasEmail && !EMAIL_RE.test(data.email) ? T.email : "");
      if (hasEmail && !EMAIL_RE.test(data.email)) ok = false;
      fieldError("df-phone", hasPhone && !PHONE_RE.test(data.phone) ? T.phone : "");
      if (hasPhone && !PHONE_RE.test(data.phone)) ok = false;
    }
    if (!data.company) { fieldError("df-company", T.company); ok = false; } else fieldError("df-company");
    if (!data.businessType) { fieldError("df-type", T.type); ok = false; } else fieldError("df-type");
    if (!data.consent) { fieldError("df-consent", T.consent); ok = false; } else fieldError("df-consent");
    return ok;
  }

  function setBusy(busy) {
    if (submitBtn) submitBtn.disabled = busy;
    if (submitLabel) submitLabel.dataset.orig = submitLabel.dataset.orig || submitLabel.textContent;
    if (note) note.setAttribute("aria-busy", busy ? "true" : "false");
  }

  function track(event, detail) {
    // No sensitive field values are ever passed here — see README-analytics.md.
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event }, detail || {}));
  }

  let started = false;
  form.addEventListener("input", () => { if (!started) { started = true; track("demo_form_start"); } }, { once: false });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = {
      name: (fd.get("name") || "").toString().trim(),
      email: (fd.get("email") || "").toString().trim(),
      phone: (fd.get("phone") || "").toString().trim(),
      company: (fd.get("company") || "").toString().trim(),
      businessType: (fd.get("businessType") || "").toString(),
      teamSize: (fd.get("teamSize") || "").toString(),
      msg: (fd.get("message") || "").toString().trim(),
      consent: fd.get("consent") === "on",
    };

    if (!validate(data)) {
      track("demo_form_error");
      if (note) { note.textContent = T.fixFields; note.className = "form-note err"; }
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    const message = [
      `Business type: ${data.businessType}`,
      data.teamSize ? `Approximate size: ${data.teamSize}` : null,
      data.msg ? `\n${data.msg}` : null,
    ].filter(Boolean).join("\n").slice(0, 2000);

    const payload = {
      name: data.name.slice(0, 160),
      company: data.company.slice(0, 200),
      message,
      source: "saleisco.com demo request",
    };
    if (data.email) payload.email = data.email;
    if (data.phone) payload.phone = data.phone;

    setBusy(true);
    if (note) { note.textContent = T.sending; note.className = "form-note"; }

    if (LEAD_API_BASE) {
      try {
        const res = await fetch(LEAD_API_BASE.replace(/\/$/, "") + "/public/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setBusy(false);
        if (!res.ok) throw new Error("request failed");
        track("demo_form_submit", { method: "api" });
        note.textContent = T.sentApi;
        note.className = "form-note ok";
        form.reset();
        return;
      } catch (err) {
        setBusy(false);
        track("demo_form_error", { method: "api" });
        note.textContent = T.apiError;
        note.className = "form-note err";
        return;
      }
    }

    // No API configured yet: an honest, working fallback — a pre-filled
    // email draft, not a fake "submitted" confirmation.
    setBusy(false);
    const subject = encodeURIComponent(`Demo request — ${data.company}`);
    const bodyLines = [
      `Name: ${data.name}`, `Company: ${data.company}`, `Business type: ${data.businessType}`,
      data.teamSize ? `Approximate size: ${data.teamSize}` : null,
      data.email ? `Email: ${data.email}` : null, data.phone ? `Phone: ${data.phone}` : null,
      data.msg ? `\nMessage:\n${data.msg}` : null,
    ].filter(Boolean).join("\n");
    window.location.href = `mailto:${FALLBACK_EMAIL}?subject=${subject}&body=${encodeURIComponent(bodyLines)}`;
    track("demo_form_submit", { method: "mailto" });
    note.textContent = T.mailto;
    note.className = "form-note ok";
  });
})();
