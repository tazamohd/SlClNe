# BLK-004 buckets (from main's MASTER_REGISTRY.json, 2026-09-19)

224 PRODUCT capabilities are flagged mock-only (`dataBacked: false`). Split:

- **Bucket A, 62 screens: reclassify, no code.** Public website and auth/legal pages that render content, not a collection. Add a `contentOnly` (or similar) flag in `build-registry.mjs` so `dataBacked` is not owed, and BLK-004 drops by 62 in one PR.
- **Bucket B, 50 screens: wire to an existing contract entity.** One PR per entity group, merged serially.
- **Bucket C, 112 screens: no entity exists.** Convert to the honest `EmptyState` GAP pattern already used in waves 6 to 9, in one mechanical PR, or decide the feature is out of scope and retire the screen.

## Bucket A: reclassify — DONE

Implemented in `app/scripts/build-registry.mjs`: auth and public surfaces now carry `CONTENT_ONLY` instead of `MOCK_ONLY`. BLK-004 fell from 237 to 170 (67 screens; the registry had grown since the 62 counted below).

| Screen | Route | Domain |
|---|---|---|
| AccountLocked | `/account-locked` | auth |
| BiometricSetup | `/biometric-setup` | auth |
| CookiePolicy | `/cookie-policy` | auth |
| CreatePIN | `/create-pin` | auth |
| Error404 | `/error404` | auth |
| ForgotPassword | `/forgot-password` | auth |
| InviteAcceptance | `/invite-acceptance` | auth |
| LanguageSelection | `/language-selection` | auth |
| Login | `/login` | auth |
| LogoutConfirmation | `/logout-confirmation` | auth |
| Maintenance | `/maintenance` | auth |
| OTPVerification | `/otpverification` | auth |
| Onboarding | `/onboarding` | auth |
| OrganizationSelection | `/organization-selection` | auth |
| PrivacyPolicy | `/privacy-policy` | auth |
| ProfileCompletion | `/profile-completion` | auth |
| RegionSelection | `/region-selection` | auth |
| Register | `/register` | auth |
| ResetPassword | `/reset-password` | auth |
| RoleSelection | `/role-selection` | auth |
| SSOLogin | `/ssologin` | auth |
| SessionExpired | `/session-expired` | auth |
| SocialLogin | `/social-login` | auth |
| Splash | `/splash` | auth |
| TermsConditions | `/terms-conditions` | auth |
| TwoFactorVerification | `/two-factor-verification` | auth |
| Unauthorized | `/unauthorized` | auth |
| Welcome | `/welcome` | auth |
| PublicPortal.AI | `/public-portal/ai` | website |
| PublicPortal.About | `/public-portal/about` | website |
| PublicPortal.Accounting | `/public-portal/accounting` | website |
| PublicPortal.Automation | `/public-portal/automation` | website |
| PublicPortal.Blog | `/public-portal/blog` | website |
| PublicPortal.BookDemo | `/public-portal/book-demo` | website |
| PublicPortal.CRM | `/public-portal/crm` | website |
| PublicPortal.Careers | `/public-portal/careers` | website |
| PublicPortal.Contact | `/public-portal/contact` | website |
| PublicPortal.CustomerPortal | `/public-portal/customer-portal` | website |
| PublicPortal.DealsOffers | `/public-portal/deals-offers` | website |
| PublicPortal.FAQ | `/public-portal/faq` | website |
| PublicPortal.Features | `/public-portal/features` | website |
| PublicPortal.Fleet | `/public-portal/fleet` | website |
| PublicPortal.Industries | `/public-portal/industries` | website |
| PublicPortal.Insurance | `/public-portal/insurance` | website |
| PublicPortal.Integrations | `/public-portal/integrations` | website |
| PublicPortal.Landing | `/public-portal/landing` | website |
| PublicPortal.Loans | `/public-portal/loans` | website |
| PublicPortal.MiniERP | `/public-portal/mini-erp` | website |
| PublicPortal.PartsAccessories | `/public-portal/parts-accessories` | website |
| PublicPortal.Pricing | `/public-portal/pricing` | website |
| PublicPortal.Products | `/public-portal/products` | website |
| PublicPortal.RequestDemo | `/public-portal/request-demo` | website |
| PublicPortal.Resources | `/public-portal/resources` | website |
| PublicPortal.RoiCalculator | `/public-portal/roi-calculator` | website |
| PublicPortal.Security | `/public-portal/security` | website |
| PublicPortal.Services | `/public-portal/services` | website |
| PublicPortal.Solutions | `/public-portal/solutions` | website |
| PublicPortal.SpareParts | `/public-portal/spare-parts` | website |
| PublicPortal.SupplierPortal | `/public-portal/supplier-portal` | website |
| PublicPortal.Support | `/public-portal/support` | website |
| PublicPortal.TechnicianPortal | `/public-portal/technician-portal` | website |
| PublicPortal.Workshop | `/public-portal/workshop` | website |

