# Getting Started with SALIS AUTO

Welcome to SALIS AUTO, the automotive workshop management platform built for Saudi Arabia. This guide walks you through your first login, navigating the interface, setting your preferences, and making the most of the system regardless of your role.

---

## First Login

1. Open the SALIS AUTO application in your browser.
2. You will land on the **Login** screen inside the AuthCard.
3. Enter your **Email** and **Password** in the respective fields.
4. Optionally tick **Remember me** to stay signed in across sessions.
5. Click **Sign In**.

After successful authentication you are redirected to the default landing page for your role:

| Role | Landing Page |
|---|---|
| Owner / CEO | Dashboard |
| Super Admin | Super Admin |
| Branch Manager | Dashboard |
| Service Advisor | Dashboard |
| Technician | Technician Portal |
| QC Inspector | Dashboard |
| Storekeeper | Dashboard |
| Accountant | Dashboard |
| HR Manager | Dashboard |
| Receptionist | Dashboard |
| Call Center Agent | Call Center |
| Procurement Agent | Procurement Portal |
| Supplier | Supplier Portal |
| Customer | Customer Portal |

### Demo Accounts

For evaluation or training, demo accounts are available. On the login screen, click any **role card** to prefill the email and password fields, then press **Sign In**. The default demo password for all accounts is `Demo@1234`.

| Role | Demo Email |
|---|---|
| Owner / CEO | owner@salisauto.sa |
| Super Admin | admin@salisauto.com |
| Branch Manager | manager@salisauto.sa |
| Service Advisor | advisor@salisauto.sa |
| Technician | tech@salisauto.sa |
| QC Inspector | qc@salisauto.sa |
| Storekeeper | parts@salisauto.sa |
| Accountant | finance@salisauto.sa |
| HR Manager | hr@salisauto.sa |
| Receptionist | frontdesk@salisauto.sa |
| Call Center Agent | calls@salisauto.sa |
| Procurement Agent | procurement@salisauto.sa |
| Supplier | supplier@aljazira.sa |
| Customer | khalid@example.sa |

---

## Navigating the Interface

### AppShell Layout

The main application uses a two-part layout:

- **Sidebar** (left): Collapsible navigation groups, user card with your name and role badge, language toggle, and sign-out button.
- **Topbar** (top): Search bar ("Search customers, vehicles, parts..."), Quick Actions button (Cmd+K / Ctrl+K), theme toggle (sun/moon icon), notification bell, and AI Chat button.

### Sidebar Navigation

The sidebar shows navigation items grouped by domain (e.g., "Workshop", "Finance", "HR"). Groups are filtered by your role -- you only see the sections you have permission to access. Items you cannot reach are removed entirely rather than greyed out.

- Click a **group header** to collapse or expand that section.
- The **active page** is highlighted with a gradient bar.
- Your **name**, **role badge**, and **subscription tier** (PRO) appear at the top of the sidebar.

### Topbar Features

| Element | Description |
|---|---|
| Search bar | Click or focus to navigate to the Global Search screen. Searches across customers, vehicles, and parts. |
| Quick Actions (Cmd+K) | Opens a command palette for fast navigation. Type a screen name or action to jump directly. |
| Theme toggle | Switches between dark and light mode. Your preference is saved in the browser. |
| Notifications bell | Opens the Notification Center. A small orange dot indicates unread notifications. |
| Chat button | Opens the AI Assistant at `/aiassistant` for help and guidance. |

---

## Setting Your Preferences

### Theme (Dark / Light)

SALIS AUTO defaults to **dark mode**. To switch:

1. Click the **sun/moon icon** in the Topbar (desktop) or the header (mobile).
2. The change applies immediately and is stored under `salis-theme` in your browser.

### Language (English / Arabic)

The platform is fully bilingual with RTL support for Arabic.

1. Use the **language toggle** in the sidebar footer.
2. Switching to Arabic flips the entire interface to right-to-left layout.
3. All labels, navigation items, and form fields render in the selected language.
4. Your choice is stored under `salis-lang` in your browser.

### Notifications

Notification preferences can be managed from **Profile > Notification Preferences**. The system uses toast notifications that appear in the bottom-right corner and auto-dismiss after approximately 3 seconds.

