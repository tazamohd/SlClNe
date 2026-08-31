# Onboarding Flows

This document describes the three onboarding paths in SALIS AUTO: how a new garage joins the platform, how a customer signs up, and how a supplier gets approved. Each path ends with the new user accessing their dedicated interface.

---

## Overview

| Path | Who | Entry Point | Result |
|---|---|---|---|
| Path A | Garage owner | Marketing page application | Full organization with branches, users, and operational access |
| Path B | Customer | QR code or signup link | Customer App with vehicles, appointments, and service tracking |
| Path C | Supplier | Supplier application form | Supplier Portal with catalog, orders, and invoicing |

---

## Path A: Garage Onboarding

This is the path for an existing automotive workshop that wants to use SALIS AUTO as their management platform.

### Step 1: Submit Application

**Who**: The garage owner

**Where**: Public marketing page

1. The garage owner visits the SALIS AUTO marketing website.
2. Navigates to the signup or application page.
3. Fills in the application form:

| Field | Description |
|---|---|
| Garage name | Official business name (EN/AR) |
| Owner name | Full name of the business owner |
| Email | Owner's email address (becomes their login) |
| Phone | Contact phone number |
| Location | City, district, full address |
| Number of bays | Workshop capacity |
| Services offered | Types of services (maintenance, repair, bodywork, etc.) |
| Trade license | Upload of business license document |
| VAT registration | ZATCA VAT registration number |

4. Submits the application via `POST /public/garage-applications`.
5. Receives a confirmation screen or email acknowledging receipt.

### Step 2: Platform Admin Review

**Who**: Super Admin (platform administrator)

**Where**: Super Admin portal (`/super-admin`)

1. The Super Admin sees the pending application in the applications queue.
2. Opens the application to review:
   - Business details and documents
   - License validity
   - Service area and capacity
3. Decision:
   - **Approve**: Proceed to organization creation.
   - **Reject**: Enter a reason. The applicant is notified by email.

### Step 3: Organization Creation (Automatic)

When the Super Admin approves:

1. The system automatically creates:
   - **Organization**: A new tenant in the multi-tenant platform.
   - **Owner user account**: Using the email from the application.
   - **Seed branch**: An initial branch based on the application's location.
2. The owner receives an email with:
   - Login credentials (email and temporary password)
   - Link to the platform
   - Instructions for first login

### Step 4: Owner First Login

**Who**: The new garage owner

1. The owner opens the login page and signs in with the emailed credentials.
2. They are prompted to change their password on first login.
3. The **Onboarding Wizard** launches, guiding them through initial setup.

### Step 5: Onboarding Wizard

**Screen**: Onboarding (`/onboarding`)

The wizard walks the owner through essential configuration:

#### Add Branches

1. Enter branch details: name (EN/AR), address, phone, operating hours.
2. Set the number of service bays and their types.
3. Add additional branches if the business has multiple locations.

#### Create Users

1. Add staff members with their roles:
   - Branch Manager(s)
   - Service Advisors
   - Technicians
   - Receptionists
   - Accountant
   - Storekeeper
   - Others as needed

2. For each user, enter:
   - Full name
   - Email (login credential)
   - Phone
   - Role (selected from the 14 available roles)
   - Assigned branch

3. Users receive their login credentials by email.

#### Import Sample Data

Optionally import sample data to explore the platform:

- Sample customers and vehicles
- Sample job cards at various stages
- Sample inventory items
- Sample invoices

This helps the owner and staff understand how the system works before entering real data.

#### Configure Settings

Quick access to essential settings:

- Organization logo and branding
- Working hours and holidays
- VAT configuration (seller VAT number)
- Default service types and pricing

### Step 6: Operational

After completing the wizard, the owner lands on the Dashboard and the organization is fully operational. Staff can log in, customers can be registered, and job cards can be created.

---

## Path B: Customer Signup

This is the path for a vehicle owner who wants to use the Customer App to book services, track repairs, and manage their vehicles.

### Step 1: Entry Point

**Who**: The customer

**Where**: Two ways to reach the signup page:

| Entry | How |
|---|---|
| QR code | Scan a QR code displayed at the garage (reception desk, waiting area, or on business cards) |
| Direct link | Follow a URL shared by the garage (e.g., `/garage/:slug/signup`) |

The QR code and link are specific to the garage, so the customer is associated with that workshop from the start.

### Step 2: Registration Form

The customer fills in:

| Field | Description | Required |
|---|---|---|
| Full name | First and last name | Yes |
| Phone number | Saudi mobile number (+966) | Yes |
| Email | Email address | Optional |
| Password | Account password | Yes |

### Step 3: OTP Verification

1. After submitting the registration form, a **6-digit OTP** is sent to the customer's phone via SMS.
2. The verification screen shows the **CodeInput** component -- six individual digit boxes.
3. The customer enters the code received by SMS.
4. The system verifies the code.
5. On success, the account is activated.

**OTP screen details**:

- The code expires after a set time (shown with a countdown).
- A "Resend code" button becomes available after the timer expires.
- Three failed attempts may temporarily lock the verification.

### Step 4: Customer App Access

After successful verification, the customer lands on the **Customer App** (`/customer-app/home`):

