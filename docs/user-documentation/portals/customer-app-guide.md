# Customer App Guide

This guide explains the SALIS AUTO Customer App -- a mobile-first interface where you manage your vehicles, book service appointments, track repair progress in real time, and handle payments.

> **Prerequisites**: You need a customer account. See [Onboarding Flows](../workflows/onboarding-flows.md) for how to sign up.

---

## App Layout

The Customer App uses a phone-frame layout (430px max-width) with a fixed bottom tab bar. On larger screens, the app centers itself rather than stretching.

### Header

The top header bar shows:

- **SALIS AUTO logo** and name
- **Theme toggle**: Sun/moon icon to switch between dark and light mode
- **Notifications bell**: Tap to view notifications. An orange dot indicates unread items.

### Bottom Tab Bar

| Tab | Icon | Screen |
|---|---|---|
| Home | Home | Dashboard with active service status and quick actions |
| Garage | Car | Your registered vehicles |
| Bookings | Calendar | Appointment list and booking |
| Tracking | Radio | Live repair progress tracking |
| Profile | User | Personal info and settings |

Tap any tab to navigate. The active tab is highlighted in blue.

---

## Home Screen

Route: `/customer-app/home`

The Home screen is your starting point. It includes:

### Hero Card

A prominent card showing your **active service status** -- if a vehicle is currently in the workshop, you see:

- Vehicle name and plate number
- Current repair stage (e.g., "Inspection", "Repair in Progress")
- Estimated completion

If no vehicle is currently being serviced, the hero card shows a **welcome message** and quick action buttons.

### Wallet Balance

Your wallet balance is displayed in SAR. This shows any prepaid balance or credits available.

### Quick Actions

Shortcut buttons for common tasks:

- **Book Service**: Jump directly to the booking flow.
- **My Vehicles**: Open the Garage tab.
- **Track Service**: Open the Tracking tab.
- **Payments**: View payment history.

---

## Garage

Route: `/customer-app/garage`

The Garage screen lists all vehicles registered under your account.

### Vehicle List

Each vehicle card shows:

- **Plate number** (displayed prominently)
- **Make and model** (e.g., Toyota Camry 2023)
- **Last service date**

### Viewing Vehicle Details

Tap a vehicle to see its full record:

- Registration details (plate, VIN, year, color)
- **Service history**: Every past job card with date, service type, and cost
- **Upcoming appointments**: Scheduled services for this vehicle
- **Inspection reports**: Past inspection results

### Adding a Vehicle

1. Tap **Add Vehicle** (plus icon).
2. Enter:
   - **Plate number**
   - **Make** (manufacturer)
   - **Model**
   - **Year**
   - **Color** (optional)
   - **VIN** (optional but recommended)
3. Tap **Save**.

The vehicle appears in your Garage immediately and is available for booking.

---

## Bookings

Route: `/customer-app/appointments`

The Bookings screen shows your appointment history and lets you create new bookings.

### Appointment List

Each booking card shows:

- Service type (Maintenance, Repair, Inspection, etc.)
- Date and time
- Branch name
- Status: Upcoming, Completed, or Cancelled

### Creating a New Booking

1. Tap the **Book Appointment** button.
2. **Select vehicle**: Choose from your registered vehicles.
3. **Select service**: Pick the service type.
4. **Choose date**: A calendar shows available dates. Unavailable dates are greyed out.
5. **Choose time**: Available time slots appear for the selected date.
6. **Confirm**: Review the booking summary and tap **Confirm Booking**.
7. You receive a confirmation notification.

### Managing Bookings

- **Reschedule**: Open a booking and tap **Reschedule**. Select a new date and time.
- **Cancel**: Open a booking and tap **Cancel**. Provide a reason if prompted.

> **Tip**: Book at least 24 hours in advance for the widest selection of time slots.

---

## Service Tracking

Route: `/customer-app/service-tracking`

When your vehicle is in the workshop, this screen shows **live repair progress** with real-time stage updates.

### Progress View

The tracking screen displays:

- **Vehicle information**: Make, model, and plate number at the top.
- **Stage indicator**: A visual progress bar showing the six workshop stages:

```
Check-In --> Inspection --> Estimate --> Repair --> Quality Check --> Delivery
```

- **Current stage**: Highlighted with a description of what is happening.
- **Stage history**: Timestamps showing when each completed stage was reached.
- **Assigned technician**: Name of the technician working on your vehicle (where available).

