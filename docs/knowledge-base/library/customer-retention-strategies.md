# SALIS AUTO -- Customer Retention Strategies

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-KB-LIB-005                              |
| Version       | 1.0                                        |
| Date          | 2026-08-31                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Introduction

Customer retention is significantly more cost-effective than acquisition in the automotive service industry. Studies in the Saudi market indicate that acquiring a new workshop customer costs 5-7x more than retaining an existing one. A 5% improvement in retention rate can increase profitability by 25-40%. This guide outlines CRM-driven retention strategies that leverage SALIS AUTO's customer management capabilities. For related operational workflows, see [Job Lifecycle](../../user-documentation/workflows/job-lifecycle.md).

---

## 2. Service Reminder Automation

### 2.1 Reminder Types

| Reminder Type               | Trigger Condition                    | Lead Time    |
|-----------------------------|--------------------------------------|-------------|
| Oil change due              | Mileage interval or time elapsed     | 7 days       |
| Major service due           | Mileage interval (e.g., 60,000 km)  | 14 days      |
| Tire rotation               | Every 10,000 km or 6 months          | 7 days       |
| AC service check            | Annually (March-April pre-summer)    | 14 days      |
| Brake inspection            | Every 20,000 km or 12 months         | 7 days       |
| Vehicle registration (Istimara) renewal | Registration expiry date   | 30 days      |
| Insurance renewal           | Policy expiry date                   | 30 days      |
| Warranty expiration         | Warranty end date                    | 60 days      |

### 2.2 Reminder Channel Configuration

| Channel          | Use Case                         | Response Rate |
|------------------|----------------------------------|---------------|
| SMS              | Primary for all reminders        | 15-25%        |
| WhatsApp         | Rich media, estimate sharing     | 30-45%        |
| Email            | Detailed service history, offers | 8-15%         |
| Phone call       | High-value customers, follow-up  | 40-55%        |
| Push notification| App users, time-sensitive        | 10-20%        |

### 2.3 Setup in SALIS AUTO

1. Navigate to CRM > Service Reminders > Templates
2. Create or customize reminder templates with bilingual content (EN/AR)
3. Set trigger conditions per reminder type (mileage-based or time-based)
4. Configure channel preferences per customer (respect opt-out selections)
5. Set escalation rules: if no response to SMS within 48 hours, trigger WhatsApp

### 2.4 Reminder Content Best Practices

- Address the customer by name in both English and Arabic
- Reference the specific vehicle (make, model, plate number)
- State the service needed and why it matters (safety, warranty, performance)
- Include an estimated price range to set expectations
- Provide a direct booking link or call-to-action
- Keep SMS under 160 characters; use WhatsApp for longer messages

---

## 3. Loyalty Program Design

### 3.1 Points-Based Program

| Action                        | Points Earned           | Notes                    |
|-------------------------------|------------------------|--------------------------|
| Service visit                 | 1 point per SAR 10 spent| Base earning rate        |
| Oil change service            | 50 bonus points        | Encourage regular visits |
| Major service (>SAR 2,000)    | 200 bonus points       | Reward high-value jobs   |
| Referral (new customer visit) | 500 bonus points       | Acquisition through loyalty|
| Online booking (app/web)      | 25 bonus points        | Drive digital adoption   |
| Service review/rating         | 30 bonus points        | Generate social proof    |

### 3.2 Tier Structure

| Tier       | Points Required | Benefits                                     |
|------------|----------------|----------------------------------------------|
| Bronze     | 0 - 499        | Base earning rate, birthday discount (5%)    |
| Silver     | 500 - 1,499    | 1.25x points, priority booking, 7% discount |
| Gold       | 1,500 - 3,999  | 1.5x points, free inspections, 10% discount |
| Platinum   | 4,000+         | 2x points, VIP bay, 15% discount, free pickup|

### 3.3 Points Redemption

| Redemption Option          | Points Required | SAR Equivalent |
|---------------------------|----------------|----------------|
| SAR 10 service credit     | 200 points     | SAR 10         |
| Free oil change           | 500 points     | SAR 120-180    |
| Free AC gas recharge      | 800 points     | SAR 200-350    |
| Free major inspection     | 1,000 points   | SAR 300-500    |
| SAR 100 parts discount    | 1,500 points   | SAR 100        |