- The Home screen shows a welcome message with quick actions.
- The Garage tab is empty -- the customer adds their first vehicle.
- The Bookings tab is available for scheduling their first appointment.

The customer sees only data related to the garage they signed up with:

- Vehicles serviced at that garage
- Appointments at that garage
- Invoices from that garage

### First-Time Actions

1. **Add a vehicle**: Go to Garage > Add Vehicle. Enter plate number, make, model, year.
2. **Book a service**: Go to Bookings > Book Appointment. Select the vehicle, service type, date, and time.

See [Customer App Guide](../portals/customer-app-guide.md) for full details.

---

## Path C: Supplier Onboarding

This is the path for a parts supplier who wants to receive purchase orders from SALIS AUTO workshops.

### Step 1: Submit Application

**Who**: The supplier company

**Where**: Supplier application page (accessed from the marketing site or by invitation from a garage)

The supplier fills in:

| Field | Description |
|---|---|
| Company name | Official business name (EN/AR) |
| Contact person | Name of the primary contact |
| Email | Company email (becomes login) |
| Phone | Contact phone number |
| Address | Company address |
| Trade license | Business license document |
| VAT registration | ZATCA VAT registration number |
| Categories | Types of parts supplied (Engine, Brakes, Electrical, Body, Tires, etc.) |
| Regions | Saudi regions they serve (Central, Western, Eastern, etc.) |

### Step 2: Admin / Owner Review

**Who**: Super Admin or garage Owner

1. The application appears in the pending supplier applications queue.
2. The reviewer checks:
   - Business legitimacy (trade license, VAT registration)
   - Categories and regions match the garage's needs
   - Company reputation and references
3. Decision:
   - **Approve**: Proceed to account creation.
   - **Reject**: Enter a reason. The supplier is notified.

### Step 3: Account Creation

When approved:

1. The system creates a supplier user account with the `supplier` role.
2. The supplier receives an email with:
   - Login credentials
   - Link to the Supplier Portal
   - Getting started instructions

### Step 4: Supplier Portal Access

After login, the supplier lands on the **Supplier Portal** (`/supplier-portal`):

- The dashboard shows zero orders initially.
- The catalog section is empty -- the supplier uploads their product catalog.
- Account settings are pre-filled from the application.

### First-Time Actions

1. **Complete profile**: Review and update company information in Account Settings.
2. **Upload catalog**: Add products with part numbers, descriptions, prices, and availability.
3. **Set notifications**: Configure how they want to be alerted about new orders and quote requests.

See [Supplier Portal Guide](../portals/supplier-portal-guide.md) for full details.

---

## Role Scoping After Onboarding

Each onboarding path results in a specific role with defined scope:

| Path | Role | Scope | What They See |
|---|---|---|---|
| A (Garage) | Owner | All | Everything in their organization |
| A (Staff) | Varies | Branch or All | Per-role module access |
| B (Customer) | Customer | Self | Only their own vehicles, appointments, invoices |
| C (Supplier) | Supplier | External | Only their own orders, catalog, invoices |

### Data Isolation

- **Customer data** is scoped to the garage they signed up with. A customer who visits multiple garages on the platform has separate accounts.
- **Supplier data** is scoped to their own transactions. They cannot see other suppliers' data or workshop operations.
- **Staff data** is scoped by role: branch-scoped roles see only their branch; all-scoped roles see the entire organization.

---

## Post-Onboarding: Adding More Users

After the initial onboarding, additional users are added through the administrative interface:

### Adding Staff (Path A continuation)

1. Owner or Super Admin navigates to **Admin > Users & Teams** (`/users-teams`).
2. Clicks **Add User**.
3. Fills in name, email, phone, role, and branch.
4. Saves. The user receives credentials by email.

### Inviting Customers (Path B alternative)

Instead of self-signup, staff can create customer accounts:

1. Service Advisor or Receptionist navigates to **CRM > Customers**.
2. Clicks **Add Customer**.
3. Enters customer details.
4. The customer receives an email or SMS with login instructions.

### Inviting Suppliers (Path C alternative)

Instead of self-application, the Procurement Agent can add suppliers:

1. Navigate to **Inventory > Suppliers**.
2. Click **Add Supplier**.
3. Enter company details and categories.
4. The supplier receives credentials by email.

---

## Troubleshooting Onboarding

| Issue | Path | Resolution |
|---|---|---|
| Did not receive credentials email | A, C | Check spam folder; contact Super Admin to resend |
| OTP code not received | B | Verify phone number; check SMS delivery; use "Resend code" |
| Application rejected | A, C | Review the rejection reason and resubmit with corrections |
| Cannot find the QR code / link | B | Ask the garage for their customer signup URL |
| Onboarding wizard skipped accidentally | A | Navigate to Settings to complete configuration |
| Staff member cannot log in | A | Verify their account is Active in Users & Teams |

---

## Related Guides

- [Getting Started](../guides/getting-started.md) -- first login and interface navigation
- [Owner & Super Admin Guide](../guides/owner-superadmin-guide.md) -- managing the platform
- [Customer App Guide](../portals/customer-app-guide.md) -- customer's interface
- [Supplier Portal Guide](../portals/supplier-portal-guide.md) -- supplier's interface
- [Technician Portal Guide](../portals/technician-portal-guide.md) -- technician's interface
