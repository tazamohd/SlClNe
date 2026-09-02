# SALIS AUTO -- Migration from Legacy Systems

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-KB-LIB-014                              |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Introduction

Migrating to SALIS AUTO from paper-based records, Excel spreadsheets, or legacy workshop management software requires careful planning and execution. This guide provides a structured approach to data extraction, field mapping, import procedures, and validation to ensure a smooth transition with minimal operational disruption.

A successful migration preserves the workshop's historical data while establishing clean, normalized data in SALIS AUTO. The migration process typically spans 4-8 weeks from planning through parallel-run completion, depending on data volume and source complexity.

---

## 2. Migration Assessment

### 2.1 Source System Classification

| Source Type            | Complexity | Typical Data Quality | Migration Approach           |
|------------------------|------------|----------------------|------------------------------|
| Paper Records Only     | High       | Variable, incomplete | Manual entry with templates  |
| Excel Spreadsheets     | Medium     | Moderate, inconsistent | CSV export and field mapping |
| Generic Accounting SW  | Medium     | Good for financials  | Export, transform, import    |
| Legacy Workshop SW     | Low-Medium | Good                 | API or database export       |
| Multiple Mixed Sources | High       | Variable             | Phased approach, source by source |

### 2.2 Pre-Migration Audit

Before starting migration, conduct a data audit:

| Audit Item                     | Assessment Questions                                    | Impact on Migration            |
|--------------------------------|---------------------------------------------------------|--------------------------------|
| Volume Estimate                | How many customers, vehicles, and job records exist?     | Determines migration timeline  |
| Data Completeness              | What percentage of records have all required fields?     | Affects cleanup effort         |
| Data Accuracy                  | How current is the data? When was it last verified?      | Determines validation effort   |
| Duplicate Records              | Are there duplicate customers, vehicles, or suppliers?   | Requires deduplication step    |
| Data Format                    | What formats are used (dates, phone numbers, currencies)? | Affects transformation rules   |
| Language Content               | Is data in Arabic, English, or mixed?                    | Affects field mapping          |
| Historical Depth               | How far back does useful historical data go?             | Determines archive vs import   |
| Attachments/Images             | Are there associated files (photos, scanned documents)?  | Separate migration stream      |

---

## 3. Data Extraction from Source Systems

### 3.1 Paper Records

| Data Category          | Extraction Method                              | Tools Required                  |
|------------------------|------------------------------------------------|--------------------------------|
| Customer Information   | Manual keying into migration template          | Excel/Google Sheets template   |
| Vehicle Records        | Manual keying with VIN/plate cross-reference   | Excel/Google Sheets template   |
| Service History        | Summarize into high-level records              | Excel/Google Sheets template   |
| Financial Records      | Keep in legacy format, enter opening balances  | Accounting template            |
| Supplier Information   | Manual keying into migration template          | Excel/Google Sheets template   |

**Guidance:** For paper-based workshops, focus on active customers (visited within 18 months), their vehicles, last 3 service records per vehicle, active supplier relationships, and current inventory counts.

### 3.2 Excel Spreadsheets

Standardize column headers to SALIS AUTO field names, remove formatting (merged cells, formulas), normalize data types, deduplicate, export each entity type to separate UTF-8 CSV files.

### 3.3 Legacy Software

| Legacy System Type       | Extraction Method                              | Common Challenges               |
|--------------------------|------------------------------------------------|--------------------------------|
| Database-backed          | SQL export to CSV                              | Schema discovery, encoding     |
| Cloud-based              | Export feature or API                           | Rate limits, format differences |
| Desktop application      | Built-in export or database file copy          | Proprietary formats            |
| Discontinued software    | Database file extraction (SQLite, Access, etc.)| No vendor support              |

---

## 4. Field Mapping Guide

### 4.1 Customer Fields

