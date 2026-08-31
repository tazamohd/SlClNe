# How To: Generate Reports

Guide for accessing, filtering, exporting, and understanding reports in SALIS AUTO. Reports are feature-driven screens rendered by the `FeatureScreen` component.

---

## Prerequisites

- You must have `reports:v` (View) on the `reports` module.
- For executive reports, you need `execreports:v`.

### Report Access by Role

| Role | `reports` | `execreports` | Notes |
|------|-----------|--------------|-------|
| Owner / CEO | vx | vx | Full access to all reports |
| Super Admin | vx | vx | Full access to all reports |
| Branch Manager | vx | vx | Full access, branch-filtered by default |
| Service Advisor | v | -- | View operational reports only |
| Technician | -- | -- | No report access |
| QC Inspector | v | -- | View quality reports only |
| Storekeeper | vx | -- | View inventory reports |
| Accountant | vx | vx | Full access to all reports |
| HR Manager | vx | -- | View HR and productivity reports |
| Receptionist | -- | -- | No report access |
| Call Center Agent | -- | -- | No report access |
| Procurement Agent | vx | -- | View procurement reports |
| Supplier | -- | -- | No report access |
| Customer | -- | -- | No report access |

---

## Available Report Types

All report screens are feature-driven (rendered by `FeatureScreen`). They display KPI stat cards, tab bars for sub-views, and data tables with charts.

### Executive Reports

| Report | Description | Key Metrics |
|--------|-------------|------------|
| Executive Dashboard | High-level business overview | Revenue, jobs completed, customer count, avg ticket value |
| Business Intelligence | Advanced analytics and trends | Multi-dimensional analysis |
| BI Dashboard | Interactive BI dashboard | Configurable widgets |
| Profit Analysis | Revenue vs cost breakdown | Gross margin, net margin, cost of goods |
| KPI Dashboard | Key performance indicators | All tracked KPIs in one view |

### Operational Reports

| Report | Description | Key Metrics |
|--------|-------------|------------|
| Operational Reports | Day-to-day workshop metrics | Jobs in progress, turnaround time, bay utilization |
| Workshop Reports | Workshop-specific analytics | Technician utilization, stage durations, bottlenecks |
| Productivity Tracker | Staff performance metrics | Jobs per technician, efficiency ratings |

### Financial Reports

| Report | Description | Key Metrics |
|--------|-------------|------------|
| Sales Reports | Revenue and invoicing | Revenue by service type, payment methods, outstanding AR |
| Insurance Reports | Insurance claims and policies | Claims submitted, approved, paid amounts |
| Loan Reports | Auto-loan portfolio | Active loans, repayment status, delinquency |

### Inventory Reports

| Report | Description | Key Metrics |
|--------|-------------|------------|
| Inventory Reports | Stock levels and movements | On-hand vs reorder level, turnover rate, dead stock |

### Custom Reports

| Report | Description |
|--------|-------------|
| Custom Reports | User-defined reports saved in `saved_reports` table |
| Business Heatmaps | Geographic and temporal heatmaps |

---

## Navigating to Reports

1. Open the sidebar and find the **Reports & Analytics** nav group.
2. Select the desired report from the list.
3. Reports open in the `FeatureScreen` layout with:
   - **StatRow** / **StatCard** — KPI metric cards across the top
   - **TabBar** — Pill tabs for switching between report views
   - **Section** — Data tables and charts within each tab
   - **SearchField** — Inline search within report data
   - **ScopeSelect** — Branch/garage picker for filtering

---

## Filtering Reports

### Date Range Filtering

Most reports support date range filtering:

1. Select a start date and end date from the date pickers.
2. Common presets: Today, This Week, This Month, This Quarter, This Year, Custom Range.
3. Date filtering applies to the primary date column of the report's source data (e.g., `created_at`, `issued_at`, `paid_on`).

### Branch Filtering

1. Use the `ScopeSelect` component (branch/garage picker) at the top of the report.
2. Organization-scoped users (Accountant, HR Manager) can select any branch or "All Branches."
3. Branch-scoped users see only their branch's data — the filter is pre-set and may be read-only.

### Additional Filters

| Filter | How to Use |
|--------|------------|
| Technician | Filter by specific technician (workshop reports) |
| Service type | Filter by service category |
| Status | Filter by record status (e.g., paid, pending, completed) |
| Customer type | Filter by individual vs fleet customer |

