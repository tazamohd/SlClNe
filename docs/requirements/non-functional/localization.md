# Localization — Non-Functional Requirements

| Field        | Value                                    |
|-------------|------------------------------------------|
| Document ID | NFR-L10N-007                             |
| Version     | 1.0                                      |
| Date        | 2026-08-30                               |
| Status      | Draft                                    |
| Category    | Localization                             |

## 1. Overview

This document defines the localization requirements for SALIS AUTO, covering bilingual English/Arabic support, RTL layout management, the translation pipeline, locale-aware formatting for Saudi Arabia, and the font system. The platform serves Saudi Arabian automotive workshops where both Arabic and English are working languages.

## 2. Bilingual EN/AR Support

### 2.1 Supported Languages

| Language | Code | Direction | Status   |
|----------|------|-----------|----------|
| English  | en   | LTR       | Primary  |
| Arabic   | ar   | RTL       | Full     |

### 2.2 Language Toggle

- Language preference is persisted in localStorage via `STORAGE_KEYS.lang`
- Default: English (`en`); Arabic selected by user toggle
- The `PreferencesProvider` manages language state above the router, so it survives navigation
- `toggleLanguage()` switches between `en` and `ar`

### 2.3 Arabic State

When Arabic is selected:

- `language = 'ar'`
- `rtl = true`
- `dir = 'rtl'` applied to `<html>` element
- Arabic translations loaded via dynamic import (`import('@/data/generated/ar')`)

## 3. Translation Pipeline

### 3.1 Pipeline Overview

```
project/gms-data.js → app/scripts/port-design-data.mjs → app/src/data/generated/ar.ts
```

1. **Source**: `gms-data.js` contains the design bundle's raw data, including Arabic strings
2. **Extraction**: `port-design-data.mjs` processes the design data and extracts translatable strings
3. **Output**: `ar.ts` contains the generated Arabic translation map (~2,122 entries)

### 3.2 Translation Files

| File                               | Purpose                              | Entry Count |
|------------------------------------|--------------------------------------|-------------|
| `app/src/data/generated/ar.ts`     | Auto-generated translations          | ~2,122      |
| `app/src/data/ar-overrides.ts`     | Manual corrections and additions     | Variable    |

### 3.3 Translation Loading

Arabic translations are lazily loaded and cached:

```typescript
async function loadArabic(): Promise<Record<string, string>> {
  if (arCache) return arCache
  const [{ AR }, { AR_OVERRIDES }] = await Promise.all([
    import('@/data/generated/ar'),
    import('@/data/ar-overrides'),
  ])
  arCache = { ...AR, ...AR_OVERRIDES }
  return arCache
}
```

### 3.4 The `t()` Function

The translation function follows a three-level fallback chain:

```
1. AR_OVERRIDES[key]  — Manual override (highest priority)
2. AR[key]            — Generated translation
3. key                — English source (fallback, never empty)
```

This ensures:

- Manual overrides take precedence over generated translations
- No label ever renders empty — the English source is always the fallback
- New UI text added in English appears immediately while awaiting translation

### 3.5 Translation Usage

The `t()` function is accessed via the `usePreferences()` hook:

```typescript
const { t } = usePreferences()
return <span>{t('Service History')}</span>
```

Column headers in `DataTable` are English source strings — they are translated at render time by the component.

## 4. RTL Layout

### 4.1 Document Direction

- `dir="rtl"` attribute set on the `<html>` element when `language === 'ar'`
- All child elements inherit direction unless explicitly overridden
- The `dir` value is provided by `PreferencesProvider` as a reactive property

### 4.2 CSS Logical Properties

All layout CSS uses logical properties that automatically adapt to text direction:

| Property Used          | Physical Equivalent (LTR) | Physical Equivalent (RTL) |
|------------------------|---------------------------|---------------------------|
| `margin-inline-start`  | margin-left               | margin-right              |
| `margin-inline-end`    | margin-right              | margin-left               |
| `padding-inline-start` | padding-left              | padding-right             |
| `padding-inline-end`   | padding-right             | padding-left              |
| `inset-inline-start`   | left                      | right                     |
| `inset-inline-end`     | right                     | left                      |
| `text-align: start`    | text-align: left          | text-align: right         |
| `text-align: end`      | text-align: right         | text-align: left          |
| `border-inline-start`  | border-left               | border-right              |
| `float: inline-start`  | float: left               | float: right              |

### 4.3 Direction Overrides

Some content must remain LTR regardless of page direction:

- License plate numbers
- VIN codes (17 characters)
- SKU codes
- Phone numbers (+966...)
- Email addresses
- Code/reference numbers (INV-2026-0142)

