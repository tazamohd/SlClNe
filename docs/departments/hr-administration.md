# SALIS AUTO -- HR & Administration Department Plan

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-DPT-003                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Department Overview

The HR & Administration department manages the full employee lifecycle, regulatory workforce compliance, and administrative operations for SALIS AUTO. Operating within the Saudi Arabian labor framework, the department ensures compliance with the Ministry of Human Resources and Social Development (MHRSD), General Organization for Social Insurance (GOSI), and Saudization (Nitaqat) requirements.

The department supports all 14 platform roles across the organization, from recruitment through onboarding, performance management, training, and end-of-service processing. Administrative functions include office management, vendor coordination, and facility operations.

**Primary Responsibilities:**
- Talent acquisition and Saudization compliance
- Employee onboarding and lifecycle management
- Payroll processing via WPS (Wage Protection System)
- GOSI registration and contribution management
- Performance management and career development
- Leave administration and attendance tracking
- Training coordination and certification management
- Office and facility administration

---

## 2. Team Structure

```
                    +-----------------------+
                    |     HR Manager        |
                    |     (1 per org)       |
                    +-----------+-----------+
                                |
     +--------------+-----------+-----------+--------------+
     |              |                       |              |
+----+-----+  +----+--------+  +-----------+----+  +------+--------+
|Recruitment|  |  Payroll   |  |  Training      |  |    Office     |
| Specialist|  |Administrator|  |  Coordinator   |  | Administrator |
|   (1)     |  |   (1)      |  |    (1)         |  |    (1)        |
+-----------+  +------------+  +----------------+  +---------------+
| - Job posts| | - Salary    | | - Training plan| | - Facilities  |
| - Screening| | - WPS       | | - Certifications| | - Procurement|
| - Interviews| | - GOSI     | | - LMS admin   | | - Visitor mgmt|
| - Offers   | | - Benefits  | | - Skills track | | - Supplies    |
+-----------+  +------------+  +----------------+  +---------------+
```

**RBAC Role Mapping (from 14 platform roles):**

| Platform Role       | HR Function                    | Module Access                       |
|---------------------|--------------------------------|-------------------------------------|
| Owner               | HR policy approval             | Full HR reports, salary approval    |
| HR Manager          | Department head                | All HR modules                      |
| Department Managers | Team management                | Team attendance, leave approval     |
| Employee (all roles)| Self-service                   | Own profile, leave requests, payslips|

---

## 3. Recruitment and Saudization

### 3.1 Nitaqat Compliance

SALIS AUTO must maintain Green Zone status (or higher) under the Nitaqat Saudization program:

| Zone        | Saudi % Requirement | Status    | Implications                          |
|-------------|---------------------|-----------|---------------------------------------|
| Platinum    | > 40%               | Target    | Full access to MHRSD services         |
| Green (High)| 27-39%              | Minimum   | Standard access to work visas         |
| Green (Low) | 13-26%              | Acceptable| Limited work visa renewals            |
| Yellow      | 7-12%               | At Risk   | Restricted hiring of non-Saudis       |
| Red         | < 7%                | Critical  | No new visas, penalties apply         |

**Current Target:** Green zone minimum (27%+ Saudi nationals)

### 3.2 Saudi National Hiring Priority

1. All new positions must first be advertised on Taqat (national employment portal)
2. Saudi candidates receive priority screening and interview scheduling
3. Non-Saudi hiring requires documented justification (no qualified Saudi applicants)
4. MHRSD approval required before issuing work visa for non-Saudi hires

### 3.3 Recruitment Process

```
Hiring Need Identified
  |
  Step 1: Job requisition (Manager) → HR Manager approval
  Step 2: Post on Taqat + LinkedIn + industry channels (3 days minimum)
  Step 3: Resume screening (Recruitment Specialist)
  Step 4: Phone screening (15 min)
  Step 5: Technical interview (45 min, hiring manager)
  Step 6: Culture fit interview (30 min, HR Manager)
  Step 7: Reference check (2 references minimum)
  Step 8: Offer letter (bilingual EN/AR)
  Step 9: Background verification + medical fitness
  Step 10: Contract signing + onboarding scheduled
```

### 3.4 Interview Scorecard

| Criterion            | Weight | Scale   | Evaluator          |
|----------------------|--------|---------|--------------------|
| Technical skills     | 35%    | 1-5     | Hiring Manager     |
| Relevant experience  | 25%    | 1-5     | Hiring Manager     |
| Communication        | 15%    | 1-5     | HR Manager         |
| Cultural fit         | 15%    | 1-5     | HR Manager         |
| Growth potential     | 10%    | 1-5     | Both               |

**Minimum passing score: 3.5 / 5.0 weighted average**

---

## 4. Onboarding

### 4.1 New Hire Checklist

