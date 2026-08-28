/** Drizzle schema (Postgres dialect).
 *
 *  One schema serves both drivers: zero-setup PGlite (default) and real
 *  Postgres via DATABASE_URL. Every data table carries a surrogate `pk` for a
 *  stable primary key; it is never selected into API responses (see
 *  `contractColumns` in routes/collections.ts), so served rows match the exact
 *  shapes in app/src/data/generated/tables.ts.
 *
 *  Column *property names* are deliberately identical to the frontend contract
 *  keys so a Drizzle select yields the contract shape with no remapping. */
import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core'

// ─── Auth ────────────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  pk: serial('pk').primaryKey(),
  id: text('id').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull(),
  name: text('name').notNull(),
  ar: text('ar').notNull().default(''),
  scope: text('scope').notNull().default('own'),
  orgId: text('org_id').notNull().default('org-salis'),
  branchId: text('branch_id').notNull().default('branch-riyadh-main'),
})

export const refreshTokens = pgTable('refresh_tokens', {
  token: text('token').primaryKey(),
  userId: text('user_id').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revoked: boolean('revoked').notNull().default(false),
})

// ─── Workshop core ───────────────────────────────────────────────────────────
export const jobs = pgTable('jobs', {
  pk: serial('pk').primaryKey(),
  id: text('id').notNull(),
  cust: text('cust').notNull(),
  veh: text('veh').notNull(),
  svc: text('svc').notNull(),
  st: text('st').notNull(),
  pr: text('pr').notNull(),
})

export const appointments = pgTable('appointments', {
  pk: serial('pk').primaryKey(),
  time: text('time').notNull(),
  cust: text('cust').notNull(),
  veh: text('veh').notNull(),
  plate: text('plate').notNull(),
  svc: text('svc').notNull(),
  status: text('status').notNull(),
  bay: text('bay').notNull(),
  tech: text('tech').notNull(),
  mins: integer('mins').notNull(),
})

export const estimates = pgTable('estimates', {
  pk: serial('pk').primaryKey(),
  id: text('id').notNull(),
  cust: text('cust').notNull(),
  veh: text('veh').notNull(),
  amount: text('amount').notNull(),
  status: text('status').notNull(),
})

export const invoices = pgTable('invoices', {
  pk: serial('pk').primaryKey(),
  id: text('id').notNull(),
  cust: text('cust').notNull(),
  amount: text('amount').notNull(),
  due: text('due').notNull(),
  status: text('status').notNull(),
})

export const receipts = pgTable('receipts', {
  pk: serial('pk').primaryKey(),
  id: text('id').notNull(),
  date: text('date').notNull(),
  customer: text('customer').notNull(),
  invoice: text('invoice').notNull(),
  method: text('method').notNull(),
  amount: text('amount').notNull(),
  status: text('status').notNull(),
})

// ─── Customers, vehicles, fleets ─────────────────────────────────────────────
export const customers = pgTable('customers', {
  pk: serial('pk').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  vehicles: integer('vehicles').notNull(),
  spent: text('spent').notNull(),
  last: text('last').notNull(),
})

export const vehicles = pgTable('vehicles', {
  pk: serial('pk').primaryKey(),
  plate: text('plate').notNull(),
  make: text('make').notNull(),
  owner: text('owner').notNull(),
  mileage: text('mileage').notNull(),
  last: text('last').notNull(),
  status: text('status').notNull(),
})

export const fleets = pgTable('fleets', {
  pk: serial('pk').primaryKey(),
  name: text('name').notNull(),
  vehicles: integer('vehicles').notNull(),
  active: integer('active').notNull(),
  contract: text('contract').notNull(),
})

// ─── Inventory & team ────────────────────────────────────────────────────────
export const parts = pgTable('parts', {
  pk: serial('pk').primaryKey(),
  name: text('name').notNull(),
  sku: text('sku').notNull(),
  stock: integer('stock').notNull(),
  reorder: integer('reorder').notNull(),
  price: text('price').notNull(),
})