| SALIS AUTO Field        | Type        | Required | Source Field Examples                    | Transformation Notes              |
|-------------------------|-------------|:--------:|------------------------------------------|-----------------------------------|
| customer_name_en        | String(100) | Yes      | "Name", "Customer", "Client"            | Title case, trim whitespace       |
| customer_name_ar        | String(100) | No       | "اسم العميل", "الاسم"                    | RTL text, validate Arabic chars   |
| mobile_number           | String(15)  | Yes      | "Phone", "Mobile", "Contact"            | Format: +966XXXXXXXXX            |
| email                   | String(100) | No       | "Email", "E-mail"                        | Validate format, lowercase       |
| national_id             | String(10)  | No       | "ID", "Iqama", "National ID"            | 10 digits, validate check digit  |
| customer_type           | Enum        | Yes      | "Type", "Category"                       | Map to: Individual, Corporate, Fleet, Government |
| vat_number              | String(15)  | Cond.    | "VAT", "Tax Number", "TIN"              | Required for B2B, 15-digit ZATCA format |
| address_city            | String(50)  | No       | "City", "المدينة"                         | Map to SALIS AUTO city list      |
| address_district        | String(50)  | No       | "District", "Area", "الحي"               | Free text                        |
| preferred_language      | Enum        | Yes      | Derive from name language                | EN or AR, default AR             |
| credit_limit            | Decimal     | No       | "Credit", "Account Limit"               | Default 0 for new customers      |

### 4.2 Vehicle Fields

| SALIS AUTO Field        | Type        | Required | Source Field Examples                    | Transformation Notes              |
|-------------------------|-------------|:--------:|------------------------------------------|-----------------------------------|
| plate_number            | String(10)  | Yes      | "Plate", "Reg", "License"               | Format varies by plate type       |
| plate_type              | Enum        | Yes      | Derive from plate format                 | Private, Commercial, Transport, Diplomatic, Temporary |
| vin                     | String(17)  | No       | "VIN", "Chassis", "Frame"               | 17 chars, validate check digit   |
| make                    | String(50)  | Yes      | "Make", "Brand", "Manufacturer"          | Map to standardized make list    |
| model                   | String(50)  | Yes      | "Model"                                  | Map to standardized model list   |
| year                    | Integer     | Yes      | "Year", "Model Year"                     | 4-digit Gregorian year           |
| color                   | String(30)  | No       | "Color", "اللون"                          | Map to standard color list       |
| engine_type             | Enum        | No       | "Engine", "Fuel"                         | Gasoline, Diesel, Hybrid, Electric |
| mileage_at_import       | Integer     | No       | "Mileage", "KM", "Odometer"             | Current mileage in kilometers    |
| owner_customer_id       | FK          | Yes      | Linked via customer name/phone match     | Must reference imported customer |

### 4.3 Service History Fields

| SALIS AUTO Field        | Type        | Required | Source Field Examples                    | Transformation Notes              |
|-------------------------|-------------|:--------:|------------------------------------------|-----------------------------------|
| service_date            | Date        | Yes      | "Date", "Service Date"                   | Format: YYYY-MM-DD (Gregorian)   |
| service_type            | Enum        | Yes      | "Service", "Type", "Work Done"           | Map to SALIS AUTO service catalog |
| description             | Text        | No       | "Notes", "Details", "Description"        | Free text, max 500 chars         |
| total_amount            | Decimal     | No       | "Total", "Amount", "Invoice"             | SAR, 2 decimal places            |
| mileage_at_service      | Integer     | No       | "Mileage", "KM"                          | Kilometers at time of service    |
| technician_name         | String      | No       | "Technician", "Mechanic"                 | For historical reference only    |
| vehicle_reference       | FK          | Yes      | Linked via plate or VIN                  | Must reference imported vehicle  |

### 4.4 Inventory/Parts Fields

