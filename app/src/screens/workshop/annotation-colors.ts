import type { InspectionAnnotation } from '@/data/repository'

/** The two brand tones an annotation may be drawn in — never an arbitrary
 *  attacker-supplied colour (`packages/contract/src/entities/inspection.ts`).
 *  Shared between the technician's annotator (`InspectionEvidence.tsx`) and
 *  the customer's read-only report (`CustomerHealthCheckReport.tsx`) so a mark
 *  renders in the same colour wherever it is shown. */
export const ANNOTATION_COLOR: Record<InspectionAnnotation['color'], string> = {
  blue: 'var(--salis-blue)',
  orange: 'var(--salis-orange)',
}
