# Supplier Portal Guide

This guide explains the SALIS AUTO Supplier Portal -- the interface for external parts suppliers to manage orders, submit invoices, respond to quote requests, and track deliveries.

> **Prerequisites**: You need an approved supplier account. See [Onboarding Flows](../workflows/onboarding-flows.md) for how to apply and get approved.

---

## Your Role at a Glance

| Detail | Value |
|---|---|
| Scope | External (your own data only) |
| Approval ceiling | SAR 0 (no approval authority) |
| Landing page | Supplier Portal |
| Accessible modules | Network (vce), Supplier Portal (vx) |

As a supplier, you interact only with the purchasing side of SALIS AUTO. You cannot see workshop operations, customer data, or financial records beyond your own transactions.

---

## Supplier Portal Dashboard

Route: `/supplier-portal`

After login, you land on the Supplier Portal dashboard. It displays:

### Key Statistics

Four summary cards at the top:

| Statistic | Description |
|---|---|
| Active Orders | Purchase orders currently in progress |
| Pending Deliveries | Items shipped but not yet received by the workshop |
| Total Revenue | Your cumulative revenue from SALIS AUTO orders |
| Rating | Your performance rating based on delivery and quality |

### Active Orders Table

Below the statistics, a DataTable lists your current purchase orders:

- **PO Number**: The purchase order reference
- **Items**: Description of ordered parts
- **Quantity**: Number of units
- **Total (SAR)**: Order total displayed in JetBrains Mono
- **Workshop**: Which branch placed the order
- **Status**: Badge showing current state
- **Due Date**: Expected delivery date

On mobile, the table switches to a card layout with key fields stacked vertically.

---

## Order Management

### Viewing Orders

Navigate to **Supplier Portal > Orders** (`/supplier-portal/orders`).

The orders screen provides a detailed view of all purchase orders sent to you. Filter by:

- **Status**: All, Pending, Confirmed, Shipped, Delivered
- **Date range**: Filter by order date
- **Workshop/Branch**: Filter by which branch ordered

### Order Lifecycle

Each purchase order goes through these stages:

| Status | Meaning | Your Action |
|---|---|---|
| Pending | PO has been sent to you | Review and confirm |
| Confirmed | You accepted the order | Prepare the items for shipment |
| Shipped | Items are on their way | Update tracking information |
| Delivered | Workshop received the items | No action needed |
| Partially Delivered | Some items received, others pending | Ship remaining items |
| Cancelled | Order was cancelled | No action needed |

### Confirming an Order

When a new purchase order arrives:

1. Open the order from the Active Orders list or the Orders screen.
2. Review the line items: part descriptions, quantities, and agreed prices.
3. Verify you can fulfill the order by the requested delivery date.
4. Click **Confirm Order**.
5. If you cannot fulfill the full quantity, update the confirmed quantity and add a note explaining the shortage.

### Updating Delivery Information

After confirming an order:

1. Open the confirmed order.
2. Click **Update Delivery**.
3. Enter the **shipment date** and **expected delivery date**.
4. Add a **tracking number** if applicable.
5. Click **Save**.

The workshop's Procurement Agent and Storekeeper are notified of the delivery update.

---

## Catalog Management

Your product catalog is visible to SALIS AUTO's procurement team when they search for parts.

### Managing Your Catalog

1. Navigate to your catalog section from the portal sidebar.
2. Each catalog entry includes:
   - **Part number / SKU**
   - **Description** (English and Arabic)
   - **Category** (e.g., Engine, Brakes, Electrical)
   - **Unit price** (SAR)
   - **Availability**: In Stock, Low Stock, Out of Stock
   - **Lead time**: Days to deliver from order confirmation

### Adding a Catalog Item

1. Click **Add Item**.
2. Fill in the part number, description, category, and pricing.
3. Set the current availability and standard lead time.
4. Click **Save**.

### Updating Prices and Availability

