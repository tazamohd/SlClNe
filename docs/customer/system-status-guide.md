# SALIS AUTO -- System Status Guide

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-CST-002                   |
| Version        | 1.0                          |
| Date           | 2026-09-02                   |
| Author         | SALIS AUTO PMO               |
| Status         | Approved                     |
| Classification | Public                       |

---

## 1. Overview

SALIS AUTO provides a public system status page so you can check the health of the platform at any time. Whether you want to verify that all services are running normally, check on a reported issue, or review upcoming maintenance, the status page is your first stop.

**Status Page URL:** [status.salisauto.sa](https://status.salisauto.sa)

The status page is available 24/7 and does not require a login. You can access it even if the main application is experiencing issues.

---

## 2. Service Components Monitored

The status page tracks the health of each major component of the SALIS AUTO platform:

| Component              | What It Covers                                                    |
|------------------------|-------------------------------------------------------------------|
| **Web Application**    | The main SALIS AUTO interface you use in your browser             |
| **API Services**       | The backend services that power all platform operations           |
| **Database**           | Data storage and retrieval for all your records                   |
| **ZATCA Integration**  | Connection to the ZATCA e-invoicing system for invoice submission |
| **Payment Processing** | Credit card, Mada, and bank transfer payment handling             |
| **SMS Service**        | OTP codes, appointment reminders, and notification messages       |
| **Email Service**      | Account notifications, invoice delivery, and report distribution  |
| **Customer App**       | The customer-facing mobile portal                                 |
| **File Storage**       | Document uploads, photos, and attachment storage                  |
| **Search**             | Global search across customers, vehicles, and parts               |

Each component is monitored independently, so you can see exactly which part of the system is affected during any issue.

---

## 3. Understanding Status Indicators

Each component on the status page displays one of four status levels:

### Operational

| Indicator | Meaning                                                             |
|-----------|---------------------------------------------------------------------|
| Color     | Green                                                               |
| Label     | Operational                                                         |
| What it means | The component is functioning normally with expected performance |

No action is needed when all components show Operational.

### Degraded Performance

| Indicator | Meaning                                                             |
|-----------|---------------------------------------------------------------------|
| Color     | Yellow                                                              |
| Label     | Degraded Performance                                                |
| What it means | The component is working but slower than usual                  |

You may experience slower page loads or delayed notifications. Core functionality remains available. Our team is actively investigating.

### Partial Outage

| Indicator | Meaning                                                             |
|-----------|---------------------------------------------------------------------|
| Color     | Orange                                                              |
| Label     | Partial Outage                                                      |
| What it means | Some features of this component are unavailable                 |

Certain operations may fail or be temporarily unavailable. For example, a partial outage on ZATCA Integration means invoices are being queued and will be submitted automatically once the connection is restored.

### Major Outage

| Indicator | Meaning                                                             |
|-----------|---------------------------------------------------------------------|
| Color     | Red                                                                 |
| Label     | Major Outage                                                        |
| What it means | The component is currently unavailable                          |

Our engineering team is working to restore service as quickly as possible. During a major outage, check the status page for updates and estimated resolution times.

---

## 4. Planned Maintenance

### Maintenance Schedule

SALIS AUTO performs regular maintenance to keep the platform secure and up to date. Planned maintenance follows a predictable schedule:

| Maintenance Type    | Typical Schedule                | Duration        |
|---------------------|----------------------------------|-----------------|
| Routine updates     | Tuesday nights, 11:00 PM - 1:00 AM (AST) | Up to 2 hours |
| Security patches    | As needed, during low-traffic hours | 15-30 minutes  |
| Major upgrades      | Scheduled with 7+ days notice    | Up to 4 hours   |
| Database maintenance| Monthly, last Saturday night     | Up to 1 hour    |

All times are in Arabia Standard Time (AST, UTC+3).

### How We Notify You

You will always receive advance notice before planned maintenance:

| Notice Period        | Maintenance Type                     | Notification Channel          |
|----------------------|--------------------------------------|-------------------------------|
| 7+ days in advance   | Major upgrades, extended downtime   | Email, in-app banner, status page |
| 3 days in advance    | Routine updates                     | Email, status page            |
| 24 hours in advance  | Emergency security patches          | Email, status page            |

During planned maintenance, the status page will display a "Scheduled Maintenance" banner with the expected start time, end time, and affected components.

### What Happens During Maintenance

- The platform may be briefly unavailable or in read-only mode
- Any work in progress is automatically saved
- ZATCA invoice submissions are queued and processed automatically once maintenance is complete
- You will not lose any data during maintenance

---

## 5. Subscribing to Status Updates

Stay informed about platform health without having to check the status page manually.

### Email Notifications

1. Visit [status.salisauto.sa](https://status.salisauto.sa)
2. Click the **Subscribe to Updates** button
3. Enter your email address
4. Choose what to receive:
   - **All updates**: Every status change and maintenance notice
   - **Major incidents only**: Only major outages and scheduled maintenance
5. Click **Subscribe**

You will receive a confirmation email. Click the link to activate your subscription.

### SMS Notifications

1. Visit [status.salisauto.sa](https://status.salisauto.sa)
2. Click the **Subscribe to Updates** button
3. Select the **SMS** tab
4. Enter your mobile number (Saudi format: 05XXXXXXXX)
5. Choose your notification level
6. Click **Subscribe**

SMS notifications are sent for major incidents and scheduled maintenance only, to avoid excessive messages.

### Managing Your Subscription

To change your preferences or unsubscribe:
- Click the **Manage Subscription** link at the bottom of any status notification email
- Or visit [status.salisauto.sa/manage](https://status.salisauto.sa/manage)

---

## 6. Incident Communication

When an issue occurs, our team follows a structured communication process:

### Communication Timeline

| Time After Detection | Action                                                    |
|----------------------|-----------------------------------------------------------|
| 0 - 15 minutes      | Issue detected and confirmed; status page updated         |
| 15 - 30 minutes     | Initial incident report posted with known impact          |
| Every 30 minutes     | Progress updates posted to status page                    |
| Upon resolution      | Resolution notice posted; root cause summary provided     |
| Within 48 hours      | Post-incident report published for major incidents        |

### What Each Update Includes

- **What is happening**: A plain-language description of the issue
- **What is affected**: Which components and features are impacted
- **What we are doing**: Current actions being taken to resolve the issue
- **Estimated resolution**: When we expect the issue to be fixed (updated as we learn more)
- **Workarounds**: Any temporary steps you can take while the issue is being resolved

### Incident History

The status page maintains a 90-day history of all incidents. You can review past incidents to understand:
- What happened and why
- How long the issue lasted
- What steps were taken to prevent recurrence

---

## 7. Uptime and Service Level Agreement (SLA)

### Uptime Target

SALIS AUTO targets **99.9% uptime** for the web application and API services, measured monthly. This translates to less than 44 minutes of unplanned downtime per month.

| Plan          | Uptime SLA      | Monthly Downtime Budget |
|---------------|-----------------|-------------------------|
| Starter       | 99.5%           | ~3.6 hours              |
| Professional  | 99.9%           | ~44 minutes             |
| Enterprise    | 99.95%          | ~22 minutes             |

### What Counts as Downtime

- Unplanned outages affecting the web application or API
- Degraded performance where page loads exceed 10 seconds

### What Does Not Count as Downtime

- Scheduled maintenance windows communicated in advance
- Issues caused by your local internet connection or browser
- Third-party service outages (ZATCA portal, payment gateway) outside our control
- Feature-specific issues that do not affect core platform access

### SLA Credits (Enterprise Plan)

Enterprise customers with an SLA credit agreement receive service credits if uptime falls below the guaranteed threshold:

| Monthly Uptime    | Credit (% of Monthly Fee) |
|-------------------|---------------------------|
| 99.0% - 99.95%   | 10%                       |
| 95.0% - 99.0%    | 25%                       |
| Below 95.0%       | 50%                       |

To request an SLA credit, contact your dedicated account manager with the affected dates.

### Historical Uptime

You can view historical uptime data on the status page. The dashboard shows:
- Current month uptime percentage
- 90-day uptime trend chart
- Individual component uptime percentages

---

## 8. Emergency Contact

If you are experiencing a critical issue that is not reflected on the status page, or if you need urgent assistance:

| Priority         | Contact Method                        | When to Use                                |
|------------------|---------------------------------------|--------------------------------------------|
| Critical         | Emergency hotline: +966 11 XXX XXXX   | Platform completely inaccessible           |
| Critical         | Email: urgent@salisauto.sa            | ZATCA submission failures, data concerns   |
| High             | Phone support: +966 11 XXX XXXX       | Significant feature not working            |
| Normal           | Email: support@salisauto.sa           | General questions and non-urgent issues    |
| Self-service     | In-app AI Assistant                    | How-to questions and guidance              |

### Before Contacting Support

To help us resolve your issue quickly, please gather the following:

1. **Your organization name** and the email address you use to log in
2. **What you were doing** when the issue occurred
3. **What you expected to happen** versus what actually happened
4. **Screenshots** of any error messages (if available)
5. **Your browser** name and version (e.g., Chrome 115, Safari 17)

---

## 9. Frequently Asked Questions

**Q: How do I know if an issue is on my end or on the SALIS AUTO side?**
A: Check the status page first. If all components show Operational, the issue may be related to your internet connection, browser, or local network. Try refreshing the page, clearing your browser cache, or using a different browser.

**Q: Will I lose my work if the system goes down unexpectedly?**
A: SALIS AUTO automatically saves your data as you work. In the rare event of an unplanned outage, any completed actions (saved forms, submitted invoices, etc.) are preserved. Work in progress on an unsaved form may need to be re-entered.

**Q: What happens to my ZATCA invoices during an outage?**
A: Invoices generated during a ZATCA integration outage are automatically queued. Once the connection is restored, they are submitted to ZATCA in order. You do not need to resubmit them manually.

**Q: Can I access my data during scheduled maintenance?**
A: During most maintenance windows, the platform is in read-only mode, meaning you can view your data but not make changes. During major upgrades, the platform may be fully unavailable for a short period.

---

## 10. Related Resources

- [Release Notes](release-notes.md) -- What is new in the latest version
- [Account Management Guide](account-management-guide.md) -- Managing your subscription and settings
- [Data Portability Guide](data-portability-guide.md) -- Exporting and managing your data
- [Getting Started Guide](../user-documentation/guides/getting-started.md) -- First-time setup and navigation

---

*SALIS AUTO is committed to transparency about platform health and performance. If you have feedback about our status communications, please email feedback@salisauto.sa.*
