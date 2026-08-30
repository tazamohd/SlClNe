# API Cookbook

Common API usage patterns for SALIS AUTO with curl examples. All examples assume the server is running at `http://localhost:4000` and use JSON format.

---

## Authentication

### Login

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@salis.demo",
    "password": "salis1234"
  }'
```

**Response (200):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "a1b2c3d4e5f6...",
  "user": {
    "id": "01HYX3N2K5P8M7Q4R6T9W0V1",
    "email": "manager@salis.demo",
    "name": "Ahmad Al-Rashid",
    "ar": "أحمد الراشد",
    "role": "manager",
    "scope": "branch",
    "orgId": "01HYX3N2K5P8M7Q4R6T9W0V2",
    "branchId": "01HYX3N2K5P8M7Q4R6T9W0V3",
    "roleLabel": "Branch Manager",
    "approvalLimit": 50000,
    "destination": "/dashboard"
  }
}
```

### Refresh Token

```bash
curl -X POST http://localhost:4000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "a1b2c3d4e5f6..."
  }'
```

Returns the same shape as login. The used refresh token is revoked and a new pair is issued.

### Logout

```bash
curl -X POST http://localhost:4000/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "a1b2c3d4e5f6..."
  }'
```

**Response:** `204 No Content`

### Get Current User

```bash
curl http://localhost:4000/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

**Response (200):**

```json
{
  "user": { "id": "...", "name": "...", "role": "manager", ... }
}
```

---

## Listing with Pagination

All collection endpoints support pagination via `page` and `pageSize` query parameters.

### Basic List

```bash
curl http://localhost:4000/jobs \
  -H "Authorization: Bearer $TOKEN"
```

Returns a bare JSON array of the first 50 rows (default `pageSize`).

### Paginated List

```bash
curl "http://localhost:4000/jobs?page=2&pageSize=20" \
  -H "Authorization: Bearer $TOKEN"
```

Returns rows 21-40.

### Pagination Parameters

| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `page` | integer | 1 | >= 1 | Page number |
| `pageSize` | integer | 50 | 1-200 | Rows per page |

---

## Sorting

Use the `sort` parameter with the format `field:direction`.

### Sort by Amount Descending

```bash
curl "http://localhost:4000/invoices?sort=totalHalalas:desc" \
  -H "Authorization: Bearer $TOKEN"
```

### Sort by Date Ascending

```bash
curl "http://localhost:4000/appointments?sort=scheduledDate:asc" \
  -H "Authorization: Bearer $TOKEN"
```

### Valid Directions

- `asc` — Ascending (A-Z, oldest first, smallest first)
- `desc` — Descending (Z-A, newest first, largest first)

---

## Searching

Use the `q` parameter for free-text search. The server performs case-insensitive `ILIKE %q%` on designated searchable columns.

### Search Customers by Name

```bash
curl "http://localhost:4000/customers?q=toyota" \
  -H "Authorization: Bearer $TOKEN"
```

Searches across the `name` and `phone` columns for customers.

### Search Parts by SKU

```bash
curl "http://localhost:4000/inventory?q=BRK-PAD" \
  -H "Authorization: Bearer $TOKEN"
```

Searches across `name` and `sku` columns.

### Searchable Columns per Collection

| Endpoint | Searchable Columns |
|----------|-------------------|
| `/jobs` | id, customer name, vehicle label |
| `/appointments` | customer name, vehicle label, plate, technician name |
| `/estimates` | id, customer name, vehicle label |
| `/invoices` | id, customer name |
| `/receipts` | id, customer name, invoice code |
| `/customers` | name, phone |
| `/vehicles` | plate, make_model, owner name |
| `/inventory` | name, sku |
| `/technicians` | name, specialty |
| `/crm/leads` | name, company |
| `/crm/opportunities` | name, company, owner name |
| `/accounting/coa` | code, name, type |
| `/accounting/journal-entries` | id, ref, narration |
| `/accounting/expenses` | id, category, vendor |

**Note:** The `q` parameter is limited to 200 characters.

---

## Filtering

Use `filter[field]` for exact-match filtering on any returned column.

### Filter by Status

```bash
curl "http://localhost:4000/jobs?filter[status]=in_progress" \
  -H "Authorization: Bearer $TOKEN"
```

### Filter by Branch

```bash
curl "http://localhost:4000/jobs?filter[branchId]=01HYX3N2K5P8M7Q4R6T9W0V3" \
  -H "Authorization: Bearer $TOKEN"
```

### Filter by Priority

```bash
curl "http://localhost:4000/jobs?filter[priority]=urgent" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Combining Query Parameters

Query parameters can be combined freely.

### Search, Filter, Sort, and Paginate

```bash
curl "http://localhost:4000/invoices?q=ahmed&filter[status]=paid&sort=totalHalalas:desc&page=1&pageSize=20" \
  -H "Authorization: Bearer $TOKEN"
```

This searches for invoices matching "ahmed" with status "paid", sorted by amount descending, returning the first 20 results.

---

## Getting a Single Record

Detail endpoints return a single JSON object (not an array).

### Get Job Card by ID

```bash
curl http://localhost:4000/jobs/01HYX3N2K5P8M7Q4R6T9W0V1 \
  -H "Authorization: Bearer $TOKEN"
```

