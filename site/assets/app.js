/* ============================================================
   Salisco — interactions v2
   i18n (EN/AR + RTL) · scroll reveals · live telemetry ·
   magnetic buttons · cursor spotlight · orbit parallax
   ============================================================ */

// NOTE: Arabic brand wordmark "ساليسكو" is a transliteration placeholder.
const I18N = {
  en: {
    "brand": "Salisco",
    "nav.vision": "Vision", "nav.divisions": "Divisions", "nav.ai": "AI", "nav.salisauto": "SalisAuto", "nav.work": "Work", "nav.next": "Roadmap", "nav.contact": "Contact",
    "ai.kicker": "AI-native", "ai.title": "Intelligence, built into every layer.",
    "ai.lede": "From pixels to predictions — Salisco engineers AI into the core of every product: vision, language and automation that turn raw operational data into decisions.",
    "ai.p1.t": "Predictive intelligence", "ai.p1.b": "Forecast demand, risk and maintenance before it happens.",
    "ai.p2.t": "Computer vision & sensors", "ai.p2.b": "See, detect and respond — from cameras to telematics.",
    "ai.p3.t": "Automation & copilots", "ai.p3.b": "Agents that orchestrate operations and assist every team.",
    "work.kicker": "Selected work", "work.title": "What we're building, in pixels.",
    "work.lede": "A living portfolio across our product lines — one platform live today, more in the pipeline.",
    "work.salisauto": "Fleet & garage management — vehicles, jobs, parts and technicians in one operational view.",
    "work.qhr": "Manpower & HR platform — workforce, compliance and people operations.",
    "work.fleetco": "Fleet leasing & financing on subscription.",
    "work.salissp": "Spare-parts marketplace & supply network.",
    "approach.kicker": "How we build", "approach.title": "From idea to live system.",
    "approach.lede": "One disciplined path we run for every product — fast to ship, engineered to last.",
    "approach.s1t": "Discover", "approach.s1b": "Map the problem, users and outcomes — before a line of code.",
    "approach.s2t": "Design", "approach.s2b": "Architecture, data model and UX in Arabic & English, RTL-first.",
    "approach.s3t": "Engineer", "approach.s3b": "Scalable services, mobile apps and AI — shipped behind quality gates.",
    "approach.s4t": "Launch", "approach.s4b": "Canary rollout, monitoring and runbooks — live with confidence.",
    "approach.s5t": "Scale", "approach.s5b": "Measure, optimise and grow across the network.",
    "cta.kicker": "Build with Salisco", "cta.title": "Have a system worth building?",
    "cta.lede": "From a single app to a Kingdom-wide platform — let's turn it into something live.",
    "cta.btn": "Start a conversation",
    "hero.location": "Riyadh · Kingdom of Saudi Arabia", "hero.ai": "AI-native", "hero.building": "Now building",
    "hero.title1": "Technology, talent", "hero.title2": "& automotive solutions.",
    "hero.lede": "Salisco is a Riyadh-based technology company — building large-scale systems, mobile apps and applied AI, focused on two sectors: Automotive and Manpower (QHR). SalisAuto is the first to ship.",
    "vision.kicker": "Vision & mission", "vision.title": "A technology company, engineering the Kingdom's next systems.",
    "vision.lede": "Salisco builds large-scale systems, mobile apps and applied AI — focused on two sectors that move Saudi Arabia: Automotive and Manpower (QHR).",
    "vision.vTag": "Vision", "vision.vBody": "To be Saudi Arabia's technology engine — building systems and AI that power entire industries, from the road to the workforce.",
    "vision.mTag": "Mission", "vision.mBody": "To design and ship dependable software, mobile apps and AI products that make our two sectors — Automotive and Manpower / QHR — faster, smarter and more reliable.",
    "vision.dirKicker": "How we build",
    "dir.systems.t": "Large-scale systems", "dir.systems.b": "Enterprise platforms engineered to scale across operations.",
    "dir.mobile.t": "Mobile-first apps", "dir.mobile.b": "Native experiences for operators, technicians and customers.",
    "dir.ai.t": "Applied AI", "dir.ai.b": "Copilots, automation and predictive intelligence baked in.",
    "dir.focus.t": "Two-sector focus", "dir.focus.b": "Deep in Automotive and Manpower / QHR — not spread thin.",
    "focus.kicker": "What we're building", "focus.title": "One technology core. A growing family.",
    "focus.lede": "Salisco builds on a single core of systems, mobile and AI — now spanning three product lines across the Kingdom.",
    "focus.core": "Systems · Mobile · AI", "focus.auto": "Automotive", "focus.people": "Manpower / QHR", "focus.workforce": "Workforce ops",
    "focus.security": "Security & Operations", "focus.command": "Command center",
    "work.raqeeb": "AI security & operational excellence — real-time monitoring, intelligent alerts and a bilingual command center.",
    "next.m5.year": "2026–27", "next.m5.title": "Raqeeb", "next.m5.body": "AI security & operational-excellence platform — monitoring and command.",
    "status.live": "Live", "status.next": "Next", "status.build": "Building", "status.planned": "Planned",
    "contact.kicker": "Get in touch", "contact.title": "Let's build what's next in the Kingdom.",
    "contact.lede": "Partnerships, talent, or a project in Automotive or Manpower / QHR — we'd love to hear from you.",
    "contact.email": "Email", "contact.phone": "Phone", "contact.hq": "Headquarters", "contact.hqVal": "Riyadh, Kingdom of Saudi Arabia",
    "contact.name": "Name", "contact.yourEmail": "Email", "contact.message": "Message", "contact.send": "Send message",
    "contact.sent": "Opening your email app…", "contact.invalid": "Please fill in all fields.",
    "hero.ctaPrimary": "Explore divisions", "hero.ctaSecondary": "Meet SalisAuto",
    "cue.scroll": "Scroll",
    "stats.est": "Established", "stats.divisions": "Divisions", "stats.hq": "Headquarters", "stats.hqValue": "Riyadh",
    "chip.tech": "Technology", "chip.manpower": "Manpower",
    "divisions.kicker": "Three solution divisions", "divisions.title": "One company, built for the Kingdom.",
    "div.tech.title": "Technology", "div.tech.body": "Product engineering, platforms and data — the software backbone behind every Salisco service.",
    "div.people.title": "Manpower", "div.people.body": "Skilled talent and workforce solutions — recruiting, deploying and supporting the people who keep operations running.",
    "div.auto.tag": "SalisAuto live", "div.auto.title": "Automotive", "div.auto.body": "Fleet & garage technology for the Saudi market. Live today as SalisAuto, with more automotive products on the way.", "div.auto.link": "See SalisAuto",
    "spot.tag": "Live now", "spot.title": "SalisAuto",
    "spot.lede": "The fleet & garage management platform shipping today — vehicles, jobs, parts and technicians in one operational view, built for workshops across the Kingdom.",
    "spot.p1": "Real-time fleet & job tracking", "spot.p2": "Parts network & purchase workflows", "spot.p3": "Technician & customer portals", "spot.p4": "AI-assisted diagnostics & predictive maintenance",
    "tele.title": "Fleet telemetry", "tele.live": "LIVE", "tele.online": "Vehicles online", "tele.uptime": "Fleet uptime", "tele.jobs": "Jobs today", "tele.response": "Avg response",
    "ai.title": "SalisAuto Copilot", "ai.status": "online",
    "coming.kicker": "More automotive products", "coming.tag": "Coming soon",
    "coming.fleetco": "Fleet leasing & financing — vehicles on subscription for Saudi businesses.",
    "coming.salissp": "Spare parts marketplace & supply — sourcing genuine parts across the network.",
    "next.kicker": "What's next", "next.title": "The road ahead.",
    "next.lede": "A clear path — from a live automotive platform to one connected network across the Kingdom.",
    "next.m1.year": "2026 · Now", "next.m1.title": "SalisAuto live", "next.m1.body": "Fleet & garage management shipping to Saudi workshops today.",
    "next.m2.year": "2026", "next.m2.title": "FleetCo", "next.m2.body": "Fleet leasing & financing — vehicles on subscription for businesses.",
    "next.m3.year": "2027", "next.m3.title": "Salis SP", "next.m3.body": "Spare-parts marketplace & supply sourced across the network.",
    "next.m4.year": "Beyond", "next.m4.title": "One platform", "next.m4.body": "Automotive, manpower and security — connected across the Kingdom.",
    "footer.title": "Let's build what's next in the Kingdom.", "footer.cta": "Get in touch",
    "footer.loc": "Riyadh, Kingdom of Saudi Arabia", "footer.copy": "© 2026 Salisco LTD · Riyadh, KSA"
  },
  ar: {
    "brand": "ساليسكو",
    "nav.vision": "الرؤية", "nav.divisions": "القطاعات", "nav.ai": "الذكاء الاصطناعي", "nav.salisauto": "ساليس أوتو", "nav.work": "أعمالنا", "nav.next": "خارطة الطريق", "nav.contact": "تواصل",
    "ai.kicker": "مبنيّ على الذكاء الاصطناعي", "ai.title": "ذكاءٌ مدمجٌ في كل طبقة.",
    "ai.lede": "من البكسل إلى التنبؤ — تهندس ساليسكو الذكاء الاصطناعي في صميم كل منتج: رؤيةٌ ولغةٌ وأتمتةٌ تحوّل البيانات التشغيلية الخام إلى قرارات.",
    "ai.p1.t": "ذكاء تنبؤي", "ai.p1.b": "توقّع الطلب والمخاطر والصيانة قبل وقوعها.",
    "ai.p2.t": "رؤية حاسوبية وأجهزة استشعار", "ai.p2.b": "رؤيةٌ واكتشافٌ واستجابة — من الكاميرات إلى التتبع.",
    "ai.p3.t": "أتمتة ومساعدون أذكياء", "ai.p3.b": "وكلاءُ ينسّقون العمليات ويساعدون كل فريق.",
    "work.kicker": "مختارات من أعمالنا", "work.title": "ما نبنيه، بالبكسل.",
    "work.lede": "معرض حيّ يمتد عبر خطوط منتجاتنا — منصّة واحدة مباشرة اليوم، والمزيد قيد التطوير.",
    "work.salisauto": "إدارة الأساطيل والورش — المركبات والمهام وقطع الغيار والفنّيون في عرض تشغيلي واحد.",
    "work.qhr": "منصّة كوادر وموارد بشرية — القوى العاملة والامتثال وعمليات الموظفين.",
    "work.fleetco": "تأجير وتمويل الأساطيل بنظام الاشتراك.",
    "work.salissp": "سوق قطع الغيار وشبكة التوريد.",
    "approach.kicker": "كيف نبني", "approach.title": "من الفكرة إلى نظام مباشر.",
    "approach.lede": "مسار منضبط واحد نتبعه في كل منتج — سريع الإطلاق، مهندَس ليدوم.",
    "approach.s1t": "اكتشاف", "approach.s1b": "نحدّد المشكلة والمستخدمين والنتائج — قبل كتابة أي سطر برمجي.",
    "approach.s2t": "تصميم", "approach.s2b": "المعمارية ونموذج البيانات وتجربة المستخدم بالعربية والإنجليزية، بأولوية RTL.",
    "approach.s3t": "هندسة", "approach.s3b": "خدمات قابلة للتوسّع وتطبيقات جوّال وذكاء اصطناعي — تُطلق خلف بوابات جودة.",
    "approach.s4t": "إطلاق", "approach.s4b": "إطلاق تدريجي ومراقبة وأدلة تشغيل — انطلاق بثقة.",
    "approach.s5t": "توسّع", "approach.s5b": "نقيس ونحسّن وننمو عبر الشبكة.",
    "cta.kicker": "ابنِ مع ساليسكو", "cta.title": "لديك نظام يستحق البناء؟",
    "cta.lede": "من تطبيق واحد إلى منصّة تغطي المملكة — لنحوّله إلى شيء مباشر.",
    "cta.btn": "ابدأ المحادثة",
    "hero.location": "الرياض · المملكة العربية السعودية", "hero.ai": "ذكاء اصطناعي", "hero.building": "نبني الآن",
    "hero.title1": "التقنية والكوادر", "hero.title2": "وحلول السيارات.",
    "hero.lede": "ساليسكو شركة تقنية مقرّها الرياض — تبني أنظمة واسعة النطاق وتطبيقات جوّال وذكاءً اصطناعيًا تطبيقيًا، مع التركيز على قطاعين: السيارات والكوادر (QHR). وساليس أوتو أول منتجاتنا التي تنطلق.",
    "vision.kicker": "الرؤية والرسالة", "vision.title": "شركة تقنية تهندس أنظمة المملكة القادمة.",
    "vision.lede": "ساليسكو تبني أنظمة واسعة النطاق وتطبيقات جوّال وذكاءً اصطناعيًا — مع التركيز على قطاعين يحرّكان المملكة: السيارات والكوادر (QHR).",
    "vision.vTag": "الرؤية", "vision.vBody": "أن نكون محرّك المملكة التقني — نبني أنظمة وذكاءً اصطناعيًا يشغّل قطاعات بأكملها، من الطريق إلى الكوادر.",
    "vision.mTag": "الرسالة", "vision.mBody": "أن نصمّم ونطلق برمجيات وتطبيقات جوّال ومنتجات ذكاء اصطناعي موثوقة تجعل قطاعينا — السيارات والكوادر / QHR — أسرع وأذكى وأكثر اعتمادية.",
    "vision.dirKicker": "كيف نبني",
    "dir.systems.t": "أنظمة واسعة النطاق", "dir.systems.b": "منصّات مؤسسية مهندَسة للتوسّع عبر العمليات.",
    "dir.mobile.t": "تطبيقات تركّز على الجوّال", "dir.mobile.b": "تجارب أصيلة للمشغّلين والفنّيين والعملاء.",
    "dir.ai.t": "ذكاء اصطناعي تطبيقي", "dir.ai.b": "مساعدون وأتمتة وذكاء تنبؤي مدمجة في صميم المنتج.",
    "dir.focus.t": "تركيز على قطاعين", "dir.focus.b": "عمق في السيارات والكوادر / QHR — دون تشتّت.",
    "focus.kicker": "ما الذي نبنيه", "focus.title": "نواة تقنية واحدة. عائلة تنمو.",
    "focus.lede": "تبني ساليسكو على نواة واحدة من الأنظمة والجوّال والذكاء الاصطناعي — تمتد الآن عبر ثلاثة خطوط منتجات في المملكة.",
    "focus.core": "أنظمة · جوّال · ذكاء اصطناعي", "focus.auto": "السيارات", "focus.people": "الكوادر / QHR", "focus.workforce": "عمليات الكوادر",
    "focus.security": "الأمن والعمليات", "focus.command": "مركز القيادة",
    "work.raqeeb": "أمن وتميّز تشغيلي بالذكاء الاصطناعي — مراقبة لحظية وتنبيهات ذكية ومركز قيادة ثنائي اللغة.",
    "next.m5.year": "2026–27", "next.m5.title": "رقيب", "next.m5.body": "منصّة أمن وتميّز تشغيلي بالذكاء الاصطناعي — مراقبة وقيادة.",
    "status.live": "مباشر", "status.next": "قادم", "status.build": "قيد البناء", "status.planned": "مخطّط",
    "contact.kicker": "تواصل معنا", "contact.title": "لنبنِ ما هو قادم في المملكة.",
    "contact.lede": "شراكات أو كفاءات أو مشروع في السيارات أو الكوادر / QHR — يسعدنا أن نسمع منك.",
    "contact.email": "البريد", "contact.phone": "الهاتف", "contact.hq": "المقر الرئيسي", "contact.hqVal": "الرياض، المملكة العربية السعودية",
    "contact.name": "الاسم", "contact.yourEmail": "البريد الإلكتروني", "contact.message": "الرسالة", "contact.send": "إرسال الرسالة",
    "contact.sent": "جارٍ فتح تطبيق البريد…", "contact.invalid": "يرجى تعبئة جميع الحقول.",
    "hero.ctaPrimary": "استكشف القطاعات", "hero.ctaSecondary": "تعرّف على ساليس أوتو",
    "cue.scroll": "تصفّح",
    "stats.est": "التأسيس", "stats.divisions": "القطاعات", "stats.hq": "المقر الرئيسي", "stats.hqValue": "الرياض",
    "chip.tech": "التقنية", "chip.manpower": "الكوادر",
    "divisions.kicker": "ثلاثة قطاعات للحلول", "divisions.title": "شركة واحدة، مبنية لخدمة المملكة.",
    "div.tech.title": "التقنية", "div.tech.body": "هندسة المنتجات والمنصّات والبيانات — البنية البرمجية خلف كل خدمات ساليسكو.",
    "div.people.title": "الكوادر البشرية", "div.people.body": "كوادر ماهرة وحلول قوى عاملة — استقطاب الكفاءات وتأهيلها ودعم من يُديرون العمليات.",
    "div.auto.tag": "ساليس أوتو — مباشر", "div.auto.title": "السيارات", "div.auto.body": "تقنيات إدارة الأساطيل والورش للسوق السعودي. متاحة اليوم عبر ساليس أوتو، مع منتجات سيارات أخرى قادمة.", "div.auto.link": "اكتشف ساليس أوتو",
    "spot.tag": "متاح الآن", "spot.title": "ساليس أوتو",
    "spot.lede": "منصّة إدارة الأساطيل والورش المتاحة اليوم — المركبات والمهام وقطع الغيار والفنّيون في واجهة تشغيلية واحدة، مصمّمة لورش المملكة.",
    "spot.p1": "تتبّع الأسطول والمهام لحظيًا", "spot.p2": "شبكة قطع الغيار وعمليات الشراء", "spot.p3": "بوّابات الفنّيين والعملاء", "spot.p4": "تشخيص وصيانة تنبؤية بالذكاء الاصطناعي",
    "tele.title": "بيانات الأسطول الحيّة", "tele.live": "مباشر", "tele.online": "المركبات المتصلة", "tele.uptime": "جاهزية الأسطول", "tele.jobs": "مهام اليوم", "tele.response": "متوسط الاستجابة",
    "ai.title": "مساعد ساليس أوتو", "ai.status": "متصل",
    "coming.kicker": "منتجات سيارات أخرى", "coming.tag": "قريبًا",
    "coming.fleetco": "تأجير وتمويل الأساطيل — مركبات بنظام الاشتراك للمنشآت السعودية.",
    "coming.salissp": "سوق وتوريد قطع الغيار — توفير قطع أصلية عبر الشبكة.",
    "next.kicker": "ما هو قادم", "next.title": "الطريق إلى الأمام.",
    "next.lede": "مسار واضح — من منصّة سيارات مباشرة إلى شبكة واحدة متّصلة عبر المملكة.",
    "next.m1.year": "2026 · الآن", "next.m1.title": "ساليس أوتو مباشر", "next.m1.body": "إدارة الأساطيل والورش متاحة لورش المملكة اليوم.",
    "next.m2.year": "2026", "next.m2.title": "فليت كو", "next.m2.body": "تأجير وتمويل الأساطيل — مركبات بنظام الاشتراك للمنشآت.",
    "next.m3.year": "2027", "next.m3.title": "ساليس إس بي", "next.m3.body": "سوق وتوريد قطع الغيار عبر الشبكة.",
    "next.m4.year": "وأبعد", "next.m4.title": "منصّة واحدة", "next.m4.body": "السيارات والكوادر والأمن — متّصلة عبر المملكة.",
    "footer.title": "لنبنِ ما هو قادم في المملكة.", "footer.cta": "تواصل معنا",
    "footer.loc": "الرياض، المملكة العربية السعودية", "footer.copy": "© 2026 شركة ساليسكو المحدودة · الرياض، المملكة العربية السعودية"
  }
};

