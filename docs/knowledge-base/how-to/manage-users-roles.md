# How To: Manage Users & Roles

Step-by-step guide for creating, editing, and managing user accounts and their roles in SALIS AUTO. User management requires the `admin` RBAC module — only Owner/CEO, Super Admin, and Branch Manager (view-only) have access.

---

## Prerequisites

- You must be logged in with a role that has `admin:c` (Create) or `admin:e` (Edit) permission.
- Only **Owner/CEO** and **Super Admin** have full create/edit/delete access on the `admin` module.
- **Branch Manager** has `admin:v` (View only) — they can see users but not modify them.

---

## Viewing the User List

1. Navigate to **Administration > Users & Teams** in the sidebar, or go directly to `/admin/users`.
2. The user list displays in a `DataTable` with the following columns:
   - Name
   - Email
   - Role (displayed as a badge)
   - Branch
   - Status (active/inactive)
   - Last login
3. Use the search bar to filter by name or email.
4. Use `filter[role]` to show only users of a specific role.
5. On mobile, each user renders as a `MobileCard` with a tappable summary.

---

## Creating a New User

1. Click the **Add User** button (top-right of the user list).
2. Fill in the required fields:

| Field | Required | Description |
|-------|----------|-------------|
| Name | Yes | Full name (up to 200 characters) |
| Name (Arabic) | No | Arabic name for bilingual display (up to 200 characters) |
| Email | Yes | Must be unique within the organization. Up to 254 characters. |
| Password | Yes | Will be hashed with bcrypt before storage. |
| Role | Yes | Select from the 14 available roles (see below). |
| Branch | Conditional | Required for branch-scoped roles. Select from existing branches. |
| Status | Yes | Defaults to `active`. |

3. Click **Save** to create the user.
4. The system generates a ULID as the user's `id`.
5. A unique index on `(org_id, email)` ensures no duplicate emails within an organization.

---

## Understanding the 14 Roles

Each role has a default data scope that determines what data the user can see:

| Role | ID | Scope | Approval Ceiling (SAR) | Description |
|------|----|-------|----------------------|-------------|
| Owner / CEO | `owner` | platform | Unlimited | Full access to all modules and all organizations. |
| Super Admin | `superadmin` | all | Unlimited | Platform-level administration across all branches. |
| Branch Manager | `manager` | branch | 50,000 | Manages a single branch's operations, staff, and finances. |
| Service Advisor | `advisor` | branch | 5,000 | Creates estimates, manages job cards, advises customers. |
| Technician | `technician` | assigned | 0 | Sees only jobs assigned to them. Performs repairs. |
| QC Inspector | `qc` | branch | 0 | Inspects completed repairs. Cannot approve financial items. |
| Storekeeper | `parts` | branch | 10,000 | Manages inventory, issues and receives stock. |
| Accountant | `accountant` | org | 25,000 | Handles invoicing, payments, journal entries, and reporting. |
| HR Manager | `hr` | org | 15,000 | Manages employees, payroll, leave, and timesheets. |
| Receptionist | `frontdesk` | branch | 0 | Creates appointments, checks in customers, issues invoices. |
| Call Center Agent | `callcenter` | branch | 0 | Manages incoming calls, creates appointments and job cards. |
| Procurement Agent | `procurement` | org | 20,000 | Handles purchase requisitions, POs, and supplier relations. |
| Supplier | `supplier` | external | 0 | External vendor. Sees only the supplier portal. |
| Customer | `customer` | self | 0 | End customer. Sees only the customer app (own vehicles and services). |

### Scope Definitions

| Scope | Data Visibility |
|-------|----------------|
| `platform` | All tenants (multi-org). Reserved for Owner. |
| `all` | All branches within the organization. |
| `org` | All branches within the organization (used interchangeably with `all` for non-admin roles). |
| `branch` | Only records belonging to the user's assigned branch. |
| `assigned` | Only records assigned to the user (e.g., Technician sees only their job cards via `assigned_tech_id`). |
| `own` | Only records created by the user (via `created_by`). |
| `external` | External portal access only. No internal data. |
| `self` | Only the user's own profile and associated records. |

---

## Editing a User

1. Navigate to `/admin/users`.
2. Click on the user row to open the user detail.
3. Editable fields:
   - **Name / Name (Arabic)** — Update display names.
   - **Role** — Change the user's role. This immediately changes their permissions and data scope.
   - **Branch** — Reassign the user to a different branch. This changes which branch's data they can access.
   - **Status** — Set to `active` or `inactive`. Inactive users cannot log in.
4. Click **Save** to apply changes.
5. The `updated_at` and `updated_by` fields are automatically set.

**Important:** Changing a user's role does not invalidate their existing access token. The new role takes effect on the next token refresh (within 15 minutes by default) or on re-login.

---

## Deactivating a User

1. Navigate to `/admin/users` and open the user.
2. Change the **Status** to `inactive`.
3. Click **Save**.
4. The user's existing refresh tokens remain valid until they expire (up to 14 days). For immediate revocation:
   - Use `POST /auth/logout` with their refresh token, or
   - Delete their sessions from the `user_sessions` table.

---

## Password Reset

### Admin-Initiated Reset

1. Navigate to `/admin/users`.
2. Open the user's profile.
3. Use the **Reset Password** action to set a new password.
4. The password is hashed with bcrypt before storage.
5. Communicate the new password to the user through a secure channel.

### User-Initiated Reset

1. The user navigates to `/forgot-password`.
2. They enter their email address.
3. An OTP is sent to the user's registered email or phone.
4. The user enters the OTP at `/otp` (6-digit `CodeInput`).
5. On successful verification, the user sets a new password at `/reset-password`.

---

## Bulk Operations

For managing multiple users at once:

1. **Bulk role change:** Not available through the UI. Use the API to update multiple users:
   ```
   PATCH /users/:id  { "role": "advisor" }
   ```
2. **Bulk branch reassignment:** Similarly handled per-user through the API.
3. **Bulk deactivation:** Update the `status` field for each user.

---

## Permission Implications by Role

When assigning a role, consider what the user will and will not be able to do:

| Action | Who Can Do It |
|--------|---------------|
| View dashboard | All roles except Supplier, Customer |
| Create job cards | Owner, Manager, Advisor, Frontdesk, Call Center |
| Approve estimates | Owner, Manager, Advisor (up to SAR 5K), Storekeeper |
| View financial reports | Owner, Super Admin, Manager, Accountant |
| Access executive reports | Owner, Super Admin, Manager, Accountant |
| Manage inventory | Owner, Manager, Storekeeper, Procurement |
| View HR / payroll | Owner, Manager (view only), HR Manager |
| Configure system settings | Owner, Super Admin, Manager (edit only) |
| Access audit logs | Owner, Super Admin, Manager, Accountant |

For the complete permission matrix, see [RBAC Matrix](../reference/rbac-matrix.md).

---

## Separation of Duties

When assigning roles, keep these segregation rules in mind. The same user should not perform both actions in a pair:

| Action A | Action B |
|----------|----------|
| Raise Purchase Order | Approve Purchase Order |
| Create Supplier | Approve Payment |
| Post Journal Entry | Approve Journal Entry |
| Perform Repair | Pass Quality Check |
| Issue Stock | Adjust Stock Count |
| Create Employee | Approve Payroll |

Assign complementary roles to different users to maintain proper controls.

---

## See Also

- [RBAC Matrix](../reference/rbac-matrix.md) — Full permission lookup
- [Configure Branches](./configure-branches.md) — Branch setup for user assignment
- [FAQ: How do I add a new user?](../reference/faq.md) — Quick answer
