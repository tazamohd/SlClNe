# Owner / CEO Journey

The Owner (or Super Admin) sits at the top of SALIS AUTO's 14-role hierarchy: unlimited approval ceiling, cross-branch visibility, and the only role that can touch tenant-wide configuration (pricing, feature flags, role definitions). Their primary scenario is daily strategic oversight -- scanning organization-wide KPIs, clearing the highest-value approvals, and comparing branch performance -- rather than hands-on workshop operations.

## Primary Scenario: Daily Strategic Oversight

```mermaid
flowchart TD
    Login["Login\nowner@salisauto.sa"] --> Dash["Executive Dashboard\nRevenue | Jobs | Utilization"]
    Dash --> BI["BI Reports\nDrill-down analytics"]
    Dash --> Compare["Branch Comparison\nBy branch / period / service type"]
    Dash --> FinOverview["Financial Overview\nP&L | Cash Flow | AR Aging"]
    Dash --> Inbox["Approval Inbox\nEstimates & POs above manager ceilings"]
    Dash --> Strategic["Strategic Settings\nPricing | Feature Flags | Config"]

    Inbox --> Decision{"Item within\nOwner authority?"}
    Decision -->|"Always yes -- unlimited SAR"| Approve["Approve / Reject"]
    Approve --> AuditLog["Audit Trail updated"]

    Strategic --> Roles["Role Management\nCreate / modify all 14 roles"]
    Strategic --> Branches["Branch Management\nAdd branch, assign manager"]

    BI --> Reports["Executive / Operational / Workshop Reports"]
    Compare --> Reports
    FinOverview --> Reports
```

## Sub-Scenario: Approval Escalation Chain (Owner's Position)

Every estimate or purchase order that exceeds a lower role's ceiling escalates upward until it reaches a role with sufficient authority. The Owner is the final, unlimited backstop -- nothing above them.

```mermaid
flowchart TD
    Est["Estimate / PO amount"] --> AdvisorCk{"Within\nAdvisor SAR 5,000?"}
    AdvisorCk -->|Yes| AdvisorOK["Advisor approves"]
    AdvisorCk -->|No| MgrCk{"Within\nManager SAR 50,000?"}
    MgrCk -->|Yes| MgrOK["Branch Manager approves"]
    MgrCk -->|No| OwnerCk["Escalates to Owner\nNo SAR ceiling on any transaction type"]
    OwnerCk --> OwnerApprove["Owner Approves\n(Unlimited)"]
    OwnerApprove --> Proceed["Job / PO proceeds"]
```

**Owner-exclusive capabilities** (unavailable to any other role, including Super Admin for tenant config): unlimited approvals, cross-branch aggregated view, tenant configuration (feature flags, pricing, branding), full role management across all 14 roles, and full audit-trail/compliance access.
