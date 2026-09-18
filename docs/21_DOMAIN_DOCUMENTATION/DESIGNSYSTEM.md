<!-- GENERATED FILE — DO NOT EDIT BY HAND.
     Generator: tools/docs/generators/domains.mjs
     Regenerate: node tools/docs/generate.mjs
     Derived from:
       - project-control/CAPABILITY_REGISTRY.json
       - project-control/API_REGISTRY.json
       - project-control/ENTITY_REGISTRY.json
       - project-control/PERMISSION_REGISTRY.json
       - project-control/BUSINESS_RULES.json
       - project-control/MASTER_REGISTRY.json
-->

# Domain — Design system and reference surfaces

**Status:** GENERATED · **Capability:** CAP-DESIGNSYSTEM · **Sources as of:** 2026-09-18

## Purpose and scope

This domain serves the objective **OBJ-VISIBILITY** (Give owners operational visibility). It comprises 205 screens, 0 API endpoints and 0 entities, gated by the `ui`, `featuremap` screen domain.

**This domain has no permission module of its own.** Its screens are grouped by their registry `domain` instead — the registry files them that way because they are pre-authorization, unauthenticated, or reference material rather than a gated business surface.

## Actors

_No permission module gates this domain, so no grants apply. Access is controlled at the route level or the surface is unauthenticated._

The grant says *which module*. The data scope says *which rows*, and it is enforced by row-level security rather than by the grant.

## Entities

_No entity is owned exclusively by this domain._



## API surface

_No API endpoints. This domain is presentation-only._

## Business rules

_No rule guard in `packages/contract/src/rules` is specific to this domain. Any constraint is in the route handlers, or absent._

## Lifecycles

_No lifecycle in the contract belongs to this domain._

## Screens

