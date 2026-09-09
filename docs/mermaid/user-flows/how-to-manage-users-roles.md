# How To: Manage Users & Roles

Diagrams for the user account lifecycle (create, edit, deactivate) and the two password-reset paths — admin-initiated and self-service.

Source: [`docs/knowledge-base/how-to/manage-users-roles.md`](../../knowledge-base/how-to/manage-users-roles.md)

---

## User Lifecycle: Create, Edit, Deactivate

```mermaid
flowchart TD
    A["Admin/Owner navigates to Admin &gt; Users &amp; Teams"] --> B["Click Add User"]
    B --> C["Enter name, email, password, role, branch, status"]
    C --> D{"Role is branch-scoped?"}
    D -->|"Yes"| E["Branch selection required"]
    D -->|"No — org/platform-scoped"| F["Branch optional"]
    E --> G["Save — unique (org_id, email) enforced"]
    F --> G
    G --> H(["User created, credentials emailed"])

    I2["Open existing user"] --> J2["Change name / role / branch / status"]
    J2 --> K2["Save"]
    K2 --> L2{"Role or branch changed?"}
    L2 -->|"Yes"| M2(["New permissions apply on next<br/>token refresh (&lt;=15 min) or re-login"])
    L2 -->|"No"| N2(["Change effective immediately"])

    O3["Decision: deactivate a user"] --> P3["Set status = inactive, Save"]
    P3 --> Q3{"Need immediate access revocation?"}
    Q3 -->|"Yes"| R3(["POST /auth/logout, or delete<br/>rows from user_sessions"])
    Q3 -->|"No"| S3(["Refresh tokens remain valid<br/>until they expire (up to 14 days)"])
```

---

## Password Reset: Admin-Initiated vs. Self-Service

```mermaid
sequenceDiagram
    actor Admin
    actor User
    participant Sys as System

    alt Admin-initiated reset
        Admin->>Sys: Open user profile, Reset Password
        Sys->>Sys: Set new password (bcrypt hash)
        Admin->>User: Communicate new password via secure channel
    else User-initiated reset
        User->>Sys: Go to /forgot-password, enter email
        Sys->>User: Send OTP (email or phone)
        User->>Sys: Enter OTP at /otp (6-digit CodeInput)
        Sys-->>User: OTP verified
        User->>Sys: Set new password at /reset-password
    end
```
