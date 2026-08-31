# SALIS AUTO -- Parts Inventory Optimization

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-KB-LIB-002                              |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Introduction

Effective parts inventory management is critical to workshop profitability and customer satisfaction. Parts costs typically represent 45-55% of total job revenue in Saudi automotive workshops. This guide provides actionable strategies for optimizing inventory within the SALIS AUTO platform, covering classification, reorder logic, supplier management, and bin organization. For procurement role permissions and approval limits, refer to the [RBAC Matrix](../reference/rbac-matrix.md).

---

## 2. ABC Analysis for Parts Classification

### 2.1 Classification Criteria

ABC analysis categorizes parts by annual consumption value (unit cost x annual usage quantity):

| Class | % of SKUs | % of Annual Value | Management Approach              |
|-------|-----------|-------------------|----------------------------------|
| A     | 10-15%    | 70-80%            | Tight control, frequent review   |
| B     | 20-25%    | 15-20%            | Moderate control, monthly review |
| C     | 60-70%    | 5-10%             | Simple control, quarterly review |

### 2.2 Typical Class A Parts in Saudi Workshops

| Part Category          | Avg. Unit Cost (SAR) | Annual Turns |
|------------------------|----------------------|--------------|
| AC compressors         | 1,200 - 3,500       | 8-12         |
| Transmission assemblies| 2,500 - 8,000       | 4-6          |
| Engine components      | 1,500 - 6,000       | 5-8          |
| OEM brake kits         | 800 - 2,200         | 12-18        |
| Catalytic converters   | 1,800 - 4,500       | 3-5          |

### 2.3 Typical Class C Parts

| Part Category          | Avg. Unit Cost (SAR) | Annual Turns |
|------------------------|----------------------|--------------|
| Cabin air filters      | 25 - 80              | 40-60        |
| Wiper blades           | 30 - 90              | 30-50        |
| Light bulbs            | 10 - 45              | 50-80        |
| Drain plugs / washers  | 5 - 15               | 100-200      |
| Fuses                  | 3 - 10               | 80-120       |

### 2.4 Running ABC Analysis in SALIS AUTO

Navigate to Inventory > Reports > ABC Analysis. The system automatically calculates classifications based on the trailing 12-month consumption data. Review and adjust classifications quarterly, as seasonal shifts (especially AC parts in summer) can reclassify items temporarily.

---

## 3. Reorder Point Formulas

### 3.1 Basic Reorder Point (ROP)

```
ROP = (Average Daily Demand x Lead Time in Days) + Safety Stock
```

### 3.2 Worked Example: Oil Filters

| Parameter              | Value            |
|------------------------|------------------|
| Monthly demand         | 120 units        |
| Average daily demand   | 120 / 30 = 4    |
| Supplier lead time     | 5 days           |
| Safety stock           | 12 units         |
| **Reorder Point**      | **(4 x 5) + 12 = 32 units** |

### 3.3 Worked Example: AC Compressor (Class A)

| Parameter              | Value            |
|------------------------|------------------|
| Monthly demand (summer)| 15 units         |
| Average daily demand   | 15 / 30 = 0.5   |
| Supplier lead time     | 14 days          |
| Safety stock           | 5 units          |
| **Reorder Point**      | **(0.5 x 14) + 5 = 12 units** |

### 3.4 Economic Order Quantity (EOQ)

For Class A and B items, use EOQ to minimize combined ordering and holding costs:

```
EOQ = sqrt((2 x D x S) / H)

Where:
  D = Annual demand (units)
  S = Ordering cost per order (SAR)
  H = Annual holding cost per unit (SAR)
```

**Example: Brake Pads**

| Parameter              | Value            |
|------------------------|------------------|
| Annual demand (D)      | 480 sets         |
| Ordering cost (S)      | SAR 150          |
| Holding cost (H)       | SAR 30/year      |
| **EOQ**                | **sqrt((2 x 480 x 150) / 30) = 69 sets** |

### 3.5 Configuring in SALIS AUTO

Set ROP and EOQ values per SKU in Inventory > Part Master > Reorder Settings. The system generates automatic purchase requisitions when stock drops below ROP. Requisitions route to the procurement role for approval (limit: SAR 20,000 per the [RBAC Matrix](../reference/rbac-matrix.md)).