1. Find the item in your catalog list.
2. Click to edit.
3. Update the unit price, stock status, or lead time.
4. Click **Save**.

> **Tip**: Keep your catalog current. Procurement Agents rely on your listed availability and pricing when comparing suppliers.

---

## Quote Responses

When a SALIS AUTO Storekeeper or Procurement Agent requests pricing for specific parts, you receive a quote request.

### Responding to a Quote Request

1. A notification alerts you to a new quote request.
2. Open the request to see the list of parts, quantities, and delivery requirements.
3. For each item, enter:
   - **Unit price** (SAR)
   - **Available quantity**
   - **Delivery timeline**
4. Add any notes or conditions.
5. Click **Submit Quote**.

Your quote is included in the Procurement Agent's comparison alongside quotes from other suppliers. If selected, a purchase order is generated.

### Quote Tips

- Respond promptly. Quote requests may have a deadline.
- Be accurate with lead times. Late deliveries affect your supplier rating.
- If a part is temporarily unavailable, indicate this rather than quoting an unrealistic timeline.

---

## Invoice Submission

After delivering parts, you can submit invoices through the portal.

### Creating an Invoice

1. Navigate to the invoice submission section.
2. Select the related **Purchase Order** (the one you fulfilled).
3. The line items pre-populate from the PO.
4. Verify quantities (match what was actually delivered).
5. Confirm pricing.
6. Enter your invoice number and date.
7. Click **Submit Invoice**.

The Accountant at SALIS AUTO reviews and processes your invoice for payment.

### Invoice Status Tracking

Track the status of your submitted invoices:

| Status | Meaning |
|---|---|
| Submitted | Invoice received by SALIS AUTO |
| Under Review | Accountant is verifying against the PO and delivery receipt |
| Approved | Invoice accepted for payment |
| Paid | Payment has been processed |
| Disputed | There is a discrepancy that needs resolution |

---

## Delivery Tracking

Track the status of all your outgoing deliveries:

- **Shipment date**: When items left your warehouse
- **Expected arrival**: When the workshop expects receipt
- **Actual arrival**: Updated when the Storekeeper confirms receipt
- **Discrepancies**: Any quantity mismatches between shipped and received

### Handling Delivery Discrepancies

If the workshop reports a quantity mismatch:

1. You are notified of the discrepancy.
2. Review the reported versus shipped quantities.
3. If an error occurred, arrange a supplementary delivery.
4. Update the order status accordingly.

---

## Account Settings

Manage your supplier profile from the settings section:

### Company Information

- Company name (EN/AR)
- Contact person
- Phone and email
- Physical address
- Tax registration number (for ZATCA compliance)

### Categories and Regions

- **Categories**: The types of parts you supply (Engine, Brakes, Electrical, Body, etc.)
- **Regions**: Geographic areas you serve within Saudi Arabia

These are set during onboarding and can be updated as your business expands.

### Notification Preferences

Control how you receive alerts:

- New purchase order notifications
- Quote request alerts
- Payment confirmation notifications
- Rating updates

---

## Performance Rating

Your supplier rating is calculated based on:

| Factor | Description |
|---|---|
| Delivery timeliness | Percentage of orders delivered on or before the due date |
| Quality | Percentage of delivered items that passed quality inspection |
| Pricing competitiveness | How your prices compare to other suppliers |
| Response time | How quickly you respond to quote requests |

A higher rating increases your visibility in the procurement team's supplier selection process.

---

## Getting Started Checklist

After your supplier account is approved:

1. Log in with the credentials emailed to you.
2. Review and complete your company profile.
3. Upload your product catalog with current prices and availability.
4. Set your notification preferences.
5. Watch for your first quote request or purchase order.

---

## Related Guides

- [Onboarding Flows](../workflows/onboarding-flows.md) -- supplier application and approval process
- [Finance Staff Guide](../guides/finance-staff-guide.md) -- how the Procurement Agent works with you
- [Getting Started](../guides/getting-started.md) -- general platform navigation
