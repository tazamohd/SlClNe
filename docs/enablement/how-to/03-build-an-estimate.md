# 03 · Build an estimate / إعداد عرض سعر

**Goal.** Price parts and labour on the job card with VAT computed by the server.
**Role.** Service advisor (ceiling `SAR 5,000`). **Time.** 5 minutes.
**Before you start.** Inspection submitted (how-to 02).

**Steps**
1. Open the job card → Estimate.
2. Under **Parts**, add a line: part, **Quantity**, **Unit Price**.
3. Under **Labor**, add a line: description, **Hours**, **Rate**.
4. Read **Subtotal**, **VAT (15%)** and **Grand Total**. VAT is computed server-side at the ZATCA rate; you do not type it.
5. Within your **Limit**: **Approve Estimate**. Above it, or to get the customer's signature: **Send to Customer** (how-to 04).

**Done when.** The estimate shows **Raised by** you and either **Approved by** or "Sent to the approval inbox for sign-off."
**If it fails.** "Above your approval limit": send it; a manager or owner approves. "Your role cannot approve estimates — this will be sent for sign-off." is the same path for roles without a ceiling. "Line items load from the API. Connect a live server to see them.": demo build without an API.

**Media block**
- Short, T5. Hook: "Parts, labour, VAT. The server does the maths." Beats: 1 "Quantity × unit price" / 2 "Hours × rate" / 3 "VAT 15%, rounded once, to the halala." VO: "Within your ceiling you approve; above it, it goes for sign-off with the audit row already written." CTA: **Book a demo**.
- Photo set: estimate with two parts lines and one labour line (1440, en); **Grand Total** close-up (1440, ar); the "Above your approval limit" state (1440, en).

---

**الهدف.** تسعير القطع والأجرة على بطاقة العمل مع ضريبة يحسبها الخادم.
**الدور.** مستشار الخدمة (حد `SAR 5,000`). **الوقت.** ٥ دقائق.

**الخطوات**
1. افتح بطاقة العمل ← عرض السعر.
2. تحت **القطع** أضف بنداً: القطعة، **الكمية**، **سعر الوحدة**.
3. تحت **الأجرة** أضف بنداً: الوصف، **الساعات**، **المعدل**.
4. اقرأ **المجموع الفرعي** و**ضريبة القيمة المضافة (١٥٪)** و**الإجمالي**. الضريبة تُحسب في الخادم بمعدل الهيئة ولا تُكتب يدوياً.
5. ضمن **حدك**: **اعتماد عرض السعر**. فوقه أو لأخذ توقيع العميل: **إرسال إلى العميل** (دليل 04).

**تكتمل حين** يعرض العرض **رفعه** باسمك وإما **اعتمده** أو «أُرسل إلى صندوق الاعتمادات للتوقيع».
**إن فشلت.** «فوق حد اعتمادك»: أرسله ليعتمده مدير أو المالك. «البنود تُحمَّل من الواجهة؛ اربط خادماً حياً»: إصدار تجريبي بلا واجهة.

**كتلة الوسائط**
- مقطع قصير (T5). الخطاف: «قطع، أجرة، ضريبة. الخادم يحسب». اللقطات: ١ «الكمية × سعر الوحدة» / ٢ «الساعات × المعدل» / ٣ «ضريبة ١٥٪ تُقرَّب مرة واحدة حتى الهللة». التعليق: «ضمن حدك تعتمد؛ فوقه يذهب للتوقيع وصف التدقيق مكتوب». الطلب: **احجز عرضاً**.
- مجموعة الصور: عرض ببندي قطع وبند أجرة؛ لقطة قريبة للإجمالي؛ حالة «فوق حد اعتمادك».