export const technicians = pgTable('technicians', {
  pk: serial('pk').primaryKey(),
  name: text('name').notNull(),
  specialty: text('specialty').notNull(),
  jobs: integer('jobs').notNull(),
  rating: text('rating').notNull(),
})

// ─── CRM ─────────────────────────────────────────────────────────────────────
export const leads = pgTable('leads', {
  pk: serial('pk').primaryKey(),
  name: text('name').notNull(),
  company: text('company').notNull(),
  value: text('value').notNull(),
  source: text('source').notNull(),
  stage: text('stage').notNull(),
  date: text('date').notNull(),
  score: integer('score').notNull(),
})

export const opportunities = pgTable('opportunities', {
  pk: serial('pk').primaryKey(),
  name: text('name').notNull(),
  company: text('company').notNull(),
  value: text('value').notNull(),
  stage: text('stage').notNull(),
  prob: text('prob').notNull(),
  close: text('close').notNull(),
  owner: text('owner').notNull(),
})

export const crmTasks = pgTable('crm_tasks', {
  pk: serial('pk').primaryKey(),
  title: text('title').notNull(),
  assigned: text('assigned').notNull(),
  due: text('due').notNull(),
  priority: text('priority').notNull(),
  status: text('status').notNull(),
  type: text('type').notNull(),
})

export const segments = pgTable('segments', {
  pk: serial('pk').primaryKey(),
  name: text('name').notNull(),
  count: integer('count').notNull(),
  rules: text('rules').notNull(),
  lastUpdated: text('lastUpdated').notNull(),
})

export const campaigns = pgTable('campaigns', {
  pk: serial('pk').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  status: text('status').notNull(),
  reach: integer('reach').notNull(),
  opens: integer('opens').notNull(),
  clicks: integer('clicks').notNull(),
  conversions: integer('conversions').notNull(),
  budget: text('budget').notNull(),
  spent: text('spent').notNull(),
})

// ─── Accounting ──────────────────────────────────────────────────────────────
export const chartOfAccounts = pgTable('chart_of_accounts', {
  pk: serial('pk').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  balance: text('balance').notNull(),
  children: integer('children').notNull(),
})

export const journalEntries = pgTable('journal_entries', {
  pk: serial('pk').primaryKey(),
  id: text('id').notNull(),
  date: text('date').notNull(),
  ref: text('ref').notNull(),
  narration: text('narration').notNull(),
  debit: text('debit').notNull(),
  credit: text('credit').notNull(),
  status: text('status').notNull(),
})

export const expenses = pgTable('expenses', {
  pk: serial('pk').primaryKey(),
  id: text('id').notNull(),
  date: text('date').notNull(),
  category: text('category').notNull(),
  vendor: text('vendor').notNull(),
  amount: text('amount').notNull(),
  status: text('status').notNull(),
})

// ─── AI platform & knowledge base ────────────────────────────────────────────
export const aiAgents = pgTable('ai_agents', {
  pk: serial('pk').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  model: text('model').notNull(),
  status: text('status').notNull(),
  tasks: integer('tasks').notNull(),
  success: text('success').notNull(),
  icon: text('icon').notNull(),
})

export const conversations = pgTable('conversations', {
  pk: serial('pk').primaryKey(),
  title: text('title').notNull(),
  user: text('user').notNull(),
  msgs: integer('msgs').notNull(),
  date: text('date').notNull(),
  tokens: text('tokens').notNull(),
})

export const kbProcedures = pgTable('kb_procedures', {
  pk: serial('pk').primaryKey(),
  id: text('id').notNull(),
  title: text('title').notNull(),
  ar: text('ar').notNull(),
  cat: text('cat').notNull(),
  make: text('make').notNull(),
  mins: integer('mins').notNull(),
  torque: text('torque').notNull(),
  ar_torque: text('ar_torque').notNull(),
  steps: integer('steps').notNull(),
  views: integer('views').notNull(),
  tsb: boolean('tsb').notNull(),
  media: text('media').notNull(),
})
