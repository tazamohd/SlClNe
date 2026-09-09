# SALIS AUTO -- Cookie Policy

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-LGL-005                   |
| Version        | 1.0                          |
| Date           | 2026-09-02                   |
| Author         | SALIS AUTO PMO               |
| Status         | Approved                     |
| Classification | Internal -- Confidential     |

---

## 1. Introduction

This Cookie Policy explains how SALIS AUTO ("we," "us," or "our") uses cookies and similar technologies on the SALIS AUTO multi-tenant automotive workshop management platform ("Service"), including the web application and the customer mobile application (CustomerAppShell). This policy should be read in conjunction with our [Privacy Policy](./privacy-policy.md).

This policy is provided in both English and Arabic in compliance with the bilingual requirements of the platform. In the event of conflict between versions, the Arabic version shall prevail.

---

## 2. What Are Cookies

2.1. Cookies are small text files placed on a User's device (computer, tablet, or mobile phone) by a website or application. Cookies are widely used to make websites and applications work efficiently, to remember User preferences, and to provide information to site operators.

2.2. Similar technologies include web storage (localStorage and sessionStorage), which are browser-based storage mechanisms that serve purposes similar to cookies but can store larger amounts of data. References to "cookies" in this policy include these similar technologies unless otherwise specified.

2.3. Cookies may be "session cookies" (deleted when the browser is closed) or "persistent cookies" (retained on the device until they expire or are manually deleted).

---

## 3. Cookie Categories

SALIS AUTO uses the following categories of cookies:

### 3.1 Essential Cookies (Strictly Necessary)

These cookies are required for the Service to function and cannot be disabled without impairing core functionality.

| Cookie / Storage      | Purpose                                       | Type        | Duration        |
|-----------------------|-----------------------------------------------|-------------|-----------------|
| Authentication JWT    | Authenticates the User's session              | First-party | Session / token expiry |
| Session identifier    | Maintains the active User session             | First-party | Session duration |
| CSRF token            | Prevents cross-site request forgery attacks   | First-party | Session          |
| Tenant context        | Identifies the active Organization (org_id)   | First-party | Session          |
| Security headers      | Stores idempotency keys and request correlation | First-party | Per request    |

**Legal Basis**: Contractual necessity. These cookies are essential for providing the Service and do not require consent under PDPL.

### 3.2 Functional Cookies

These cookies enable enhanced functionality and personalization.

| Cookie / Storage      | Purpose                                       | Type        | Duration        |
|-----------------------|-----------------------------------------------|-------------|-----------------|
| Language preference   | Stores the User's language selection (EN/AR)  | First-party | Persistent (1 year) |
| Theme preference      | Stores the User's UI theme selection          | First-party | Persistent (1 year) |
| Layout preferences    | Remembers sidebar state, table column widths  | First-party | Persistent (6 months) |
| Last visited module   | Redirects User to last-used module on login   | First-party | Persistent (30 days) |
| Regional settings     | Stores date format, number format preferences | First-party | Persistent (1 year) |

**Legal Basis**: Legitimate interest in providing a personalized User experience. Consent is requested where required.

### 3.3 Analytics Cookies

These cookies help us understand how Users interact with the Service to improve functionality and performance.

| Cookie / Storage      | Purpose                                       | Type        | Duration        |
|-----------------------|-----------------------------------------------|-------------|-----------------|
| Usage metrics         | Tracks feature usage patterns and module access | First-party | Persistent (1 year) |
| Session analytics     | Records session duration and navigation paths | First-party | Session          |
| Error tracking        | Captures client-side errors for debugging     | First-party | Persistent (30 days) |
| Feature adoption      | Measures adoption rates of new features       | First-party | Persistent (6 months) |

**Legal Basis**: Legitimate interest in Service improvement. Consent is requested prior to setting analytics cookies.

### 3.4 Performance Cookies

These cookies are used to optimize Service performance and reduce load times.

| Cookie / Storage      | Purpose                                       | Type        | Duration        |
|-----------------------|-----------------------------------------------|-------------|-----------------|
| Client-side cache     | Caches frequently accessed data (part catalogs, dropdown options) | First-party | Persistent (24 hours) |
| API response cache    | Reduces redundant API calls for static data   | First-party | Persistent (1 hour) |
| Asset versioning      | Ensures correct static asset versions are loaded | First-party | Persistent (per deployment) |
| Prefetch hints        | Stores prefetched module data for navigation  | First-party | Session          |

**Legal Basis**: Legitimate interest in providing a performant Service. Consent is requested where required.

---

## 4. First-Party vs. Third-Party Cookies

### 4.1 First-Party Cookies

All cookies described in Section 3 are first-party cookies set by the SALIS AUTO domain. We use first-party cookies exclusively for platform operation, personalization, analytics, and performance.

### 4.2 Third-Party Cookies

SALIS AUTO minimizes the use of third-party cookies. The following third-party integrations may set cookies:

| Third Party           | Cookie Purpose                               | Category        | Control              |
|-----------------------|----------------------------------------------|-----------------|----------------------|
| Stripe                | Payment processing session and fraud prevention | Essential     | Required for payments |
| SMS provider          | Delivery tracking for OTP messages            | Essential       | Required for OTP     |

4.3. SALIS AUTO does not permit third-party advertising cookies or tracking cookies on the Service. No cookies are used for cross-site tracking or behavioral advertising.

