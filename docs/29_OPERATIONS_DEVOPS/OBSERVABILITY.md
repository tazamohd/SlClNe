**Status:** NORMATIVE · **Owner:** Operations architect

# Observability

What this system can be observed with today, and what it cannot. This describes instrumentation **present in the repository**, not a monitored production service: nothing here is deployed, nothing is collecting, and no dashboard, alert or metric series exists anywhere in this workspace. Where a signal is absent, this document says so plainly rather than describing what would be nice to have.

Three real observability surfaces exist: two HTTP probes, a structured redacting log, and an immutable audit trail. Everything beyond those three is absent.

---

## 1. Health and readiness probes

Both are defined in `server/src/routes/health.ts` and are listed in the `PUBLIC_PATHS` set in `server/src/app.ts`, so they are unauthenticated. Neither discloses anything beyond its own answer.

| Probe | Response | Behaviour |
| --- | --- | --- |
| `GET /health` | `{ status: "ok", uptimeSeconds: N }`, 200 | Liveness. **Never touches the database** — a database blip must not restart every healthy container. `uptimeSeconds` is `process.uptime()` rounded. |
| `GET /ready` | `{ status: "ready" }` 200, or `{ status: "unavailable" }` 503 | Readiness. Executes `select 1` through the Drizzle client. On failure it logs at error level with the caught error and returns 503. |

The separation is the point: an orchestrator maps `/health` to a liveness probe and `/ready` to a readiness probe, so a database outage removes instances from a load balancer without restarting them. `docs/system/operations/devops-guide.md` §7 records that mapping.

Limits worth knowing before relying on them:

- `/ready` tests connectivity, not capacity. A pool at its `DATABASE_POOL_MAX` ceiling with queries queueing can still answer `select 1` promptly.
- Neither probe reports a version, build, commit or migration state, so "which build is running" and "are migrations applied" have no observable answer.
- **Nothing polls either probe.** No uptime monitor, orchestrator manifest or healthcheck directive exists in this repository — `docker-compose.yml` has no `healthcheck` block. The probes are available; nobody is asking them.

## 2. Structured logging

Configured in `server/src/logger.ts` and passed to Fastify, which uses Pino.

| Property | Value |
| --- | --- |
| Format | JSON in every environment. There is deliberately no pretty-printer: a second formatting path would be a second, unredacted output channel. |
| Level | `LOG_LEVEL`, one of fatal, error, warn, info, debug, trace, silent; default info |
| Destination | stdout. **No log shipping, aggregation, retention or search is configured anywhere.** |

### 2.1 Redaction

Redaction happens at the serialiser, not by remembering not to log something. The censored paths cover the authorization and cookie headers, the idempotency key, `set-cookie`, and in request bodies `password`, `newPassword`, `otp`, `token`, `refreshToken`, `phone`, `email` and `buyerVatNumber`; plus wildcard paths for `password`, `passwordHash`, `refreshToken`, `accessToken` and `codeHash` at any depth. The censor value is `[redacted]`.

### 2.2 Request serialisation

The request serialiser emits exactly four fields: `id`, `method`, `url` **with the query string stripped**, and `ip`. Stripping the query string is deliberate — filters and search terms carry customer data.

The consequence for diagnosis is real and should be planned for: query parameters never appear in logs, so a slow or failing list request cannot be reproduced from the log line alone. The request id is the handle instead.

### 2.3 The request id

Every response carries `x-request-id` (`server/src/app.ts`), `x-request-id` is an allowed CORS header, every error envelope includes `requestId`, and the 500 message tells the user to quote it. The same id is written to the audit row for the mutation it caused. It is the one correlation key that links what a user saw, what the log recorded and what the database change was — and it discloses nothing about the system.

### 2.4 Error classification

`server/src/app.ts` maps failures onto a single error envelope with a stable code taxonomy: `ApiError` instances serialise themselves, Zod failures become field-level validation errors, and driver errors are unwrapped through the `cause` chain to find the real SQLSTATE so a unique violation answers 409 with the colliding field rather than 500. This makes error *classes* distinguishable in the logs — which matters, because nothing else counts them.

## 3. The audit log as an observability surface

`server/src/audit/audit.ts` writes one row per mutation **inside the same transaction as the change**, so there is no state in which a change happened and the record of it did not. The table is append-only at the database level: a trigger (`server/drizzle/0011_audit_log_statement_immutability.sql`) refuses UPDATE and DELETE, and `server/scripts/migrate.ts` additionally revokes those grants from the application role.

Each row carries: `id`, `orgId`, `branchId`, `actorId`, `actorRole`, `action`, `entity`, `entityId`, `before`, `after` (JSONB), `reason`, `source` (`api` | `seed` | `job` | `import`), `requestId`, `ip`, `userAgent`, `ts`. Indexes exist on (org, entity, entity id) and (org, timestamp).

This is the strongest observability asset the system has, and it is worth being explicit about what it can and cannot answer.

| It can answer | It cannot answer |
| --- | --- |
| Who changed what, when, from which address, under which role and request id | Anything about a read — queries and exports are not audit events |
| The before and after state of any mutation | Latency, throughput, error rate or resource use |
| Whether an approval respected its ceiling and segregation of duties | Anything at all when the API is not running |
| The full history behind every `GET .../history` endpoint | Trends, without someone writing the query — there is no reporting over it |

