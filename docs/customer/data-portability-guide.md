# SALIS AUTO -- Data Portability Guide

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-CST-003                   |
| Version        | 1.0                          |
| Date           | 2026-09-02                   |
| Author         | SALIS AUTO PMO               |
| Status         | Approved                     |
| Classification | Public                       |

---

## 1. Introduction

Your data belongs to you. SALIS AUTO is built on the principle that you should always be able to access, export, and manage the information you store on our platform. This guide explains how to export your data, import data from other systems, and exercise your rights under the Saudi Personal Data Protection Law (PDPL).

---

## 2. Your Data Rights Under PDPL

The Saudi Personal Data Protection Law (PDPL) grants you specific rights over your personal data. SALIS AUTO supports all of these rights:

| Right                      | What It Means                                              | How to Exercise It                     |
|----------------------------|------------------------------------------------------------|----------------------------------------|
| Right to access (Art. 4)   | You can request a copy of all personal data we hold        | Self-service export or support request |
| Right to correction (Art. 5) | You can correct inaccurate personal data               | Edit your profile, or contact support  |
| Right to portability (Art. 6) | You can receive your data in a machine-readable format | Export as JSON (see Section 4)         |
| Right to restrict (Art. 7) | You can request we pause processing your data              | Contact support                        |
| Right to erasure (Art. 8)  | You can request deletion of your personal data             | See Section 8                          |
| Right to object (Art. 9)   | You can object to data processing for specific purposes    | Contact support or adjust in-app settings |

To exercise any of these rights, you may contact us at privacy@salisauto.sa or submit a request through your account settings.

---

## 3. Available Export Formats

SALIS AUTO supports multiple export formats to meet different needs:

| Format | Best For                                  | Available For              |
|--------|-------------------------------------------|----------------------------|
| CSV    | Opening in spreadsheets (Excel, Google Sheets), data analysis | All list-based data       |
| JSON   | Machine-readable format for system integrations and data portability | All data categories       |
| PDF    | Printed reports, official records, sharing with stakeholders | Invoices, reports, statements |

All exports include headers and field labels in the language you are currently using (English or Arabic).

---

## 4. Exporting Data by Category

### 4.1 Customers

Export your customer database including contact details, vehicle associations, and service history.

1. Navigate to **Registry > Customers**
2. (Optional) Use filters to narrow the list
3. Click the **Export** button above the data table
4. Select your format: CSV, JSON, or PDF
5. Click **Download**

**Fields included:** Customer name, phone number, email, address, registered vehicles, total visits, total spend, account creation date.

### 4.2 Vehicles

Export vehicle records with service history and inspection data.

1. Navigate to **Registry > Vehicles**
2. Apply any desired filters (make, model, year, status)
3. Click **Export** and select your format
4. Click **Download**

**Fields included:** Plate number, VIN, make, model, year, color, owner name, registration date, last service date, total job cards.

### 4.3 Job Cards

Export workshop job card records with service details.

1. Navigate to **Workshop > Job Cards**
2. Filter by date range, status, branch, or technician as needed
3. Click **Export** and select your format
4. Click **Download**

**Fields included:** Job card number, vehicle, customer, check-in date, service type, assigned technician, status, completion date, total cost.

### 4.4 Invoices

Export invoices with full line-item detail and ZATCA compliance data.

1. Navigate to **Finance > Invoices**
2. Filter by date range, status, or customer
3. Click **Export** and select your format
4. Click **Download**

**Fields included:** Invoice number, date, customer, line items, subtotal, VAT amount, total, payment status, ZATCA submission status.

Individual invoices can also be downloaded as PDF with QR code from the invoice detail screen.

### 4.5 Inventory

Export your parts catalog and stock levels.

1. Navigate to **Parts & Inventory > Parts Catalog**
2. Apply filters if needed (category, stock status, supplier)
3. Click **Export** and select your format
4. Click **Download**

**Fields included:** Part number, name, category, current stock, minimum stock, reorder level, unit cost, supplier, last restocked date.

### 4.6 Financial Reports

Export pre-built and custom financial reports.

1. Navigate to **Reports > Financial Reports** (or any report section)
2. Select the report you want to export
3. Set the date range and any filters
4. Click the **Export** button on the report toolbar
5. Choose CSV or PDF

**Available reports:** Revenue summary, expense breakdown, profit and loss, cash flow, balance sheet, income statement, trial balance, aging reports.

### Export Limits

| Plan          | Maximum Rows per Export | Bulk Export |
|---------------|------------------------|-------------|
| Starter       | 10,000 rows            | --          |
| Professional  | 50,000 rows            | Available   |
| Enterprise    | Unlimited              | Available   |