---

## 4. Safety Stock Calculation

### 4.1 Formula

```
Safety Stock = Z x sigma_d x sqrt(L)

Where:
  Z       = Service level factor (1.65 for 95%, 2.33 for 99%)
  sigma_d = Standard deviation of daily demand
  L       = Lead time in days
```

### 4.2 Service Level Targets by Part Class

| Part Class | Target Service Level | Z Factor |
|------------|---------------------|----------|
| A          | 99%                 | 2.33     |
| B          | 95%                 | 1.65     |
| C          | 90%                 | 1.28     |

### 4.3 Saudi Supply Chain Considerations

Saudi-specific factors that affect safety stock calculations:

| Factor                    | Impact on Safety Stock         |
|---------------------------|-------------------------------|
| Import customs clearance  | Add 2-5 days to lead time     |
| Jeddah port congestion    | Add 3-7 days during peak      |
| Ramadan shipping slowdown | Add 5-10 days during Ramadan  |
| Summer demand volatility  | Increase sigma_d by 30-50%    |
| Single-source parts       | Increase Z to 99% regardless  |
| Local supplier (Riyadh)   | Reduce lead time by 60-70%    |

### 4.4 Seasonal Safety Stock Adjustments

Adjust safety stock levels before peak seasons:

| Season              | Affected Categories       | Adjustment          |
|---------------------|--------------------------|---------------------|
| Summer (May-Sep)    | AC parts, coolant, belts | +50% safety stock   |
| Ramadan             | All categories           | +30% (longer leads) |
| Hajj (Dhul Hijjah)  | Tires, brakes, fluids    | +40% in Makkah area |
| Back-to-school      | Tires, batteries         | +20% safety stock   |

---

## 5. Dead Stock Identification

### 5.1 Criteria

A part is classified as dead stock when it meets any of the following:

| Criterion                     | Threshold                     |
|-------------------------------|-------------------------------|
| No movement                   | 180+ days with zero issues    |
| Very slow movement            | Less than 2 issues in 365 days|
| Obsolete vehicle coverage     | Vehicle model discontinued 5+ years |
| Superseded part number        | Replacement part available    |
| Damaged / expired             | Failed visual inspection      |

### 5.2 Dead Stock Report

Run Inventory > Reports > Dead Stock Analysis monthly. The report flags items matching the criteria above and calculates the total capital locked in dead inventory.

### 5.3 Disposition Strategies

| Strategy              | Best For                    | Expected Recovery  |
|-----------------------|-----------------------------|-------------------|
| Return to supplier    | Recent purchases, agreement | 80-100% of cost   |
| Cross-branch transfer | Multi-location operators    | 100% (internal)   |
| Discount sale         | Still-compatible parts      | 40-60% of cost    |
| Scrap / write-off     | Damaged, truly obsolete     | 0%                |
| Bundle with service   | Slow Class C items          | 50-70% of cost    |

### 5.4 Prevention

- Review new SKU additions against vehicle population data before initial stocking
- Set maximum shelf life alerts for rubber and chemical products
- Require minimum order justification for parts with no historical demand

---

## 6. Supplier Lead Time Management

### 6.1 Supplier Tier Classification

| Tier   | Lead Time      | Relationship    | Typical Suppliers           |
|--------|----------------|-----------------|-----------------------------|
| Tier 1 | 1-3 days       | Local, strategic| Riyadh/Jeddah distributors  |
| Tier 2 | 5-10 days      | Regional        | UAE, Bahrain wholesalers    |
| Tier 3 | 15-30 days     | International   | OEM / aftermarket importers |
| Tier 4 | 30-60 days     | Specialty       | Direct factory orders       |

### 6.2 Lead Time Tracking

Record actual lead times for every purchase order in SALIS AUTO. The system calculates rolling average lead time per supplier, which feeds into ROP calculations. Flag suppliers whose actual lead times exceed quoted lead times by more than 20% for review.

### 6.3 Dual Sourcing

