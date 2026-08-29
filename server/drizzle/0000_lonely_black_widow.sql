CREATE TABLE IF NOT EXISTS "ai_agents" (
	"pk" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"model" text NOT NULL,
	"status" text NOT NULL,
	"tasks" integer NOT NULL,
	"success" text NOT NULL,
	"icon" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "appointments" (
	"pk" serial PRIMARY KEY NOT NULL,
	"time" text NOT NULL,
	"cust" text NOT NULL,
	"veh" text NOT NULL,
	"plate" text NOT NULL,
	"svc" text NOT NULL,
	"status" text NOT NULL,
	"bay" text NOT NULL,
	"tech" text NOT NULL,
	"mins" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "campaigns" (
	"pk" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"status" text NOT NULL,
	"reach" integer NOT NULL,
	"opens" integer NOT NULL,
	"clicks" integer NOT NULL,
	"conversions" integer NOT NULL,
	"budget" text NOT NULL,
	"spent" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chart_of_accounts" (
	"pk" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"balance" text NOT NULL,
	"children" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "conversations" (
	"pk" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"user" text NOT NULL,
	"msgs" integer NOT NULL,
	"date" text NOT NULL,
	"tokens" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crm_tasks" (
	"pk" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"assigned" text NOT NULL,
	"due" text NOT NULL,
	"priority" text NOT NULL,
	"status" text NOT NULL,
	"type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customers" (
	"pk" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"vehicles" integer NOT NULL,
	"spent" text NOT NULL,
	"last" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "estimates" (
	"pk" serial PRIMARY KEY NOT NULL,
	"id" text NOT NULL,
	"cust" text NOT NULL,
	"veh" text NOT NULL,
	"amount" text NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "expenses" (
	"pk" serial PRIMARY KEY NOT NULL,
	"id" text NOT NULL,
	"date" text NOT NULL,
	"category" text NOT NULL,
	"vendor" text NOT NULL,
	"amount" text NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fleets" (
	"pk" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"vehicles" integer NOT NULL,
	"active" integer NOT NULL,
	"contract" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoices" (
	"pk" serial PRIMARY KEY NOT NULL,
	"id" text NOT NULL,
	"cust" text NOT NULL,
	"amount" text NOT NULL,
	"due" text NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "jobs" (
	"pk" serial PRIMARY KEY NOT NULL,
	"id" text NOT NULL,
	"cust" text NOT NULL,
	"veh" text NOT NULL,
	"svc" text NOT NULL,
	"st" text NOT NULL,
	"pr" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "journal_entries" (
	"pk" serial PRIMARY KEY NOT NULL,
	"id" text NOT NULL,
	"date" text NOT NULL,
	"ref" text NOT NULL,
	"narration" text NOT NULL,
	"debit" text NOT NULL,
	"credit" text NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kb_procedures" (
	"pk" serial PRIMARY KEY NOT NULL,
	"id" text NOT NULL,
	"title" text NOT NULL,
	"ar" text NOT NULL,
	"cat" text NOT NULL,
	"make" text NOT NULL,
	"mins" integer NOT NULL,
	"torque" text NOT NULL,
	"ar_torque" text NOT NULL,
	"steps" integer NOT NULL,
	"views" integer NOT NULL,
	"tsb" boolean NOT NULL,
	"media" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "leads" (
	"pk" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"company" text NOT NULL,
	"value" text NOT NULL,
	"source" text NOT NULL,
	"stage" text NOT NULL,
	"date" text NOT NULL,
	"score" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "opportunities" (
	"pk" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"company" text NOT NULL,
	"value" text NOT NULL,
	"stage" text NOT NULL,
	"prob" text NOT NULL,
	"close" text NOT NULL,
	"owner" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "parts" (
	"pk" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"sku" text NOT NULL,
	"stock" integer NOT NULL,
	"reorder" integer NOT NULL,
	"price" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "receipts" (
	"pk" serial PRIMARY KEY NOT NULL,
	"id" text NOT NULL,
	"date" text NOT NULL,
	"customer" text NOT NULL,
	"invoice" text NOT NULL,
	"method" text NOT NULL,
	"amount" text NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
	"token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "segments" (
	"pk" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"count" integer NOT NULL,
	"rules" text NOT NULL,
	"lastUpdated" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "technicians" (
	"pk" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"specialty" text NOT NULL,
	"jobs" integer NOT NULL,
	"rating" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"pk" serial PRIMARY KEY NOT NULL,
	"id" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text NOT NULL,
	"name" text NOT NULL,
	"ar" text DEFAULT '' NOT NULL,
	"scope" text DEFAULT 'own' NOT NULL,
	"org_id" text DEFAULT 'org-salis' NOT NULL,
	"branch_id" text DEFAULT 'branch-riyadh-main' NOT NULL,
	CONSTRAINT "users_id_unique" UNIQUE("id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vehicles" (
	"pk" serial PRIMARY KEY NOT NULL,
	"plate" text NOT NULL,
	"make" text NOT NULL,
	"owner" text NOT NULL,
	"mileage" text NOT NULL,
	"last" text NOT NULL,
	"status" text NOT NULL
);