### Stage Descriptions

| Stage | What Is Happening |
|---|---|
| Check-In | Your vehicle has been received and the initial details recorded |
| Inspection | A multi-point inspection is being performed |
| Estimate | The service team is preparing a cost estimate |
| Repair | Approved work is being performed |
| Quality Check | The work is being verified by an independent inspector |
| Delivery | Your vehicle is ready for pickup |

### Notifications

You receive push notifications when your vehicle moves to a new stage. Each notification includes:

- Stage name
- Brief description
- Estimated time remaining (when available)

---

## Estimate Approval

When the workshop prepares an estimate for your vehicle, you receive an SMS with an approval link.

### Approval Flow

1. **Receive SMS**: A text message arrives with a short URL.
2. **Open the link**: Your browser opens the estimate review page.
3. **Review line items**: Each service item is listed with:
   - Description
   - Quantity
   - Unit price (SAR)
   - Urgency indicator (Critical / Due now / Advisory)
4. **Select items**: Use checkboxes to approve or defer specific items.
   - Items marked as "Critical" should be approved for safety.
   - "Advisory" items can be deferred to a future visit.
5. **Review revised total**: The total updates based on your selections.
6. **OTP verification**: A 6-digit code is sent to your phone. Enter it in the CodeInput field.
7. **Sign**: Use your finger or stylus to sign on the canvas area.
8. **Submit**: Tap **Approve** to authorize the work.

Your signature is stored securely. Once approved, the workshop proceeds with the selected repairs.

> **Note**: If you do not respond to the estimate within the specified timeframe, the Service Advisor may contact you directly.

See [Estimate Approval Workflow](../workflows/estimate-approval.md) for full technical details.

---

## Payments

Route: `/customer-app/wallet`

View your payment history and wallet:

- **Wallet balance**: Prepaid credits available.
- **Payment history**: All past payments with invoice reference, amount, date, and payment method.
- **Pending invoices**: Any outstanding amounts.

### Making a Payment

When an invoice is issued:

1. The invoice appears in your Pending Invoices section.
2. Tap the invoice to view the full breakdown.
3. Tap **Pay Now** to proceed with payment.
4. Select your payment method (Card, Bank Transfer).
5. Complete the payment process.
6. A receipt is generated and available in your history.

---

## Profile

Route: `/customer-app/profile`

Manage your account settings:

### Personal Information

- Full name
- Phone number
- Email address
- National ID (if provided)

Tap **Edit** to update any field.

### Notification Preferences

Control which notifications you receive:

- Service stage updates (recommended: keep enabled)
- Appointment reminders
- Promotional offers
- Payment receipts

### Language & Theme

- **Language**: Toggle between English and Arabic. Arabic switches the entire app to RTL layout.
- **Theme**: Choose dark or light mode.

### Other Options

- **Orders**: View parts orders or marketplace purchases.
- **Insurance**: Manage insurance claims linked to your vehicles.
- **Notifications**: Full notification history.

---

## Additional Customer App Screens

| Screen | Route | Purpose |
|---|---|---|
| Marketplace | `/customer-app/marketplace` | Browse and purchase parts or accessories |
| Insurance | `/customer-app/insurance` | Manage insurance claims |
| Loans | `/customer-app/loans` | Vehicle loan information |
| Notifications | `/customer-app/notifications` | Full notification history |

---

## Getting Help

- **Contact the workshop**: Call the branch phone number shown in your booking confirmation.
- **AI Assistant**: Available through the support chat for quick questions.
- **Visit the front desk**: For in-person assistance.

---

## Signing Up as a New Customer

If you do not have an account yet:

1. Scan the QR code at the workshop, or follow a link to the garage's signup page.
2. Fill in the registration form with your name, phone, and email.
3. Enter the 6-digit **OTP** sent to your phone to verify your identity.
4. You land on the Customer App with an empty Garage -- add your first vehicle to get started.

See [Onboarding Flows](../workflows/onboarding-flows.md) for the detailed signup path.

---

## Related Guides

- [Onboarding Flows](../workflows/onboarding-flows.md) -- signup and account creation
- [Estimate Approval](../workflows/estimate-approval.md) -- how the approval link works
- [Job Lifecycle](../workflows/job-lifecycle.md) -- what happens inside the workshop
- [Getting Started](../guides/getting-started.md) -- general platform overview
