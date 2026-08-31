# SALIS AUTO -- Definition of Done

| Field         | Value                                      |
|---------------|--------------------------------------------|
| Document ID   | SA-AGI-003                                 |
| Version       | 1.0                                        |
| Date          | 2026-08-30                                 |
| Author        | SALIS AUTO PMO                             |
| Status        | Approved                                   |
| Classification| Internal -- Confidential                   |

---

## 1. Purpose

This document defines the Definition of Done (DoD) for the SALIS AUTO project. A user story, feature, or sprint increment is considered "Done" only when it satisfies every applicable criterion in this checklist. The DoD ensures consistent quality across all 13 domains and 191+ screens.

---

## 2. Story-Level Definition of Done

Every user story must pass all applicable items before being marked complete.

### 2.1 Code Quality

- [ ] All code is written in TypeScript 5.7 with strict mode enabled (`strict: true` in tsconfig).
- [ ] No `any` types unless explicitly justified and documented with `// eslint-disable-next-line` comment.
- [ ] Code passes ESLint with the project configuration (zero warnings in changed files).
- [ ] Code passes Prettier formatting check.
- [ ] No console.log/debug statements in committed code (use structured logging).
- [ ] Functions and components have JSDoc comments for public APIs.
- [ ] Complex business logic (state machines, approval chains, ZATCA encoding) has inline documentation.

### 2.2 Testing

- [ ] **Unit tests** written in Vitest covering:
  - All new utility functions and hooks.
  - Business logic (state transitions, approval limits, halala arithmetic, VAT calculations).
  - Edge cases documented in acceptance criteria.
  - Minimum 80% line coverage for changed files.
- [ ] **Integration tests** written with Supertest covering:
  - All new API endpoints (success + error paths).
  - RBAC enforcement (authorized + unauthorized access per role).
  - Input validation (valid + invalid payloads).
  - Minimum 70% coverage for changed API routes.
- [ ] **E2E tests** written in Playwright for critical paths:
  - Job lifecycle transitions (Check-In through Delivery).
  - ZATCA invoice generation flow.
  - Customer estimate approval (6-step e-signature).
  - Login + refresh token rotation.
  - Approval chain escalation.
- [ ] All tests pass in CI pipeline (no flaky tests -- flaky tests are fixed or quarantined before merge).

### 2.3 Code Review

- [ ] Pull request submitted with description referencing the story ID.
- [ ] At least one peer review approval from a team member who did not write the code.
- [ ] ZATCA-related changes reviewed by the ZATCA specialist.
- [ ] RBAC-related changes reviewed by the security lead.
- [ ] All review comments addressed (resolved or discussed with reviewer agreement).
- [ ] No merge conflicts with the main branch.

### 2.4 Internationalization (i18n)

- [ ] All user-facing strings extracted to i18n namespace files (no hardcoded English or Arabic in components).
- [ ] English (EN) translations provided and reviewed.
- [ ] Arabic (AR) translations provided and reviewed by a native speaker.
- [ ] Date, time, and number formatting uses locale-aware formatters (Intl API).
- [ ] Currency displays as "SAR" with proper formatting (e.g., SAR 1,234.56 / ر.س ١٬٢٣٤٫٥٦).
- [ ] Phone numbers display with +966 prefix in both languages.
- [ ] i18n CI lint rule passes (no missing keys in either language).

### 2.5 RTL (Right-to-Left) Layout

- [ ] Component renders correctly in both LTR (English) and RTL (Arabic) modes.
- [ ] CSS uses logical properties (`margin-inline-start` not `margin-left`) where applicable.
- [ ] Icons and directional elements (arrows, chevrons) are mirrored in RTL.
- [ ] Text alignment follows the document direction (not hardcoded left/right).
- [ ] Data tables, forms, and navigation menus are visually verified in both directions.
- [ ] RTL visual regression test passes (screenshot comparison).

### 2.6 Accessibility (a11y)

- [ ] WCAG 2.1 AA compliance for all new screens.
- [ ] Semantic HTML elements used (nav, main, section, button, not div-for-everything).
- [ ] All interactive elements are keyboard-navigable (Tab, Enter, Escape, Arrow keys).
- [ ] Focus management is correct (modals trap focus; dialogs return focus on close).
- [ ] Form inputs have associated labels (visible or aria-label).
- [ ] Color contrast ratio meets WCAG AA (4.5:1 for normal text, 3:1 for large text).
- [ ] Screen reader tested with at least one tool (NVDA, VoiceOver, or axe-core).
- [ ] ARIA attributes used correctly where native HTML semantics are insufficient.

### 2.7 Security