For exports exceeding the row limit, use date-range filters to split your export into smaller batches.

---

## 5. Bulk Export via API

Professional and Enterprise plan subscribers can export data programmatically using the SALIS AUTO API.

### 5.1 Setting Up API Access

1. Navigate to **Settings > Integrations > API Access**
2. Click **Generate API Key**
3. Give your key a descriptive name (e.g., "Monthly data backup")
4. Copy and store the key securely -- it will only be shown once
5. Set permissions for the key (read-only recommended for exports)

### 5.2 Using the API for Export

The API provides endpoints for each data category:

| Endpoint                    | Data Returned                              |
|-----------------------------|--------------------------------------------|
| `GET /api/v1/customers`     | Customer records with pagination           |
| `GET /api/v1/vehicles`      | Vehicle records with pagination            |
| `GET /api/v1/job-cards`     | Job card records with pagination           |
| `GET /api/v1/invoices`      | Invoice records with pagination            |
| `GET /api/v1/inventory`     | Parts and stock levels with pagination     |
| `GET /api/v1/reports/{type}`| Financial report data                      |

All API responses are in JSON format. Use query parameters to filter by date range, status, or other fields. Results are paginated with a default page size of 100 records.

### 5.3 API Rate Limits

| Plan          | Requests per Minute | Daily Limit   |
|---------------|---------------------|---------------|
| Professional  | 60                  | 10,000        |
| Enterprise    | 300                 | Unlimited     |

