# AI Platform — Functional Requirements

| Field        | Value                                    |
|-------------|------------------------------------------|
| Document ID | FR-AIP-007                               |
| Version     | 1.0                                      |
| Date        | 2026-08-30                               |
| Status      | Draft                                    |
| Domain      | AI Platform                              |
| Modules     | ai                                       |

## 1. Overview

The AI Platform domain provides intelligent assistance, knowledge management, and automation capabilities within SALIS AUTO. It encompasses a conversational AI assistant, a structured knowledge base for repair procedures, an AI agent registry for automated tasks, and a suite of feature screens for specialized AI-powered workflows.

## 2. AI Assistant

### 2.1 Conversation Model

The `conversations` table:

| Field             | Type          | Description                          |
|-------------------|---------------|--------------------------------------|
| id                | varchar(26)   | ULID primary key                     |
| org_id            | varchar(26)   | Tenant isolation                     |
| title             | varchar(300)  | Conversation title (required)        |
| user_name         | varchar(200)  | User who initiated the conversation  |
| message_count     | integer       | Number of messages in the thread     |
| conversation_date | date          | Date of conversation                 |
| tokens_label      | varchar(24)   | Display label for token usage        |

### 2.2 Chat Interface

The `AIAssistant` screen provides:

- Free-form conversational interface with the AI
- Suggested prompts for common workshop scenarios
- Conversation history with search and filtering
- Token usage tracking per conversation

### 2.3 Prompt Library

The `PromptLibrary` screen manages reusable prompt templates:

- Pre-built prompts for common automotive diagnostic scenarios
- User-created custom prompts
- Category-based organization

## 3. Knowledge Base

### 3.1 Data Model

The `kb_procedures` table:

| Field      | Type          | Description                              |
|------------|---------------|------------------------------------------|
| id         | varchar(26)   | ULID primary key                         |
| org_id     | varchar(26)   | Tenant isolation                         |
| code       | varchar(32)   | Procedure code                           |
| title      | varchar(300)  | Procedure title (EN, required)           |
| title_ar   | varchar(300)  | Procedure title (AR)                     |
| category   | varchar(64)   | Category (e.g., Engine, Brakes, Electrical) |
| make       | varchar(160)  | Vehicle make (e.g., Toyota, BMW)         |
| mins       | integer       | Estimated time in minutes                |
| torque     | text          | Torque specifications (EN)               |
| torque_ar  | text          | Torque specifications (AR)               |
| steps      | integer       | Number of procedure steps                |
| views      | integer       | View count                               |
| tsb        | boolean       | Whether this is a Technical Service Bulletin |
| media      | varchar(64)   | Media attachment reference               |

### 3.2 Procedure Categories

Procedures are organized by:

- **Category** — Vehicle system (Engine, Transmission, Brakes, Electrical, etc.)
- **Make** — Vehicle manufacturer for make-specific procedures
- **TSB flag** — Distinguishes Technical Service Bulletins from standard procedures

### 3.3 Content Structure

Each procedure includes:

- Step-by-step instructions with numbered steps (`steps` count)
- Torque specifications in EN/AR for precision tasks
- Estimated completion time in minutes
- Media references (photos, diagrams, videos)
- View count for popularity tracking

### 3.4 Knowledge Base Screen

The `KnowledgeBase` screen provides:

- Searchable procedure library with category and make filters
- Step count and estimated time display
- TSB identification
- Bilingual content (EN/AR)

## 4. AI Agents

### 4.1 Data Model

The `ai_agents` table:

| Field              | Type          | Description                         |
|--------------------|---------------|-------------------------------------|
| id                 | varchar(26)   | ULID primary key                    |
| org_id             | varchar(26)   | Tenant isolation                    |
| name               | varchar(160)  | Agent name (required)               |
| role               | varchar(120)  | Agent role description              |
| model              | varchar(120)  | AI model identifier                 |
| status             | varchar(24)   | active, inactive, error             |
| tasks              | integer       | Total task count                    |
| success_rate_label | varchar(16)   | Display label (e.g., "94%")         |
| icon               | varchar(64)   | Agent icon identifier               |

