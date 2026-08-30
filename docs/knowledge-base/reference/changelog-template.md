# Changelog Template

Release changelog standards and templates for SALIS AUTO. Follows Semantic Versioning (SemVer) and the Keep a Changelog convention.

---

## Version Numbering

SALIS AUTO uses Semantic Versioning (SemVer): `MAJOR.MINOR.PATCH`

| Component | When to Increment | Example |
|-----------|-------------------|---------|
| **MAJOR** | Breaking API changes, database schema changes requiring migration, removal of features | 1.0.0 to 2.0.0 |
| **MINOR** | New features, new screens, new API endpoints, backward-compatible additions | 1.0.0 to 1.1.0 |
| **PATCH** | Bug fixes, performance improvements, documentation updates, dependency updates | 1.0.0 to 1.0.1 |

### Pre-release Versions

| Tag | Purpose | Example |
|-----|---------|---------|
| `-alpha.N` | Internal testing, incomplete features | `1.2.0-alpha.1` |
| `-beta.N` | External testing, feature-complete but not yet stable | `1.2.0-beta.1` |
| `-rc.N` | Release candidate, final testing before release | `1.2.0-rc.1` |

---

## Changelog Entry Format

Each release entry follows the Keep a Changelog categories:

```markdown
## [VERSION] - YYYY-MM-DD

### Added
- New features and capabilities

### Changed
- Modifications to existing features

### Fixed
- Bug fixes

### Removed
- Features or capabilities that were removed

### Security
- Security-related changes

### Deprecated
- Features that will be removed in a future version
```

### Entry Guidelines

1. Write entries in the imperative mood: "Add X" not "Added X" or "Adds X".
2. Reference the affected domain, screen, or module.
3. Include the RBAC module if permissions changed.
4. Mention database migrations if schema changed.
5. Note breaking changes prominently.

---

## Example Changelog

```markdown
# Changelog

All notable changes to SALIS AUTO are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Bank reconciliation module with statement import and auto-matching
- Insurance claims lifecycle (submit, approve, reject, pay) with segregation of duties
- Auto-loan contract management with amortization schedule

## [1.5.0] - 2026-08-30

### Added
- ZATCA Phase 2 e-invoicing compliance with QR code generation, hash chain, and XML submission
- Invoice `sellerVatNumber`, `buyerVatNumber`, `qrCode`, `hashPrev`, `hashSelf` fields
- Payroll management with monthly runs, employee lines, and posting workflow
- Leave request module with approval flow and calendar overlap detection
- Timesheet tracking with clock-in/out and worked minutes
- Employee management with salary field (redacted for non-HR roles)
- OBD DTC readings table with device-to-reading history and mock flag
- Saved reports table for persisting custom report definitions
- Public lead intake form for unauthenticated website submissions

### Changed
- Upgrade Drizzle ORM to 0.36 with improved migration support
- DataTable skeleton loading now shows 5 rows instead of 3
- Toast auto-dismiss extended from 2800ms to 3200ms
- Money component now uses JetBrains Mono exclusively (was mixed font stack)

### Fixed
- Fix CodeInput paste handling when pasting from password managers
- Fix RTL chevron direction in sidebar navigation groups
- Fix WorkflowStepper not marking current stage with `aria-current`
- Fix mobile drawer not auto-closing on route change in Safari
- Fix customer phone uniqueness not enforced across branches within same org

### Security
- Add `Idempotency-Key` support to prevent duplicate financial transactions
- Audit log triggers now refuse UPDATE and DELETE at the database level
- OTP codes stored as hashes, never plaintext (`otp_challenges.code_hash`)
- Refresh token family tracking for stolen-token detection

## [1.4.0] - 2026-07-15

### Added
- CRM module with leads, opportunities, campaigns, segments, and tasks
- Customer feedback collection linked to job cards
- Fleet management with contract tracking and vehicle counts
- Purchase order receiving with quantity validation (`receivedQty <= qty`)
- Supplier directory with code uniqueness per organization

### Changed
- Expand RBAC matrix from 24 to 28 modules
- Update approval ceiling display to show ceiling in advance on estimate screen
- Improve search to support up to 200-character queries

### Fixed
- Fix Accountant role missing `vx` access on `hr` module
- Fix pagination returning duplicate rows when `pageSize` exceeds total rows
- Fix estimate line `sort` field not respected in display order

### Deprecated
- Legacy `refresh_tokens` table (replaced by `user_sessions` with family tracking)

## [1.3.0] - 2026-06-01

### Added
- Complete accounting module: Chart of Accounts, Journal Entries, Expenses
- Hierarchical account structure with parent/child relationships
- Expense tracking with category and vendor fields
- CSV export with formula injection protection
- 50,000-row export limit with guidance for splitting large exports

### Changed
- Money storage migrated from `numeric` to `bigint` halalas across all tables
- All money column names now end in `_halalas` for clarity
- API error envelope expanded with `field` property on 400 and 422 responses

### Fixed
- Fix approval workflow allowing self-approval (submittedBy === approvedBy)
- Fix inventory movement delta signs for damage and return types
- Fix CORS configuration not accepting comma-separated origins

### Security
- JWT claims now include `scope` for row-level data visibility
- Cross-tenant reads return 404 instead of 403 to prevent existence confirmation

## [1.2.0] - 2026-04-15

### Added
- Inventory management with parts, stock movements, and reorder alerts
- Purchase requisition and purchase order workflow
- Transfer between branches with paired debit/credit ledger entries
- Parts Supply Network screen for B2B marketplace
- 6 separation of duties pairs enforcement

### Changed
- Sidebar navigation now role-filtered using `SCREEN_MODULE` mapping
- DataTable mobile breakpoint changed from 768px to 860px
- Badge fallback color standardized to slate `#64748B`