| SALIS AUTO Field        | Type        | Required | Source Field Examples                    | Transformation Notes              |
|-------------------------|-------------|:--------:|------------------------------------------|-----------------------------------|
| part_number             | String(30)  | Yes      | "Part No", "SKU", "Code"                | Standardize format               |
| part_name_en            | String(100) | Yes      | "Description", "Part Name"              | Standardized terminology         |
| part_name_ar            | String(100) | No       | "الوصف", "اسم القطعة"                    | Arabic description               |
| category                | Enum        | Yes      | "Category", "Group", "Type"             | Map to SALIS AUTO categories     |
| unit_cost               | Decimal     | Yes      | "Cost", "Purchase Price"                | SAR, 2 decimal places            |
| selling_price           | Decimal     | Yes      | "Price", "Sell Price", "Retail"          | SAR, 2 decimal places, VAT-exclusive |
| quantity_on_hand        | Integer     | Yes      | "Stock", "QOH", "Qty"                   | Physical count at migration date |
| reorder_point           | Integer     | No       | "Min Stock", "Reorder Level"            | Default calculated from history  |
| supplier_reference      | FK          | No       | Linked via supplier name                | Must reference imported supplier |
| location                | String(20)  | No       | "Shelf", "Bin", "Location"              | Warehouse location code          |

---

## 5. Data Import Procedures

### 5.1 CSV Format Requirements