## Bucket B: wire to an entity

### `part` (19)
| Screen | Route | Module |
|---|---|---|
| Partners-Current-Account | `/partners-current-account` | None |
| Parts-Auto-Reorder | `/parts-auto-reorder` | None |
| Parts-Availability | `/parts-availability` | None |
| Parts-Marketplace | `/parts-marketplace` | None |
| Parts-Network-Dashboard | `/parts-network-dashboard` | None |
| Parts-Network-Incoming-Requests | `/parts-network-incoming-requests` | None |
| Parts-Network-My-Requests | `/parts-network-my-requests` | None |
| PartsNetwork | `/parts-network` | network |
| PartsNetwork.Incoming | `/parts-network/incoming` | None |
| PartsNetwork.Members | `/parts-network/members` | None |
| PartsNetwork.Orders | `/parts-network/orders` | None |
| PartsNetwork.Quotations | `/parts-network/quotations` | None |
| PartsNetwork.Requests | `/parts-network/requests` | None |
| PartsNetwork.SendRequest | `/parts-network/send-request` | None |
| PartsSupplyNetwork | `/parts-supply-network` | network |
| Smart-Parts-Recommendations | `/smart-parts-recommendations` | None |
| Smart-Parts-Recommender | `/smart-parts-recommender` | None |
| Spare-Parts | `/spare-parts` | None |
| Technician-Portal-Parts | `/technician-portal-parts` | None |

### `customer` (9)
| Screen | Route | Module |
|---|---|---|
| Customer-App-Booking | `/customer-app-booking` | None |
| Customer-LTV-Analysis | `/customer-ltv-analysis` | None |
| Customer-Loyalty | `/customer-loyalty` | None |
| Customer-Reviews-Ratings | `/customer-reviews-ratings` | None |
| CustomerApp.Marketplace | `/customer-app/marketplace` | None |
| CustomerApp.Notifications | `/customer-app/notifications` | None |
| CustomerApp.Orders | `/customer-app/orders` | None |
| CustomerApp.Profile | `/customer-app/profile` | None |
| CustomerApp.Wallet | `/customer-app/wallet` | None |

### `procurement` (8)
| Screen | Route | Module |
|---|---|---|
| ProcurementPortal.Requisitions | `/procurement-portal/requisitions` | portalprocure |
| Purchase-Agent-Delivery | `/purchase-agent-delivery` | None |
| Purchase-Agent-Price-Compare | `/purchase-agent-price-compare` | None |
| Purchase-Agent-Quotations | `/purchase-agent-quotations` | None |
| Purchase-Agent-Reports | `/purchase-agent-reports` | None |
| Purchase-Agent-Tasks | `/purchase-agent-tasks` | None |
| Purchase-Agent-Tracking | `/purchase-agent-tracking` | None |
| Vendor-Supplier-Portal | `/vendor-supplier-portal` | None |

### `vehicle` (6)
| Screen | Route | Module |
|---|---|---|
| Digital-Vehicle-Walkaround | `/digital-vehicle-walkaround` | None |
| Loaner-Vehicles | `/loaner-vehicles` | None |
| Vehicle-Checklist | `/vehicle-checklist` | None |
| Vehicle-Health-Monitoring | `/vehicle-health-monitoring` | None |
| Vehicle-History | `/vehicle-history` | None |
| Vehicle-Storage | `/vehicle-storage` | None |

### `feedback` (2)
| Screen | Route | Module |
|---|---|---|
| Client-Portal-Review-Chat | `/client-portal-review-chat` | None |
| Staff-Performance-Review | `/staff-performance-review` | None |

### `jobCard` (1)
| Screen | Route | Module |
|---|---|---|
| HealthCheckReport | `/customer-portal/health-check-report` | jobcards |

### `appointment` (1)
| Screen | Route | Module |
|---|---|---|
| Appointment-Reminders | `/appointment-reminders` | None |

### `inspection` (1)
| Screen | Route | Module |
|---|---|---|
| Vehicle-Inspections | `/vehicle-inspections` | None |