| Day    | Task                                  | Responsible          | System Action                |
|--------|---------------------------------------|----------------------|------------------------------|
| Pre-1  | GOSI registration                     | Payroll Admin        | Submit via GOSI portal       |
| Pre-1  | Bank account setup (for WPS)          | Employee             | Provide IBAN                 |
| Pre-1  | System access provisioning            | IT + HR              | Create user, assign RBAC role|
| Day 1  | Welcome orientation (company overview)| HR Manager           | --                           |
| Day 1  | Workspace setup and IT equipment      | Office Administrator | Equipment checklist signed   |
| Day 1  | Safety orientation                    | Workshop Manager*    | Safety cert recorded         |
| Day 1  | Platform training (role-specific)     | Training Coordinator | LMS enrollment               |
| Week 1 | Department-specific training          | Direct Manager       | Training log updated         |
| Week 1 | Buddy assignment                      | HR Manager           | --                           |
| Week 2 | 2-week check-in meeting               | HR Manager           | Feedback recorded            |
| Day 30 | 30-day review                         | Direct Manager       | Performance note filed       |
| Day 90 | Probation review and confirmation     | Direct Manager + HR  | Status updated in system     |

*For workshop roles only.

### 4.2 Probation Period

- Standard probation: 90 calendar days
- Extension: up to 180 days with mutual written agreement
- Evaluation criteria: attendance, performance targets, training completion
- Termination during probation: no end-of-service benefit, 1-day notice

---

## 5. Payroll Management

### 5.1 WPS (Wage Protection System) Compliance

All salary payments must be processed through the Wage Protection System as mandated by MHRSD:

| Requirement               | Policy                                        |
|---------------------------|-----------------------------------------------|
| Payment method            | Bank transfer via WPS                         |
| Payment deadline          | By 7th of each month                          |
| Currency                  | SAR (Saudi Riyal)                             |
| Documentation             | WPS file uploaded to Mudad portal             |
| Non-compliance penalty    | MHRSD sanctions, Nitaqat downgrade risk       |

### 5.2 Salary Components

| Component              | Calculation                          | Mandatory    |
|------------------------|--------------------------------------|--------------|
| Basic salary           | Per contract (minimum 60% of total)  | Yes          |
| Housing allowance      | Typically 25% of basic               | Contractual  |
| Transportation allow.  | Typically 10% of basic               | Contractual  |
| GOSI employee deduction| 10% of basic + housing               | Yes          |
| GOSI employer contrib. | 12% of basic + housing               | Yes          |
| Overtime               | Hourly rate x 1.5 (see Section 8)    | When applicable |

### 5.3 GOSI Contributions

| Contribution Type          | Employee Share | Employer Share | Total  |
|----------------------------|----------------|----------------|--------|
| Annuities (Saudi)          | 10%            | 12%            | 22%    |
| OHRP (Non-Saudi)           | 0%             | 2%             | 2%     |
| Unemployment (SANED - Saudi)| 1%            | 1%             | 2%     |

**Base for calculation:** Basic salary + Housing allowance (capped at SAR 45,000/month)

### 5.4 Payroll Calendar

| Activity                     | Deadline              | Responsible        |
|------------------------------|-----------------------|--------------------|
| Timesheet submission         | 25th of month         | All employees      |
| Overtime approval            | 26th of month         | Department Managers|
| Payroll processing           | 28th-1st              | Payroll Admin      |
| GOSI file submission         | 1st-5th               | Payroll Admin      |
| Salary disbursement (WPS)    | By 7th                | Payroll Admin      |
| Payslip distribution         | By 7th                | Automated/system   |

---

## 6. Performance Reviews

### 6.1 Review Cycle

| Review Type          | Frequency   | Duration   | Participants                    |
|----------------------|-------------|------------|---------------------------------|
| Weekly 1:1           | Weekly      | 15 min     | Manager + Employee              |
| Quarterly Check-in   | Quarterly   | 45 min     | Manager + Employee              |
| Annual Review        | Annual      | 60 min     | Manager + Employee + HR         |
| 360 Feedback         | Annual      | --         | Peers + Manager + Direct reports|

### 6.2 KPI-Based Evaluation

Each role has defined KPIs mapped from the platform's 13 domains:

| Role Category       | Sample KPIs                                       | Weight    |
|---------------------|----------------------------------------------------|-----------|
| Workshop (Technician)| Jobs/day, first-time fix, comeback rate            | 60% technical, 40% behavioral |
| Service Advisor     | Check-in time, CSAT, upsell rate                   | 50/50     |
| Finance             | Close time, DSO, ZATCA compliance                  | 70/30     |
| IT/Development      | Sprint velocity, code quality, incident response   | 60/40     |
| Sales               | Revenue target, pipeline, conversion rate           | 70/30     |

### 6.3 Performance Rating Scale

