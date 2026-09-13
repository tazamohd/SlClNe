# Deployment Architecture

Deployment topology by security zone — DMZ, application tier, and isolated database tier — plus the external services and observability stack around them. Source: `docs/visualizations/deployment-architecture.html`, `docs/system/operations/devops-guide.md`, `docs/system/operations/environment-setup.md`.

```mermaid
flowchart TB
    subgraph DMZ["DMZ — Public Network"]
        CDN["Cloudflare CDN\nSSL termination, DDoS, edge cache"]
        LB["NGINX / ALB\nLayer 7 routing, health checks"]
        CDN --> LB
    end

    subgraph APP["Private Subnet — Application Tier"]
        SPA1["React SPA\nVite build, static"]
        SPA2["React SPA\nreplica"]
        API1["Express/Fastify API\nNode 20, REST + JWT"]
        API2["Express/Fastify API\nreplica"]
    end

    subgraph DB["Isolated Subnet — Database Tier"]
        PGB["PgBouncer\nconnection pooler"]
        PGP[("PostgreSQL 15+ Primary\nRead/Write, WAL streaming")]
        PGR[("PostgreSQL Read Replica\nanalytics, reports")]
        PGB --> PGP
        PGP -.WAL streaming.-> PGR
    end

    subgraph EXT["External Services"]
        ZATCA["ZATCA API\nSaudi e-invoicing"]
        STRIPE["Stripe\npayment processing"]
        SMS["SMS Gateway\nOTP, notifications"]
        WA["WhatsApp Business\ncustomer messaging"]
        EMAIL["Email (SMTP)\ntransactional mail"]
        S3["Cloud Storage (S3)\ndocuments, backups"]
    end

    subgraph OBS["Observability"]
        ERR["Error Tracking\nSentry"]
        APM["APM\nDatadog / New Relic"]
        LOGS["Log Aggregation\nELK / CloudWatch"]
        UPTIME["Uptime Monitor\nPingdom / UptimeRobot"]
    end

    LB --> SPA1
    LB --> SPA2
    LB --> API1
    LB --> API2

    API1 --> PGB
    API2 --> PGB

    API1 -.-> ZATCA
    API1 -.-> STRIPE
    API1 -.-> SMS
    API1 -.-> WA
    API1 -.-> EMAIL
    API1 -.-> S3

    API1 -.reports.-> ERR
    API1 -.metrics.-> APM
    API1 -.logs.-> LOGS
    LB -.health.-> UPTIME

    classDef dmz fill:#fdece3,stroke:#DA7756;
    classDef app fill:#e8f1fb,stroke:#6ba4d9;
    classDef data fill:#eaf6ea,stroke:#7dbb7d;
    classDef ext fill:#fbf4e0,stroke:#d9b86b;
    classDef obs fill:#f1eaf8,stroke:#a98ee0;
    class CDN,LB dmz;
    class SPA1,SPA2,API1,API2 app;
    class PGB,PGP,PGR data;
    class ZATCA,STRIPE,SMS,WA,EMAIL,S3 ext;
    class ERR,APM,LOGS,UPTIME obs;
```

## Notes

- **Three real deployment targets are documented** for the SPA build itself: GitHub Pages (`.github/workflows/deploy-pages.yml`), Vercel (`vercel.json`), and Netlify (`netlify.toml`) — all static-file hosts with SPA fallback to `/index.html`. The zoned topology above (CDN / LB / app tier / DB tier / observability) is the target production architecture illustrated in `docs/visualizations/deployment-architecture.html`.
- **Health probes**: `/health` (liveness — never touches the database) and `/ready` (readiness — runs `SELECT 1`) are the two endpoints an orchestrator or load balancer should watch.
- **Database tier isolation**: PostgreSQL runs with `FORCE` row-level security on all 53 tenant tables; even the table owner is subject to the policy.
- **Rate limiting** at the API tier is keyed `orgId:IP` (default 300/min), with a tighter 5/min/IP limit on the unauthenticated public lead endpoint.