Audit payloads exclude credential-shaped values by design; the log is read by support staff, and a hash or token in it would be a credential leak with a long retention period.

## 4. What is NOT instrumented

Checked, not assumed. Each row below was verified against the dependency manifests, the source tree and the workflows.

| Signal | Status | Evidence |
| --- | --- | --- |
| Metrics | **Absent.** No metrics of any kind are produced or exposed. | No `prom-client`, no StatsD client, no `/metrics` endpoint, no counter or histogram anywhere in `server/src`. |
| Distributed tracing | **Absent.** No spans, no trace context propagation, no exporter. | No OpenTelemetry SDK or instrumentation package is a dependency of `server` or `app`. `@opentelemetry/api` appears in `server/package-lock.json` only as a transitive dependency of another package; nothing imports it and no tracer is registered. |
| Error tracking | **Absent.** | No Sentry, Rollbar or equivalent client in either workspace. Unhandled errors reach the log and the error envelope, and nowhere else. The runbooks' references to error-tracker alerts describe intended tooling. |
| Alerting and paging | **Absent.** `No alerting is configured in this repository.` | No alert rule, alert manager, paging integration or notification target exists. Nothing can page anyone; nothing can even send an email — there is no email or SMS transport in the system at all (`OTP_TRANSPORT` defaults to `unconfigured`). |
| Dashboards | **Absent.** | No Grafana, Kibana or equivalent definition, provisioning file or dashboard JSON. |
| Uptime monitoring | **Absent.** | Nothing polls `/health` or `/ready`. No synthetic check, no external monitor configuration. |
| Log aggregation and retention | **Absent.** | Logs go to stdout. No shipper, no retention policy, no search. Once a container restarts, its logs are gone unless the host keeps them. |
| Frontend telemetry — real user monitoring, Core Web Vitals, JS error reporting | **Absent.** | No analytics or RUM script in `app/`; the CSP `connect-src 'self'` would block one anyway until deliberately widened. |
| Database observability | **Absent as instrumentation.** | No `pg_stat_statements` setup, no slow-query log configuration, no pool-utilisation gauge. PostgreSQL's own views are available to anyone with a psql session, which is not the same as monitoring. |
| Business and service-level metrics | **Absent.** | No job-throughput, invoice-issue-rate, approval-latency or any other service metric is computed or stored. The in-product reporting surfaces report business data to tenants; they are not operational telemetry. |
| Build and deployment observability | **Partial.** | GitHub Actions run history, the artefacts uploaded by `ci.yml` (gap report, golden-path record) and the `pr-report.yml` comment are the only trend data the project keeps. There is no deployment marker, no version endpoint and no way to correlate a deployment with a behaviour change. |
| Synthetic transaction monitoring | **Absent in operation, present in CI.** | The Playwright smoke and golden-path suites are exactly the right shape for synthetic monitoring, but they run only in CI against a locally built preview, never against a deployed environment. |

### The consequence

Most of the trigger conditions in the existing runbooks cannot currently fire. `runbooks/performance-degradation.md` triggers on p95 latency, error rate, query time, pool utilisation, memory and CPU; none of those six is measured. `runbooks/deployment-rollback.md` triggers on error rate and repeated probe failures; nothing measures the first and nothing polls the second. `runbooks/database-failover.md` triggers on replication lag and an automated database-down alert; there is no replication and no alerting.

Detection today is: a human notices. That is the single largest operational gap in this repository, and it is larger than any of the individual missing tools, because it invalidates the entry condition of almost every procedure that has been written.

## 5. Minimum instrumentation to make the runbooks operable — TARGET

Stated as intent. None of this exists; nothing below has been scheduled, sized or assigned.

| Priority | Capability | Why this order |
| --- | --- | --- |
| 1 | An external uptime check against `/ready` with a notification target | Turns "a human notices" into "something notices". Cheapest single change with the largest effect, and it needs no code. |
| 2 | Log shipping with retention and search | The logs already exist and are already redacted; without shipping they vanish on restart and cannot be searched during an incident. |
| 3 | Request-rate, latency and error-rate metrics from the Fastify layer | Makes the performance and rollback runbooks' trigger conditions real. |
| 4 | Error tracking with grouping | Turns individual 500s into countable classes with a first-seen timestamp. |
| 5 | Database metrics — connections, slow queries, replication lag if a standby exists | Required before the failover runbook's triggers mean anything. |
| 6 | A version or build identifier on a probe response, and a deployment marker | Makes "which build is running" and "did this start after the deploy" answerable. |
| 7 | Tracing | Least valuable at this architecture — one API process and one database. Worth deferring until there is a second service. |

## 6. Related documents

| Document | Relationship |
| --- | --- |
| `docs/system/operations/monitoring-logging.md` | The longer reference on logging, error classification and the audit trail. |
| `docs/29_OPERATIONS_DEVOPS/RUNBOOK_INDEX.md` | The procedures whose trigger conditions depend on the signals listed here. |
| `docs/29_OPERATIONS_DEVOPS/ENVIRONMENTS_AND_DEPLOYMENT.md` | Where the probes and logs would run, once anything runs. |
| `docs/28_ITIL_SERVICE_MANAGEMENT/SERVICE_MANAGEMENT_MODEL.md` | Why incident, availability and capacity management are all TARGET. |