| Rating | Label          | Description                            | Salary Action      |
|--------|----------------|----------------------------------------|---------------------|
| 5      | Exceptional    | Consistently exceeds all targets       | 8-12% increase      |
| 4      | Exceeds        | Regularly exceeds most targets         | 5-8% increase       |
| 3      | Meets          | Consistently meets expectations        | 3-5% increase       |
| 2      | Below          | Partially meets, improvement needed    | 0-2%, PIP initiated |
| 1      | Unsatisfactory | Does not meet minimum standards        | PIP or termination  |

### 6.4 Promotion Criteria

- Minimum 2 consecutive annual reviews rated 4 or higher
- Completion of required certifications for target role
- Demonstrated leadership or expanded responsibility
- Manager recommendation with HR Manager approval
- Budget availability for salary adjustment

---

## 7. Leave Management

### 7.1 Leave Entitlements (Saudi Labor Law)

| Leave Type            | Entitlement                              | Documentation      |
|-----------------------|------------------------------------------|--------------------|
| Annual Leave          | 21 days (< 5 years) / 30 days (5+ years)| Request via system  |
| Sick Leave            | 30 days full pay, 60 days 75%, 30 days unpaid | Medical certificate |
| Hajj Leave            | 10-15 days (once during employment)      | Hajj permit         |
| Maternity Leave       | 10 weeks (4 pre + 6 post delivery)       | Medical certificate |
| Paternity Leave       | 3 days                                   | Birth certificate   |
| Marriage Leave        | 5 days                                   | Marriage contract   |
| Bereavement Leave     | 5 days (spouse/ascendant/descendant)     | Death certificate   |
| Iddah Leave (women)   | 4 months + 10 days                       | Death certificate   |
| Study/Exam Leave      | Per approval                             | Enrollment proof    |

### 7.2 Leave Request Workflow

```
Employee submits leave request (system)
  |
  Direct Manager review (approve/reject/modify)
  |
  If > 5 consecutive days: HR Manager review
  |
  System updates leave balance
  |
  Employee notified of decision
  |
  Calendar updated, coverage assigned
```

### 7.3 Leave Balance Tracking

- Balances displayed on employee self-service portal
- Carry-forward: maximum 50% of annual entitlement (with approval)
- Leave encashment on termination: per end-of-service rules
- Blackout periods: during Ramadan peak, maximum 20% of department on leave

---

## 8. Working Hours and Overtime

### 8.1 Standard Working Hours

| Period              | Daily Hours | Weekly Hours | Notes                         |
|---------------------|-------------|--------------|-------------------------------|
| Standard            | 8 hours     | 48 hours     | 6 days/week                   |
| Ramadan             | 6 hours     | 36 hours     | Reduced per labor law          |
| Workshop shifts     | 10 hours    | 48 hours     | With proper rest breaks        |

### 8.2 Rest Periods

- Friday: mandatory weekly rest day (paid)
- Daily break: minimum 30 minutes after 5 consecutive hours
- Maximum continuous work: 5 hours without break
- Night shift premium: not mandatory but recommended (10% supplement)

### 8.3 Overtime

| Category              | Rate                     | Max Hours/Month | Approval         |
|-----------------------|--------------------------|-----------------|------------------|
| Weekday overtime      | Hourly rate x 1.5        | 40 hours        | Manager + HR     |
| Friday/holiday work   | Hourly rate x 1.5 + day off or double pay | Per need | Manager + HR |

```
Hourly Rate Calculation:
  Hourly Rate = (Basic Salary + Allowances) / (30 days x Daily Hours)
  Overtime Rate = Hourly Rate x 1.5
  
  Example:
    Monthly salary: SAR 8,000
    Daily hours: 8
    Hourly rate: 8,000 / (30 x 8) = SAR 33.33
    Overtime rate: 33.33 x 1.5 = SAR 50.00
```

---

## 9. Training and Development

### 9.1 Training Categories

| Category               | Content                                   | Frequency    | Mandatory   |
|------------------------|-------------------------------------------|-------------|-------------|
| Safety Training        | PPE, hazmat, fire safety, first aid       | Quarterly   | Yes         |
| ZATCA Compliance       | E-invoicing, VAT updates, regulations     | Semi-annual | Finance team|
| Platform Training      | System modules per RBAC role              | On hire + updates | Yes    |
| Technical Certification| ASE, manufacturer-specific, diagnostic    | Annual      | Technicians |
| Leadership Development | Management skills, team leadership        | Annual      | Managers    |
| Soft Skills            | Customer service, communication           | Semi-annual | Advisors    |

### 9.2 Annual Training Budget

| Role Level            | Budget per Employee (SAR) | Training Days/Year |
|-----------------------|---------------------------|--------------------|
| Entry level           | 3,000                     | 5                  |
| Mid level             | 5,000                     | 7                  |
| Senior/Management     | 8,000                     | 10                 |
| Specialized (certs)   | 10,000                    | 10                 |

