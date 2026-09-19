# BLK-004 buckets (from main's MASTER_REGISTRY.json, 2026-09-19)

224 PRODUCT capabilities are flagged mock-only (`dataBacked: false`). Split:

- **Bucket A, 62 screens: reclassify, no code.** Public website and auth/legal pages that render content, not a collection. Add a `contentOnly` (or similar) flag in `build-registry.mjs` so `dataBacked` is not owed, and BLK-004 drops by 62 in one PR.
- **Bucket B, 50 screens: wire to an existing contract entity.** One PR per entity group, merged serially.
- **Bucket C, 112 screens: no entity exists.** Convert to the honest `EmptyState` GAP pattern already used in waves 6 to 9, in one mechanical PR, or decide the feature is out of scope and retire the screen.

## Bucket A: reclassify

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

## Bucket C: no entity, EmptyState or retire

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
