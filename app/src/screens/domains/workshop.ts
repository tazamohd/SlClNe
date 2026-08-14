/** Screens owned by agent 08 — Workshop / Mini ERP.
 *
 *  The connected check-in → inspection → estimate → job card → QC → delivery → invoice chain, plus diagnostics, the approval inbox and the technician schedule.
 *
 *  Nobody else edits this file. `screens/registry.ts` composes it with the other
 *  domains and refuses to let two of them claim the same screen name, which is
 *  why ten agents can add routes at once without meeting in `routes/index.tsx`.
 *
 *  A bare component renders in the operational shell. Use the object form to say
 *  otherwise — `shell: null` for a screen with no chrome, or a shell component
 *  this domain owns and imports here. */
import type { DomainScreens } from '../registry'
import { JobCardDetail } from '../workshop/JobCardDetail'
import { ApprovalInbox } from '../workshop/ApprovalInbox'
import { EstimateDetail } from '../workshop/EstimateDetail'
import { AppointmentCalendar } from '../workshop/AppointmentCalendar'
import { TechnicianSchedule } from '../workshop/TechnicianSchedule'
import { TechnicianKB } from '../workshop/TechnicianKB'
import { OBDDiagnostics } from '../workshop/OBDDiagnostics'
import { DiagnosticReport } from '../workshop/DiagnosticReport'
import { WorkshopReports } from '../workshop/WorkshopReports'
import { CustomerApproval } from '../workshop/CustomerApproval'

export const SCREENS: DomainScreens = {
  JobCardDetail,
  ApprovalInbox,
  EstimateDetail,
  AppointmentCalendar,
  TechnicianSchedule,
  TechnicianKB,
  OBDDiagnostics,
  DiagnosticReport,
  WorkshopReports,
  CustomerApproval,
}