---

## Understanding the Dashboard

The Dashboard is the main landing page for most roles. It provides:

- **Summary statistics** relevant to your role (e.g., active jobs, pending approvals, revenue for managers; assigned tasks for technicians).
- **Quick action cards** for common operations.
- **Recent activity feed** showing the latest changes in your scope.

Different roles see different dashboard widgets. An Owner sees the entire organization's metrics, while a Branch Manager sees branch-level data only.

---

## Mobile Usage

SALIS AUTO is fully responsive with a breakpoint at **860px**.

### What Changes on Mobile

| Desktop | Mobile |
|---|---|
| Sidebar is always visible | Sidebar becomes an overlay drawer (swipe or tap hamburger to open) |
| Topbar with search and actions | MobileHeader replaces Topbar |
| DataTable with columns | MobileCard layout with stacked fields |
| Side-by-side panels | Stacked single-column layout |

### Customer App

The Customer App uses a dedicated phone-frame layout (430px max-width) with a **bottom tab bar** instead of the sidebar:

| Tab | Icon | Destination |
|---|---|---|
| Home | Home | Active service status, wallet, quick actions |
| Garage | Car | Vehicle list and history |
| Bookings | Calendar | Appointment list and new booking |
| Tracking | Radio | Live repair progress |
| Profile | User | Personal info and preferences |

See [Customer App Guide](../portals/customer-app-guide.md) for details.

---

## Common UI Components

Understanding these components will help you work faster:

| Component | Usage |
|---|---|
| **Button** | Primary (filled), Outline (bordered), Ghost (text only), Subtle (minimal). Primary buttons perform the main action. |
| **Card** | Container for grouped information, typically with a CardHeader. |
| **DataTable** | Sortable, searchable tables with pagination. Click column headers to sort. Use the search field above the table to filter rows. |
| **Badge / StatusBadge** | Colored labels showing status (e.g., "Active", "Pending", "Closed"). |
| **Money** | SAR amounts displayed in JetBrains Mono font for clarity. |
| **WorkflowStepper** | Horizontal progress rail showing the six workshop stages: Check-In, Inspection, Estimate, Repair, Quality Check, Delivery. |
| **Timeline** | Vertical event history for a job or record. |
| **Checklist** | Interactive checkbox list used in QC, delivery, and inspection screens. |
| **CodeInput** | Six-digit OTP entry field used during verification flows. |
| **Toast** | Brief notification messages in the bottom-right corner. Green for success, red for errors. |

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Cmd+K / Ctrl+K | Open Quick Actions palette |
| Tab / Shift+Tab | Navigate between form fields |
| Enter | Submit the current form or confirm a dialog |
| Escape | Close the current modal or drawer |

---

## Getting Help

- **AI Assistant**: Click the chat icon in the Topbar or navigate to `/aiassistant`. The AI can answer questions about the platform, guide you through workflows, and help troubleshoot issues.
- **Knowledge Base**: Technicians can access repair guides and procedures through the Technician KB screen.
- **Support Chat**: Available from the sidebar under Support for roles that have access.

---

## What to Read Next

Depending on your role, continue with the appropriate guide:

| Your Role | Guide |
|---|---|
| Owner / CEO, Super Admin | [Owner & Super Admin Guide](owner-superadmin-guide.md) |
| Branch Manager | [Branch Manager Guide](manager-guide.md) |
| Service Advisor, Technician, QC Inspector | [Workshop Staff Guide](workshop-staff-guide.md) |
| Accountant, Storekeeper, Procurement Agent | [Finance Staff Guide](finance-staff-guide.md) |
| Receptionist, Call Center Agent, HR Manager | [Support Staff Guide](support-staff-guide.md) |
| Customer | [Customer App Guide](../portals/customer-app-guide.md) |
| Supplier | [Supplier Portal Guide](../portals/supplier-portal-guide.md) |

For workflow-specific instructions, see:

- [Job Lifecycle](../workflows/job-lifecycle.md)
- [Estimate Approval](../workflows/estimate-approval.md)
- [Diagnostic Report](../workflows/diagnostic-report.md)
- [Invoice & Payment](../workflows/invoice-payment.md)
- [Onboarding Flows](../workflows/onboarding-flows.md)
