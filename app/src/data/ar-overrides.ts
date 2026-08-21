/** Arabic for strings the design bundle never translated.
 *
 *  `generated/ar.ts` is regenerated from `project/gms-data.js` and must not be
 *  hand-edited, so it can only ever hold what the prototypes carried. The
 *  rebuilt screens introduced copy the bundle never saw — empty states, derived
 *  totals, toasts — which `t()` currently falls back to English for, leaving
 *  Arabic mode mixed.
 *
 *  This file is hand-maintained and merged ahead of the generated dictionary,
 *  so entries survive `npm run port-design`.
 *
 *  NEEDS A NATIVE REVIEWER. Seeded here are only unambiguous, standard UI
 *  terms. The remainder — accounting and IFRS copy especially, where a loose
 *  translation is worse than English — is deliberately left untranslated rather
 *  than guessed at. `ar-coverage.test.ts` prints what is still outstanding. */
export const AR_OVERRIDES: Record<string, string> = {
  // Common actions and feedback
  'Load More': 'تحميل المزيد',
  'Settings saved': 'تم حفظ الإعدادات',
  'Your changes have been applied.': 'تم تطبيق التغييرات.',
  'Export started': 'بدأ التصدير',
  'Backup started': 'بدأ النسخ الاحتياطي',
  'Mark All Read': 'تعليم الكل كمقروء',

  // Empty states
  'No accounts yet': 'لا توجد حسابات بعد',
  'No journal entries yet': 'لا توجد قيود يومية بعد',
  'No expenses recorded': 'لا توجد مصروفات مسجلة',
  'No receipts yet': 'لا توجد إيصالات بعد',
  'No departments yet': 'لا توجد أقسام بعد',
  'No matching events': 'لا توجد أحداث مطابقة',
  'Nothing here yet': 'لا يوجد شيء هنا بعد',

  // Pending-screen scaffolding
  'Designed, not yet rebuilt': 'مصمم، لم يُبنَ بعد',
  'Design file': 'ملف التصميم',
  'Mobile variant': 'نسخة الجوال',

  // Frequently shown labels
}