### 3.4 Program Economics

Target loyalty program cost at 3-5% of revenue. Model the expected impact:

| Metric                        | Without Program | With Program  | Delta        |
|-------------------------------|----------------|---------------|--------------|
| Annual visits per customer    | 2.1            | 3.4           | +62%         |
| Average spend per visit (SAR) | 850            | 920           | +8%          |
| Customer retention rate       | 55%            | 72%           | +17 pts      |
| Customer lifetime value (SAR) | 5,355          | 9,384         | +75%         |
| Program cost (% of revenue)   | 0%             | 3.5%          | -3.5%        |
| Net revenue impact            | Baseline       | +68%          | Positive     |

---

## 4. NPS Survey Implementation

### 4.1 Survey Design

Net Promoter Score measures customer likelihood to recommend. The survey should be simple:

**Primary Question (mandatory):**
"On a scale of 0-10, how likely are you to recommend [Workshop Name] to a friend or colleague?"

**Follow-up Question (optional, based on score):**
- Promoters (9-10): "What did you enjoy most about your experience?"
- Passives (7-8): "What could we do to earn a perfect score?"
- Detractors (0-6): "What was the main reason for your rating?"

### 4.2 Survey Timing

| Trigger                 | Delay After Event | Channel    |
|-------------------------|-------------------|------------|
| Job completion          | 2 hours           | WhatsApp   |
| Vehicle delivery        | 24 hours          | SMS        |
| Estimate declined       | 48 hours          | SMS        |
| Complaint resolution    | 72 hours          | Phone call |

### 4.3 NPS Calculation

```
NPS = % Promoters - % Detractors
```

| Score Range  | Classification | Target Response |
|-------------|---------------|-----------------|
| 9-10        | Promoter      | Thank and request referral |
| 7-8         | Passive       | Follow up to understand gaps |
| 0-6         | Detractor     | Immediate manager outreach |

### 4.4 NPS Targets and Benchmarks

| Context                    | NPS Score    |
|---------------------------|-------------|
| Saudi automotive average  | 35-45       |
| SALIS AUTO target (year 1)| 60+         |
| SALIS AUTO target (year 2)| 65+         |
| World-class automotive    | 70+         |

### 4.5 Detractor Response Protocol

| Timeframe       | Action                                           | Responsible     |
|-----------------|--------------------------------------------------|-----------------|
| Within 2 hours  | Acknowledge the feedback via the original channel | Service Advisor |
| Within 24 hours | Manager calls the customer personally             | Branch Manager  |
| Within 48 hours | Concrete resolution offered (discount, redo, etc.)| Branch Manager  |
| Within 7 days   | Follow-up to confirm satisfaction                 | Service Advisor |
| Within 30 days  | Re-survey to measure recovery                     | System (auto)   |

---

## 5. Customer Lifetime Value Analysis

### 5.1 CLV Calculation

```
CLV = (Average Visit Revenue x Visits per Year x Gross Margin %) x Average Customer Lifespan (years)
```

### 5.2 CLV by Customer Segment

| Segment                  | Avg Visit (SAR) | Visits/Year | Margin | Lifespan | CLV (SAR)    |
|--------------------------|-----------------|-------------|--------|----------|-------------|
| Economy sedan owner      | 500             | 2.5         | 45%    | 4 years  | 2,250       |
| Mid-range SUV owner      | 900             | 3.0         | 42%    | 5 years  | 5,670       |
| Luxury vehicle owner     | 1,800           | 3.5         | 38%    | 6 years  | 14,364      |
| Fleet manager (10 cars)  | 6,500           | 6.0         | 35%    | 7 years  | 95,550      |
| Small fleet (3-5 cars)   | 2,200           | 4.0         | 38%    | 5 years  | 16,720      |

### 5.3 Investment Guidelines by CLV