Full API documentation is available at [api.salisauto.sa/docs](https://api.salisauto.sa/docs).

---

## 6. Importing Data

If you are migrating from another system, SALIS AUTO supports data import to get you up and running quickly.

### 6.1 Supported Import Formats

| Format | Supported For                                          |
|--------|--------------------------------------------------------|
| CSV    | Customers, vehicles, parts catalog, price lists        |
| JSON   | All data categories                                    |
| Excel  | Customers, vehicles, parts catalog (converted to CSV)  |

### 6.2 Import Process

1. Navigate to **Settings > Data Management > Import**
2. Select the data category you want to import
3. Download the **import template** for that category (pre-formatted CSV or JSON with required fields)
4. Fill in the template with your data
5. Upload the completed file
6. Review the **field mapping** screen -- the system matches your columns to SALIS AUTO fields
7. Correct any mapping issues highlighted in yellow
8. Click **Validate** to check your data for errors
9. Review the validation report:
   - Green rows will be imported
   - Red rows have errors that need fixing (duplicate records, missing required fields, invalid formats)
10. Click **Import** to proceed with valid records
11. Download the error report for any rows that could not be imported

### 6.3 Import Validation Rules

The system validates your data before import:

| Validation                   | Rule                                              |
|------------------------------|---------------------------------------------------|
| Required fields              | Name and phone for customers; plate for vehicles  |
| Phone format                 | Saudi mobile format (05XXXXXXXX) required         |
| Duplicate detection          | Matches on phone number (customers) or plate (vehicles) |
| VIN format                   | 17-character alphanumeric when provided           |
| Part number uniqueness       | No duplicate part numbers within your organization|
| Date format                  | YYYY-MM-DD or DD/MM/YYYY accepted                 |

### 6.4 Migration Assistance

For large or complex migrations, our implementation team can assist:

| Service                      | What Is Included                                   |
|------------------------------|---------------------------------------------------|
| Basic migration              | Template preparation, data mapping, import execution |
| Complex migration            | Data cleansing, deduplication, custom field mapping, historical data |
| Full migration               | End-to-end migration from your previous system with validation |

Contact sales@salisauto.sa to discuss migration support for your workshop.

---

## 7. Data Retention

### 7.1 While Your Account Is Active

All your data is stored securely and available to you for as long as your subscription is active.

### 7.2 After Account Closure

When you cancel your subscription, data is retained according to the following schedule:

| Data Category          | Retention After Closure | Reason                                    |
|------------------------|------------------------|-------------------------------------------|
| Financial records      | 7 years                | Saudi tax law and ZATCA requirements      |
| E-invoice XML files    | 7 years                | ZATCA Phase 2 record retention mandate    |
| VAT return data        | 7 years                | ZATCA regulatory requirement              |
| Customer personal data | 90 days                | Grace period for reactivation             |
| Vehicle records        | 90 days                | Grace period for reactivation             |
| Job card history       | 90 days                | Grace period for reactivation             |
| Parts and inventory    | 90 days                | Grace period for reactivation             |
| User accounts          | 90 days                | Grace period for reactivation             |

After the retention period, data is permanently deleted and cannot be recovered.

**Important:** We strongly recommend exporting all data you may need before canceling your account. See [Account Management Guide](account-management-guide.md) for cancellation steps.

### 7.3 Data Export After Cancellation

You have 30 days after account closure to request a data export. Contact support@salisauto.sa with your organization name and the email address used for your account.

---

## 8. Requesting Data Deletion

Under PDPL Article 8, you have the right to request deletion of your personal data, subject to legal retention requirements.

### 8.1 What Can Be Deleted

| Data Type                | Can Be Deleted? | Notes                                    |
|--------------------------|-----------------|------------------------------------------|
| Personal profile data    | Yes             | Name, phone, email, address              |
| Marketing preferences    | Yes             | Immediate upon request                   |
| Service history          | Partially       | Personal identifiers removed; anonymized records retained |
| Financial records        | No              | Retained for 7 years per Saudi tax law   |
| E-invoice records        | No              | Retained for 7 years per ZATCA mandate   |
| Audit log entries        | No              | Immutable for compliance                 |

### 8.2 How to Request Deletion

1. Log in to your SALIS AUTO account
2. Navigate to **Profile > Privacy Settings**
3. Click **Request Data Deletion**
4. Select the categories of data you want deleted
5. Confirm your request

Alternatively, send an email to privacy@salisauto.sa with the subject line "Data Deletion Request" and include:
- Your full name
- Your registered email address
- The specific data you want deleted

### 8.3 Processing Timeline

| Step                     | Timeline                              |
|--------------------------|---------------------------------------|
| Acknowledgment           | Within 2 business days                |
| Identity verification    | Within 5 business days                |
| Deletion execution       | Within 30 days of verified request    |
| Confirmation             | Email confirmation upon completion    |

Data that is subject to legal retention (financial records, ZATCA invoices) will be retained for the mandated period and then automatically deleted.

---

## 9. Data Portability to Other Systems

If you decide to move to another workshop management system, SALIS AUTO makes it straightforward:

1. **Export all data** using the category-by-category export described in Section 4, or use the API for a bulk export (Section 5)
2. **Download invoices** as PDF files from the Finance section for your records
3. **Export financial reports** for the full period of your subscription
4. **Request a complete data package** by emailing support@salisauto.sa -- we will prepare a comprehensive JSON export of all your data within 10 business days

The JSON export follows standard data structures that most modern workshop management systems can import. If your new provider needs data in a specific format, our support team can assist with format conversion.

---

## 10. Data Security During Export

All data exports are protected:

- **Encrypted transfer**: Downloads use HTTPS encryption
- **Access control**: Only users with the Export permission for the relevant module can perform exports
- **Audit trail**: Every export action is recorded in the audit log with the user, timestamp, and data category
- **CSV protection**: CSV exports include formula injection protection to prevent security risks when opening in spreadsheet applications
- **Sensitive field handling**: Certain sensitive fields (e.g., employee salary data) are excluded from exports unless the requesting user has the appropriate role

---

## 11. Frequently Asked Questions

**Q: How long does a data export take?**
A: Small exports (under 1,000 records) download immediately. Larger exports may take a few minutes to prepare. You will receive a notification when your export is ready.

**Q: Can I schedule automatic exports?**
A: Scheduled exports are available on Professional and Enterprise plans through the custom report builder. API-based exports can also be automated using your own scheduling tools.

**Q: What happens if I import duplicate records?**
A: The import system detects duplicates based on key fields (phone number for customers, plate number for vehicles). Duplicates are flagged during validation, and you can choose to skip or update existing records.

**Q: Can I import data from a specific competitor system?**
A: SALIS AUTO accepts standard CSV and JSON formats. If your previous system can export in either format, you can import that data. For systems with proprietary formats, contact our migration team for assistance.

**Q: Is there a cost for data export?**
A: No. Self-service data exports are included in all subscription plans at no additional cost. API-based exports require a plan that includes API access (Professional or Enterprise).

---

## 12. Related Resources

- [Account Management Guide](account-management-guide.md) -- Subscription management and cancellation
- [Release Notes](release-notes.md) -- Latest platform updates
- [System Status Guide](system-status-guide.md) -- Check platform health
- [Getting Started Guide](../user-documentation/guides/getting-started.md) -- First-time setup

---

*For questions about data portability or to exercise your PDPL rights, contact privacy@salisauto.sa. Our Data Protection Officer can be reached at dpo@salisauto.sa.*