const html = document.documentElement;
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function applyLang(lang) {
  const dict = I18N[lang] || I18N.en;
  html.setAttribute("lang", lang);
  html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const k = el.getAttribute("data-i18n");
    if (dict[k] !== undefined) el.textContent = dict[k];
  });
  try { localStorage.setItem("salisco-lang", lang); } catch (e) {}
}
document.getElementById("langToggle")?.addEventListener("click", () =>
  applyLang(html.getAttribute("lang") === "ar" ? "en" : "ar"));
let saved = "en";
try { saved = localStorage.getItem("salisco-lang") || "en"; } catch (e) {}
if (saved === "ar" && document.getElementById("langToggle")) applyLang("ar");

/* ---------- Mobile nav toggle (inner pages) ---------- */
(function mobileNav() {
  const btn = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (!btn || !links) return;
  btn.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });
  links.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
    links.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
  }));
})();

/* ---------- Scroll progress + nav state ---------- */
const nav = document.getElementById("nav");
const prog = document.getElementById("scrollProgress");
function onScroll() {
  const st = window.scrollY;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  if (prog) prog.style.width = (h > 0 ? (st / h) * 100 : 0) + "%";
  if (nav) nav.classList.toggle("scrolled", st > 12);
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Reveal on scroll ---------- */
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !reduce) {
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.style.setProperty("--d", e.target.getAttribute("data-d") || 0);
        e.target.classList.add("in");
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
  reveals.forEach((r) => io.observe(r));
} else {
  reveals.forEach((r) => r.classList.add("in"));
}