**Organization-wide target: SAR 5,000 average per employee per year**

### 9.3 Certification Tracking

All employee certifications are tracked in the platform's training module:

| Certification            | Valid For | Renewal Process          | Required For        |
|--------------------------|-----------|--------------------------|---------------------|
| Occupational Safety      | 2 years   | Refresher course + exam  | All workshop staff  |
| ASE Certification        | 5 years   | Continuing education     | Senior Technicians  |
| First Aid/CPR            | 2 years   | Practical course         | 1 per department    |
| ZATCA e-Invoice          | 1 year    | Online update course     | Finance team        |
| Forklift Operation       | 3 years   | Practical assessment     | Parts warehouse     |

---

## 10. End-of-Service Benefits

### 10.1 Calculation Formula (Saudi Labor Law Article 84)

| Service Duration      | Benefit Rate                          |
|-----------------------|---------------------------------------|
| First 5 years         | Half-month salary per year of service |
| After 5 years         | Full month salary per year of service |

**Salary basis:** Last drawn basic salary + housing allowance

### 10.2 Calculation Examples

```
Example 1: Employee with 3 years of service
  Monthly salary: SAR 10,000
  Benefit: 3 x (10,000 / 2) = SAR 15,000

Example 2: Employee with 8 years of service
  Monthly salary: SAR 12,000
  First 5 years: 5 x (12,000 / 2) = SAR 30,000
  Next 3 years:  3 x 12,000 = SAR 36,000
  Total benefit: SAR 66,000

Example 3: Resignation (< 2 years)
  No end-of-service benefit
  
Example 4: Resignation (2-5 years)
  One-third of calculated benefit
  
Example 5: Resignation (5-10 years)
  Two-thirds of calculated benefit
  
Example 6: Resignation (10+ years)
  Full calculated benefit
```

### 10.3 Termination Checklist

| Step | Action                              | Responsible      | Timeline       |
|------|-------------------------------------|------------------|----------------|
| 1    | Notice period served (30-60 days)   | Employee/Manager | Per contract   |
| 2    | Knowledge transfer                  | Employee         | During notice  |
| 3    | Company asset return                | Office Admin     | Last day       |
| 4    | System access revocation            | IT               | Last day       |
| 5    | Final payroll (salary + leave)      | Payroll Admin    | Within 7 days  |
| 6    | End-of-service benefit payment      | Finance          | Within 7 days  |
| 7    | GOSI de-registration                | Payroll Admin    | Within 15 days |
| 8    | Experience certificate issued       | HR Manager       | Within 7 days  |
| 9    | Exit interview                      | HR Manager       | Last day       |

---

## 11. Key Performance Indicators

| KPI                          | Target              | Measurement    | Frequency | Owner         |
|------------------------------|---------------------|----------------|-----------|---------------|
| Time to Hire                 | < 30 days           | Days           | Per hire  | Recruitment   |
| Saudization Rate             | > 27% (Green zone)  | Percentage     | Monthly   | HR Manager    |
| Employee Turnover            | < 15% annual        | Percentage     | Quarterly | HR Manager    |
| Training Completion Rate     | > 95%               | Percentage     | Quarterly | Training Coord|
| Payroll Accuracy             | > 99.5%             | Percentage     | Monthly   | Payroll Admin |
| WPS Compliance               | 100% on time        | Percentage     | Monthly   | Payroll Admin |
| GOSI Filing Compliance       | 100% on time        | Percentage     | Monthly   | Payroll Admin |
| Employee Satisfaction (eNPS) | > 30                | Score          | Semi-annual| HR Manager   |
| Absenteeism Rate             | < 3%                | Percentage     | Monthly   | HR Manager    |
| Onboarding Completion (30d)  | 100%                | Percentage     | Per hire  | HR Manager    |

---

## 12. Cross-References

| Document                                                                           | Relevance                          |
|------------------------------------------------------------------------------------|------------------------------------|
| [Training Program Overview](../training/program-overview.md)                       | Training curriculum details        |
| [Certification Framework](../knowledge-base/certification-framework.md)            | Certification requirements         |
| [Compliance Management Plan](../management/compliance-management-plan.md)          | Regulatory compliance details      |
| [Business Rules](../MASTER_BUSINESS_RULES.md)                                     | HR-related business rules          |
| [RBAC Matrix](../MASTER_RBAC_MATRIX.md)                                           | Role definitions and permissions   |
| [Architecture](../MASTER_ARCHITECTURE.md)                                         | System access architecture         |

---

## 13. Revision History

| Version | Date       | Author           | Changes                    |
|---------|------------|------------------|----------------------------|
| 1.0     | 2026-08-31 | SALIS AUTO PMO   | Initial department plan    |
