# Customer Journey

The Customer uses a mobile-first app to manage their vehicles, book service appointments, approve cost estimates, track repair progress in real time, and pay invoices. Unlike internal staff, the Customer's journey is made up of several genuinely separate sub-scenarios that a person dips in and out of over the life of a single service visit.

## Primary Scenario: App Navigation

```mermaid
flowchart TD
    Home["Home\nActive status + quick actions"] --> Garage["My Garage\nPlate / VIN / service history"]
    Home --> QuickActions["Quick Actions\nBook / Track / Invoices / Contact"]
    Garage --> AddVehicle["Add Vehicle\nPlate / VIN / make / model"]
    QuickActions --> Book["Book Appointment"]
    QuickActions --> Track["Live Tracking"]
    QuickActions --> Pay["Payment"]
    Home --> Notif["Receive Estimate notification\nSAR breakdown"]
```

## Sub-Scenario: Book Appointment

```mermaid
flowchart TD
    Start["Tap Book Appointment"] --> Vehicle["Select vehicle"]
    Vehicle --> Service["Select service, date, time, branch"]
    Service --> Confirm["Review summary & Confirm Booking"]
    Confirm --> Notification["Confirmation notification received"]
```

## Sub-Scenario: Approve Estimate (E-Signature)

```mermaid
flowchart TD
    SMS["Receive SMS with approval link"] --> Open["Open link -- review line items\n(Critical / Due now / Advisory)"]
    Open --> Select["Check / uncheck items to approve or defer"]
    Select --> OTP["Enter OTP (6-digit code)"]
    OTP --> Sign["E-Signature on canvas"]
    Sign --> Approve["Submit -- estimate = Customer Approved"]
    Approve --> RepairStart["Job transitions to Repair"]
```

## Sub-Scenario: Live Tracking

```mermaid
flowchart TD
    CheckIn["Check-In"] --> Inspect["Inspect"]
    Inspect --> Estimate["Estimate"]
    Estimate --> Repair["Repair\nEst. remaining: 2h 15m"]
    Repair --> QC["QC"]
    QC --> Delivery["Delivery"]
    Delivery --> Pickup["Vehicle ready for pickup"]
```

## Sub-Scenario: Payment & Review

```mermaid
flowchart TD
    Invoice["Invoice issued, appears in Pending Invoices"] --> PayNow["Tap Pay Now"]
    PayNow --> Method["Select method: Stripe\nCard / mada / Apple Pay"]
    Method --> Complete["Complete payment"]
    Complete --> Receipt["Receipt generated\n15% VAT + ZATCA QR receipt"]
    Receipt --> Review["Rate & Review the service"]
```
