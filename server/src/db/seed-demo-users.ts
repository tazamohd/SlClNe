/** One demo login identity per role, for local/dev seeding only.
 *
 *  Contact fields (name/ar/email) are cosmetic and live here rather than in
 *  `@salis/contract` because they are not part of the authorization contract —
 *  role id and scope are, and those are read live from `@salis/contract` in
 *  `seed.ts` so this file cannot drift from the permission model. */
export interface DemoUser {
  id: string
  demo: { name: string; ar: string; email: string }
}

export const DEMO_USERS: readonly DemoUser[] = [
  { id: 'owner', demo: { name: 'Abdullah Al-Salis', ar: 'عبدالله السالس', email: 'owner@salisauto.sa' } },
  { id: 'superadmin', demo: { name: 'Platform Admin', ar: 'مشرف المنصة', email: 'admin@salisauto.com' } },
  { id: 'manager', demo: { name: 'Faisal Al-Harbi', ar: 'فيصل الحربي', email: 'manager@salisauto.sa' } },
  { id: 'advisor', demo: { name: 'Noura Al-Qahtani', ar: 'نورة القحطاني', email: 'advisor@salisauto.sa' } },
  { id: 'technician', demo: { name: 'Saeed Al-Zahrani', ar: 'سعيد الزهراني', email: 'tech@salisauto.sa' } },
  { id: 'qc', demo: { name: 'Majed Al-Otaibi', ar: 'ماجد العتيبي', email: 'qc@salisauto.sa' } },
  { id: 'parts', demo: { name: 'Yousef Al-Ghamdi', ar: 'يوسف الغامدي', email: 'parts@salisauto.sa' } },
  { id: 'accountant', demo: { name: 'Hessa Al-Mutairi', ar: 'حصة المطيري', email: 'finance@salisauto.sa' } },
  { id: 'hr', demo: { name: 'Reem Al-Dossari', ar: 'ريم الدوسري', email: 'hr@salisauto.sa' } },
  { id: 'frontdesk', demo: { name: 'Lama Al-Shehri', ar: 'لمى الشهري', email: 'frontdesk@salisauto.sa' } },
  { id: 'callcenter', demo: { name: 'Turki Al-Anazi', ar: 'تركي العنزي', email: 'calls@salisauto.sa' } },
  { id: 'procurement', demo: { name: 'Bandar Al-Subaie', ar: 'بندر السبيعي', email: 'procurement@salisauto.sa' } },
  { id: 'supplier', demo: { name: 'Al-Jazira Parts Co.', ar: 'شركة الجزيرة للقطع', email: 'supplier@aljazira.sa' } },
  { id: 'customer', demo: { name: 'Khalid Al-Amri', ar: 'خالد العامري', email: 'khalid@example.sa' } },
]