| CLV Range (SAR)    | Max Retention Investment | Tactics                          |
|--------------------|--------------------------|---------------------------------|
| Under 2,000        | SAR 100/year             | Automated reminders, SMS only   |
| 2,000 - 5,000      | SAR 250/year             | Reminders + loyalty program     |
| 5,000 - 15,000     | SAR 500/year             | Dedicated advisor + VIP perks   |
| 15,000 - 50,000    | SAR 1,500/year           | Account manager + custom pricing|
| Over 50,000        | SAR 5,000/year           | Full fleet management service   |

---

## 6. Win-Back Campaigns

### 6.1 Lapsed Customer Definition

| Category       | Last Visit Gap    | Risk Level  |
|---------------|-------------------|-------------|
| At-risk       | 4-6 months        | Medium      |
| Lapsed        | 6-12 months       | High        |
| Lost          | 12+ months        | Very High   |

### 6.2 Win-Back Campaign Sequence

**Week 1 -- Awareness (SMS/WhatsApp):**
"We miss you at [Workshop Name]! Your [Vehicle Make Model] may be due for service. Book now and enjoy 15% off your next visit."

**Week 3 -- Value Offer (WhatsApp with image):**
"Exclusive comeback offer: Free multi-point inspection (worth SAR 150) with any service booking. Valid for 14 days."

**Week 5 -- Personal Touch (Phone Call):**
Service advisor calls personally to understand why the customer stopped visiting and addresses any concerns. Offer a tailored incentive based on the conversation.

**Week 8 -- Final Attempt (SMS):**
"Last chance! Your exclusive SAR 200 service credit expires in 7 days. Don't miss out. Call or book online."

### 6.3 Win-Back Metrics

| Metric                     | Target      |
|---------------------------|-------------|
| Campaign reach rate       | 80%+        |
| Response rate (any action)| 15-25%      |
| Booking conversion rate   | 8-15%       |
| Win-back retention (6mo)  | 40-50%      |
| Cost per win-back         | SAR 50-150  |

---

## 7. Referral Program Mechanics

### 7.1 Program Structure

| Element              | Details                                      |
|----------------------|----------------------------------------------|
| Referral reward      | SAR 100 service credit + 500 loyalty points  |
| Referee reward       | 10% off first visit (max SAR 200)            |
| Qualification        | Referee must complete a paid service visit    |
| Payout timing        | Credit applied after referee's first invoice  |
| Referral limit       | 10 per customer per year                      |
| Expiry               | Referral link valid for 90 days               |

### 7.2 Tracking in SALIS AUTO

1. Customer receives a unique referral code via their profile or app
2. Referee presents the code at check-in or enters it during online booking
3. System links the referral to the referring customer's account
4. Upon referee's first paid service completion, rewards are auto-applied
5. Both parties receive notification of the reward credit

### 7.3 Referral Promotion Calendar

| Month          | Campaign Theme                    | Extra Incentive              |
|----------------|----------------------------------|------------------------------|
| January        | New Year, New Car Care           | Double referral points       |
| March-April    | Pre-Summer AC Check              | Free AC check for referee    |
| June-July      | Beat the Heat                    | Extra SAR 50 credit          |
| September      | Back to School Safety            | Free safety inspection       |
| November       | Saudi National Day               | Triple loyalty points        |

---

## 8. Post-Service Follow-Up

### 8.1 Follow-Up Timeline

| Timing               | Action                                  | Channel      |
|----------------------|-----------------------------------------|-------------|
| Immediately          | Digital invoice + service summary       | WhatsApp/Email|
| 2 hours post-service | NPS survey                              | WhatsApp     |
| 24 hours             | "How is your vehicle?" check-in         | SMS          |
| 7 days               | "Everything still good?" for major repairs| SMS         |
| 30 days              | Satisfaction confirmation               | Automated    |
| Service interval - 7d| Next service reminder                   | WhatsApp/SMS |

### 8.2 Post-Service Communication Content

Each follow-up should include:

- Personalized greeting (customer name in their preferred language)
- Reference to the specific service performed
- Any relevant aftercare instructions
- Direct contact information for the service advisor who handled the job
- A link to leave a review or provide feedback