The `DataTable` column's `code: true` flag pins a cell to LTR and renders it in monospace, preventing Arabic character reordering.

### 4.4 Icon Mirroring

Directional icons (back arrows, chevrons, flow indicators) are mirrored in RTL mode. Non-directional icons (checkmark, settings gear, user) remain unchanged.

## 5. Database-Level Bilingual Support

### 5.1 Arabic Name Columns

Many tables carry `_ar` suffixed columns for Arabic content:

| Table            | Arabic Columns                                  |
|------------------|-------------------------------------------------|
| organizations    | name_ar                                         |
| branches         | name_ar                                         |
| users            | name_ar                                         |
| suppliers        | name_ar                                         |
| employees        | name_ar                                         |
| estimate_lines   | description_ar                                  |
| invoice_lines    | description_ar                                  |
| requisition_lines| description_ar                                  |
| kb_procedures    | title_ar, torque_ar                             |
| dtc_codes        | description_ar                                  |
| integrations     | name_ar, detail_ar                              |
| diag_findings    | finding_ar, system_ar                           |
| diag_stages      | label_ar, owner_name_ar, action_ar, adds_ar     |
| diag_labour      | task_ar                                         |
| diag_copies      | recipient_ar                                    |
| approval_lines   | item_ar, note_ar                                |
| crm_tasks        | (via translations)                              |
| campaigns        | (via translations)                              |

### 5.2 Bilingual API Response

API responses include both English and Arabic fields when available. The client displays the appropriate field based on the current language setting.

## 6. Locale-Aware Formatting

### 6.1 Currency

| Language | Format            | Symbol Position |
|----------|-------------------|-----------------|
| English  | SAR 1,234.56      | Prefix          |
| Arabic   | ١٬٢٣٤٫٥٦ ر.س     | Suffix          |

- Internal storage: integer halalas (bigint)
- Display: divided by 100, formatted per locale
- The `Money` UI component handles locale-aware currency formatting

### 6.2 Dates

| Language | Format                    | Calendar   |
|----------|---------------------------|------------|
| English  | Aug 30, 2026 / MM/DD/YYYY | Gregorian  |
| Arabic   | ٣٠ أغسطس ٢٠٢٦            | Gregorian  |

- Relative dates stored as display labels (`last_visit_label`, `last_service_label`)
- ISO 8601 used for API transport and storage

### 6.3 Numbers

| Language | Format    | Decimal | Grouping |
|----------|-----------|---------|----------|
| English  | 1,234.56  | .       | ,        |
| Arabic   | ١٬٢٣٤٫٥٦ | ٫       | ٬        |

### 6.4 Phone Numbers

Saudi phone numbers formatted as `+966 5x xxx xxxx` in both languages. The digits remain Western Arabic numerals in both locales for consistency with Saudi telecommunications standards.

## 7. Font System

### 7.1 Font Families

| Token        | Primary Font    | Usage                          |
|--------------|-----------------|--------------------------------|
| font-ui      | System UI stack | Body text, labels              |
| font-display | System UI stack | Headings, page titles          |
| font-action  | System UI stack | Buttons, action labels         |
| font-mono    | JetBrains Mono  | Code, SKUs, plates, VINs      |

### 7.2 Arabic Font Support

The system UI font stack includes Arabic-capable fonts:

- System fonts on macOS/iOS render Arabic natively
- Windows: Segoe UI, which includes Arabic glyphs
- Android: Roboto + Noto Sans Arabic
- Fallback: sans-serif (OS default)

### 7.3 Monospace for Identifiers

JetBrains Mono is used for monospace rendering of:

- Vehicle plate numbers
- VIN codes
- Part SKU codes
- Invoice/estimate/PO codes
- Reference numbers

These identifiers always render LTR regardless of page direction.

## 8. Translation Coverage

### 8.1 Coverage Metrics

- ~2,122 generated translation entries
- Manual overrides in `ar-overrides.ts` correct auto-translated strings
- Coverage testing via `app/src/data/ar-coverage.test.ts`
- i18n linting via `app/scripts/check-i18n.mjs`

### 8.2 Missing Translation Behavior

When a translation key has no Arabic entry:

1. The English source string is displayed (never empty)
2. The missing key is detectable via coverage tests
3. No runtime error or visible warning to end users

## 9. Cross-References

- [Usability](./usability.md) — RTL layout and responsive design details
- [Accessibility](./accessibility.md) — Screen reader support in both languages
- [Admin & Portals](../functional/admin-portals.md) — Language selection in portals
- [Registry](../functional/registry.md) — Bilingual customer and vehicle records
- [Workshop Operations](../functional/workshop-operations.md) — Bilingual estimate and inspection content