/* ---------- Count-up (stats) ---------- */
function countUp(el) {
  if (el.hasAttribute("data-plain") || reduce) return;
  const target = parseInt(el.getAttribute("data-count"), 10);
  if (isNaN(target)) return;
  const dur = 1100, start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const counters = document.querySelectorAll("[data-count]");
if ("IntersectionObserver" in window && !reduce) {
  const io2 = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => { if (e.isIntersecting) { countUp(e.target); obs.unobserve(e.target); } });
  }, { threshold: 0.6 });
  counters.forEach((c) => io2.observe(c));
}

/* ---------- Live telemetry ---------- */
const lives = document.querySelectorAll("[data-live]");
if (!reduce && lives.length) {
  setInterval(() => {
    lives.forEach((el) => {
      const min = +el.getAttribute("data-min"), max = +el.getAttribute("data-max");
      let v = +el.textContent + (Math.random() < 0.5 ? -1 : 1);
      v = Math.max(min, Math.min(max, v));
      el.textContent = v;
      el.style.transition = "color .2s ease";
      el.style.color = "#6aa9ef";
      setTimeout(() => { el.style.color = ""; }, 220);
    });
  }, 2400);
}

/* ---------- Cursor spotlight on cards ---------- */
if (!reduce && window.matchMedia("(hover: hover)").matches) {
  document.querySelectorAll(".spotlight").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ---------- Magnetic buttons ---------- */
  document.querySelectorAll(".magnetic").forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.3}px)`;
    });
    btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
  });

  /* ---------- Shape parallax (logo mark stays static) ---------- */
  const shapes = document.querySelectorAll(".shape");
  window.addEventListener("mousemove", (e) => {
    const dx = (e.clientX / window.innerWidth - 0.5);
    const dy = (e.clientY / window.innerHeight - 0.5);
    shapes.forEach((s, i) => {
      const k = (i + 1) * 8;
      s.style.marginLeft = (dx * k) + "px";
      s.style.marginTop = (dy * k) + "px";
    });
  }, { passive: true });
}

/* ============================================================
   Cinematic intro
   ============================================================ */
(function intro() {
  const el = document.getElementById("intro");
  if (!el) return;
  if (reduce) { el.classList.add("intro--done"); return; }
  document.body.classList.add("intro-lock");
  const done = () => { el.classList.add("intro--done"); document.body.classList.remove("intro-lock"); };
  // CSS animation hides it at ~2.6s; remove from flow shortly after, with a safety timeout.
  el.addEventListener("animationend", (e) => { if (e.animationName === "introOut") done(); });
  setTimeout(done, 2900);
})();

/* ============================================================
   Custom glow cursor
   ============================================================ */
(function glowCursor() {
  const cur = document.getElementById("cursor");
  if (!cur || reduce || !window.matchMedia("(hover: hover)").matches) return;
  let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y;
  addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; cur.classList.add("ready"); }, { passive: true });
  addEventListener("mousedown", () => cur.classList.add("down"));
  addEventListener("mouseup", () => cur.classList.remove("down"));
  addEventListener("mouseleave", () => cur.classList.remove("ready"));
  const hoverSel = "a, button, .magnetic, .pillar, .lang-toggle";
  document.querySelectorAll(hoverSel).forEach((h) => {
    h.addEventListener("mouseenter", () => cur.classList.add("hover"));
    h.addEventListener("mouseleave", () => cur.classList.remove("hover"));
  });
  (function loop() {
    x += (tx - x) * 0.18; y += (ty - y) * 0.18;
    cur.style.transform = `translate(${x}px, ${y}px)`;
    requestAnimationFrame(loop);
  })();
})();

/* ============================================================
   Interactive canvas constellation (cursor-reactive)
   ============================================================ */
(function constellation() {
  const cv = document.getElementById("fx");
  if (!cv || reduce) return;
  const ctx = cv.getContext("2d");
  let w, h, dpr, pts = [], raf, running = true;
  const mouse = { x: -999, y: -999 };
  const TINT = [ "47,128,230", "239,122,42", "91,140,255" ];

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = cv.clientWidth; h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const target = Math.min(90, Math.round((w * h) / 16000));
    pts = [];
    for (let i = 0; i < target; i++) {
      pts.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.6, t: TINT[i % TINT.length]
      });
    }
  }

  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    const LINK = 130, MOUSE = 190;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      // gentle pull toward cursor
      const mdx = mouse.x - p.x, mdy = mouse.y - p.y;
      const md = Math.hypot(mdx, mdy);
      if (md < MOUSE) {
        const f = (1 - md / MOUSE) * 0.04;
        p.vx += (mdx / (md || 1)) * f; p.vy += (mdy / (md || 1)) * f;
        p.vx = Math.max(-0.8, Math.min(0.8, p.vx));
        p.vy = Math.max(-0.8, Math.min(0.8, p.vy));
        ctx.strokeStyle = `rgba(${p.t},${(1 - md / MOUSE) * 0.5})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
      // links to neighbours
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = Math.hypot(dx, dy);
        if (d < LINK) {
          ctx.strokeStyle = `rgba(${p.t},${(1 - d / LINK) * 0.22})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      ctx.fillStyle = `rgba(${p.t},.85)`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  }

  addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  addEventListener("mouseleave", () => { mouse.x = -999; mouse.y = -999; });
  addEventListener("resize", size);
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) { size(); frame(); } else { cancelAnimationFrame(raf); }
  });
  size(); frame();
})();

/* ============================================================
   Drifting voxel cube field (deep-space ambiance)
   ============================================================ */
(function cubeField() {
  const cv = document.getElementById("cubes");
  if (!cv || reduce) return;
  const ctx = cv.getContext("2d");
  let w, h, dpr, cubes = [], raf, running = true;
  const TINTS = [[200, 214, 235], [47, 128, 230], [239, 122, 42]];
  const rnd = (a, b) => a + Math.random() * (b - a);

  function make() {
    const depth = Math.random();
    return {
      x: Math.random() * w, y: Math.random() * h,
      s: 4 + depth * 15,
      vy: -(0.05 + depth * 0.16),
      vx: rnd(-0.05, 0.05),
      depth,
      wire: Math.random() < 0.55,
      tint: TINTS[(Math.random() * TINTS.length) | 0],
      a: 0.1 + depth * 0.45
    };
  }
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = cv.clientWidth; h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(60, Math.round((w * h) / 26000));
    cubes = []; for (let i = 0; i < n; i++) cubes.push(make());
  }
  function poly(p) { ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]); ctx.closePath(); ctx.fill(); }
  function cube(c) {
    const s = c.s, x = c.x, y = c.y;
    const top = [x, y - s], right = [x + s, y - s / 2], bot = [x, y], left = [x - s, y - s / 2];
    const ll = [x - s, y + s / 2], bl = [x, y + s], rl = [x + s, y + s / 2];
    const [r, g, b] = c.tint;
    if (c.wire) {
      ctx.strokeStyle = `rgba(${r},${g},${b},${c.a})`;
      ctx.lineWidth = Math.max(0.6, s * 0.055);
      ctx.beginPath();
      ctx.moveTo(...top); ctx.lineTo(...right); ctx.lineTo(...rl); ctx.lineTo(...bl); ctx.lineTo(...ll); ctx.lineTo(...left); ctx.closePath();
      ctx.moveTo(...left); ctx.lineTo(...bot); ctx.lineTo(...right); ctx.moveTo(...bot); ctx.lineTo(...bl);
      ctx.stroke();
    } else {
      ctx.fillStyle = `rgba(${r},${g},${b},${c.a})`; poly([top, right, bot, left]);
      ctx.fillStyle = `rgba(${(r * .5) | 0},${(g * .5) | 0},${(b * .5) | 0},${c.a})`; poly([left, bot, bl, ll]);
      ctx.fillStyle = `rgba(${(r * .76) | 0},${(g * .76) | 0},${(b * .76) | 0},${c.a})`; poly([right, bot, bl, rl]);
    }
  }
  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    for (const c of cubes) {
      c.x += c.vx; c.y += c.vy;
      if (c.y < -30) { c.y = h + 20; c.x = Math.random() * w; }
      if (c.x < -30) c.x = w + 20; if (c.x > w + 30) c.x = -20;
      cube(c);
    }
    raf = requestAnimationFrame(frame);
  }
  addEventListener("resize", size);
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) { size(); frame(); } else cancelAnimationFrame(raf);
  });
  size(); frame();
})();

/* ============================================================
   Rotating keyword (typewriter)
   ============================================================ */
(function rotator() {
  const el = document.getElementById("rotWord");
  if (!el) return;
  const WORDS = {
    en: ["AI fleet intelligence", "Predictive maintenance", "Automation platforms", "Connected garages", "Smart logistics"],
    ar: ["ذكاء الأساطيل", "الصيانة التنبؤية", "منصّات الأتمتة", "ورش متّصلة", "لوجستيات ذكية"]
  };
  if (reduce) { el.textContent = WORDS.en[0]; return; }
  let i = 0, j = 0, deleting = false;
  function tick() {
    const list = WORDS[html.getAttribute("lang")] || WORDS.en;
    const word = list[i % list.length];
    j += deleting ? -1 : 1;
    el.textContent = word.slice(0, j);
    let delay = deleting ? 45 : 80;
    if (!deleting && j === word.length) { deleting = true; delay = 1500; }
    else if (deleting && j === 0) { deleting = false; i++; delay = 250; }
    setTimeout(tick, delay);
  }
  tick();
})();

/* ============================================================
   AI Copilot console (typewriter loop)
   ============================================================ */
(function aiConsole() {
  const box = document.getElementById("aiConsole");
  if (!box) return;
  const SCRIPT = {
    en: [
      { s: "›", c: "pr", t: " analyzing fleet telemetry…" },
      { s: "✓", c: "ok", t: " 3 vehicles flagged for predictive maintenance" },
      { s: "✓", c: "ok", t: " route optimized · 12% fuel saved" },
      { s: "›", c: "pr", t: " auto-assigning open jobs…" },
      { s: "✓", c: "ok", t: " 5 work orders dispatched to technicians" },
      { s: "▌", c: "hl", t: " Copilot ready — monitoring 128 vehicles" }
    ],
    ar: [
      { s: "›", c: "pr", t: " تحليل بيانات الأسطول…" },
      { s: "✓", c: "ok", t: " 3 مركبات بحاجة لصيانة تنبؤية" },
      { s: "✓", c: "ok", t: " تحسين المسارات · توفير 12% من الوقود" },
      { s: "›", c: "pr", t: " إسناد المهام المفتوحة تلقائيًا…" },
      { s: "✓", c: "ok", t: " إرسال 5 أوامر عمل إلى الفنّيين" },
      { s: "▌", c: "hl", t: " المساعد جاهز — مراقبة 128 مركبة" }
    ]
  };
  const cursor = document.createElement("span");
  cursor.className = "ai-cursor";
  let timer = null, active = false;

  function renderStatic() {
    const lines = SCRIPT[html.getAttribute("lang")] || SCRIPT.en;
    box.innerHTML = "";
    lines.forEach((ln) => {
      const row = document.createElement("span");
      row.className = "ai-line";
      row.innerHTML = `<span class="${ln.c}">${ln.s}</span>${ln.t}`;
      box.appendChild(row);
    });
  }

  function run() {
    if (reduce) { renderStatic(); return; }
    const lines = SCRIPT[html.getAttribute("lang")] || SCRIPT.en;
    box.innerHTML = "";
    let li = 0;
    function nextLine() {
      if (li >= lines.length) { timer = setTimeout(() => { if (active) run(); }, 2600); return; }
      const ln = lines[li];
      const row = document.createElement("span");
      row.className = "ai-line";
      row.innerHTML = `<span class="${ln.c}">${ln.s}</span><span class="t"></span>`;
      box.appendChild(row);
      const t = row.querySelector(".t");
      row.appendChild(cursor);
      let k = 0;
      (function type() {
        if (!active) return;
        t.textContent = ln.t.slice(0, ++k);
        if (k < ln.t.length) { timer = setTimeout(type, 26); }
        else { li++; timer = setTimeout(nextLine, 480); }
      })();
    }
    nextLine();
  }

  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (e.isIntersecting && !active) { active = true; run(); }
      else if (!e.isIntersecting && active) { active = false; clearTimeout(timer); }
    });
  }, { threshold: 0.25 });
  io.observe(box);
})();

/* ============================================================
   Contact form → mailto
   ============================================================ */
(function contactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;
  const note = document.getElementById("formNote");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const dict = I18N[html.getAttribute("lang")] || I18N.en;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const msg = form.message.value.trim();
    if (!name || !email || !msg) { note.textContent = dict["contact.invalid"]; note.className = "form-note err"; return; }
    const subject = encodeURIComponent(`Salisco enquiry — ${name}`);
    const body = encodeURIComponent(`${msg}\n\n— ${name}\n${email}`);
    window.location.href = `mailto:hello@salisco.sa?subject=${subject}&body=${body}`;
    note.textContent = dict["contact.sent"]; note.className = "form-note ok";
    form.reset();
  });
})();

/* ============================================================
   Work cards — pointer tilt + spotlight
   ============================================================ */
(function workTilt() {
  const cards = document.querySelectorAll(".work-card.tilt");
  if (!cards.length) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  cards.forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
      card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
      if (reduce || !fine) return;
      const rx = (0.5 - py) * 7;
      const ry = (px - 0.5) * 7;
      card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-4px)`;
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });
})();