**Response (200):**

```json
{
  "id": "01HYX3N2K5P8M7Q4R6T9W0V1",
  "code": "A3F8B2C1",
  "customerName": "Ahmad Al-Rashid",
  "vehicleLabel": "Toyota Camry 2023",
  "service": "maintenance",
  "status": "in_progress",
  "stage": "repair",
  "priority": "medium",
  "assignedTechId": "01HYX3N2K5P8M7Q4R6T9W0V4",
  "complaint": "Engine noise when accelerating",
  "orgId": "01HYX3N2K5P8M7Q4R6T9W0V2",
  "branchId": "01HYX3N2K5P8M7Q4R6T9W0V3",
  "createdAt": "2026-08-15T10:30:00.000Z",
  "version": 3
}
```

### Available Detail Endpoints

| Path | Returns |
|------|---------|
| `GET /jobs/:id` | Job card detail |
| `GET /estimates/:id` | Estimate with lines |
| `GET /invoices/:id` | Invoice with lines and payments |
| `GET /receipts/:id` | Receipt detail |
| `GET /accounting/coa/:id` | Account detail |
| `GET /accounting/journal-entries/:id` | Journal entry detail |
| `GET /accounting/expenses/:id` | Expense detail |
| `GET /kb/procedures/:id` | Knowledge base procedure detail |

---

## Response Format

### Lists

List endpoints return a **bare JSON array**:

```json
[
  { "id": "...", "name": "...", ... },
  { "id": "...", "name": "...", ... }
]
```

### Detail

Detail endpoints return a **single JSON object**:

```json
{ "id": "...", "name": "...", ... }
```

### Empty Lists

An empty list returns an empty array: `[]`

---

## Error Handling

### Parsing the Error Envelope

All errors follow the same format:

```json
{
  "error": {
    "code": "forbidden",
    "message": "Your role does not have permission to edit invoices",
    "field": null
  }
}
```

### Example: Handling a 401

```bash
# This will fail if the token is expired
curl http://localhost:4000/jobs \
  -H "Authorization: Bearer expired-token"

# Response: 401
# { "error": { "code": "unauthorized", "message": "Token expired" } }

# Fix: refresh the token
curl -X POST http://localhost:4000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{ "refreshToken": "valid-refresh-token" }'
```

### Example: Handling a 422

```bash
# Attempt to transfer stock to another org's branch
curl -X POST http://localhost:4000/parts/01HYX.../movements \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "transfer",
    "qty": 5,
    "toBranchId": "01OTHER_ORG_BRANCH"
  }'

# Response: 422
# { "error": { "code": "rule_violated", "message": "Transfer target branch does not belong to this organization", "field": "toBranchId" } }
```

---

## Working with Money

All monetary values in the API are integer halalas. To display as SAR:

```
Display value = API value / 100
```

### Examples

| API Value (halalas) | Display (SAR) |
|--------------------|---------------|
| `150000` | `SAR 1,500.00` |
| `7550` | `SAR 75.50` |
| `100` | `SAR 1.00` |
| `0` | `SAR 0.00` |

### In JavaScript

```javascript
// API returns halalas
const totalHalalas = response.totalHalalas // 150000

// Convert for display
const sarAmount = totalHalalas / 100 // 1500.00
const formatted = new Intl.NumberFormat('en-SA', {
  style: 'currency',
  currency: 'SAR'
}).format(sarAmount) // "SAR 1,500.00"
```

### In Request Bodies

When sending money values, convert SAR to halalas:

```bash
# Create a part priced at SAR 150.00
curl -X POST http://localhost:4000/inventory \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Brake Pad Set",
    "sku": "BRK-PAD-001",
    "priceHalalas": 15000,
    "onHand": 50,
    "reorderLevel": 10
  }'
```

---

## CSV Export

Request data in CSV format by setting the `Accept` header:

```bash
curl "http://localhost:4000/invoices?filter[status]=paid&sort=issuedAt:desc" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: text/csv" \
  -o invoices.csv
```

### CSV Notes

- Maximum 50,000 rows per export.
- Formula injection protection: cells starting with `=`, `+`, `-`, `@`, `\t`, `\r` are prefixed with `'`.
- UTF-8 encoding with BOM for Arabic support.
- Money columns remain in halalas (integer) in the CSV.

---

## Health Check

No authentication required:

```bash
curl http://localhost:4000/health
```

**Response (200):**

```json
{ "status": "ok" }
```

Use this to verify the server is running and reachable.

---

## Idempotency

For write operations, include an `Idempotency-Key` header to prevent duplicate effects:

```bash
curl -X POST http://localhost:4000/payments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: pay-inv-001-2026-08-30" \
  -d '{
    "invoiceId": "01HYX...",
    "paidOn": "2026-08-30",
    "method": "card",
    "amountHalalas": 150000
  }'
```

If the same `Idempotency-Key` is sent again with the same request body, the server returns the stored response. A different body with the same key is rejected.

---

## See Also

- [Error Codes](../troubleshooting/error-codes.md) — Complete error reference
- [Data Dictionary](./data-dictionary.md) — Table schemas
- [Configuration Reference](./configuration-reference.md) — Environment variables