| Screen | Route | Surface | Data-backed | Loading | Error | Empty | Arabic | e2e |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D-UI.ActivityFeed | `/ui/activity-feed` | reference | **mock** | yes | — | yes | PARTIAL | yes |
| D-UI.AdvancedFilters | `/ui/advanced-filters` | reference | **mock** | yes | — | yes | PARTIAL | yes |
| D-UI.Attachments | `/ui/attachments` | reference | **mock** | yes | — | yes | PARTIAL | yes |
| D-UI.CalendarView | `/ui/calendar-view` | reference | **mock** | yes | — | yes | PARTIAL | yes |
| D-UI.CardView | `/ui/card-view` | reference | **mock** | yes | — | yes | PARTIAL | yes |
| D-UI.Charts | `/ui/charts` | reference | **mock** | yes | — | yes | PARTIAL | yes |
| D-UI.Comments | `/ui/comments` | reference | **mock** | yes | — | yes | PARTIAL | yes |
| D-UI.ExportCenter | `/ui/export-center` | reference | **mock** | yes | — | yes | PARTIAL | yes |
| D-UI.ImportCenter | `/ui/import-center` | reference | **mock** | yes | — | yes | PARTIAL | yes |
| D-UI.KanbanView | `/ui/kanban-view` | reference | **mock** | yes | — | yes | PARTIAL | yes |
| D-UI.ListView | `/ui/list-view` | reference | **mock** | yes | — | yes | PARTIAL | yes |
| D-UI.MapView | `/ui/map-view` | reference | **mock** | yes | — | yes | PARTIAL | yes |
| D-UI.MediaGallery | `/ui/media-gallery` | reference | **mock** | yes | — | yes | PARTIAL | yes |
| D-UI.Messages | `/ui/messages` | reference | **mock** | yes | — | yes | PARTIAL | yes |
| D-UI.Modals.Actions | `/ui/modals/actions` | reference | **mock** | yes | — | yes | PARTIAL | yes |
| D-UI.Modals.Capture | `/ui/modals/capture` | reference | **mock** | yes | — | yes | PARTIAL | yes |
| D-UI.Modals.CRUD | `/ui/modals/crud` | reference | **mock** | yes | — | yes | PARTIAL | yes |
| D-UI.Modals.Data | `/ui/modals/data` | reference | **mock** | yes | — | yes | PARTIAL | yes |
| D-UI.Modals.Lifecycle | `/ui/modals/lifecycle` | reference | **mock** | yes | — | yes | PARTIAL | yes |
| D-UI.Modals.Status | `/ui/modals/status` | reference | **mock** | yes | — | yes | PARTIAL | yes |
| D-UI.TableView | `/ui/table-view` | reference | **mock** | yes | — | yes | PARTIAL | yes |
| D-UI.TimelineView | `/ui/timeline-view` | reference | **mock** | yes | — | yes | PARTIAL | yes |
| F-001 | `/dashboard-home` | app | yes | yes | yes | yes | PARTIAL | yes |
| F-002 | `/welcome-page` | app | **mock** | — | — | — | PARTIAL | yes |
| F-003 | `/dashboard-main` | app | yes | yes | yes | yes | PARTIAL | yes |
| F-006 | `/customer-loyalty` | app | **mock** | — | — | — | PARTIAL | yes |
| F-007 | `/customer-reviews-ratings` | app | **mock** | — | — | — | PARTIAL | yes |
| F-008 | `/referral-program` | app | **mock** | — | — | — | PARTIAL | yes |
| F-010 | `/loyalty-program` | app | **mock** | — | — | — | PARTIAL | yes |
| F-011 | `/customer-ltv-analysis` | app | **mock** | — | — | — | PARTIAL | yes |
| F-013 | `/appointment-reminders` | app | **mock** | — | — | — | PARTIAL | yes |
| F-014 | `/calendar` | app | yes | yes | yes | — | PARTIAL | yes |
| F-016 | `/ai-scheduling` | app | **mock** | — | — | — | PARTIAL | yes |
| F-017 | `/smart-assignment` | app | **mock** | — | — | — | PARTIAL | yes |
| F-018 | `/routing-optimizer` | app | **mock** | — | — | — | PARTIAL | yes |
| F-020 | `/vehicles-list` | app | yes | yes | yes | yes | verified | yes |
| F-021 | `/vehicle-inspections` | app | **mock** | — | — | — | verified | yes |
| F-022 | `/vehicle-checklist` | app | **mock** | — | — | — | PARTIAL | yes |
| F-023 | `/vehicle-history` | app | **mock** | — | — | — | verified | yes |
| F-024 | `/vehicle-health-monitoring` | app | **mock** | — | — | — | PARTIAL | yes |
| F-025 | `/vehicle-tracking` | app | **mock** | — | — | — | PARTIAL | yes |
| F-026 | `/vehicle-storage` | app | **mock** | — | — | — | PARTIAL | yes |
| F-027 | `/vin-decoder` | app | **mock** | — | — | — | PARTIAL | yes |
| F-029 | `/fleet-tracking` | app | **mock** | — | — | — | verified | yes |
| F-030 | `/tire-management` | app | **mock** | — | — | — | PARTIAL | yes |
| F-031 | `/loaner-vehicles` | app | **mock** | — | — | yes | verified | yes |
| F-032 | `/towing-assistance` | app | **mock** | — | — | — | verified | yes |
| F-033 | `/towing-services` | app | **mock** | — | — | yes | verified | yes |
| F-034 | `/telematics-integration` | app | **mock** | — | — | — | PARTIAL | yes |
| F-035 | `/digital-vehicle-walkaround` | app | **mock** | — | — | — | PARTIAL | yes |
| F-036 | `/license-plate-recognition` | app | **mock** | — | — | — | PARTIAL | yes |
| F-037 | `/diagnostics-obd-hub` | app | **mock** | — | — | — | PARTIAL | yes |
| F-038 | `/predictive-diagnostics` | app | **mock** | — | — | — | PARTIAL | yes |
| F-039 | `/predictive-maintenance` | app | **mock** | — | — | — | PARTIAL | yes |
| F-040 | `/oem-software-subscriptions` | app | **mock** | — | — | — | PARTIAL | yes |
| F-042 | `/service-templates` | app | **mock** | — | — | — | PARTIAL | yes |
| F-043 | `/service-bay-dashboard` | app | **mock** | — | — | — | PARTIAL | yes |
| F-044 | `/live-service-tracking` | app | **mock** | — | — | — | PARTIAL | yes |
| F-045 | `/quality-control` | app | **mock** | — | — | — | PARTIAL | yes |
| F-046 | `/computer-vision-qc` | app | **mock** | — | — | — | PARTIAL | yes |
| F-049 | `/video-estimates` | app | **mock** | — | — | — | PARTIAL | yes |
| F-050 | `/video-consultations` | app | **mock** | — | — | — | PARTIAL | yes |
| F-052 | `/stripe-payment-processing` | app | **mock** | — | — | — | PARTIAL | yes |
| F-053 | `/refund-management` | app | **mock** | — | — | — | PARTIAL | yes |
| F-054 | `/inventory-management` | app | **mock** | — | — | yes | PARTIAL | yes |
| F-055 | `/parts-availability` | app | **mock** | — | — | — | PARTIAL | yes |
| F-056 | `/parts-auto-reorder` | app | **mock** | — | — | — | PARTIAL | yes |
| F-057 | `/smart-parts-recommender` | app | **mock** | — | — | — | PARTIAL | yes |
| F-058 | `/smart-parts-recommendations` | app | **mock** | — | — | — | PARTIAL | yes |
| F-059 | `/smart-inventory-forecasting` | app | **mock** | — | — | — | PARTIAL | yes |
| F-060 | `/automated-reordering` | app | **mock** | — | — | — | PARTIAL | yes |
| F-061 | `/spare-parts` | app | **mock** | — | — | yes | PARTIAL | yes |
| F-062 | `/barcode-scanner` | app | **mock** | — | — | — | PARTIAL | yes |
| F-063 | `/internal-warehouse` | app | **mock** | — | — | yes | PARTIAL | yes |
| F-065 | `/parts-marketplace` | app | **mock** | — | — | — | PARTIAL | yes |
| F-066 | `/dynamic-pricing` | app | **mock** | — | — | — | PARTIAL | yes |
| F-067 | `/intelligent-price-optimizer` | app | **mock** | — | — | — | PARTIAL | yes |
| F-068 | `/suppliers` | app | **mock** | — | — | yes | PARTIAL | yes |
| F-069 | `/purchase-orders` | app | **mock** | — | — | — | PARTIAL | yes |
| F-070 | `/vendor-supplier-portal` | app | **mock** | — | — | — | PARTIAL | yes |
| F-071 | `/parts-network-dashboard` | app | **mock** | — | — | — | PARTIAL | yes |
| F-073 | `/parts-network-my-requests` | app | **mock** | — | — | — | PARTIAL | yes |
| F-074 | `/parts-network-incoming-requests` | app | **mock** | — | — | — | PARTIAL | yes |
| F-079 | `/purchase-agent-dashboard` | app | **mock** | — | — | — | PARTIAL | yes |
| F-080 | `/purchase-agent-tasks` | app | **mock** | — | — | — | PARTIAL | yes |
| F-081 | `/purchase-agent-quotations` | app | **mock** | — | — | — | PARTIAL | yes |
| F-083 | `/purchase-agent-delivery` | app | **mock** | — | — | — | PARTIAL | yes |
| F-084 | `/purchase-agent-orders` | app | **mock** | — | — | — | PARTIAL | yes |
| F-086 | `/purchase-agent-inventory` | app | **mock** | — | — | — | PARTIAL | yes |
| F-087 | `/purchase-agent-price-compare` | app | **mock** | — | — | — | PARTIAL | yes |
| F-088 | `/purchase-agent-tracking` | app | **mock** | — | — | — | PARTIAL | yes |
| F-089 | `/purchase-agent-reports` | app | **mock** | — | — | — | PARTIAL | yes |
| F-092 | `/technician-portal-time-clock` | app | **mock** | — | — | — | PARTIAL | yes |
| F-093 | `/technician-portal-parts` | app | **mock** | — | — | — | PARTIAL | yes |
| F-094 | `/technician-portal-documentation` | app | **mock** | — | — | — | PARTIAL | yes |
| F-095 | `/technician-portal-profile` | app | **mock** | — | — | — | PARTIAL | yes |
| F-096 | `/technician-portal-attendance` | app | **mock** | — | — | — | PARTIAL | yes |
| F-097 | `/technician-portal-guides` | app | **mock** | — | — | — | PARTIAL | yes |
| F-098 | `/technician-portal-software` | app | **mock** | — | — | — | PARTIAL | yes |
| F-099 | `/technician-management` | app | **mock** | — | — | — | PARTIAL | yes |
| F-100 | `/technician-leaderboards` | app | **mock** | — | — | — | PARTIAL | yes |
| F-101 | `/technician-performance` | app | **mock** | — | — | — | verified | yes |
| F-103 | `/technician-app-home` | app | **mock** | — | — | — | verified | yes |
| F-105 | `/technician-app-clock` | app | **mock** | — | — | — | PARTIAL | yes |
| F-106 | `/technician-app-lookup` | app | **mock** | — | — | — | PARTIAL | yes |
| F-107 | `/technician-app-profile` | app | **mock** | — | — | — | PARTIAL | yes |
| F-108 | `/client-portal-dashboard` | app | **mock** | — | — | — | PARTIAL | yes |
| F-111 | `/client-portal-invoices` | app | yes | yes | yes | yes | verified | yes |
| F-112 | `/client-portal-profile` | app | **mock** | — | — | — | PARTIAL | yes |
| F-113 | `/client-portal-service-history` | app | **mock** | — | — | — | PARTIAL | yes |
| F-114 | `/client-portal-live-tracking` | app | **mock** | — | — | — | PARTIAL | yes |
| F-115 | `/client-portal-reminders` | app | **mock** | — | — | — | PARTIAL | yes |
| F-116 | `/client-portal-review-chat` | app | **mock** | — | — | — | PARTIAL | yes |
| F-118 | `/customer-app-booking` | app | **mock** | — | — | — | PARTIAL | yes |
| F-119 | `/customer-app-vehicles` | app | yes | yes | yes | yes | PARTIAL | yes |
| F-120 | `/customer-app-payments` | app | yes | yes | yes | yes | verified | yes |
| F-122 | `/portal-dashboard` | app | **mock** | — | — | — | PARTIAL | yes |
| F-123 | `/portal-appointments` | app | yes | yes | yes | yes | PARTIAL | yes |
| F-124 | `/portal-invoices` | app | yes | yes | yes | yes | verified | yes |
| F-125 | `/portal-vehicles` | app | yes | yes | yes | yes | PARTIAL | yes |
| F-126 | `/portal-communications` | app | **mock** | — | — | — | PARTIAL | yes |
| F-129 | `/business-intelligence` | app | **mock** | — | — | — | PARTIAL | yes |
| F-130 | `/business-intelligence-dashboard` | app | **mock** | — | — | — | PARTIAL | yes |
| F-131 | `/business-heatmaps` | app | **mock** | — | — | — | PARTIAL | yes |
| F-132 | `/profit-analysis` | app | **mock** | — | — | — | PARTIAL | yes |
| F-133 | `/kpi-dashboard` | app | **mock** | — | — | — | PARTIAL | yes |
| F-134 | `/productivity-tracker` | app | **mock** | — | — | — | PARTIAL | yes |
| F-137 | `/staff-scheduling` | app | **mock** | — | — | — | PARTIAL | yes |
| F-138 | `/staff-performance-review` | app | **mock** | — | — | — | PARTIAL | yes |
| F-143 | `/training-lms` | app | **mock** | — | — | — | PARTIAL | yes |
| F-144 | `/wearable-integration` | app | **mock** | — | — | — | PARTIAL | yes |
| F-146 | `/general-ledger` | app | **mock** | yes | yes | yes | PARTIAL | yes |
| F-148 | `/trial-balance` | app | **mock** | yes | yes | yes | PARTIAL | yes |
| F-149 | `/balance-sheet` | app | **mock** | yes | yes | — | PARTIAL | yes |
| F-150 | `/income-statement` | app | **mock** | yes | yes | — | PARTIAL | yes |
| F-151 | `/cash-flow-statement` | app | **mock** | — | — | — | PARTIAL | yes |
| F-152 | `/accounts-receivable` | app | **mock** | — | — | yes | PARTIAL | yes |
| F-153 | `/accounts-payable` | app | **mock** | — | — | yes | PARTIAL | yes |
| F-154 | `/bank-account-management` | app | **mock** | — | — | yes | verified | yes |
| F-155 | `/budget-management` | app | **mock** | — | — | yes | verified | yes |
| F-156 | `/capital-management` | app | **mock** | — | — | yes | verified | yes |
| F-157 | `/assets-management` | app | **mock** | — | — | yes | PARTIAL | yes |
| F-158 | `/liabilities-management` | app | **mock** | — | — | yes | PARTIAL | yes |
| F-159 | `/equity-management` | app | **mock** | — | — | yes | PARTIAL | yes |
| F-160 | `/retained-earnings` | app | **mock** | — | — | yes | verified | yes |
| F-161 | `/cost-centers` | app | **mock** | — | — | yes | PARTIAL | yes |
| F-162 | `/loss-account` | app | **mock** | — | — | yes | PARTIAL | yes |
| F-163 | `/partners-current-account` | app | **mock** | — | — | yes | PARTIAL | yes |
| F-164 | `/expense-tracking` | app | **mock** | — | — | yes | PARTIAL | yes |
| F-165 | `/expenses-management` | app | yes | yes | yes | yes | PARTIAL | yes |
| F-166 | `/sales-management` | app | **mock** | — | — | yes | PARTIAL | yes |
| F-167 | `/accounting-integration` | app | **mock** | — | — | — | PARTIAL | yes |
| F-168 | `/financial-settings` | app | **mock** | — | — | — | PARTIAL | yes |
| F-169 | `/warranty-management` | app | **mock** | — | — | yes | PARTIAL | yes |
| F-170 | `/contract-management` | app | **mock** | — | — | yes | PARTIAL | yes |
| F-172 | `/marketing-hub` | app | **mock** | — | — | — | PARTIAL | yes |
| F-173 | `/marketing-automation` | app | **mock** | — | — | — | PARTIAL | yes |
| F-175 | `/social-media-integration` | app | **mock** | — | — | — | verified | yes |
| F-176 | `/social-media-monitoring` | app | **mock** | — | — | — | PARTIAL | yes |
| F-177 | `/google-my-business` | app | **mock** | — | — | — | verified | yes |
| F-179 | `/chat` | app | **mock** | — | — | — | PARTIAL | yes |
| F-180 | `/support-chat-dashboard` | app | **mock** | — | — | — | PARTIAL | yes |
| F-181 | `/notifications` | app | **mock** | — | — | — | PARTIAL | yes |
| F-182 | `/compliance-management` | app | **mock** | — | — | — | PARTIAL | yes |
| F-183 | `/zatca-settings` | app | **mock** | — | — | — | PARTIAL | yes |
| F-184 | `/vat-settings` | app | **mock** | — | — | — | verified | yes |
| F-185 | `/zakat-settings` | app | **mock** | — | — | — | PARTIAL | yes |
| F-186 | `/safety-incidents` | app | **mock** | — | — | — | PARTIAL | yes |
| F-187 | `/environmental-compliance` | app | **mock** | — | — | — | PARTIAL | yes |
| F-188 | `/iso-quality-management` | app | **mock** | — | — | — | PARTIAL | yes |
| F-189 | `/equipment-calibration` | app | **mock** | — | — | — | PARTIAL | yes |
| F-190 | `/franchise-management` | app | **mock** | — | — | yes | PARTIAL | yes |
| F-191 | `/globalization-layer` | app | **mock** | — | — | — | PARTIAL | yes |
| F-192 | `/multi-location-dashboard` | app | **mock** | — | — | — | PARTIAL | yes |
| F-202 | `/emerging-technologies` | app | **mock** | — | — | — | PARTIAL | yes |
| F-203 | `/next-gen-technologies` | app | **mock** | — | — | — | PARTIAL | yes |
| F-204 | `/io-t-dashboard` | app | **mock** | — | — | — | PARTIAL | yes |
| F-205 | `/edge-computing` | app | **mock** | — | — | — | PARTIAL | yes |
| F-206 | `/digital-twin-viewer` | app | **mock** | — | — | — | PARTIAL | yes |
| F-207 | `/drone-inspection` | app | **mock** | — | — | — | PARTIAL | yes |
| F-208 | `/ar-repair-guide` | app | **mock** | — | — | — | PARTIAL | yes |
| F-209 | `/ar-overlay` | app | **mock** | — | — | — | PARTIAL | yes |
| F-210 | `/vr-showroom` | app | **mock** | — | — | — | PARTIAL | yes |
| F-211 | `/blockchain-service-history` | app | **mock** | — | — | — | PARTIAL | yes |
| F-212 | `/smart-contracts` | app | **mock** | — | — | — | PARTIAL | yes |
| F-213 | `/quantum-computing` | app | **mock** | — | — | — | PARTIAL | yes |
| F-214 | `/sustainable-energy-monitoring` | app | **mock** | — | — | — | PARTIAL | yes |
| F-215 | `/digital-signage` | app | **mock** | — | — | — | PARTIAL | yes |
| F-217 | `/security-cameras` | app | **mock** | — | — | — | PARTIAL | yes |
| F-218 | `/mobile-device-management` | app | **mock** | — | — | — | PARTIAL | yes |
| F-219 | `/document-management` | app | **mock** | — | — | yes | PARTIAL | yes |
| F-220 | `/document-ocr` | app | **mock** | — | — | — | PARTIAL | yes |
| F-221 | `/data-import-export` | app | **mock** | — | — | — | PARTIAL | yes |
| F-222 | `/data-backup` | app | **mock** | — | — | — | PARTIAL | yes |
| F-224 | `/user-profile` | app | **mock** | — | — | — | PARTIAL | yes |
| F-225 | `/system-settings` | app | **mock** | — | — | — | PARTIAL | yes |
| F-226 | `/user-settings` | app | **mock** | — | — | — | PARTIAL | yes |
| F-228 | `/security-settings` | app | **mock** | — | — | — | PARTIAL | yes |
| F-229 | `/role-management` | app | **mock** | — | — | — | PARTIAL | yes |
| F-230 | `/tasks` | app | **mock** | — | — | yes | PARTIAL | yes |
| F-231 | `/task-management` | app | **mock** | — | — | — | PARTIAL | yes |
| F-232 | `/tools` | app | **mock** | — | — | — | PARTIAL | yes |
| F-233 | `/dashboard-widgets` | app | **mock** | — | — | — | PARTIAL | yes |
| F-234 | `/sms-integration` | app | **mock** | — | — | — | PARTIAL | yes |
| F-235 | `/sales-guide` | app | **mock** | — | — | — | PARTIAL | yes |

## Known gaps in this domain

- **194 of 205 screens read design fixtures rather than the API.** They render and are asserted; they have not exchanged data with the server.
- **168 screens declare neither a loading nor an error state.** Acceptable for a static reference screen; a defect for one that fetches.

## Evidence

| Fact | Source |
| --- | --- |
| Entities and columns | `server/src/db/schema.ts` |
| Endpoints and guards | — |
| Permissions | `packages/contract/src/rbac.ts` |
| Rules | — |
| Screens | `project-control/MASTER_REGISTRY.json` |