| Specification           | Requirement                                            |
|-------------------------|--------------------------------------------------------|
| Encoding                | UTF-8 (with BOM for Excel compatibility)               |
| Delimiter               | Comma (,)                                              |
| Text Qualifier          | Double quotes (") for fields containing commas         |
| Date Format             | YYYY-MM-DD                                             |
| Number Format           | No thousands separator, period for decimal (1234.56)   |
| Boolean Format          | TRUE/FALSE or 1/0                                      |
| Null/Empty              | Empty field (two consecutive delimiters)               |
| Line Ending             | CRLF (Windows) or LF (Unix) both accepted             |
| Header Row              | Required, must match SALIS AUTO field names exactly    |
| Maximum File Size       | 50MB per import file                                   |
| Maximum Rows            | 50,000 rows per import file                            |

### 5.2 Import Sequence

Data must be imported in dependency order:

| Order | Entity             | Dependencies                  | Estimated Time (per 1000 records) |
|-------|--------------------|-------------------------------|-----------------------------------|
| 1     | Organization Setup | None                          | Manual configuration              |
| 2     | Users and Roles    | Organization                  | Manual configuration              |
| 3     | Service Catalog    | Organization                  | Manual or CSV                     |
| 4     | Suppliers          | Organization                  | 10-15 minutes                     |
| 5     | Customers          | Organization                  | 15-20 minutes                     |
| 6     | Vehicles           | Customers                     | 15-20 minutes                     |
| 7     | Parts/Inventory    | Suppliers, Service Catalog    | 20-30 minutes                     |
| 8     | Service History    | Customers, Vehicles           | 25-35 minutes                     |
| 9     | Opening Balances   | Customers, Suppliers          | Manual entry                      |

### 5.3 Validation Rules

The import engine validates each record against these rules:

| Validation Type        | Rule                                                   | On Failure                     |
|------------------------|--------------------------------------------------------|--------------------------------|
| Required Fields        | All required fields must have values                   | Row rejected                   |
| Data Type              | Values must match expected types                       | Row rejected                   |
| Referential Integrity  | Foreign keys must reference existing records           | Row rejected                   |
| Uniqueness             | Unique fields must not duplicate existing data         | Row rejected, duplicate flagged |
| Format                 | Formatted fields must match patterns (phone, email)    | Row rejected                   |
| Range                  | Numeric values must be within valid ranges             | Row rejected                   |
| Business Rule          | Domain-specific validations (valid plate format, etc.) | Row rejected with explanation  |

### 5.4 Import Error Handling

After each import batch, the system generates an import report:

| Report Element         | Content                                                |
|------------------------|--------------------------------------------------------|
| Total Records          | Number of records in the import file                   |
| Successfully Imported  | Number of records imported without issues              |
| Rejected Records       | Number of records that failed validation               |
| Warnings               | Records imported with non-critical issues              |
| Error Details          | Row number, field name, error description for each failure |
| Duplicate Report       | Potential duplicates detected with existing data       |

---

## 6. Historical Data Handling

### 6.1 Archive vs Import Decision Matrix

| Data Category              | Age           | Recommendation    | Rationale                         |
|----------------------------|---------------|-------------------|-----------------------------------|
| Active customer profiles   | Any           | Import            | Customer relationship continuity  |
| Inactive customers         | > 24 months   | Archive           | Low value, data cleanup opportunity |
| Vehicle records (active)   | Any           | Import            | Service history context           |
| Vehicle records (sold/scrapped) | Any      | Archive           | No future service expected        |
| Service history            | < 24 months   | Import            | Recent context valuable           |
| Service history            | 24-60 months  | Summarize         | Import summary record only        |
| Service history            | > 60 months   | Archive           | Minimal operational value         |
| Financial transactions     | < 12 months   | Import            | Current-year accounting           |
| Financial transactions     | 12-84 months  | Archive           | Retain per ZATCA requirements     |
| Inventory records          | Current       | Import            | Current stock levels required     |
| Supplier records (active)  | Any           | Import            | Ongoing relationships             |
| Supplier records (inactive)| > 12 months   | Archive           | No current relationship           |

### 6.2 Archive Format

Archived data should be stored in the following format for future reference:

1. Export to CSV with full field set
2. Create a ZIP archive named: `[workshop_name]_legacy_archive_[YYYY-MM-DD].zip`
3. Include a README.txt file describing the archive contents, source system, and date range
4. Store the archive in a secure, backed-up location (organization's cloud storage)
5. Retain for minimum 7 years per ZATCA requirements

---

## 7. Parallel-Run Period

### 7.1 Parallel-Run Recommendations

| Workshop Size          | Recommended Duration | Justification                       |
|------------------------|----------------------|-------------------------------------|
| Small (1-3 bays)       | 2 weeks              | Lower complexity, faster validation |
| Medium (4-8 bays)      | 3 weeks              | Moderate complexity                 |
| Large (9+ bays)        | 4 weeks              | Higher complexity, more edge cases  |
| Multi-Branch           | 4 weeks per branch   | Staggered rollout recommended       |

### 7.2 Parallel-Run Procedures

During the parallel-run period, the workshop operates on both the legacy system (or paper) and SALIS AUTO simultaneously:

| Day Range    | Activity                                                | Focus Area                     |
|--------------|--------------------------------------------------------|--------------------------------|
| Days 1-3     | All transactions entered in both systems               | Identify workflow gaps          |
| Days 4-7     | SALIS AUTO primary, legacy as backup verification      | Staff comfort assessment        |
| Days 8-14    | SALIS AUTO primary, legacy for complex cases only      | Edge case resolution            |
| Days 15-21   | SALIS AUTO only, legacy available but not required     | Independence verification       |
| Days 22-28   | SALIS AUTO only, legacy decommissioned                 | Full cutover                    |

### 7.3 Parallel-Run Validation Checkpoints

| Checkpoint              | Validation                                             | Acceptance Criteria              |
|-------------------------|--------------------------------------------------------|----------------------------------|
| Daily Revenue Match     | SALIS AUTO daily total matches legacy/manual total     | Within SAR 50 variance           |
| Invoice Accuracy        | Sample 10 invoices per day for field-by-field comparison | 100% match on amounts           |
| Customer Data           | Verify 20 random customer records against source       | 95% field accuracy               |
| Vehicle Data            | Verify 20 random vehicle records against source        | 98% field accuracy               |
| Inventory Counts        | Physical count of 50 high-value parts vs system        | 100% match                       |
| Workflow Completion     | 5 jobs processed end-to-end in SALIS AUTO              | All stages completed without workaround |
| Report Accuracy         | Compare standard reports between systems               | Within 2% variance               |

---

## 8. Validation Checklists

### 8.1 Pre-Import Validation

| Check Item                     | Method                                   | Pass Criteria                    |
|--------------------------------|------------------------------------------|----------------------------------|
| CSV file encoding              | Open in text editor, check for garbled Arabic | All Arabic text renders correctly |
| Header row correctness         | Compare to SALIS AUTO field name list    | 100% match                       |
| Required fields populated      | Count empty cells in required columns    | 0 empty required fields          |
| Date format consistency        | Sort date columns, check for anomalies   | All dates in YYYY-MM-DD          |
| Phone number format            | Regex validation on phone columns        | All match +966 or 05X pattern    |
| Duplicate check                | Sort by key fields, flag duplicates      | Duplicates resolved              |
| Character encoding test        | Import 10 rows as test, verify display   | All characters display correctly |

### 8.2 Post-Import Validation

| Check Item                     | Method                                   | Pass Criteria                    |
|--------------------------------|------------------------------------------|----------------------------------|
| Record count verification      | Compare import file row count to system count | Match (minus rejected rows)   |
| Random sample verification     | Check 50 random records field-by-field   | > 98% accuracy                   |
| Relationship integrity         | Verify vehicle-customer links            | All vehicles linked to customers |
| Search functionality           | Search for 20 known records              | All found and correct            |
| Arabic content display         | View 20 Arabic-content records           | Correct RTL rendering            |
| Financial data accuracy        | Verify 20 financial records              | 100% match on amounts            |

---

## 9. Common Migration Pitfalls

| Pitfall                            | Description                                    | Prevention                        |
|------------------------------------|------------------------------------------------|-----------------------------------|
| Encoding issues                    | Arabic text corrupted during export/import      | Always use UTF-8, test with sample |
| Date format confusion              | Hijri/Gregorian mixing, DD/MM vs MM/DD          | Standardize to YYYY-MM-DD Gregorian |
| Duplicate customers                | Same customer entered with different name spellings | Pre-import deduplication          |
| Orphaned vehicles                  | Vehicles without linked customer records        | Import customers before vehicles  |
| Missing VAT numbers               | Corporate customers without ZATCA-valid VAT     | Collect before import for B2B     |
| Incorrect inventory counts         | System quantities do not match physical stock   | Physical count at migration date  |
| Historical pricing issues          | Old prices imported as current prices           | Clearly separate historical from current |
| Incomplete service history         | Gaps in service records creating confusion      | Mark imported history as "Legacy" |
| User resistance                    | Staff reluctant to learn new system             | Training program before migration |
| Overambitious scope                | Trying to import everything at once             | Phase the migration, start with essentials |
| No rollback plan                   | Inability to revert if migration fails          | Always maintain legacy access during parallel run |
| Insufficient testing               | Going live without adequate validation          | Complete all validation checklists |

---

## 10. Rollback Procedures

### 10.1 Rollback Decision Criteria

A rollback to the legacy system should be considered if:

| Criterion                          | Threshold                                     |
|------------------------------------|------------------------------------------------|
| Data accuracy below acceptable     | Post-import accuracy < 90%                     |
| Critical workflow failure          | Unable to complete Check-In to Delivery cycle  |
| Financial discrepancy              | Daily revenue variance > 5%                    |
| Staff inability                    | > 50% of staff unable to complete basic tasks  |
| Customer impact                    | Customer complaints about service delays > 20% increase |
| System availability                | SALIS AUTO uptime < 95% during parallel run    |

### 10.2 Rollback Steps

If rollback is triggered: (1) Owner approves decision, (2) announce to all staff immediately, (3) resume legacy system within 1 hour, (4) export SALIS AUTO data within 4 hours, (5) enter SALIS AUTO-only transactions into legacy within 24 hours, (6) conduct root cause analysis within 1 week, (7) develop remediation plan within 2 weeks, (8) schedule re-migration attempt.

---

## 11. Document References

- [Getting Started Guide](../../user-documentation/guides/getting-started.md) -- Post-migration system setup and orientation
- [Data Dictionary](../reference/data-dictionary.md) -- Complete field definitions for all importable entities
- [Security Architecture](../../system/security/security-architecture.md) -- Security considerations during data migration
- [Data Protection](../../system/security/data-protection.md) -- Data handling requirements during migration
- [Compliance Requirements](../../requirements/non-functional/compliance.md) -- ZATCA and regulatory data retention requirements

---

*End of Document -- SA-KB-LIB-014*