---

## Exporting Data

### CSV Export

1. On any report screen with tabular data, look for the **Export** or **Download CSV** button.
2. Click to download the current filtered view as a CSV file.
3. The export uses the `Accept: text/csv` header to the API.

**Limits and protections:**

| Rule | Detail |
|------|--------|
| Row limit | Maximum 50,000 rows per export |
| Formula injection protection | Cell values starting with `=`, `+`, `-`, `@`, `\t`, or `\r` are prefixed with `'` |
| Encoding | UTF-8 with BOM for Arabic character support |
| Column selection | Exports all visible columns in the current view |

### Splitting Large Exports

If your data exceeds 50,000 rows:

1. Apply date range filters to reduce the scope (e.g., export month by month).
2. Apply branch filters to export one branch at a time.
3. Apply status filters (e.g., export only "completed" records).

---

## Understanding KPI Metrics

### Workshop KPIs

| KPI | Formula | Target |
|-----|---------|--------|
| Average Turnaround Time | Sum of (delivery_at - checkin_at) / completed jobs | Varies by service type |
| Bay Utilization | Scheduled appointment minutes / available bay minutes | > 75% |
| First-Time Fix Rate | Jobs completed without rework / total completed jobs | > 90% |
| Technician Efficiency | Actual labor hours / estimated labor hours | > 85% |

### Financial KPIs

| KPI | Formula | Notes |
|-----|---------|-------|
| Average Ticket Value | Total invoiced (SAR) / number of invoices | Divide halalas by 100 |
| Collection Rate | Payments received / invoices issued | Track aging buckets |
| Gross Margin | (Revenue - COGS) / Revenue | Cost price is redacted for some roles |
| Outstanding AR | Sum of unpaid invoice balances | `total_halalas - paid_halalas` |

### Inventory KPIs

| KPI | Formula | Notes |
|-----|---------|-------|
| Stock Turnover | Parts consumed in period / average on-hand | Higher is better |
| Stockout Rate | Items with on_hand = 0 / total items | < 5% target |
| Reorder Accuracy | Timely reorders / total reorder triggers | > 95% target |

---

## Custom Reports

### Using the Custom Reports Builder

1. Navigate to the Custom Reports screen.
2. Select a **source** (which data to report on): `invoices`, `journal`, `expenses`, `jobs`, etc.
3. Choose **columns** to include.
4. Set **filters** to narrow the data.
5. Preview the report.
6. **Save** the report definition. It is stored in the `saved_reports` table:

| Field | Description |
|-------|-------------|
| `name` | Report name (varchar 200) |
| `source` | Which ledger source the report runs over |
| `ownerName` | Name of the user who saved it |
| `definition` | JSON object containing filters and column selection |

7. Saved reports can be re-run later with updated data.

---

## Dashboard Customization

The main Dashboard screen at `/dashboard` displays role-appropriate widgets:

- **Owner/CEO**: Revenue trends, multi-branch comparison, P&L summary
- **Branch Manager**: Branch KPIs, job card pipeline, staff utilization
- **Service Advisor**: Today's appointments, pending estimates, active jobs
- **Technician**: Assigned jobs, completion targets
- **Accountant**: Revenue, AR aging, expense summary
- **Storekeeper**: Low stock alerts, pending requisitions

Dashboard widgets use `StatCard` components with optional gradient backgrounds and tone indicators:
- `warning` tone: Orange highlight for metrics needing attention
- `info` tone: Blue highlight for informational metrics

---

## Field-Level Redaction in Reports

Certain report fields are hidden based on the user's role:

| Hidden Field | Hidden From |
|-------------|-------------|
| Employee salary | Roles without HR access |
| Part cost price | Roles without full inventory access |
| Profit margin | Roles without executive report access |
| Branch P&L details | Roles without `execreports` access |

The `ReadField` component renders hidden values as an em-dash with "Hidden for your role" tooltip text.

---

## See Also

- [RBAC Matrix](../reference/rbac-matrix.md) — Report access by role
- [Data Dictionary](../reference/data-dictionary.md) — Source table definitions
- [Performance Issues](../troubleshooting/performance-issues.md) — Export timeout troubleshooting
