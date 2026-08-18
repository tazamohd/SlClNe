/** Screens owned by agent 12 — Accounting / Finance.
 *
 *  Ledger, tax, reconciliation, statements and the financial-integrity chain from invoice through payment and receipt to the reports.
 *
 *  Nobody else edits this file. `screens/registry.ts` composes it with the other
 *  domains and refuses to let two of them claim the same screen name, which is
 *  why ten agents can add routes at once without meeting in `routes/index.tsx`.
 *
 *  A bare component renders in the operational shell. Use the object form to say
 *  otherwise — `shell: null` for a screen with no chrome, or a shell component
 *  this domain owns and imports here. */
import type { DomainScreens } from '../registry'
import { InvoicePreview } from '../finance/InvoicePreview'
import { TaxManagement } from '../finance/TaxManagement'
import { BankReconciliation } from '../finance/BankReconciliation'
import {
  CustomReports,
  Reports,
  ReportsAnalytics,
  SalesReports,
} from '../accounting/ReportSuite'
import { InsuranceReports, LoanReports } from '../accounting/GapReports'

/** Screens this tranche adds. Every name here is NEW — the ledger, invoice and
 *  report screens the legacy app map already claims (ChartOfAccounts,
 *  FinancialReports, …) are declared there, and re-declaring one would throw at
 *  composition. These are the designed screens that were still awaiting a build. */
import { GeneralLedger } from '../accounting/GeneralLedger'
import { TrialBalance } from '../accounting/TrialBalance'
import { BalanceSheet } from '../accounting/BalanceSheet'
import { IncomeStatement } from '../accounting/IncomeStatement'
import { CashFlowStatement } from '../accounting/CashFlowStatement'
import { AccountsReceivable } from '../accounting/AccountsReceivable'
import { AccountsPayable } from '../accounting/AccountsPayable'
import { BankAccountManagement } from '../accounting/BankAccountManagement'
import { BudgetManagement } from '../accounting/BudgetManagement'
import { CapitalManagement } from '../accounting/CapitalManagement'
import { AssetsManagement } from '../accounting/AssetsManagement'
import { LiabilitiesManagement } from '../accounting/LiabilitiesManagement'
import { EquityManagement } from '../accounting/EquityManagement'
import { RetainedEarnings } from '../accounting/RetainedEarnings'
import { CostCenters } from '../accounting/CostCenters'
import { LossAccount } from '../accounting/LossAccount'
import { PartnersCurrentAccount } from '../accounting/PartnersCurrentAccount'
import { ExpenseTracking } from '../accounting/ExpenseTracking'
import { ExpensesManagement } from '../accounting/ExpensesManagement'
import { SalesManagement } from '../accounting/SalesManagement'
import { AccountingIntegration } from '../accounting/AccountingIntegration'
import { WarrantyManagement } from '../accounting/WarrantyManagement'
import { ContractManagement } from '../accounting/ContractManagement'
import { AccountingConfig } from '../accounting/AccountingConfig'

export const SCREENS: DomainScreens = {
  InvoicePreview,
  TaxManagement,
  BankReconciliation,
  Reports,
  ReportsAnalytics,
  SalesReports,
  CustomReports,
  InsuranceReports,
  LoanReports,
  'General-Ledger': GeneralLedger,
  'Trial-Balance': TrialBalance,
  'Balance-Sheet': BalanceSheet,
  'Income-Statement': IncomeStatement,
  'Cash-Flow-Statement': CashFlowStatement,
  'Accounts-Receivable': AccountsReceivable,
  'Accounts-Payable': AccountsPayable,
  'Bank-Account-Management': BankAccountManagement,
  'Budget-Management': BudgetManagement,
  'Capital-Management': CapitalManagement,
  'Assets-Management': AssetsManagement,
  'Liabilities-Management': LiabilitiesManagement,
  'Equity-Management': EquityManagement,
  'Retained-Earnings': RetainedEarnings,
  'Cost-Centers': CostCenters,
  'Loss-Account': LossAccount,
  'Partners-Current-Account': PartnersCurrentAccount,
  'Expense-Tracking': ExpenseTracking,
  'Expenses-Management': ExpensesManagement,
  'Sales-Management': SalesManagement,
  'Accounting-Integration': AccountingIntegration,
  'Warranty-Management': WarrantyManagement,
  'Contract-Management': ContractManagement,
  'Accounting-Config': AccountingConfig,
}
