CREATE TABLE IF NOT EXISTS "ai_agents" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"name" varchar(160) NOT NULL,
	"role" varchar(120),
	"model" varchar(120),
	"status" varchar(24) NOT NULL,
	"tasks" integer DEFAULT 0 NOT NULL,
	"success_rate_label" varchar(16),
	"icon" varchar(64)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "appointments" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"scheduled_date" date NOT NULL,
	"time_label" varchar(16) NOT NULL,
	"start_minute" integer NOT NULL,
	"duration_mins" integer NOT NULL,
	"customer_id" varchar(26),
	"customer_name" varchar(200) NOT NULL,
	"vehicle_id" varchar(26),
	"vehicle_label" varchar(160) NOT NULL,
	"plate" varchar(16) NOT NULL,
	"service_label" varchar(80) NOT NULL,
	"bay" varchar(32) NOT NULL,
	"technician_id" varchar(26),
	"technician_name" varchar(200),
	"status" varchar(16) DEFAULT 'awaiting' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "approval_lines" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"seq" integer NOT NULL,
	"item" varchar(300) NOT NULL,
	"item_ar" varchar(300),
	"qty" double precision DEFAULT 1 NOT NULL,
	"unit_price_halalas" bigint DEFAULT 0 NOT NULL,
	"kind" varchar(16),
	"urgency" varchar(16),
	"note" text,
	"note_ar" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_log" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26),
	"branch_id" varchar(26),
	"actor_id" varchar(26),
	"actor_role" varchar(32),
	"action" varchar(40) NOT NULL,
	"entity" varchar(64) NOT NULL,
	"entity_id" varchar(64),
	"before" jsonb,
	"after" jsonb,
	"reason" text,
	"source" varchar(24) DEFAULT 'api' NOT NULL,
	"request_id" varchar(64),
	"ip" varchar(64),
	"user_agent" text,
	"ts" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "branches" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"name" varchar(200) NOT NULL,
	"name_ar" varchar(200),
	"city" varchar(120),
	"is_main" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "campaigns" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"name" varchar(200) NOT NULL,
	"type" varchar(24) NOT NULL,
	"status" varchar(24) NOT NULL,
	"reach" integer DEFAULT 0 NOT NULL,
	"opens" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"conversions" integer DEFAULT 0 NOT NULL,
	"budget_halalas" bigint DEFAULT 0 NOT NULL,
	"spent_halalas" bigint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chart_of_accounts" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"code" varchar(24) NOT NULL,
	"name" varchar(200) NOT NULL,
	"type" varchar(40) NOT NULL,
	"balance_halalas" bigint DEFAULT 0 NOT NULL,
	"children_count" integer DEFAULT 0 NOT NULL,
	"parent_id" varchar(26)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conversations" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"title" varchar(300) NOT NULL,
	"user_name" varchar(200),
	"message_count" integer DEFAULT 0 NOT NULL,
	"conversation_date" date,
	"tokens_label" varchar(24)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_tasks" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"title" varchar(300) NOT NULL,
	"assigned_to" varchar(200),
	"due_date" date,
	"priority" varchar(16) DEFAULT 'medium' NOT NULL,
	"status" varchar(16) DEFAULT 'todo' NOT NULL,
	"type" varchar(24)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customers" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"name" varchar(200) NOT NULL,
	"phone" varchar(32) NOT NULL,
	"email" varchar(254),
	"type" varchar(16) DEFAULT 'individual' NOT NULL,
	"fleet_id" varchar(26),
	"vehicle_count" integer DEFAULT 0 NOT NULL,
	"total_spent_halalas" bigint DEFAULT 0 NOT NULL,
	"last_visit_at" timestamp with time zone,
	"last_visit_label" varchar(64),
	"notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "departments" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"name" varchar(200) NOT NULL,
	"head" varchar(200),
	"headcount" integer DEFAULT 0 NOT NULL,
	"cost_center" varchar(40),
	"branch_label" varchar(160),
	"icon" varchar(64)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "diag_copies" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"recipient" varchar(120) NOT NULL,
	"recipient_ar" varchar(120),
	"icon" varchar(64),
	"at_label" varchar(64),
	"state" varchar(24)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "diag_findings" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"dtc" varchar(16),
	"finding" varchar(300) NOT NULL,
	"finding_ar" varchar(300),
	"system" varchar(64),
	"system_ar" varchar(64),
	"severity" varchar(16),
	"evidence" varchar(32)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "diag_labour" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"task" varchar(300) NOT NULL,
	"task_ar" varchar(300),
	"hours" double precision DEFAULT 0 NOT NULL,
	"rate_halalas" bigint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "diag_parts" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"part_sku" varchar(64) NOT NULL,
	"description" varchar(300) NOT NULL,
	"description_ar" varchar(300),
	"qty" double precision DEFAULT 1 NOT NULL,
	"price_halalas" bigint DEFAULT 0 NOT NULL,
	"stock" varchar(16),
	"eta" varchar(32)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "diag_stages" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"stage_key" varchar(40) NOT NULL,
	"role" varchar(32),
	"label" varchar(160) NOT NULL,
	"label_ar" varchar(160),
	"owner_name" varchar(200),
	"owner_name_ar" varchar(200),
	"at_label" varchar(64),
	"action" varchar(160),
	"action_ar" varchar(160),
	"adds" text,
	"adds_ar" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dtc_codes" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"code" varchar(16) NOT NULL,
	"description" varchar(300) NOT NULL,
	"description_ar" varchar(300),
	"severity" varchar(16) NOT NULL,
	"system" varchar(64),
	"freeze_frame" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "estimate_lines" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"estimate_id" varchar(26) NOT NULL,
	"description" varchar(300) NOT NULL,
	"description_ar" varchar(300),
	"kind" varchar(16) NOT NULL,
	"qty" double precision NOT NULL,
	"unit_price_halalas" bigint NOT NULL,
	"part_sku" varchar(64),
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "estimates" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"code" varchar(32) NOT NULL,
	"job_card_id" varchar(26),
	"customer_id" varchar(26),
	"customer_name" varchar(200) NOT NULL,
	"vehicle_id" varchar(26),
	"vehicle_label" varchar(160) NOT NULL,
	"subtotal_halalas" bigint DEFAULT 0 NOT NULL,
	"tax_halalas" bigint DEFAULT 0 NOT NULL,
	"discount_halalas" bigint DEFAULT 0 NOT NULL,
	"total_halalas" bigint DEFAULT 0 NOT NULL,
	"status" varchar(16) DEFAULT 'draft' NOT NULL,
	"valid_until" timestamp with time zone,
	"submitted_by" varchar(26),
	"approved_by" varchar(26),
	"approved_at" timestamp with time zone,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "expenses" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"code" varchar(32) NOT NULL,
	"expense_date" date NOT NULL,
	"category" varchar(120),
	"vendor" varchar(200),
	"amount_halalas" bigint DEFAULT 0 NOT NULL,
	"status" varchar(16) DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fleets" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"name" varchar(200) NOT NULL,
	"vehicle_count" integer DEFAULT 0 NOT NULL,
	"active_count" integer DEFAULT 0 NOT NULL,
	"contract_status" varchar(32) DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "garage_applications" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"legal_name" varchar(200) NOT NULL,
	"cr_number" varchar(20),
	"vat_number" varchar(20),
	"contact_name" varchar(200) NOT NULL,
	"phone" varchar(32) NOT NULL,
	"email" varchar(254) NOT NULL,
	"city" varchar(120),
	"plan_requested" varchar(40),
	"notes" text,
	"status" varchar(16) DEFAULT 'pending' NOT NULL,
	"reviewed_by" varchar(26),
	"reviewed_at" timestamp with time zone,
	"rejection_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "idempotency_keys" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"key" varchar(128) NOT NULL,
	"endpoint" varchar(160) NOT NULL,
	"request_hash" varchar(64) NOT NULL,
	"response_status" integer NOT NULL,
	"response_body" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "integrations" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"name" varchar(160) NOT NULL,
	"name_ar" varchar(160),
	"category" varchar(64),
	"icon" varchar(64),
	"status" varchar(24) NOT NULL,
	"detail" text,
	"detail_ar" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_movements" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"part_id" varchar(26) NOT NULL,
	"type" varchar(16) NOT NULL,
	"qty" integer NOT NULL,
	"delta" integer NOT NULL,
	"ref" varchar(64),
	"reason" text,
	"to_branch_id" varchar(26)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoice_lines" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"invoice_id" varchar(26) NOT NULL,
	"description" varchar(300) NOT NULL,
	"description_ar" varchar(300),
	"kind" varchar(16) NOT NULL,
	"qty" double precision NOT NULL,
	"unit_price_halalas" bigint NOT NULL,
	"part_sku" varchar(64),
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoices" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"code" varchar(32) NOT NULL,
	"customer_id" varchar(26),
	"customer_name" varchar(200) NOT NULL,
	"job_card_id" varchar(26),
	"vehicle_id" varchar(26),
	"due_date" date NOT NULL,
	"status" varchar(16) DEFAULT 'draft' NOT NULL,
	"subtotal_halalas" bigint DEFAULT 0 NOT NULL,
	"tax_halalas" bigint DEFAULT 0 NOT NULL,
	"discount_halalas" bigint DEFAULT 0 NOT NULL,
	"total_halalas" bigint DEFAULT 0 NOT NULL,
	"paid_halalas" bigint DEFAULT 0 NOT NULL,
	"seller_vat_number" varchar(20),
	"buyer_vat_number" varchar(20),
	"qr_code" text,
	"hash_prev" varchar(64),
	"hash_self" varchar(64),
	"issued_at" timestamp with time zone,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_cards" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"code" varchar(32) NOT NULL,
	"customer_id" varchar(26),
	"customer_name" varchar(200) NOT NULL,
	"vehicle_id" varchar(26),
	"vehicle_label" varchar(160) NOT NULL,
	"service" varchar(32) NOT NULL,
	"status" varchar(24) DEFAULT 'pending' NOT NULL,
	"stage" varchar(24) DEFAULT 'checkin' NOT NULL,
	"priority" varchar(16) DEFAULT 'medium' NOT NULL,
	"assigned_tech_id" varchar(26),
	"complaint" text,
	"qc_passed_by" varchar(26)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "journal_entries" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"code" varchar(32) NOT NULL,
	"entry_date" date NOT NULL,
	"ref" varchar(64),
	"narration" text,
	"debit_halalas" bigint DEFAULT 0 NOT NULL,
	"credit_halalas" bigint DEFAULT 0 NOT NULL,
	"status" varchar(16) DEFAULT 'draft' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kb_procedures" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"code" varchar(32) NOT NULL,
	"title" varchar(300) NOT NULL,
	"title_ar" varchar(300),
	"category" varchar(64),
	"make" varchar(160),
	"mins" integer,
	"torque" text,
	"torque_ar" text,
	"steps" integer,
	"views" integer,
	"tsb" boolean DEFAULT false NOT NULL,
	"media" varchar(64)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leads" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"name" varchar(200) NOT NULL,
	"company" varchar(200),
	"value_halalas" bigint DEFAULT 0 NOT NULL,
	"source" varchar(64),
	"stage" varchar(32) DEFAULT 'new' NOT NULL,
	"lead_date" date,
	"score" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "obd_devices" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"code" varchar(32) NOT NULL,
	"bay" varchar(32),
	"vehicle_label" varchar(160),
	"plate" varchar(16),
	"status" varchar(24) NOT NULL,
	"vin" varchar(40),
	"rpm" integer,
	"coolant" integer,
	"voltage" double precision,
	"load" integer,
	"dtc_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oem_tools" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"brand" varchar(120) NOT NULL,
	"tool" varchar(120) NOT NULL,
	"status" varchar(24) NOT NULL,
	"vehicle_count" integer DEFAULT 0 NOT NULL,
	"protocol" varchar(120),
	"licence" varchar(64),
	"expires_on" date,
	"expires_label" varchar(32)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "opportunities" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"name" varchar(200) NOT NULL,
	"company" varchar(200),
	"value_halalas" bigint DEFAULT 0 NOT NULL,
	"stage" varchar(32) NOT NULL,
	"probability_pct" integer,
	"close_date" date,
	"owner_name" varchar(200)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organizations" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"name_ar" varchar(200),
	"slug" varchar(80) NOT NULL,
	"cr_number" varchar(20),
	"vat_number" varchar(20),
	"plan" varchar(40) DEFAULT 'starter' NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "otp_challenges" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"channel" varchar(8) NOT NULL,
	"destination" varchar(254) NOT NULL,
	"code_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "parts" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"name" varchar(200) NOT NULL,
	"sku" varchar(64) NOT NULL,
	"price_halalas" bigint DEFAULT 0 NOT NULL,
	"cost_halalas" bigint,
	"on_hand" integer DEFAULT 0 NOT NULL,
	"reserved" integer DEFAULT 0 NOT NULL,
	"reorder_level" integer DEFAULT 0 NOT NULL,
	"backorderable" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payments" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"invoice_id" varchar(26),
	"paid_on" date NOT NULL,
	"method" varchar(40) NOT NULL,
	"method_ar" varchar(60),
	"reference" varchar(64),
	"amount_halalas" bigint NOT NULL,
	"note" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "purchase_order_lines" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"purchase_order_id" varchar(26) NOT NULL,
	"part_sku" varchar(64),
	"description" varchar(300) NOT NULL,
	"qty" integer NOT NULL,
	"received_qty" integer DEFAULT 0 NOT NULL,
	"unit_price_halalas" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "purchase_orders" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"code" varchar(32) NOT NULL,
	"supplier_name" varchar(200) NOT NULL,
	"status" varchar(24) DEFAULT 'draft' NOT NULL,
	"total_halalas" bigint DEFAULT 0 NOT NULL,
	"ordered_at" timestamp with time zone,
	"expected_at" timestamp with time zone,
	"submitted_by" varchar(26),
	"approved_by" varchar(26),
	"approved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "receipts" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"code" varchar(32) NOT NULL,
	"receipt_date" date NOT NULL,
	"customer_name" varchar(200) NOT NULL,
	"invoice_code" varchar(32),
	"method" varchar(40) NOT NULL,
	"amount_halalas" bigint NOT NULL,
	"status" varchar(16) DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "segments" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"name" varchar(200) NOT NULL,
	"member_count" integer DEFAULT 0 NOT NULL,
	"rules" text,
	"last_updated_label" varchar(64)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "services" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"icon" varchar(64) NOT NULL,
	"label" varchar(120) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscription_requests" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"from_plan" varchar(40) NOT NULL,
	"to_plan" varchar(40) NOT NULL,
	"direction" varchar(16) NOT NULL,
	"reason" text,
	"status" varchar(16) DEFAULT 'pending' NOT NULL,
	"requested_by" varchar(26),
	"reviewed_by" varchar(26),
	"reviewed_at" timestamp with time zone,
	"effective_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "supplier_applications" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"company" varchar(200) NOT NULL,
	"cr_number" varchar(20),
	"vat_number" varchar(20),
	"contact_name" varchar(200) NOT NULL,
	"phone" varchar(32) NOT NULL,
	"email" varchar(254) NOT NULL,
	"categories" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"regions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" varchar(16) DEFAULT 'pending' NOT NULL,
	"reviewed_by" varchar(26),
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "support_tickets" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"subject" varchar(300) NOT NULL,
	"body" text,
	"priority" varchar(16) DEFAULT 'low' NOT NULL,
	"status" varchar(16) DEFAULT 'open' NOT NULL,
	"assigned_to" varchar(26),
	"thread" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "system_health" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"ts" timestamp with time zone DEFAULT now() NOT NULL,
	"uptime_pct" double precision,
	"queue_depth" integer,
	"error_rate_pct" double precision,
	"db_size_gb" double precision,
	"active_sessions" integer,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "technicians" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"name" varchar(200) NOT NULL,
	"specialty" varchar(160),
	"active_jobs" integer DEFAULT 0 NOT NULL,
	"rating" double precision,
	"user_id" varchar(26)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_sessions" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"user_id" varchar(26) NOT NULL,
	"refresh_token_hash" text NOT NULL,
	"family_id" varchar(26) NOT NULL,
	"user_agent" text,
	"ip" varchar(64),
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"replaced_by" varchar(26)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"email" varchar(254) NOT NULL,
	"name" varchar(200) NOT NULL,
	"name_ar" varchar(200),
	"role" varchar(32) NOT NULL,
	"password_hash" text,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"last_login_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vehicles" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"org_id" varchar(26) NOT NULL,
	"branch_id" varchar(26),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" varchar(26),
	"updated_by" varchar(26),
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	"plate" varchar(16) NOT NULL,
	"make_model" varchar(160) NOT NULL,
	"customer_id" varchar(26),
	"owner_name" varchar(200),
	"vin" varchar(17),
	"mileage_km" integer DEFAULT 0 NOT NULL,
	"last_service_at" timestamp with time zone,
	"last_service_label" varchar(64),
	"status" varchar(16) DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ai_agents" ADD CONSTRAINT "ai_agents_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "appointments" ADD CONSTRAINT "appointments_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "approval_lines" ADD CONSTRAINT "approval_lines_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "branches" ADD CONSTRAINT "branches_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "conversations" ADD CONSTRAINT "conversations_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "crm_tasks" ADD CONSTRAINT "crm_tasks_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customers" ADD CONSTRAINT "customers_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "departments" ADD CONSTRAINT "departments_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "diag_copies" ADD CONSTRAINT "diag_copies_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "diag_findings" ADD CONSTRAINT "diag_findings_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "diag_labour" ADD CONSTRAINT "diag_labour_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "diag_parts" ADD CONSTRAINT "diag_parts_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "diag_stages" ADD CONSTRAINT "diag_stages_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dtc_codes" ADD CONSTRAINT "dtc_codes_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "estimate_lines" ADD CONSTRAINT "estimate_lines_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "estimates" ADD CONSTRAINT "estimates_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "expenses" ADD CONSTRAINT "expenses_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fleets" ADD CONSTRAINT "fleets_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "integrations" ADD CONSTRAINT "integrations_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_cards" ADD CONSTRAINT "job_cards_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kb_procedures" ADD CONSTRAINT "kb_procedures_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "leads" ADD CONSTRAINT "leads_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "obd_devices" ADD CONSTRAINT "obd_devices_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oem_tools" ADD CONSTRAINT "oem_tools_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "parts" ADD CONSTRAINT "parts_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "receipts" ADD CONSTRAINT "receipts_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "segments" ADD CONSTRAINT "segments_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "services" ADD CONSTRAINT "services_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscription_requests" ADD CONSTRAINT "subscription_requests_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "technicians" ADD CONSTRAINT "technicians_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "appointments_date_idx" ON "appointments" USING btree ("org_id","branch_id","scheduled_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "appointments_bay_idx" ON "appointments" USING btree ("org_id","scheduled_date","bay");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_entity_idx" ON "audit_log" USING btree ("org_id","entity","entity_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_ts_idx" ON "audit_log" USING btree ("org_id","ts");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "branches_org_idx" ON "branches" USING btree ("org_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "coa_org_code_idx" ON "chart_of_accounts" USING btree ("org_id","code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "customers_org_idx" ON "customers" USING btree ("org_id","branch_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "customers_org_phone_idx" ON "customers" USING btree ("org_id","phone");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "estimate_lines_estimate_idx" ON "estimate_lines" USING btree ("org_id","estimate_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "estimates_org_code_idx" ON "estimates" USING btree ("org_id","code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "estimates_org_idx" ON "estimates" USING btree ("org_id","branch_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "expenses_org_code_idx" ON "expenses" USING btree ("org_id","code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "fleets_org_idx" ON "fleets" USING btree ("org_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idempotency_org_key_idx" ON "idempotency_keys" USING btree ("org_id","key","endpoint");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inventory_movements_part_idx" ON "inventory_movements" USING btree ("org_id","part_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoice_lines_invoice_idx" ON "invoice_lines" USING btree ("org_id","invoice_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "invoices_org_code_idx" ON "invoices" USING btree ("org_id","code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoices_org_idx" ON "invoices" USING btree ("org_id","branch_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "job_cards_org_code_idx" ON "job_cards" USING btree ("org_id","code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_cards_org_idx" ON "job_cards" USING btree ("org_id","branch_id","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_cards_tech_idx" ON "job_cards" USING btree ("org_id","assigned_tech_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "journal_org_code_idx" ON "journal_entries" USING btree ("org_id","code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leads_stage_idx" ON "leads" USING btree ("org_id","stage");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "otp_destination_idx" ON "otp_challenges" USING btree ("destination","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "parts_org_sku_idx" ON "parts" USING btree ("org_id","sku");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "parts_org_idx" ON "parts" USING btree ("org_id","branch_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payments_invoice_idx" ON "payments" USING btree ("org_id","invoice_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "po_lines_po_idx" ON "purchase_order_lines" USING btree ("org_id","purchase_order_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "purchase_orders_org_code_idx" ON "purchase_orders" USING btree ("org_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "receipts_org_code_idx" ON "receipts" USING btree ("org_id","code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "technicians_org_idx" ON "technicians" USING btree ("org_id","branch_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_sessions_user_idx" ON "user_sessions" USING btree ("org_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_org_email_idx" ON "users" USING btree ("org_id","email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vehicles_org_idx" ON "vehicles" USING btree ("org_id","branch_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "vehicles_org_plate_idx" ON "vehicles" USING btree ("org_id","plate");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "vehicles_org_vin_idx" ON "vehicles" USING btree ("org_id","vin");