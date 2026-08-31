# SALIS AUTO -- Security Best Practices

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-KB-LIB-011                              |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Introduction

This document provides security best practices for all SALIS AUTO users, from workshop floor technicians to organization owners. Security is a shared responsibility -- the platform provides robust technical controls, but human behavior remains the most critical factor in maintaining data security and system integrity.

SALIS AUTO handles sensitive data categories including customer Personally Identifiable Information (PII), financial records, vehicle information, and business operational data. All users must understand their role in protecting this information. For the technical security architecture, see [Security Architecture](../../system/security/security-architecture.md). For data protection policies, see [Data Protection](../../system/security/data-protection.md).

---

## 2. Password Policies

### 2.1 Password Requirements

| Requirement               | Minimum Standard                                        |
|---------------------------|---------------------------------------------------------|
| Length                    | 12 characters minimum                                   |
| Uppercase Letters         | At least 1                                               |
| Lowercase Letters         | At least 1                                               |
| Numbers                  | At least 1                                               |
| Special Characters        | At least 1 (!@#$%^&*()_+-=[]{}|;:',.<>?/)              |
| Password History          | Cannot reuse last 12 passwords                           |
| Maximum Age               | 90 days (forced rotation)                                |
| Minimum Age               | 1 day (prevents rapid cycling)                           |
| Account Lockout           | 5 failed attempts locks account for 30 minutes           |

### 2.2 Password Creation Guidelines

**Do:**
- Use a passphrase approach (e.g., "Workshop-Bay7-Runs-Smooth!")
- Use a different password for SALIS AUTO than for other systems
- Use a password manager if managing multiple systems
- Change password immediately if you suspect it has been compromised

**Do Not:**
- Use personal information (birthdate, name, phone number)
- Use workshop name, branch name, or company name
- Use sequential patterns (123456, abcdef) or keyboard walks (qwerty)
- Share passwords with colleagues, even temporarily
- Write passwords on sticky notes or store them in unencrypted files
- Use the same password across multiple platforms

### 2.3 Multi-Factor Authentication (MFA)

MFA is enforced for the following roles:

| Role                    | MFA Required | MFA Methods Supported                    |
|-------------------------|:------------:|------------------------------------------|
| Organization Owner      | Yes          | Authenticator app, SMS                   |
| Branch Manager          | Yes          | Authenticator app, SMS                   |
| Finance/Accountant      | Yes          | Authenticator app, SMS                   |
| Service Advisor         | Configurable | Authenticator app, SMS                   |
| Technician              | Configurable | Authenticator app, SMS, PIN              |
| Parts Specialist        | Configurable | Authenticator app, SMS                   |
| Cashier                 | Yes          | Authenticator app, SMS                   |

---

## 3. Session Management

### 3.1 Auto-Logout Configuration

| Setting                    | Default Value  | Recommended Value | Configurable By      |
|----------------------------|----------------|-------------------|----------------------|
| Web Session Timeout        | 30 minutes     | 15-30 minutes     | Organization Owner   |
| Mobile App Timeout         | 15 minutes     | 10-15 minutes     | Organization Owner   |
| POS/Cashier Terminal       | 5 minutes      | 5 minutes         | Branch Manager       |
| Management Dashboard       | 30 minutes     | 30 minutes        | Organization Owner   |
| Background Session Limit   | 8 hours        | 8 hours           | System Default       |

### 3.2 Session Security Rules

1. **Single Session per User:** Each user account can have only one active web session. Logging in from a new device terminates the previous session.
2. **Session Binding:** Sessions are bound to the originating IP address range. A session accessed from a significantly different IP triggers re-authentication.
3. **Sensitive Operations:** Certain operations (password change, role modification, financial exports) require re-authentication regardless of session status.
4. **Visible Session Info:** Users can view their active sessions and last login time from their profile page.

### 3.3 Concurrent Access Controls

| Scenario                         | System Behavior                                       |
|----------------------------------|-------------------------------------------------------|
| Same user, second browser tab    | Shared session, allowed                               |
| Same user, different device      | New session, previous session terminated              |
| Same user, mobile + web          | Both allowed (different session types)                |
| Shared account detected          | Flagged in audit log, alert to manager                |

---

## 4. Shared Device Procedures

### 4.1 Workshop Floor Devices

Many workshops use shared tablets or terminals on the workshop floor. The following procedures must be followed:

| Procedure                       | Description                                            |
|---------------------------------|--------------------------------------------------------|
| Individual Login                | Each user must log in with their own credentials       |
| Log Out After Use               | Always log out before handing the device to another user |
| Browser Profiles                | Use separate browser profiles if multiple users share a device frequently |
| No Saved Passwords              | Never save passwords in the browser on shared devices  |
| PIN Lock                        | Enable device PIN lock (minimum 6 digits) for physical security |
| Screen Lock                     | Configure 2-minute auto screen lock                    |
| Clear Browser Data              | Weekly clearing of browser cache, cookies, and saved form data |

### 4.2 Reception / Front Desk Devices

| Security Measure                | Implementation                                         |
|---------------------------------|--------------------------------------------------------|
| Privacy Screen Filter           | Physical privacy filter on monitors visible to customers |
| Auto-Lock on Inactivity         | 3-minute screen lock when unattended                   |
| Customer-Facing Display         | Use dual-monitor setup; customer sees only approved content |
| Quick User Switch               | Enable fast user switching (Windows key + L on Windows) |
| USB Port Restriction            | Disable USB storage device access on shared terminals  |

### 4.3 Mobile Device Management

| Device Type   | Policy                                                    |
|---------------|-----------------------------------------------------------|
| Corporate     | MDM enrolled, remote wipe capable, enforced encryption    |
| BYOD          | SALIS AUTO app sandboxed, no data export, app-level PIN  |
| Shared Tablet | Kiosk mode, restricted to SALIS AUTO app and browser     |

---

## 5. Data Classification Awareness

### 5.1 Data Classification Levels

| Level              | Definition                                    | Examples                                         | Handling Rules                    |
|--------------------|-----------------------------------------------|--------------------------------------------------|-----------------------------------|
| Confidential       | Highly sensitive, severe impact if disclosed  | Financial records, payment data, salary info     | Encrypted, role-restricted access |
| Restricted         | Sensitive, moderate impact if disclosed       | Customer PII, vehicle details, service history   | Role-based access, audit logged   |
| Internal           | Business-use only, low impact if disclosed    | Work schedules, inventory counts, SOPs           | Internal access only              |
| Public             | No sensitivity                                | Workshop address, published service catalog      | No restrictions                   |

### 5.2 Data Types and Their Classification

| Data Type                    | Classification | Special Handling Requirements                   |
|------------------------------|----------------|-------------------------------------------------|
| Customer Name and Contact    | Restricted     | Access logged, masked in reports                |
| National ID / Iqama Number   | Confidential   | Encrypted at rest, never displayed in full      |
| Payment Card Details         | Confidential   | PCI-DSS compliance, tokenized storage           |
| Vehicle Registration (Plate) | Restricted     | Access logged                                   |
| VIN (Vehicle ID Number)      | Restricted     | Access logged                                   |
| Invoice and Financial Data   | Confidential   | Role-restricted, ZATCA compliance               |
| Employee Records             | Confidential   | HR role access only                             |
| Service History              | Restricted     | Customer consent for sharing                    |
| Workshop Operational Data    | Internal       | Management access                               |
| Parts Catalog and Pricing    | Internal       | Standard access controls                        |

### 5.3 Data Handling Do's and Don'ts

**Do:**
- Access only the data you need for your current task
- Verify customer identity before sharing their service history
- Use the platform's built-in communication tools for customer contact
- Report any suspected data breach immediately

**Do Not:**
- Screenshot customer data and share via personal messaging apps
- Export customer lists to personal devices or email accounts
- Discuss customer details in public areas where others can overhear
- Share login credentials to "quickly look something up"
- Store customer data in personal spreadsheets or notes

---

## 6. Recognizing Social Engineering Attacks

### 6.1 Common Attack Vectors in Workshop Context

| Attack Type              | How It Manifests                                        | Response                          |
|--------------------------|---------------------------------------------------------|-----------------------------------|
| Phone Impersonation      | Caller claims to be from "SALIS AUTO support" requesting login credentials | Never share credentials by phone; SALIS AUTO support will never ask for passwords |
| Phishing Email           | Email mimicking SALIS AUTO login page to steal credentials | Verify sender domain; report to IT |
| Customer Data Request    | Someone claiming to be a customer requests full account details by phone | Verify identity using security questions; use in-app communication |
| Vendor Impersonation     | Someone claiming to be a parts vendor requests payment detail changes | Verify through known contact numbers, not numbers in the email |
| USB Drop Attack          | USB drive left in workshop parking lot or reception     | Never plug unknown USB devices into workshop computers |
| Tailgating               | Unauthorized person follows staff into restricted areas  | Challenge unknown individuals, require visitor badges |

### 6.2 Red Flags to Watch For

1. Urgency -- "This must be done immediately or the system will shut down"
2. Authority pressure -- "The owner said to give me access right now"
3. Unusual requests -- "Can you export all customer data to this email?"
4. Requests to bypass procedures -- "Skip the verification, I'm in a hurry"
5. Unfamiliar communication channels -- Support requests via WhatsApp or personal email
6. Requests for credential sharing -- "Let me use your account just this once"

### 6.3 Reporting Suspicious Activity

All suspicious activities should be reported through:

1. **In-App:** Security incident report form (Settings > Security > Report Incident)
2. **Phone:** Branch Manager or Organization IT contact
3. **Email:** Dedicated security reporting email configured per organization
4. **Escalation:** If no response within 1 hour, escalate to Organization Owner

---

## 7. Mobile Device Security

### 7.1 BYOD (Bring Your Own Device) Requirements

| Requirement                    | Standard                                              |
|--------------------------------|-------------------------------------------------------|
| OS Version                     | iOS 16+ or Android 12+ (latest security patches)     |
| Device Encryption              | Full device encryption enabled                        |
| Screen Lock                    | Biometric or 6+ digit PIN                             |
| SALIS AUTO App                 | Latest version from official app store only           |
| App-Level Security             | Biometric lock on SALIS AUTO app enabled              |
| Jailbreak/Root Detection       | App will not run on jailbroken or rooted devices      |
| Lost Device Protocol           | Report within 1 hour; remote session termination      |

### 7.2 Corporate Device Standards

| Standard                       | Requirement                                           |
|--------------------------------|-------------------------------------------------------|
| MDM Enrollment                 | Mandatory for all corporate mobile devices            |
| Remote Wipe                    | Enabled and tested quarterly                          |
| App Whitelist                  | Only approved apps installed                          |
| VPN                            | Required for accessing SALIS AUTO outside workshop    |
| Camera Policy                  | Enabled (needed for QC photos), no personal photo sync |
| Location Services              | Enabled for fleet/mobile service tracking only        |

---

## 8. Incident Reporting Procedures

### 8.1 Security Incident Categories

| Category            | Examples                                                | Response Time    |
|---------------------|---------------------------------------------------------|------------------|
| Critical            | Data breach, unauthorized access to financial data, ransomware | Immediate     |
| High                | Compromised user account, phishing attempt success      | Within 1 hour    |
| Medium              | Suspicious login activity, failed login attempts surge  | Within 4 hours   |
| Low                 | Password policy violation, unattended unlocked device   | Within 24 hours  |

### 8.2 Incident Response Steps

1. **Detect:** Identify the incident (user report, system alert, or audit finding)
2. **Contain:** Immediately limit the impact (lock account, disconnect device, isolate system)
3. **Report:** File incident report through the prescribed channel
4. **Investigate:** IT/Security team determines scope and root cause
5. **Remediate:** Fix the vulnerability, reset credentials, patch systems
6. **Recover:** Restore normal operations, verify system integrity
7. **Review:** Post-incident review, update procedures, conduct additional training if needed

### 8.3 Mandatory Reporting Obligations

Under Saudi Arabia's Personal Data Protection Law (PDPL) and ZATCA regulations, certain incidents require mandatory external reporting:

| Incident Type                  | Reporting Obligation                     | Timeline          |
|--------------------------------|------------------------------------------|--------------------|
| Customer PII breach            | NDMO/SDAIA notification                  | Within 72 hours    |
| Financial data compromise      | ZATCA and SAMA notification              | Within 24 hours    |
| Payment card data breach       | PCI-DSS incident response               | Immediate          |
| System compromise affecting invoicing | ZATCA notification                | Within 24 hours    |

---

## 9. Physical Security Considerations

| Area                    | Security Measure                                        |
|-------------------------|---------------------------------------------------------|
| Server/Network Room     | Locked, access-controlled, monitored                   |
| Reception Area          | Screens not visible to walk-in customers                |
| Workshop Floor          | Tablets secured with anti-theft tethers or cases       |
| Printed Documents       | Shred before disposal, do not leave on desks           |
| Visitor Access          | Sign-in required, escort in restricted areas           |
| CCTV                    | Server room and cash handling areas covered            |

---

## 10. Security Awareness Training Schedule

| Training Type              | Frequency     | Audience              | Duration    |
|----------------------------|---------------|-----------------------|-------------|
| New Hire Security Onboarding | At hire      | All staff             | 2 hours     |
| Quarterly Refresher        | Every 3 months| All staff             | 30 minutes  |
| Phishing Simulation        | Every 6 months| All digital users     | Self-paced  |
| Data Handling Workshop      | Annually      | Managers, Advisors    | 1 hour      |
| Incident Response Drill     | Annually      | IT, Managers, Owners  | 2 hours     |

---

## 11. Document References

- [Security Architecture](../../system/security/security-architecture.md) -- Technical security controls and architecture
- [Data Protection](../../system/security/data-protection.md) -- Data protection policies and encryption standards
- [Getting Started Guide](../../user-documentation/guides/getting-started.md) -- Initial security setup during onboarding
- [Compliance Requirements](../../requirements/non-functional/compliance.md) -- Regulatory security requirements

---

*End of Document -- SA-KB-LIB-011*
