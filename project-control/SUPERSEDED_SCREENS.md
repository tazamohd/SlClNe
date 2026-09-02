# Feature-map screen reconciliation — retrieval record

_Generated 2026-08-31. This file records the disposition of the 63 "orphan" screen
files flagged by BLK-010 (screen files unreachable from any route), so any removed
file can be retrieved from git when needed._

## How to restore a deleted file

Every deleted file below still lives in git history. To restore one:

```bash
# view it
git show 2e33f7d^:<path>
# restore it to the working tree
git show 2e33f7d^:<path> > <path>
```

Deletion commit: `2e33f7d` — "refactor(screens): delete the shadow copy of the app (BLK-010)".
Wiring commit:   `5f4a12b` — "feat(feature-map): wire 4 orphan screens into routes/registry".

---

## 1. Wired — graduated to real, reachable screens (4)

These were the sole implementation of an unclaimed spec-screen; they now render
their real component instead of the generic `FeatureScreenView` kit.

| File | Route | Capability |
|------|-------|-----------|
| `app/src/screens/ai/VoiceCommands.tsx` | `/voice-commands` | Voice-Commands |
| `app/src/screens/ai/VoiceCommandInterface.tsx` | `/voice-command-interface` | Voice-Command-Interface |
| `app/src/screens/fleet/LoanerVehicles.tsx` | `/loaner-vehicles` | Loaner-Vehicles |
| `app/src/screens/fleet/TowingServices.tsx` | `/towing-services` | Towing-Services |

## 2. Deleted — superseded shadow copies (57)

Stale pre-split originals; a canonical per-screen implementation already exists in
the domain barrels. Removed in `2e33f7d`. Restore any with the command above.

- `app/src/routes/SpecScreenResolver.tsx`
- `app/src/screens/accounting/BankReconciliation.tsx`
- `app/src/screens/accounting/CustomReports.tsx`
- `app/src/screens/accounting/InsuranceReports.tsx`
- `app/src/screens/accounting/InventoryReports.tsx`
- `app/src/screens/accounting/InvoicePreview.tsx`
- `app/src/screens/accounting/LoanReports.tsx`
- `app/src/screens/accounting/ReportsAnalytics.tsx`
- `app/src/screens/accounting/ReportsHub.tsx`
- `app/src/screens/accounting/SalesReports.tsx`
- `app/src/screens/accounting/TaxManagement.tsx`
- `app/src/screens/admin/ComplianceScreens.tsx`
- `app/src/screens/admin/HRPayroll.tsx`
- `app/src/screens/admin/HRScreens.tsx`
- `app/src/screens/admin/OrganizationScreens.tsx`
- `app/src/screens/admin/SettingsScreens.tsx`
- `app/src/screens/ai/AutomationRules.tsx`
- `app/src/screens/ai/WorkflowBuilder.tsx`
- `app/src/screens/auth/PrivacyPolicy.tsx`
- `app/src/screens/auth/TermsConditions.tsx`
- `app/src/screens/callcenter/CallCenter.tsx`
- `app/src/screens/comms/CommunicationScreens.tsx`
- `app/src/screens/compliance/ComplianceScreens.tsx`
- `app/src/screens/crm/CustomerFeedback.tsx`
- `app/src/screens/fleet/FleetTracking.tsx`
- `app/src/screens/fleet/TowingAssistance.tsx`
- `app/src/screens/infra/InfraScreens.tsx`
- `app/src/screens/insurance/ContractManagement.tsx`
- `app/src/screens/insurance/WarrantyManagement.tsx`
- `app/src/screens/marketing/MarketingScreens.tsx`
- `app/src/screens/meta/Native.tsx`
- `app/src/screens/meta/Specs.tsx`
- `app/src/screens/network/NetworkScreens.tsx`
- `app/src/screens/network/PurchaseOrder.tsx`
- `app/src/screens/procurement/ProcurementScreens.tsx`
- `app/src/screens/productivity/ProductivityScreens.tsx`
- `app/src/screens/reporting/ReportingScreens.tsx`
- `app/src/screens/settings/SettingsScreens.tsx`
- `app/src/screens/ui/Collaboration.tsx`
- `app/src/screens/ui/Insights.tsx`
- `app/src/screens/ui/Media.tsx`
- `app/src/screens/ui/ModalsCore.tsx`
- `app/src/screens/ui/ModalsFlow.tsx`
- `app/src/screens/ui/States.tsx`
- `app/src/screens/ui/Transfer.tsx`
- `app/src/screens/ui/Views.tsx`
- `app/src/screens/ui/ViewsAlt.tsx`
- `app/src/screens/website/About.tsx`
- `app/src/screens/website/Blog.tsx`
- `app/src/screens/website/Contact.tsx`
- `app/src/screens/website/FAQ.tsx`
- `app/src/screens/website/Insurance.tsx`
- `app/src/screens/website/Landing.tsx`
- `app/src/screens/website/Loans.tsx`
- `app/src/screens/website/Marketplace.tsx`
- `app/src/screens/website/Services.tsx`
- `app/src/screens/website/Support.tsx`

## 3. Retained on purpose — reference implementations (3)

Listed in `app/scripts/build-registry.mjs` `RETAINED_REFERENCE`. Unwired
deliberately (routing one would put a legacy screen in front of users); kept as the
reference for building the real screen. **Do not delete** without the same review.

- `app/src/screens/admin/SystemScreens.tsx` — reference for /security-cameras, /digital-signage (kit routes today)
- `app/src/screens/emerging/EmergingTechScreens.tsx` — reference for /drone-inspection, /ar-repair-guide, /ar-overlay, /vr-showroom, /blockchain-service-history, /smart-contracts, /quantum-computing
- `app/src/screens/enterprise/EnterpriseScreens.tsx` — reference for /wearable-integration

---

_Total accounted for: 4 wired + 56 deleted screens (+ router shim) + 3 retained. Registry now reports `orphanScreenFiles: 0`._
