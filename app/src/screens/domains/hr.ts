/** Screens owned by agent 14 — HR.
 *
 *  Employees, payroll, leave, timesheets, scheduling and performance.
 *
 *  Nobody else edits this file. `screens/registry.ts` composes it with the other
 *  domains and refuses to let two of them claim the same screen name, which is
 *  why ten agents can add routes at once without meeting in `routes/index.tsx`.
 *
 *  A bare component renders in the operational shell. Use the object form to say
 *  otherwise — `shell: null` for a screen with no chrome, or a shell component
 *  this domain owns and imports here.
 *
 *  Keyed by the exact registry names (`app/src/data/generated/screens.ts` for the
 *  designed `HRPayroll`, `spec-screens.ts` for the six feature-map screens). Two
 *  pairs share one component because they list one backend collection between
 *  them: `Staff-Directory` / `HR-Management` (employees) and `Timesheet-Management`
 *  / `Timeclock-Payroll` (timesheets). `Staff-Scheduling` and
 *  `Staff-Performance-Review` have no backend, so they render an honest gap shell
 *  rather than fake rows. */
import type { DomainScreens } from '../registry'
import { HRPayroll } from '../hr/HRPayroll'
import { StaffDirectory } from '../hr/StaffDirectory'
import { PayrollManagement } from '../hr/PayrollManagement'
import { LeaveRequests } from '../hr/LeaveRequests'
import { Timesheets } from '../hr/Timesheets'
import { StaffScheduling, StaffPerformanceReview } from '../hr/StaffGap'
import { TechnicianManagement } from '../hr/TechnicianManagement'
import { TechnicianLeaderboards } from '../hr/TechnicianLeaderboards'
import { TechnicianPerformance } from '../hr/TechnicianPerformance'
import { TrainingLMS } from '../hr/TrainingLMS'
import { ProductivityTracker } from '../hr/ProductivityTracker'

export const SCREENS: DomainScreens = {
  HRPayroll,
  'Staff-Directory': StaffDirectory,
  'HR-Management': StaffDirectory,
  'Payroll-Management': PayrollManagement,
  'Timesheet-Management': Timesheets,
  'Timeclock-Payroll': Timesheets,
  'Leave-Requests': LeaveRequests,
  'Staff-Scheduling': StaffScheduling,
  'Staff-Performance-Review': StaffPerformanceReview,
  'Technician-Management': TechnicianManagement,
  'Technician-Leaderboards': TechnicianLeaderboards,
  'Technician-Performance': TechnicianPerformance,
  'Training-LMS': TrainingLMS,
  'Productivity-Tracker': ProductivityTracker,
}