For Class A parts, maintain at least two approved suppliers. Configure primary and secondary suppliers in the Part Master record. If the primary supplier's lead time exceeds the threshold, the system suggests the secondary source during requisition creation.

### 6.4 Supplier Scorecard

Evaluate suppliers quarterly on:

| Metric                  | Weight | Target    |
|-------------------------|--------|-----------|
| On-time delivery rate   | 30%    | 95%+      |
| Order accuracy          | 25%    | 98%+      |
| Price competitiveness   | 20%    | Within 5% |
| Defect / return rate    | 15%    | Below 2%  |
| Responsiveness          | 10%    | Same-day  |

---

## 7. Min/Max Inventory Levels

### 7.1 Setting Min/Max

| Parameter | Formula                                    |
|-----------|--------------------------------------------|
| Minimum   | Safety Stock + (Avg Daily Demand x Lead Time) |
| Maximum   | Minimum + EOQ                              |

### 7.2 Example Configuration

| Part               | Min  | Max  | Rationale                         |
|--------------------|------|------|-----------------------------------|
| Oil filter (common)| 32   | 101  | High volume, short lead time      |
| AC compressor      | 12   | 20   | Seasonal, long lead time          |
| Brake pad set      | 25   | 94   | Consistent demand, moderate cost  |
| Cabin filter       | 15   | 50   | Low cost, high margin add-on      |
| Spark plug set     | 20   | 60   | Steady demand, compact storage    |

### 7.3 System Alerts

SALIS AUTO generates alerts at three thresholds:

1. **Below Min**: Triggers automatic purchase requisition
2. **At Safety Stock**: Sends urgent notification to parts manager
3. **Above Max**: Warns against over-ordering during procurement

---

## 8. Stock-Out Cost Analysis

### 8.1 Direct Costs

| Cost Component               | Typical Impact (SAR)        |
|------------------------------|-----------------------------|
| Lost labor revenue (idle tech)| 150-300 per hour            |
| Bay opportunity cost         | 200-400 per hour            |
| Emergency procurement premium| 15-30% above normal cost    |
| Express shipping             | 50-500 per order            |

### 8.2 Indirect Costs

| Cost Component               | Estimated Annual Impact      |
|------------------------------|------------------------------|
| Customer dissatisfaction     | 2-5% churn increase          |
| Delayed vehicle delivery     | NPS reduction of 5-10 points |
| Rework from substitute parts | 3-5% warranty claims         |
| Technician morale impact     | Increased turnover risk      |

### 8.3 Stock-Out Rate Target

Maintain an overall stock-out rate below 5% for Class A items and below 10% for Class B items. Track monthly via Inventory > Reports > Stock-Out Analysis.

---

## 9. Bin Organization Strategies

### 9.1 Location Coding

Use a hierarchical bin coding system: Zone-Rack-Shelf-Bin.

```
Example: A-03-02-15
  A  = Zone (A=Fast-moving, B=Medium, C=Slow)
  03 = Rack number
  02 = Shelf level (bottom=01, top=05)
  15 = Bin position
```

### 9.2 Zone Layout

| Zone | Contents                      | Access Frequency |
|------|-------------------------------|------------------|
| A    | Class A parts, daily-use items| Multiple per day |
| B    | Class B parts, weekly movers  | Several per week |
| C    | Class C parts, slow movers    | Monthly or less  |
| H    | Hazardous materials (oil, chemicals) | As needed |
| R    | Returns and warranty items    | Weekly           |

### 9.3 Picking Efficiency

- Place fastest-moving items at waist height (shelves 02-03) to minimize bending and reaching
- Group parts by vehicle make when possible (e.g., Toyota section, Hyundai section)
- Label bins with both part number and description in English and Arabic
- Use barcode scanning for picks to ensure accuracy and update inventory in real time

---

## 10. Related Documents

- [Workshop Efficiency Best Practices](./workshop-efficiency-best-practices.md)
- [Multi-Branch Management](./multi-branch-management.md)
- [Financial Reporting Guide](./financial-reporting-guide.md)
- [Workshop Staff Guide](../../user-documentation/guides/workshop-staff-guide.md)
- [RBAC Matrix](../reference/rbac-matrix.md)

---

*End of Document SA-KB-LIB-002*