4.4. For information about how third-party processors handle data, refer to our [Privacy Policy](./privacy-policy.md) Section 7 and the [Data Processing Agreement](./data-processing-agreement.md) Section 4.

---

## 5. Cookie Purposes and Duration Summary

| Category      | Number of Cookies | Consent Required | Default State    |
|---------------|-------------------|------------------|------------------|
| Essential     | 5                 | No               | Always active    |
| Functional    | 5                 | Yes              | Enabled          |
| Analytics     | 4                 | Yes              | Disabled         |
| Performance   | 4                 | Yes              | Disabled         |

**Duration Categories**:
- **Session**: Deleted when the browser is closed or the User logs out.
- **Persistent (short)**: Retained for 1 to 24 hours.
- **Persistent (medium)**: Retained for 30 days to 6 months.
- **Persistent (long)**: Retained for up to 1 year.

---

## 6. Consent Mechanism

6.1. Upon first access to the Service, Users are presented with a cookie consent banner in their selected language (English or Arabic) that:
- Informs the User about the use of cookies;
- Provides a clear description of each cookie category;
- Allows the User to accept or reject non-essential cookie categories individually;
- Provides an "Accept All" and "Reject All" option;
- Links to this Cookie Policy for full details.

6.2. Essential cookies do not require consent, as they are strictly necessary for the provision of the Service under PDPL.

6.3. Consent preferences are stored locally and are respected for the duration specified. Users may change their cookie preferences at any time through the platform's privacy settings.

6.4. Consent records are maintained as part of the platform's audit trail to demonstrate compliance with PDPL consent requirements.

6.5. Where the Organization has signed a [Data Processing Agreement](./data-processing-agreement.md), cookie consent management may be delegated to the Organization's Data Protection Officer.

---

## 7. How to Manage and Disable Cookies

### 7.1 Platform Preferences

Users may manage cookie preferences through the Service's privacy settings, accessible from the User profile menu. The settings allow Users to:
- View all active cookie categories;
- Enable or disable non-essential categories (Functional, Analytics, Performance);
- Withdraw previously granted consent;
- Export a record of current cookie preferences.

### 7.2 Browser Settings

Users may also manage cookies through their web browser settings. Common browser cookie management:

| Browser            | Cookie Settings Location                            |
|--------------------|-----------------------------------------------------|
| Google Chrome      | Settings > Privacy and Security > Cookies            |
| Mozilla Firefox    | Settings > Privacy and Security > Cookies            |
| Microsoft Edge     | Settings > Privacy, Search, and Services > Cookies   |
| Apple Safari       | Preferences > Privacy > Manage Website Data          |

### 7.3 Mobile Application

The CustomerAppShell mobile application uses local storage rather than traditional cookies. Users may manage data storage through:
- The application's Settings > Privacy menu;
- The device's application storage management settings.

---

## 8. Impact of Disabling Cookies

Disabling cookies may affect the functionality of the Service as follows:

| Cookie Category   | Impact if Disabled                                              |
|-------------------|-----------------------------------------------------------------|
| Essential         | Cannot be disabled. The Service will not function without them. |
| Functional        | Language defaults to browser language; theme resets to default; layout preferences are not remembered. Users must re-select preferences each session. |
| Analytics         | No impact on Service functionality. SALIS AUTO loses visibility into usage patterns, which may affect future improvements. |
| Performance       | Increased page load times; more frequent API calls; reduced responsiveness for data-heavy modules (Parts Catalog, Reports). |

8.1. Disabling all non-essential cookies does not prevent access to any Service module or feature. Core functionality remains fully available with Essential cookies alone.

8.2. Users who disable Functional cookies should note that the bilingual interface (EN/AR) will default to the browser's language setting and may not persist between sessions.

---

## 9. Updates to This Cookie Policy

9.1. SALIS AUTO reserves the right to update this Cookie Policy to reflect changes in technology, legal requirements, or our practices.

9.2. Material changes shall be communicated via in-platform notification at least fifteen (15) days prior to the effective date.

9.3. The "Date" field in the document header indicates the date of the most recent revision.

9.4. Following a material update, Users may be asked to review and update their cookie consent preferences.

---

## 10. Cross-References

| Document                                                       | Relevance                            |
|----------------------------------------------------------------|--------------------------------------|
| [Privacy Policy](./privacy-policy.md)                          | Comprehensive data protection policy |
| [Terms of Service](./terms-of-service.md)                      | Governing contractual terms          |
| [Acceptable Use Policy](./acceptable-use-policy.md)            | Permitted and prohibited activities  |
| [Data Processing Agreement](./data-processing-agreement.md)    | Processor obligations                |
| [EULA](./end-user-license-agreement.md)                        | Mobile application terms             |
| [Data Protection](../system/security/data-protection.md)       | Technical security measures          |

---

## 11. Contact Information

For questions about this Cookie Policy or to exercise your cookie preferences:

| Contact                      | Detail                                |
|------------------------------|---------------------------------------|
| Privacy Inquiries            | privacy@salisauto.com                 |
| Data Protection Officer      | dpo@salisauto.com                     |
| Platform Cookie Settings     | User Profile > Privacy Settings       |

---

## 12. Document Control

| Version | Date       | Author           | Changes                        |
|---------|------------|------------------|--------------------------------|
| 1.0     | 2026-09-02 | SALIS AUTO PMO   | Initial release                |
