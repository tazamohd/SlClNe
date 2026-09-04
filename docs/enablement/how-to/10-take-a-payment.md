# 10 · Take a payment and raise a receipt / تحصيل دفعة وإصدار سند قبض

**Goal.** Record money against an issued invoice.
**Role.** Accountant, receptionist with billing rights. **Time.** 1 minute.
**Before you start.** The invoice is issued (how-to 09). The live API is connected: in the demo build the screen says "Writes need the API."

**Steps**
1. Billing → Payments → **Raise receipt** (or Receipts → **New Receipt**).
2. "Choose an invoice". The screen shows **Balance due**.
3. Enter **Amount received** and "Select a method" under **Payment Method**.
4. Confirm. The screen reads **Receipt raised — It stays pending until the money clears.** or, for a recorded payment, **Payment recorded — The receipt has been raised against this invoice.**
5. Read the balance "as the server reports it after this payment".

**Done when.** Payments shows the amount under **SAR received today** and the invoice balance fell by it.
**If it fails.** "Writes need the API. Set VITE_API_URL to record a real payment." (demo). "Every invoice is settled or cancelled. There is nothing to receipt." "Paid invoices only — part payments need the API." "This build has no API configured, so the outstanding balance is unknown."

**Media block**
- Short, T5. Hook: "One receipt per payment. Pending until it clears." Beats: 1 "Choose an invoice" / 2 "Amount received, method" / 3 "Receipt raised." VO: "The balance is what the server reports, not what someone typed." CTA: **Book a demo**.
- Photo set: **Raise receipt** dialog with **Balance due** (1440, en); **Receipt raised** toast (1440, ar); Payments tiles (1440, ar).

---

**الهدف.** تسجيل الأموال مقابل فاتورة صادرة.
**الدور.** المحاسب، أو الاستقبال بصلاحية فوترة. **الوقت.** دقيقة.
**قبل البدء.** الفاتورة صادرة (دليل 09). الواجهة الحية متصلة: في الإصدار التجريبي تقول الشاشة «الكتابة تحتاج الواجهة».

**الخطوات**
1. الفوترة ← المدفوعات ← **إصدار سند قبض** (أو سندات القبض ← **سند جديد**).
2. «اختر فاتورة». تعرض الشاشة **الرصيد المستحق**.
3. أدخل **المبلغ المستلَم** و«اختر طريقة» تحت **طريقة الدفع**.
4. أكّد. تقرأ الشاشة **صدر السند؛ يبقى معلقاً حتى تصل الأموال** أو **سُجّلت الدفعة**.
5. اقرأ الرصيد «كما يبلّغه الخادم بعد هذه الدفعة».

**تكتمل حين** يظهر المبلغ تحت **ريال مستلَم اليوم** وينخفض رصيد الفاتورة به.
**إن فشلت.** «الكتابة تحتاج الواجهة. اضبط VITE_API_URL لتسجيل دفعة حقيقية». «كل الفواتير مسدَّدة أو ملغاة؛ لا شيء لإصدار سند». «الفواتير المسدَّدة فقط؛ الدفعات الجزئية تحتاج الواجهة».

**كتلة الوسائط**
- مقطع قصير (T5). الخطاف: «سند لكل دفعة. معلق حتى يصل المال». اللقطات: ١ «اختر فاتورة» / ٢ «المبلغ المستلَم، الطريقة» / ٣ «صدر السند». التعليق: «الرصيد ما يبلّغه الخادم، لا ما كتبه أحد». الطلب: **احجز عرضاً**.
- مجموعة الصور: حوار إصدار السند مع الرصيد المستحق؛ رسالة صدر السند؛ بطاقات المدفوعات.