- [ ] No secrets, API keys, or credentials in source code (use environment variables).
- [ ] API endpoints enforce authentication (JWT verification middleware).
- [ ] API endpoints enforce authorization (role + scope check via RBAC middleware).
- [ ] User input is validated on both client (React form) and server (Express middleware).
- [ ] SQL injection prevented (Drizzle ORM parameterized queries -- no raw SQL unless reviewed).
- [ ] XSS prevention (React's default escaping; no dangerouslySetInnerHTML without sanitization).
- [ ] CSRF protection on state-changing endpoints.
- [ ] Separation-of-duties pairs enforced where applicable (6 pairs per RBAC design).

### 2.8 Performance

- [ ] No N+1 query issues in new database queries.
- [ ] API response time < 500ms at P95 for the new endpoint (measured locally with sample data).
- [ ] Frontend component does not cause unnecessary re-renders (React DevTools Profiler check).
- [ ] Images and assets are optimized (WebP where possible, lazy loading for below-fold).
- [ ] Bundle size impact assessed (no new dependency > 50KB gzipped without team discussion).

### 2.9 Documentation

- [ ] API endpoint documented in OpenAPI spec (request/response schemas, error codes).
- [ ] Complex workflows documented with sequence diagrams or state diagrams.
- [ ] README or inline comments updated if the feature changes setup or configuration.
- [ ] Storybook entry created for reusable UI components (if Storybook is in the project).

---

## 3. Sprint-Level Definition of Done

A sprint increment is Done when:

- [ ] All stories committed to the sprint meet the story-level DoD.
- [ ] Sprint demo conducted and feedback captured.
- [ ] No P1 or P2 bugs remain open from this sprint's work.
- [ ] Sprint burndown chart is updated and reviewed.
- [ ] Retrospective action items from the previous sprint are addressed.
- [ ] CI/CD pipeline is green on the main branch.
- [ ] Release notes drafted for the sprint increment.

---

## 4. Release-Level Definition of Done

A release is Done when:

- [ ] All sprint increments in the release meet the sprint-level DoD.
- [ ] Full regression test suite passes (Vitest + Supertest + Playwright).
- [ ] RTL visual regression suite passes across all 191+ screens.
- [ ] Performance benchmarks met (Lighthouse >= 80; API P95 < 500ms).
- [ ] Security scan passes (OWASP ZAP -- zero critical/high findings).
- [ ] ZATCA compliance verified (sandbox or production as applicable).
- [ ] User acceptance testing (UAT) completed with >= 85% pass rate.
- [ ] Deployment runbook executed successfully on staging environment.
- [ ] Rollback procedure tested and documented (see [Capacity Rollback Plan](../planning/capacity-rollback-plan.md)).
- [ ] Release approved by Product Owner and Project Manager.

---

## 5. Domain-Specific Additions

### 5.1 Finance & ZATCA

In addition to the general DoD, Finance stories must also:

- [ ] Verify all monetary arithmetic uses integer halalas (no floating-point at any layer).
- [ ] Verify VAT is calculated at 15% and rounded correctly per ZATCA rules.
- [ ] Verify invoice XML validates against ZATCA UBL 2.1 schema.
- [ ] Verify QR code encodes correct TLV data.
- [ ] Verify hash chain links to the previous invoice in the sequence.

### 5.2 Workshop

Workshop stories must also:

- [ ] Verify state machine transitions are guarded (invalid transitions return 422).
- [ ] Verify audit log captures every state change with timestamp and actor.
- [ ] Verify notifications are sent to the correct role at each transition.

### 5.3 RBAC

RBAC stories must also:

- [ ] Verify enforcement at all three layers (JWT claims, UI `can()`, API middleware).
- [ ] Verify tenant isolation (Branch A user cannot access Branch B data).
- [ ] Verify field-level redaction (7 rules) hides sensitive data from unauthorized roles.
- [ ] Verify separation-of-duties (6 pairs) prevents conflicting actions by the same user.

---

## 6. Exceptions and Waivers

If a DoD item cannot be met for a specific story:

1. The developer documents the reason in the PR description.
2. The QA lead and tech lead agree to a temporary waiver.
3. A follow-up story is created in the backlog to address the gap.
4. The waiver is logged in the sprint retrospective notes.
5. No waiver is permitted for security, ZATCA compliance, or tenant isolation items.

---

## 7. DoD Review Schedule

| Event                     | Frequency    | Participants             |
|---------------------------|-------------|--------------------------|
| DoD checklist review      | Quarterly   | Scrum team + QA lead     |
| DoD update proposal       | As needed   | Any team member          |
| DoD approval              | Per update  | PM, TL, QA Lead, PO     |

---

## 8. References

- [User Stories](user-stories.md)
- [Sprint Template](sprint-template.md)
- [Test Plan](../planning/test-plan.md)
- [Capacity Rollback Plan](../planning/capacity-rollback-plan.md)
- [Quality Register](../prince2/quality-register.md)
