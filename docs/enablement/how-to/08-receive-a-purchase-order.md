# 08 · Create and receive a purchase order / إنشاء أمر شراء واستلامه

Long-form: `docs/knowledge-base/how-to/manage-inventory.md` §Purchase Requisition Flow. This file adds the exact labels and the media block.

**Goal.** Order from a supplier in the directory and book the stock in when it arrives.
**Role.** Storekeeper (ceiling `SAR 10,000`) or procurement agent (`SAR 20,000`); a manager approves above. **Time.** 5 minutes to raise; receiving on delivery.
**Before you start.** The supplier exists (**Add Supplier** if not). Parts below their reorder point show under **Low Stock Items**.

**Steps**
1. Parts → Inventory → **Low Stock Items**, or Purchase Orders → **Create Purchase Order**.
2. "Choose a supplier..." from the directory. "A supplier joins the directory so purchase orders reference it, not a free-typed name."
3. **Add Item** from the catalogue or "directly from the stock alert list"; set quantity and the agreed unit cost. "VAT is added on the order total."
4. Read the preview: "the server computes the order total and re-checks it against the ceiling." Submit. Above your ceiling it waits in the approver's inbox.
5. On delivery, open the order under **Approval & Receiving** and receive the lines. Lines read **Fully received**; the stock movement posts to the ledger.

**Done when.** The order reads **Fully received** and **On Hand** on each part rose by the received quantity.
**If it fails.** "No suppliers yet — add one to reference it on the order." "Not from the catalogue": add the part to inventory first. "Nothing below reorder level — Every part is at or above its reorder point." means there is nothing to reorder.

**Label check against the KB.** The KB describes the flow as "requisition → approval → PO"; the screens use **Create Purchase Order**, **Add Item**, **Approval & Receiving**, **Fully received**. Use the screen labels on camera.

**Media block**
- Short, T5. Hook: "Below minimum, an order drafts itself." Beats: 1 "Low Stock Items" / 2 "Add Item from the alert list" / 3 "Fully received. Stock moves." VO: "The order references a supplier in the directory, VAT is on the total, and receiving writes the movement." CTA: **Book a demo**.
- Photo set: **Low Stock Items** (1440, en); the order preview with the ceiling note (1440, ar); **Fully received** lines (1440, en).

---

**الهدف.** الطلب من مورّد في الدليل وإدخال المخزون عند وصوله.
**الدور.** أمين المستودع (حد `SAR 10,000`) أو مسؤول المشتريات (`SAR 20,000`)؛ المدير يعتمد فوق ذلك.

**الخطوات**
1. القطع ← المخزون ← **أصناف منخفضة**، أو أوامر الشراء ← **إنشاء أمر شراء**.
2. اختر المورّد من الدليل؛ «ينضم المورّد إلى الدليل لتشير إليه أوامر الشراء لا إلى اسم مكتوب يدوياً».
3. **إضافة بند** من الكتالوج أو من قائمة تنبيهات المخزون؛ حدد الكمية وتكلفة الوحدة المتفق عليها. «تُضاف الضريبة على إجمالي الأمر».
4. اقرأ المعاينة: «يحسب الخادم إجمالي الأمر ويعيد التحقق منه مقابل الحد». أرسل. فوق حدك ينتظر في صندوق المعتمِد.
5. عند التسليم افتح الأمر تحت **الاعتماد والاستلام** واستلم البنود. تقرأ البنود **مستلَم بالكامل** وتُرحَّل حركة المخزون.

**تكتمل حين** يقرأ الأمر **مستلَم بالكامل** ويرتفع **المتوفر** بالكمية المستلَمة.
**إن فشلت.** «لا موردين بعد؛ أضف واحداً». «ليس من الكتالوج»: أضف القطعة إلى المخزون أولاً. «لا شيء دون حد إعادة الطلب».

**كتلة الوسائط**
- مقطع قصير (T5). الخطاف: «دون الحد الأدنى، يصوغ الأمر نفسه». اللقطات: ١ «أصناف منخفضة» / ٢ «إضافة بند من قائمة التنبيهات» / ٣ «مستلَم بالكامل. يتحرك المخزون». التعليق: «الأمر يشير إلى مورّد في الدليل، والضريبة على الإجمالي، والاستلام يكتب الحركة». الطلب: **احجز عرضاً**.
- مجموعة الصور: الأصناف المنخفضة؛ معاينة الأمر مع ملاحظة الحد؛ بنود مستلَمة بالكامل.