### Fixed
- Fix Arabic translations missing for 47 keys in navigation
- Fix dark mode toggle not persisting across page reloads
- Fix input focus ring not visible in light mode

## [1.1.0] - 2026-03-01

### Added
- Job card workflow with 6-stage progression (Check-In through Delivery)
- Appointment scheduling with bay assignment and overlap detection
- Estimate creation with line items, approval workflow, and segregation of duties
- Customer and vehicle registry with search and pagination
- Invoice creation with ZATCA placeholder fields
- 14-role RBAC system with 28 modules and 5 permission actions

### Changed
- Authentication upgraded to rotating refresh tokens with reuse detection
- Password hashing switched from bcrypt cost 10 to cost 12

### Security
- Implement token family tracking to detect stolen refresh tokens

## [1.0.0] - 2026-01-15

### Added
- Initial release of SALIS AUTO platform
- Authentication with JWT access and refresh tokens
- Login, register, forgot password, OTP verification screens
- Dark mode default with light mode toggle
- Bilingual support (English / Arabic) with RTL layout
- AppShell with sidebar, topbar, and mobile drawer
- CustomerAppShell with bottom tab bar (430px frame)
- 14 UI primitives: Button, Card, Input, Badge, DataTable, Icon, Toast, Money, Timeline, Chip, CodeInput, FieldGrid, Checklist, WorkflowStepper
- 260 lucide-react icons via registry
- Design system with 5 brand colors, 4 font families
```

---

## Release Process

### Steps

1. **Freeze code**: Create a release branch from `main` (e.g., `release/1.5.0`).
2. **Run full test suite**: Ensure all tests pass including type checks and lint.
3. **Update changelog**: Add entries under the new version heading with the release date.
4. **Bump version**: Update `package.json` version in `app/` and `server/`.
5. **Create tag**: `git tag v1.5.0`
6. **Build**: Run production build for frontend and server.
7. **Run migrations**: Apply any database schema changes.
8. **Deploy**: Push to production infrastructure.
9. **Verify**: Smoke test critical flows (login, create job card, create invoice, ZATCA compliance).
10. **Announce**: Notify stakeholders of the release.

### Migration Checklist

For releases with database changes:

- [ ] Migration file created and reviewed
- [ ] Migration tested against production-like data
- [ ] Rollback migration prepared
- [ ] New indexes verified with `EXPLAIN ANALYZE`
- [ ] RLS policies updated for new tables (check `TENANT_TABLES` list)

---

## Version History Template

| Version | Date | Highlights |
|---------|------|-----------|
| 1.5.0 | 2026-08-30 | ZATCA Phase 2, Payroll, OBD readings |
| 1.4.0 | 2026-07-15 | CRM module, Fleet management, PO receiving |
| 1.3.0 | 2026-06-01 | Accounting module, Halalas migration, CSV export |
| 1.2.0 | 2026-04-15 | Inventory management, Procurement, Transfers |
| 1.1.0 | 2026-03-01 | Workshop workflow, Estimates, RBAC |
| 1.0.0 | 2026-01-15 | Initial release |

---

## See Also

- [Configuration Reference](./configuration-reference.md) — Deployment settings
- [Data Dictionary](./data-dictionary.md) — Database schema for migration reference
- [FAQ](./faq.md) — Common release questions
