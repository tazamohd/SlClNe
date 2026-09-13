# Supplier Journey

The Supplier is an external portal role scoped to their own purchase orders and payments only -- they have no visibility into workshop operations, customer data, or other suppliers' transactions, and a SAR 0 approval ceiling (no approval authority). Their scenario centers on fulfilling purchase orders and getting paid for them.

## Primary Scenario: Order Fulfillment to Payment

```mermaid
flowchart TD
    Login["Login"] --> Dash["Supplier Dashboard\nActive Orders | Pending Deliveries | Revenue | Rating"]
    Dash --> ReceivePO["Receive PO"]
    ReceivePO --> ConfirmReject{"Can fulfill\nthe order?"}
    ConfirmReject -->|Confirm| Prepare["Prepare Shipment"]
    ConfirmReject -->|Reject / partial| Note["Update confirmed quantity\n+ shortage note"]
    Note --> Prepare
    Prepare --> DeliveryStatus["Delivery Status\nShipment date, tracking number"]
    DeliveryStatus --> GoodsReceived["Goods Received\n(by Storekeeper)"]
    GoodsReceived --> SubmitInvoice["Submit Invoice\n(SAR, pre-populated from PO)"]
    SubmitInvoice --> TrackPayment["Track Payment\nSubmitted -> Under Review -> Approved -> Paid"]
    TrackPayment --> History["Payment History"]
```

## Sub-Scenario: Quote Request Response

```mermaid
flowchart TD
    Request["Quote request received\n(parts, quantities, delivery needs)"] --> Enter["Enter unit price, available qty,\ndelivery timeline, notes"]
    Enter --> SubmitQuote["Submit Quote"]
    SubmitQuote --> Compare["Included in Procurement Agent's\nprice comparison"]
    Compare --> Selected{"Selected?"}
    Selected -->|Yes| POGenerated["Purchase Order generated"]
    Selected -->|No| NoAward["Not selected this round"]
```

## Sub-Scenario: Delivery Discrepancy Handling

```mermaid
flowchart TD
    Mismatch["Workshop reports quantity mismatch"] --> Notified["Supplier notified of discrepancy"]
    Notified --> ReviewQty["Review reported vs. shipped quantities"]
    ReviewQty --> ErrorCheck{"Error on\nsupplier side?"}
    ErrorCheck -->|Yes| Supplement["Arrange supplementary delivery"]
    ErrorCheck -->|No| UpdateStatus["Update order status with explanation"]
    Supplement --> UpdateStatus
```

**Boundary**: workshop-internal steps -- PO creation, goods receipt confirmation, and payment approval -- are performed by SALIS AUTO staff and are never visible to the supplier; the supplier only sees their own PO and payment status.