### 8.3 Warranty Follow-Up

For jobs with warranty coverage, schedule additional follow-ups:

| Warranty Period | Follow-Up Schedule                        |
|----------------|-------------------------------------------|
| 30 days        | Check at day 7 and day 25                 |
| 90 days        | Check at day 14, day 45, and day 80       |
| 6 months       | Check at month 1, month 3, and month 5    |
| 12 months      | Check at month 1, month 6, and month 11   |

---

## 9. Customer Segmentation Criteria

### 9.1 Segmentation Dimensions

| Dimension          | Segments                                      |
|--------------------|--------------------------------------------- |
| Vehicle type       | Sedan, SUV, Truck, Luxury, Commercial         |
| Service frequency  | Regular (4+/yr), Moderate (2-3/yr), Rare (1/yr)|
| Spend level        | High (>SAR 5K/yr), Medium (2-5K), Low (<2K)  |
| Tenure             | New (<6mo), Established (6mo-2yr), Loyal (2yr+)|
| Payment behavior   | Cash, Credit, Fleet account, Insurance        |
| Channel preference | Walk-in, Appointment, App booking             |

### 9.2 Priority Segments

| Segment Name        | Criteria                              | Strategy               |
|---------------------|---------------------------------------|------------------------|
| VIP Fleet           | 5+ vehicles, >SAR 30K/yr             | Dedicated account mgr  |
| Loyal Regulars      | 3+ visits/yr, 2+ yr tenure           | Loyalty tier benefits   |
| High-Value At-Risk  | Spend >SAR 5K/yr, no visit in 4 months| Immediate win-back     |
| New Converts        | First visit in last 60 days           | Welcome sequence        |
| Price Sensitive      | Declined estimates >2x                | Value package offers    |
| Digital Natives     | Book via app, pay online              | App-exclusive perks     |

### 9.3 Segment-Specific Communication

| Segment          | Frequency   | Tone                    | Key Content              |
|------------------|-------------|------------------------|--------------------------|
| VIP Fleet        | Bi-weekly   | Professional, concise  | Fleet health reports     |
| Loyal Regulars   | Monthly     | Warm, appreciative     | Loyalty rewards updates  |
| High-Value Risk  | Weekly      | Concerned, personal    | Exclusive return offers  |
| New Converts     | Weekly x 4  | Welcoming, educational | Platform features, tips  |
| Price Sensitive   | Monthly     | Value-focused          | Bundled service deals    |

---

## 10. Measuring Retention Success

### 10.1 Key Retention Metrics

| Metric                          | Formula                                           | Target     |
|---------------------------------|---------------------------------------------------|-----------|
| Customer retention rate         | (Customers end - New customers) / Customers start | 70%+      |
| Repeat visit rate               | Customers with 2+ visits / Total customers        | 55%+      |
| Average visits per customer     | Total visits / Unique customers                   | 3.0+      |
| Revenue per customer per year   | Total revenue / Unique customers                  | SAR 2,500+|
| Churn rate                      | Lost customers / Total customers                  | Below 30% |
| Referral rate                   | Referred new customers / Total new customers      | 15%+      |

### 10.2 Monthly Retention Dashboard

Track these metrics monthly at both branch and organization level. Compare against previous month, same month previous year, and organizational targets. The CRM > Analytics screen in SALIS AUTO provides pre-built retention dashboards. See [Financial Reporting Guide](./financial-reporting-guide.md) for revenue-side analysis.

---

## 11. Related Documents

- [Workshop Efficiency Best Practices](./workshop-efficiency-best-practices.md)
- [Multi-Branch Management](./multi-branch-management.md)
- [Financial Reporting Guide](./financial-reporting-guide.md)
- [Technician Productivity Tips](./technician-productivity-tips.md)
- [Workshop Staff Guide](../../user-documentation/guides/workshop-staff-guide.md)
- [Job Lifecycle Workflow](../../user-documentation/workflows/job-lifecycle.md)
- [RBAC Matrix](../reference/rbac-matrix.md)

---

*End of Document SA-KB-LIB-005*