### 4.2 Agent Management Screens

- `AgentDashboard` — Overview of all active agents with status and metrics
- `AgentRegistry` — Full agent catalog with configuration management

### 4.3 Agent Metrics

Each agent tracks:

- Total tasks executed (`tasks`)
- Success rate (`success_rate_label`)
- Current status (active/inactive/error)
- Model configuration

## 5. Feature Screens

### 5.1 Workflow and Automation

| Screen           | Description                                          |
|------------------|------------------------------------------------------|
| WorkflowBuilder  | Visual workflow creation for automated processes     |
| AutomationRules  | Rule-based automation configuration                  |

### 5.2 Conversational AI

| Screen              | Description                                       |
|---------------------|---------------------------------------------------|
| ConversationHistory | Historical conversation archive and search        |
| ModelSettings       | AI model configuration and parameter tuning       |
| AIAnalytics         | AI usage analytics and performance metrics        |

### 5.3 Planned AI Features

The following screens represent planned AI capabilities:

| Feature                | Description                                         |
|------------------------|-----------------------------------------------------|
| Service Advisor AI     | Intelligent service recommendation engine           |
| Voice Commands         | Voice-activated workshop operations                 |
| Damage Assessment      | Computer vision-based damage detection              |
| Fraud Detection        | Anomaly detection in financial transactions         |
| Predictive Maintenance | ML-based maintenance prediction from vehicle data   |
| AI Chatbot             | Customer-facing chatbot for appointment booking     |

## 6. Diagnostics Integration

### 6.1 OBD Devices

The `obd_devices` table tracks connected diagnostic devices:

| Field         | Type          | Description                          |
|---------------|---------------|--------------------------------------|
| code          | varchar(32)   | Device code                          |
| bay           | varchar(32)   | Service bay location                 |
| vehicle_label | varchar(160)  | Connected vehicle                    |
| plate         | varchar(16)   | Vehicle plate number                 |
| status        | varchar(24)   | Device status                        |
| vin           | varchar(40)   | Scanned VIN                          |
| rpm           | integer       | Real-time RPM reading                |
| coolant       | integer       | Coolant temperature                  |
| voltage       | double        | Battery voltage                      |
| load          | integer       | Engine load percentage               |
| dtc_count     | integer       | Number of active DTCs                |

### 6.2 DTC Readings

The `obd_dtc_readings` table stores diagnostic trouble code readings:

| Field       | Type          | Description                             |
|-------------|---------------|-----------------------------------------|
| device_id   | varchar(26)   | FK to OBD device                        |
| dtc_code    | varchar(16)   | Diagnostic trouble code (e.g., P0300)   |
| description | varchar(300)  | Code description                        |
| severity    | varchar(16)   | Severity level                          |
| source      | varchar(16)   | How reading arrived: rescan, clear, manual |
| cleared     | boolean       | Whether the code has been cleared       |
| read_at     | timestamptz   | When the reading was taken              |
| mock        | boolean       | Whether from the mock bridge            |

### 6.3 DTC Reference

The `dtc_codes` table provides a reference library of diagnostic trouble codes with EN/AR descriptions, severity, system classification, and freeze-frame availability.

### 6.4 Diagnostic Screens

- `OBDDiagnostics` — Live device monitoring and DTC scanning (gated on `jobcards`)
- `DiagnosticReport` — Structured diagnostic report generation (gated on `jobcards`)

## 7. AI Platform Permissions

| Role         | Grants | Notes                                   |
|--------------|--------|-----------------------------------------|
| Owner        | vcedax | Full access                             |
| Manager      | vce    | View, create, edit                      |
| Advisor      | v      | View only                               |
| Accountant   | v      | View only                               |
| Super Admin  | vcedax | Full access (platform administration)   |

All other roles have no `ai` module access.

## 8. Cross-References

- [Workshop Operations](./workshop-operations.md) — Diagnostic integration with job cards
- [HR & Team](./hr-team.md) — Technician knowledge base access
- [Admin & Portals](./admin-portals.md) — AI agent administration
- [Performance](../non-functional/performance.md) — AI response time targets
- [Security](../non-functional/security.md) — AI platform access control
