# SALIS AUTO -- Load Testing Plan

| Field          | Value                        |
|----------------|------------------------------|
| Document ID    | SA-TST-002                   |
| Version        | 1.0                          |
| Date           | 2026-09-02                   |
| Author         | SALIS AUTO PMO               |
| Status         | Approved                     |
| Classification | Internal -- Confidential     |

---

## 1. Purpose

This document defines the load testing methodology for the SALIS AUTO platform, covering tool selection, test environments, baseline performance targets, test scenarios, multi-tenant isolation validation, and results reporting. Load tests validate that the system meets the performance requirements defined in [Performance Requirements](../requirements/non-functional/performance.md) under realistic and stressed conditions for Saudi automotive workshop operations.

**Related documents:**
- [Test Plan](../project-management/planning/test-plan.md)
- [Testing Strategy](../system/testing-strategy.md)
- [Performance Requirements](../requirements/non-functional/performance.md)
- [UAT Test Scripts](uat-test-scripts.md)

---

## 2. Tools and Infrastructure

### 2.1 Primary Tool: k6 (Grafana k6)

| Attribute | Value |
|-----------|-------|
| Tool | k6 v0.50+ |
| Language | JavaScript/TypeScript test scripts |
| Execution | CLI (local) and k6 Cloud (distributed) |
| Output | JSON, CSV, InfluxDB, Grafana dashboards |
| CI Integration | GitHub Actions with k6 action |