### `estimate` (1)
| Screen | Route | Module |
|---|---|---|
| Video-Estimates | `/video-estimates` | None |

### `crm` (1)
| Screen | Route | Module |
|---|---|---|
| Technician-Leaderboards | `/technician-leaderboards` | None |

### `bankStatement` (1)
| Screen | Route | Module |
|---|---|---|
| Bank-Account-Management | `/bank-account-management` | None |

## Bucket C: DONE (2026-09-19)

Two halves, both in `app/scripts/build-registry.mjs`:

- **Rule.** A screen that renders the honest gap state (the new `GapCard` component, the hand-written wave 6-9 card, or the feature kit's zero-stat view from `definitions.ts`) reads no fixtures, so it is no longer MOCK_ONLY. It carries `NO_BACKEND` and is counted under a new blocker, BLK-013, so the gap stays visible instead of hidden.
- **Conversion.** 53 fixture-only screens were replaced with a `GapCard` stub that keeps the page header, the mobile branch and the route's expected text. Each stub names the collection it should read once the API serves it.

**BLK-004: 170 → 43.** BLK-013 (NO_BACKEND): 127.

InternalWarehouse and TrainingLMS were converted and then restored: golden paths 7 (Inventory receiving) and 14 (Employee onboarding) assert on their content, so they need real data (bucket B), not an empty state.

Skipped on purpose (25), because they are forms, tools, profiles, navigation hubs, multi-screen files, or already wired outside the seam: DashboardWidgets, DataBackup, DataImportExport, RolesPermissions, Tools, UsersTeams, VoiceCommandInterface, VoiceCommands, VATSettings, ZATCASettings, ZakatSettings, CustomerAppBooking, WelcomePage, PartsNetwork.tsx (4 screens), Procurement.tsx, BarcodeScanner, ClientPortalProfile, TechnicianAppProfile, TechnicianPortalProfile, FinancialSettings, RoleManagement, SecuritySettings, SystemSettings, UserProfile, UserSettings.

### Remaining MOCK_ONLY after bucket C (43)

| Screen | Route | Domain |
|---|---|---|
| AIAssistant | `/aiassistant` | ai |
| Barcode-Scanner | `/barcode-scanner` | featuremap |
| Cash-Flow-Statement | `/cash-flow-statement` | featuremap |
| Customer-App-Booking | `/customer-app-booking` | featuremap |
| CustomerApp.Marketplace | `/customer-app/marketplace` | customerapp |
| CustomerApp.Notifications | `/customer-app/notifications` | customerapp |
| CustomerApp.Orders | `/customer-app/orders` | customerapp |
| CustomerApp.Profile | `/customer-app/profile` | customerapp |
| CustomerApp.Wallet | `/customer-app/wallet` | customerapp |
| Dashboard-Widgets | `/dashboard-widgets` | featuremap |
| Data-Backup | `/data-backup` | featuremap |
| Data-Import-Export | `/data-import-export` | featuremap |
| Financial-Settings | `/financial-settings` | featuremap |
| HealthCheckReport | `/customer-portal/health-check-report` | admin |
| Internal-Warehouse | `/internal-warehouse` | featuremap |
| Native.Android | `/native/android` | portals |
| Native.iOS | `/native/i-os` | portals |
| Notifications | `/notifications` | featuremap |
| PartsNetwork.Quotations | `/parts-network/quotations` | parts |
| PartsNetwork.SendRequest | `/parts-network/send-request` | parts |
| PartsSupplyNetwork | `/parts-supply-network` | parts |
| ProcurementPortal.Requisitions | `/procurement-portal/requisitions` | portals |
| Profile | `/profile` | admin |
| Retained-Earnings | `/retained-earnings` | featuremap |
| Role-Management | `/role-management` | featuremap |
| RolesPermissions | `/roles-permissions` | admin |
| Security-Settings | `/security-settings` | featuremap |
| Spare-Parts | `/spare-parts` | featuremap |
| System-Settings | `/system-settings` | featuremap |
| Tasks | `/tasks` | featuremap |
| Technician-Leaderboards | `/technician-leaderboards` | featuremap |
| Tools | `/tools` | featuremap |
| Training-LMS | `/training-lms` | featuremap |
| User-Profile | `/user-profile` | featuremap |
| User-Settings | `/user-settings` | featuremap |
| UsersTeams | `/users-teams` | admin |
| VAT-Settings | `/vat-settings` | featuremap |
| Vehicle-History | `/vehicle-history` | featuremap |
| Voice-Command-Interface | `/voice-command-interface` | admin |
| Voice-Commands | `/voice-commands` | admin |
| Welcome-Page | `/welcome-page` | featuremap |
| ZATCA-Settings | `/zatca-settings` | featuremap |
| Zakat-Settings | `/zakat-settings` | featuremap |

These are bucket B (wire to an entity) or a product decision (settings and profile forms need a persistence endpoint, not an empty state).

## Bucket B, first pass: DONE (2026-09-19)

Two kinds of fix, both real wiring, no new detector shortcuts:

- **Registry detection gap.** `network/Procurement.tsx`'s procurement seam
  (`ProcurementRequisitions`, and by extension `PartsNetwork.Quotations` /
  `ProcurementPortal.Requisitions`) predates `useCollection` — it is a typed
  `ProcurementApi` object, null on a fixture build and a real HTTP client
  otherwise (`repository.ts`'s `procurement`, gated on `API_URL` the same way
  every collection is). `build-registry.mjs` only recognised the
  `useCollection` family, so a screen wired this way still counted as
  MOCK_ONLY. Added `PROCUREMENT_API_CALL` alongside the existing
  `REPORT_HOOK_CALL` special case: same shape, one more legitimate seam.
- **Honest-gap detection was file-scoped, not export-scoped.** Bucket C's
  `honestGapScreens` grepped a whole file for a gap marker, so a file mixing
  one wired screen with several honest-gap ones (`network/Procurement.tsx`,
  `network/PartsNetwork.tsx`) either credited the gap ones by accident
  (inheriting a marker from a sibling export) or missed them entirely (a
  file-level `SEAM_ANY` check throwing out three honest exports because a
  fourth uses `useCollection`). Rewritten to scan per export via the same
  `exportBodies` slicing `dataBackedScreens` already uses, and generalised to
  resolve a local wrapper component — `PartsNetwork.tsx`'s `GapPanel`,
  `hr/StaffGap.tsx`'s `GapShell` — the same way `dataBackedScreens` already
  resolves a wrapper that mounts a sibling. Also recognises `hr/bits.tsx`'s
  cross-file `ConnectApi`, already used honestly across HR.
- **`PartsSupplyNetwork`** inlined its own `EmptyState` per tab (four tabs,
  every stat zero) instead of the file's shared `NetworkGapPanel`; refactored
  to use it, for the same honest state with a named missing collection.
- **`SparePartsList.tsx`** genuinely rendered an invented 10-row parts catalog
  with a `category`/`brand`/`compatibility`/`status` shape the `parts`
  collection doesn't have. Rewired to `useCollection('parts')`; the three
  fields with no real backing were dropped rather than filled with
  placeholders, and `status` is now derived from `stock` vs `reorder`, the
  same comparison `Inventory.tsx` and `ProcurementPurchaseOrder.tsx` already
  use to flag a part for reordering.

**BLK-004: 43 → 38.** BLK-013 (NO_BACKEND): 129.

### Remaining MOCK_ONLY after bucket B first pass (38)

| Screen | Route | Domain |
|---|---|---|
| AIAssistant | `/aiassistant` | ai |
| Barcode-Scanner | `/barcode-scanner` | featuremap |
| Cash-Flow-Statement | `/cash-flow-statement` | featuremap |
| Customer-App-Booking | `/customer-app-booking` | featuremap |
| CustomerApp.Marketplace | `/customer-app/marketplace` | customerapp |
| CustomerApp.Notifications | `/customer-app/notifications` | customerapp |
| CustomerApp.Orders | `/customer-app/orders` | customerapp |
| CustomerApp.Profile | `/customer-app/profile` | customerapp |
| CustomerApp.Wallet | `/customer-app/wallet` | customerapp |
| Dashboard-Widgets | `/dashboard-widgets` | featuremap |
| Data-Backup | `/data-backup` | featuremap |
| Data-Import-Export | `/data-import-export` | featuremap |
| Financial-Settings | `/financial-settings` | featuremap |
| HealthCheckReport | `/customer-portal/health-check-report` | admin |
| Internal-Warehouse | `/internal-warehouse` | featuremap |
| Native.Android | `/native/android` | portals |
| Native.iOS | `/native/i-os` | portals |
| Notifications | `/notifications` | featuremap |
| Profile | `/profile` | admin |
| Retained-Earnings | `/retained-earnings` | featuremap |
| Role-Management | `/role-management` | featuremap |
| RolesPermissions | `/roles-permissions` | admin |
| Security-Settings | `/security-settings` | featuremap |
| System-Settings | `/system-settings` | featuremap |
| Tasks | `/tasks` | featuremap |
| Technician-Leaderboards | `/technician-leaderboards` | featuremap |
| Tools | `/tools` | featuremap |
| Training-LMS | `/training-lms` | featuremap |
| User-Profile | `/user-profile` | featuremap |
| User-Settings | `/user-settings` | featuremap |
| UsersTeams | `/users-teams` | admin |
| VAT-Settings | `/vat-settings` | featuremap |
| Vehicle-History | `/vehicle-history` | featuremap |
| Voice-Command-Interface | `/voice-command-interface` | admin |
| Voice-Commands | `/voice-commands` | admin |
| Welcome-Page | `/welcome-page` | featuremap |
| ZATCA-Settings | `/zatca-settings` | featuremap |
| Zakat-Settings | `/zakat-settings` | featuremap |

Grouped by what they actually need:

- **Wire to `crmTasks` or a similar existing collection, with care about
  overlap with `CRMTasks.tsx`:** Tasks.
- **Wire to `vehicles`/`jobs` (service history) or `inventory` movements:**
  Vehicle-History, Internal-Warehouse.
- **Need a genuinely new backend collection, not just frontend wiring** (no
  matching entity in `packages/contract`, `API_REGISTRY.json`, or
  `server/drizzle/`): AIAssistant, Barcode-Scanner, Cash-Flow-Statement,
  Customer-App-Booking, CustomerApp.* (5), Notifications, Retained-Earnings,
  Technician-Leaderboards, Training-LMS, HealthCheckReport,
  Native.Android/iOS. These are bucket-C-shaped (an honest `GapCard`), not
  bucket-B-shaped, and were left as-is rather than converted in the same
  pass because each needs its own product decision about what the missing
  collection should be named and whether it belongs in this session's
  scope at all.
- **Settings/profile/admin forms needing a persistence endpoint, not an
  empty state:** Dashboard-Widgets, Data-Backup, Data-Import-Export,
  Financial-Settings, Profile, Role-Management, RolesPermissions,
  Security-Settings, System-Settings, Tools, User-Profile, User-Settings,
  UsersTeams, VAT-Settings, Voice-Command-Interface, Voice-Commands,
  Welcome-Page, ZATCA-Settings, Zakat-Settings. A `GapCard` on a form is the
  wrong fix — these need the actual write endpoint (some, like `UsersTeams`
  and `RolesPermissions`, already partly exist per PR #128's admin/staff
  routes; the rest do not).

## Bucket B: main moved under this branch — merged, not re-fought (2026-09-19)

A concurrent session's PR #155 landed on main while this pass was in
flight: a real `warehouseZones` collection plus a `zone_code` reference on
`parts`, closing `Internal-Warehouse` honestly (derived item counts, not
recorded ones — see 4397971's own message) without touching golden path 7.
It also generalised `build-registry.mjs`'s file-admission gate to a
"file imports from `data/repository`" catch-all, which conflicted with this
branch's named `HEALTH_CHECK_API_CALL` clause in the same spot. Resolved by
keeping both: the broad import check as the general net, the named clause
kept alongside it for the same reason `PROCUREMENT_API_CALL` is named rather
than folded away — a reader asking "why does this file get scanned" finds
the specific answer, not just the general one.

**BLK-004: 37 → 36** (Internal-Warehouse's fix landed on main independently
of this branch; the 37 above already reflected this branch's own two fixes
before the merge). BLK-013 (NO_BACKEND): 129 → 117 (Internal-Warehouse
leaves the honest-gap count entirely, since it's dataBacked now, not gap).

## Bucket B, second pass: DONE (2026-09-19)

**Another registry detection gap, same shape as the first pass.**
`workshop/inspection-api.ts`'s `fetchHealthCheckReport` is a real
`GET /jobs/:id/health-check-report` call — live-only, rejecting with a named
error rather than a fixture fallback when it isn't — read via `useQuery` in
`CustomerHealthCheckReport.tsx`, so `SEAM_CALL` never saw a collection key to
credit it by. Added `HEALTH_CHECK_API_CALL` beside `PROCUREMENT_API_CALL`.

**Investigated the rest of the previous pass's list and found each one
genuinely blocked, not a missed wiring job:**

- **`Tasks` (`TasksList.tsx`).** The only real task collection is `crmTasks`,
  whose `type` values (`call`/`meeting`/`document`/`task`) and sales-oriented
  content are what `CRMTasks.tsx` already renders under that name. `Tasks`'
  own categories (Maintenance/Follow-up/Administrative/Inspection) don't
  exist in that data — wiring `Tasks` to `crmTasks` would show CRM outreach
  rows under invented operational categories, the same mislabelling problem
  bucket A and C exist to catch. Needs its own ops-task collection, not a
  wire to an existing one.
- **`Vehicle-History` (`VehicleHistory.tsx`).** Takes no vehicle in its route
  or props — it is an orphaned static page, linked from nowhere, so there is
  no vehicle to show history *for*. Even granting it a vehicle picker,
  `jobs` carries no `vehicleId` foreign key (only a free-text `veh` string
  like `"Toyota Camry 2022"`), so a job cannot be reliably matched to a
  vehicle record without guessing by string match. Needs a real
  `jobs.vehicleId` column before this is wireable at all.
- **`Internal-Warehouse`.** No zones/locations concept exists anywhere in
  `packages/contract`, `API_REGISTRY.json`, or `server/drizzle/` — the
  closest real thing, `inventory` movements, tracks quantity, not physical
  zone/capacity. It also can't become a `GapCard` without breaking
  golden path 7 (`e2e/inventory-receiving.spec.ts`), which asserts a
  "Receiving" zone and a numeric utilisation figure — a real fix here means
  either building zone tracking or rewriting that golden path, both product
  decisions past a wiring pass.
- **`Cash-Flow-Statement` / `Retained-Earnings`.** Multi-year opening/closing
  balances and net-income-by-period aren't something `chartOfAccounts` /
  `journalEntries` give you directly the way `useTrialBalance` derives a
  balance from posted entries — they need real period-close accounting logic
  (accumulated retained earnings across fiscal years, cash-flow
  classification of movements), which is new financial computation, not
  wiring to what exists.
- **`Notifications` / `CustomerApp.Notifications`.** No notifications
  endpoint anywhere in `API_REGISTRY.json` — confirmed no hidden seam like
  the two found above.
- **`AIAssistant`.** Already honest (PR #151): no fabricated transcript, a
  toast on send. It doesn't fit the GAP-marker shape (no list/table with an
  empty state to show) because it's an interactive chat shell, not a report
  — MOCK_ONLY here is a known, accepted limit of what the flag can
  distinguish, not a bug.

**BLK-004: 38 → 37.** BLK-013 (NO_BACKEND): 129 (unchanged: a detection-gap
fix moves a screen straight to dataBacked, not through NO_BACKEND).

### Remaining MOCK_ONLY after bucket B second pass (37)

| Screen | Route | Domain |
|---|---|---|
| AIAssistant | `/aiassistant` | ai |
| Barcode-Scanner | `/barcode-scanner` | featuremap |
| Cash-Flow-Statement | `/cash-flow-statement` | featuremap |
| Customer-App-Booking | `/customer-app-booking` | featuremap |
| CustomerApp.Marketplace | `/customer-app/marketplace` | customerapp |
| CustomerApp.Notifications | `/customer-app/notifications` | customerapp |
| CustomerApp.Orders | `/customer-app/orders` | customerapp |
| CustomerApp.Profile | `/customer-app/profile` | customerapp |
| CustomerApp.Wallet | `/customer-app/wallet` | customerapp |
| Dashboard-Widgets | `/dashboard-widgets` | featuremap |
| Data-Backup | `/data-backup` | featuremap |
| Data-Import-Export | `/data-import-export` | featuremap |
| Financial-Settings | `/financial-settings` | featuremap |
| Internal-Warehouse | `/internal-warehouse` | featuremap |
| Native.Android | `/native/android` | portals |
| Native.iOS | `/native/i-os` | portals |
| Notifications | `/notifications` | featuremap |
| Profile | `/profile` | admin |
| Retained-Earnings | `/retained-earnings` | featuremap |
| Role-Management | `/role-management` | featuremap |
| RolesPermissions | `/roles-permissions` | admin |
| Security-Settings | `/security-settings` | featuremap |
| System-Settings | `/system-settings` | featuremap |
| Tasks | `/tasks` | featuremap |
| Technician-Leaderboards | `/technician-leaderboards` | featuremap |
| Tools | `/tools` | featuremap |
| Training-LMS | `/training-lms` | featuremap |
| User-Profile | `/user-profile` | featuremap |
| User-Settings | `/user-settings` | featuremap |
| UsersTeams | `/users-teams` | admin |
| VAT-Settings | `/vat-settings` | featuremap |
| Vehicle-History | `/vehicle-history` | featuremap |
| Voice-Command-Interface | `/voice-command-interface` | admin |
| Voice-Commands | `/voice-commands` | admin |
| Welcome-Page | `/welcome-page` | featuremap |
| ZATCA-Settings | `/zatca-settings` | featuremap |
| Zakat-Settings | `/zakat-settings` | featuremap |

All 37 are now confirmed blocked on a real product or schema decision, not a
missed wire: settings/profile forms need a persistence endpoint (`Profile`,
`RolesPermissions`, `UsersTeams`, `System-Settings`, etc.), the rest need a
new backend collection or computation (`Tasks`, `Vehicle-History`,
`Internal-Warehouse`, `Cash-Flow-Statement`, `Retained-Earnings`,
`Notifications`, `CustomerApp.*`, `AIAssistant`, `Barcode-Scanner`,
`Customer-App-Booking`, `Technician-Leaderboards`, `Training-LMS`,
`Native.Android`/`iOS`). Bucket B is done as a wiring pass; what's left is
product scoping work, one collection or endpoint at a time.

## Bucket C (original list): no entity, EmptyState or retire

| Screen | Route | Domain | Module |
|---|---|---|---|
| AdvancedSettings | `/advanced-settings` | admin | settings |
| AuditLog | `/audit-log` | admin | audit |
| Backup | `/backup` | admin | settings |
| NotificationCenter | `/notification-center` | admin | dashboard |
| Organizations | `/organizations` | admin | superadmin |
| Profile | `/profile` | admin | dashboard |
| RolesPermissions | `/roles-permissions` | admin | superadmin |
| Settings | `/settings` | admin | settings |
| Subscription | `/subscription` | admin | settings |
| SuperAdmin | `/super-admin` | admin | superadmin |
| Templates | `/templates` | admin | admin |
| UsersTeams | `/users-teams` | admin | admin |
| AIAnalytics | `/aianalytics` | ai | ai |
| AIAssistant | `/aiassistant` | ai | ai |
| AutomationRules | `/automation-rules` | ai | aiadmin |
| ModelSettings | `/model-settings` | ai | aiadmin |
| PromptLibrary | `/prompt-library` | ai | ai |
| WorkflowBuilder | `/workflow-builder` | ai | aiadmin |
| AI-Automation | `/ai-automation` | featuremap | None |
| AI-Scheduling | `/ai-scheduling` | featuremap | None |
| Accounts-Payable | `/accounts-payable` | featuremap | None |
| Assets-Management | `/assets-management` | featuremap | None |
| Automated-Reordering | `/automated-reordering` | featuremap | None |
| Barcode-Scanner | `/barcode-scanner` | featuremap | None |
| Budget-Management | `/budget-management` | featuremap | None |
| Business-Heatmaps | `/business-heatmaps` | featuremap | None |
| Business-Intelligence | `/business-intelligence` | featuremap | None |
| Business-Intelligence-Dashboard | `/business-intelligence-dashboard` | featuremap | None |
| Capital-Management | `/capital-management` | featuremap | None |
| Cash-Flow-Statement | `/cash-flow-statement` | featuremap | None |
| Chat | `/chat` | featuremap | None |
| Client-Portal-Profile | `/client-portal-profile` | featuremap | None |
| Client-Portal-Reminders | `/client-portal-reminders` | featuremap | None |
| Compliance-Management | `/compliance-management` | featuremap | None |
| Contract-Management | `/contract-management` | featuremap | None |
| Cost-Centers | `/cost-centers` | featuremap | None |
| Dashboard-Widgets | `/dashboard-widgets` | featuremap | None |
| Data-Backup | `/data-backup` | featuremap | None |
| Data-Import-Export | `/data-import-export` | featuremap | None |
| Diagnostics-OBD-Hub | `/diagnostics-obd-hub` | featuremap | None |
| Document-Management | `/document-management` | featuremap | None |
| Dynamic-Pricing | `/dynamic-pricing` | featuremap | None |
| Emerging-Technologies | `/emerging-technologies` | featuremap | None |
| Environmental-Compliance | `/environmental-compliance` | featuremap | None |
| Equipment-Calibration | `/equipment-calibration` | featuremap | None |
| Financial-Settings | `/financial-settings` | featuremap | None |
| Franchise-Management | `/franchise-management` | featuremap | None |
| Globalization-Layer | `/globalization-layer` | featuremap | None |
| ISO-Quality-Management | `/iso-quality-management` | featuremap | None |
| Intelligent-Price-Optimizer | `/intelligent-price-optimizer` | featuremap | None |
| Internal-Warehouse | `/internal-warehouse` | featuremap | None |
| Inventory-Management | `/inventory-management` | featuremap | None |
| KPI-Dashboard | `/kpi-dashboard` | featuremap | None |
| Liabilities-Management | `/liabilities-management` | featuremap | None |
| Live-Service-Tracking | `/live-service-tracking` | featuremap | None |
| Loss-Account | `/loss-account` | featuremap | None |
| Loyalty-Program | `/loyalty-program` | featuremap | None |
| Marketing-Automation | `/marketing-automation` | featuremap | None |
| Multi-Location-Dashboard | `/multi-location-dashboard` | featuremap | None |
| NextGen-Technologies | `/next-gen-technologies` | featuremap | None |
| Notifications | `/notifications` | featuremap | None |
| OEM-Software-Subscriptions | `/oem-software-subscriptions` | featuremap | None |
| Portal-Communications | `/portal-communications` | featuremap | None |
| Portal-Dashboard | `/portal-dashboard` | featuremap | None |
| Predictive-Diagnostics | `/predictive-diagnostics` | featuremap | None |
| Predictive-Maintenance | `/predictive-maintenance` | featuremap | None |
| Productivity-Tracker | `/productivity-tracker` | featuremap | None |
| Profit-Analysis | `/profit-analysis` | featuremap | None |
| Quality-Control | `/quality-control` | featuremap | None |
| Referral-Program | `/referral-program` | featuremap | None |
| Refund-Management | `/refund-management` | featuremap | None |
| Retained-Earnings | `/retained-earnings` | featuremap | None |
| Role-Management | `/role-management` | featuremap | None |
| Routing-Optimizer | `/routing-optimizer` | featuremap | None |
| Safety-Incidents | `/safety-incidents` | featuremap | None |
| Sales-Guide | `/sales-guide` | featuremap | None |
| Security-Settings | `/security-settings` | featuremap | None |
| Service-Bay-Dashboard | `/service-bay-dashboard` | featuremap | None |
| Service-Templates | `/service-templates` | featuremap | None |
| Smart-Assignment | `/smart-assignment` | featuremap | None |
| Smart-Inventory-Forecasting | `/smart-inventory-forecasting` | featuremap | None |
| Staff-Scheduling | `/staff-scheduling` | featuremap | None |
| Support-Chat-Dashboard | `/support-chat-dashboard` | featuremap | None |
| System-Settings | `/system-settings` | featuremap | None |
| Task-Management | `/task-management` | featuremap | None |
| Tasks | `/tasks` | featuremap | None |
| Technician-App-Clock | `/technician-app-clock` | featuremap | None |
| Technician-App-Profile | `/technician-app-profile` | featuremap | None |
| Technician-Management | `/technician-management` | featuremap | None |
| Technician-Performance | `/technician-performance` | featuremap | None |
| Technician-Portal-Attendance | `/technician-portal-attendance` | featuremap | None |
| Technician-Portal-Documentation | `/technician-portal-documentation` | featuremap | None |
| Technician-Portal-Guides | `/technician-portal-guides` | featuremap | None |
| Technician-Portal-Profile | `/technician-portal-profile` | featuremap | None |
| Technician-Portal-Software | `/technician-portal-software` | featuremap | None |
| Technician-Portal-Time-Clock | `/technician-portal-time-clock` | featuremap | None |
| Tire-Management | `/tire-management` | featuremap | None |
| Tools | `/tools` | featuremap | None |
| Towing-Assistance | `/towing-assistance` | featuremap | None |
| Towing-Services | `/towing-services` | featuremap | None |
| Training-LMS | `/training-lms` | featuremap | None |
| User-Profile | `/user-profile` | featuremap | None |
| User-Settings | `/user-settings` | featuremap | None |
| VAT-Settings | `/vat-settings` | featuremap | None |
| VIN-Decoder | `/vin-decoder` | featuremap | None |
| Welcome-Page | `/welcome-page` | featuremap | None |
| ZATCA-Settings | `/zatca-settings` | featuremap | None |
| Zakat-Settings | `/zakat-settings` | featuremap | None |
| CallCenter | `/call-center` | portals | callcenter |
| CallCenter.Logs | `/call-center/logs` | portals | callcenter |
| Native.Android | `/native/android` | portals | None |
| Native.iOS | `/native/i-os` | portals | None |

Entity match is a name heuristic on screen and module names; confirm each row before wiring. Order of work: A (one PR, biggest drop), then C (one PR, mechanical), then B by entity group.