**Rationale:** k6 is selected for its JavaScript scripting model (consistent with the project's TypeScript stack), built-in HTTP/2 support, threshold-based pass/fail, and native Grafana integration for real-time dashboards.

### 2.2 Secondary Tool: Artillery (Supplemental)

Artillery is used for WebSocket load testing and scenario-driven tests that benefit from its YAML configuration model. Used for notification delivery and real-time service tracking load.

### 2.3 Frontend Performance: Lighthouse CI

Lighthouse CI runs automated audits against staging to measure Core Web Vitals (LCP, FID, CLS) and performance scores under load conditions.

### 2.4 Monitoring Stack

| Component | Tool | Purpose |
|-----------|------|---------|
| API metrics | Grafana + Prometheus | Request rate, latency percentiles, error rate |
| Database | pg_stat_statements | Query duration, call frequency, rows returned |
| Application | Node.js process metrics | Event loop lag, heap usage, GC pauses |
| Infrastructure | Cloud provider dashboards | CPU, memory, network, disk I/O |

---

## 3. Test Environment

### 3.1 Environment Specification

| Component | Staging Configuration |
|-----------|----------------------|
| Frontend | Vite production build served via CDN |
| Backend | Express/Fastify on 2 instances (2 vCPU, 4GB RAM each) |
| Database | PostgreSQL 16 (4 vCPU, 16GB RAM, 100GB SSD) |
| Connection pool | 20 connections per instance |
| External services | ZATCA sandbox, SMS mock, payment gateway mock |
| Load generators | k6 Cloud or 2 dedicated VMs (4 vCPU, 8GB RAM) |

### 3.2 Environment Isolation

- Load tests run on a dedicated staging environment, never on production.
- The staging database is seeded with synthetic data matching production volume (Section 6).
- External service mocks (ZATCA, SMS, payment) respond with realistic latency (50-200ms).
- Load test runs are scheduled during off-hours or on an isolated environment to avoid interference with QA testing.

### 3.3 Pre-Test Checklist

- [ ] Staging environment deployed with latest release candidate
- [ ] Database seeded with synthetic data (Section 6)
- [ ] External service mocks verified operational
- [ ] Monitoring dashboards configured and recording
- [ ] Previous test results archived for comparison
- [ ] Connection pool sizes match production configuration

---

## 4. Baseline Performance Targets

### 4.1 API Response Time Targets

| Metric | Target | Maximum | Failure Threshold |
|--------|--------|---------|-------------------|
| p50 response time | < 100ms | 200ms | > 200ms |
| p95 response time | < 300ms | 500ms | > 500ms |
| p99 response time | < 500ms | 1000ms | > 1000ms |
| Error rate | < 0.1% | 0.5% | > 1% |

### 4.2 Frontend Performance Targets

| Metric | Target | Maximum | Failure Threshold |
|--------|--------|---------|-------------------|
| Initial page load (LCP) | < 2s | 3s | > 3s |
| Client-side navigation | < 500ms | 1s | > 1s |
| Time to Interactive | < 3s | 5s | > 5s |
| Lighthouse performance score | >= 80 | 70 | < 70 |

### 4.3 Throughput Targets (Business Tier)

| Metric | Target | Failure Threshold |
|--------|--------|-------------------|
| Concurrent users | 100 | Degradation at 80 |
| API requests/minute | 2,000 | < 1,500 |
| WebSocket connections | 100 | < 80 |
| Database queries/second | 500 | < 400 |

---

## 5. Test Scenarios

### 5.1 Scenario 1: Normal Load

**Objective:** Validate system performance under typical daily usage.

| Parameter | Value |
|-----------|-------|
| Virtual users | 50 concurrent |
| Ramp-up | 5 minutes (10 VUs/min) |
| Steady state | 30 minutes |
| Ramp-down | 5 minutes |
| Total duration | 40 minutes |

**User profile mix:**

| Role | Percentage | Primary actions |
|------|------------|-----------------|
| Service Advisor | 25% | Job card CRUD, transitions, estimates |
| Technician | 20% | View assigned jobs, update repair status |
| Receptionist | 15% | Customer lookup, check-in, appointments |
| Accountant | 10% | Invoice creation, ZATCA submission, payments |
| Manager | 10% | Dashboard, reports, approvals |
| Storekeeper | 10% | Inventory lookup, PO creation |
| Customer | 10% | Customer app: booking, service tracking |

**Pass criteria:** All p95 targets met. Error rate < 0.1%.

### 5.2 Scenario 2: Peak Load (3x)

**Objective:** Validate system under workshop peak hours (8:00-10:00 AM service drop-off).

| Parameter | Value |
|-----------|-------|
| Virtual users | 150 concurrent (3x normal) |
| Ramp-up | 3 minutes (50 VUs/min) |
| Steady state | 20 minutes |
| Ramp-down | 5 minutes |
| Total duration | 28 minutes |

**Additional write-heavy profile:**

| Action | Multiplier |
|--------|------------|
| Vehicle check-ins | 5x normal rate |
| Job card creation | 3x normal rate |
| Appointment booking | 3x normal rate |
| Customer registration | 2x normal rate |

**Pass criteria:** p95 < 500ms for CRUD operations. p95 < 2000ms for reports. Error rate < 0.5%.

### 5.3 Scenario 3: Stress Test

**Objective:** Find the system's breaking point and observe degradation behavior.

| Parameter | Value |
|-----------|-------|
| Virtual users | Ramp from 50 to 500 over 30 minutes |
| Step increase | +50 VUs every 3 minutes |
| Hold at each step | 3 minutes |
| Total duration | 30 minutes |

**Measurements at each step:**
- API response time percentiles (p50, p95, p99)
- Error rate
- Database connection pool utilization
- CPU and memory usage
- Event loop lag (Node.js)

**Pass criteria:** Identify the VU count where p95 exceeds 1 second. System must not crash. Error rate must not exceed 5% at any point. Graceful degradation (HTTP 429 rate limiting) preferred over 5xx errors.

### 5.4 Scenario 4: Soak Test (24-Hour Endurance)

**Objective:** Detect memory leaks, connection pool exhaustion, and performance degradation over extended operation.

| Parameter | Value |
|-----------|-------|
| Virtual users | 30 concurrent (light but sustained) |
| Duration | 24 hours |
| Measurement interval | Every 5 minutes |

**Monitoring focus:**

| Metric | Acceptable Drift |
|--------|-----------------|
| Heap memory (Node.js) | < 10% growth over 24 hours |
| p95 response time | < 20% increase from hour 1 to hour 24 |
| Database connections | Stable (no leak) |
| Error rate | < 0.1% throughout |
| Disk usage | Predictable growth only (logs, audit) |

**Pass criteria:** No memory leaks. Response times stable. No connection pool exhaustion.

### 5.5 Scenario 5: Spike Test

**Objective:** Validate recovery from sudden load spikes.

| Parameter | Value |
|-----------|-------|
| Baseline VUs | 30 |
| Spike VUs | 200 (instantaneous) |
| Spike duration | 5 minutes |
| Recovery period | 10 minutes |
| Total duration | 25 minutes |

**Pass criteria:** System recovers to baseline p95 within 5 minutes of spike end. No data loss during spike.

---

## 6. Data Setup for Multi-Tenant Testing

### 6.1 Synthetic Data Volume

| Entity | Records per Org | Total (10 orgs) |
|--------|----------------|-----------------|
| Organizations | 1 | 10 |
| Branches | 3 | 30 |
| Users | 50 | 500 |
| Customers | 2,000 | 20,000 |
| Vehicles | 3,000 | 30,000 |
| Job cards | 10,000 | 100,000 |
| Invoices | 8,000 | 80,000 |
| Parts | 500 | 5,000 |
| Purchase orders | 1,000 | 10,000 |
| Audit log entries | 50,000 | 500,000 |

### 6.2 Multi-Tenant Isolation Tests

Each load test scenario includes tenant isolation validation:

1. **Cross-org query test:** VUs for Org A make API calls; response data is validated to contain zero records with a different `org_id`.
2. **Cross-branch scope test:** Manager VUs query data; results validated to contain only their assigned `branch_id`.
3. **Concurrent tenant writes:** Two orgs perform simultaneous writes to the same table; verify no data crossover.
4. **Tenant under load:** Org A at peak load; measure response time impact on Org B (must be < 10% degradation).

### 6.3 Data Generation Script

```javascript
// k6-data-seed.js (outline)
import { generateULID } from './utils.js';

export function seedOrganization(orgIndex) {
  const orgId = generateULID();
  const branches = Array.from({ length: 3 }, (_, i) => ({
    id: generateULID(),
    orgId,
    name: `Branch ${orgIndex}-${i}`,
    city: ['Riyadh', 'Jeddah', 'Dammam'][i],
  }));
  // Generate users (14 roles per branch), customers, vehicles, job cards...
  return { orgId, branches, users: [], customers: [], vehicles: [] };
}
```

---

## 7. Key Endpoints to Test Per Domain

### 7.1 Workshop (Operations)

| Endpoint | Method | Load Priority |
|----------|--------|---------------|
| `/api/v1/job-cards` | GET (list) | High |
| `/api/v1/job-cards` | POST (create) | High |
| `/api/v1/job-cards/:id/transition` | POST | Critical |
| `/api/v1/appointments` | GET (list) | Medium |
| `/api/v1/appointments` | POST (create) | Medium |
| `/api/v1/estimates` | POST (create) | High |

### 7.2 Registry

| Endpoint | Method | Load Priority |
|----------|--------|---------------|
| `/api/v1/customers` | GET (list + search) | High |
| `/api/v1/customers` | POST (create) | Medium |
| `/api/v1/vehicles` | GET (list) | High |
| `/api/v1/vehicles` | POST (create) | Medium |

### 7.3 Finance

| Endpoint | Method | Load Priority |
|----------|--------|---------------|
| `/api/v1/invoices` | GET (list) | High |
| `/api/v1/invoices` | POST (create) | High |
| `/api/v1/invoices/:id/zatca` | POST (submit) | Critical |
| `/api/v1/payments` | POST (create) | Medium |

### 7.4 Accounting

| Endpoint | Method | Load Priority |
|----------|--------|---------------|
| `/api/v1/accounting/coa` | GET (tree) | Medium |
| `/api/v1/accounting/journal-entries` | POST | Medium |
| `/api/v1/accounting/expenses` | GET (list) | Medium |

### 7.5 Administration

| Endpoint | Method | Load Priority |
|----------|--------|---------------|
| `/api/v1/auth/login` | POST | Critical |
| `/api/v1/auth/refresh` | POST | Critical |
| `/api/v1/users` | GET (list) | Low |
| `/api/v1/audit-log` | GET (list) | Medium |

### 7.6 Parts & Inventory

| Endpoint | Method | Load Priority |
|----------|--------|---------------|
| `/api/v1/inventory` | GET (list + search) | High |
| `/api/v1/purchase-orders` | POST (create) | Medium |
| `/api/v1/purchase-orders/:id/approve` | POST | Medium |

### 7.7 Reports & Analytics

| Endpoint | Method | Load Priority |
|----------|--------|---------------|
| `/api/v1/reports/workshop-summary` | GET | Medium |
| `/api/v1/reports/financial-summary` | GET | Medium |
| `/api/v1/export/csv` | GET | Low (rate-limited) |

---

## 8. k6 Test Script Structure

### 8.1 Example: Normal Load Scenario

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const jobCardLatency = new Trend('job_card_latency');

export const options = {
  stages: [
    { duration: '5m', target: 50 },   // ramp up
    { duration: '30m', target: 50 },  // steady state
    { duration: '5m', target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(50)<200', 'p(95)<500'],
    errors: ['rate<0.001'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://staging.salisauto.com';

export default function () {
  // Authenticate
  const loginRes = http.post(`${BASE_URL}/api/v1/auth/login`, JSON.stringify({
    email: `advisor-${__VU}@test.sa`,
    password: 'TestPassword123',
  }), { headers: { 'Content-Type': 'application/json' } });

  check(loginRes, { 'login success': (r) => r.status === 200 });
  const token = loginRes.json('accessToken');

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // List job cards
  const listRes = http.get(`${BASE_URL}/api/v1/job-cards?page=1&limit=20`, { headers });
  jobCardLatency.add(listRes.timings.duration);
  check(listRes, { 'job cards listed': (r) => r.status === 200 });
  errorRate.add(listRes.status !== 200);

  sleep(Math.random() * 3 + 1); // 1-4 second think time
}
```

### 8.2 Threshold Configuration

```javascript
thresholds: {
  'http_req_duration': ['p(50)<200', 'p(95)<500', 'p(99)<1000'],
  'http_req_duration{endpoint:login}': ['p(95)<800'],
  'http_req_duration{endpoint:zatca}': ['p(95)<2000'],
  'http_req_duration{endpoint:reports}': ['p(95)<2000'],
  'http_req_duration{endpoint:transition}': ['p(95)<500'],
  'errors': ['rate<0.001'],
  'http_req_failed': ['rate<0.01'],
},
```

---

## 9. Results Reporting Template

### 9.1 Executive Summary

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| p50 response time | < 200ms | ___ ms | Pass / Fail |
| p95 response time | < 500ms | ___ ms | Pass / Fail |
| p99 response time | < 1000ms | ___ ms | Pass / Fail |
| Error rate | < 0.1% | ___% | Pass / Fail |
| Max concurrent users (stable) | 100 | ___ | Pass / Fail |
| Page load (LCP) | < 3s | ___ s | Pass / Fail |
| Lighthouse score | >= 80 | ___ | Pass / Fail |

### 9.2 Scenario Results

| Scenario | Duration | Peak VUs | p50 | p95 | p99 | Error Rate | Status |
|----------|----------|----------|-----|-----|-----|------------|--------|
| Normal Load | 40m | 50 | | | | | |
| Peak Load (3x) | 28m | 150 | | | | | |
| Stress Test | 30m | 500 | | | | | |
| Soak Test | 24h | 30 | | | | | |
| Spike Test | 25m | 200 | | | | | |

### 9.3 Per-Endpoint Breakdown

| Endpoint | Requests | p50 | p95 | p99 | Error Rate | Notes |
|----------|----------|-----|-----|-----|------------|-------|
| POST /auth/login | | | | | | |
| GET /job-cards | | | | | | |
| POST /job-cards/:id/transition | | | | | | |
| POST /invoices/:id/zatca | | | | | | |
| GET /reports/* | | | | | | |

### 9.4 Resource Utilization

| Resource | Baseline | Under Load | Peak | Status |
|----------|----------|------------|------|--------|
| CPU (backend) | | | | |
| Memory (backend) | | | | |
| DB connections | | | | |
| DB CPU | | | | |
| Event loop lag | | | | |
| Heap size (Node.js) | | | | |

### 9.5 Tenant Isolation Validation

| Test | Result | Data Leaks Found |
|------|--------|-----------------|
| Cross-org query isolation | Pass / Fail | 0 / ___ |
| Cross-branch scope enforcement | Pass / Fail | 0 / ___ |
| Concurrent tenant write isolation | Pass / Fail | 0 / ___ |
| Cross-tenant performance impact | < 10% / ___% | N/A |

---

## 10. Test Schedule

| Activity | Trigger | Duration | Owner |
|----------|---------|----------|-------|
| Normal load test | Every sprint (pre-release) | 40 minutes | DevOps |
| Peak load test | Pre-release to staging | 30 minutes | DevOps |
| Stress test | Pre-release to production | 30 minutes | DevOps |
| Soak test | Monthly or pre-major release | 24 hours | DevOps |
| Spike test | Pre-release to production | 25 minutes | DevOps |
| Tenant isolation validation | Every load test run | Integrated | DevOps + QA |

---

## 11. Failure Response Procedures

### 11.1 During Load Test

| Observation | Action |
|-------------|--------|
| p95 > 500ms for CRUD | Identify slow queries via pg_stat_statements. Check index usage. |
| Error rate > 1% | Stop test. Check application logs for 5xx errors. Review connection pool. |
| Memory growth > 20% in 1 hour | Flag potential memory leak. Capture heap snapshot. |
| DB connection exhaustion | Review pool size. Check for connection leaks (unreturned connections). |
| Event loop lag > 100ms | Profile CPU-intensive operations. Check for synchronous blocking. |

### 11.2 Post-Test

1. Generate k6 HTML report and archive with timestamp.
2. Compare results against previous run (regression detection).
3. File defects for any metric exceeding failure thresholds.
4. Update performance baseline if targets are adjusted.

---

## 12. References

- [Performance Requirements](../requirements/non-functional/performance.md)
- [Scalability Requirements](../requirements/non-functional/scalability.md)
- [Test Plan](../project-management/planning/test-plan.md)
- [Testing Strategy](../system/testing-strategy.md)
- [UAT Test Scripts](uat-test-scripts.md)
- [Security Testing Plan](security-testing-plan.md)
- [Regression Test Suite](regression-test-suite.md)
