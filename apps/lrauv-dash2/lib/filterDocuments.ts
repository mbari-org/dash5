import { GetDocumentsResponse } from '@mbari/api-client'

export type DocumentFilterType =
  | 'This Vehicle'
  | 'By Deployment'
  | 'Unattached'
  | 'Forms'
  | 'Templates'
  | 'All Documents'

export const DOCUMENT_FILTER_TYPES: DocumentFilterType[] = [
  'This Vehicle',
  'By Deployment',
  'Unattached',
  'Forms',
  'Templates',
  'All Documents',
]

const filterDocuments = (params: {
  type: DocumentFilterType
  doc: GetDocumentsResponse
  deploymentId?: string | null
  vehicleName?: string
}) => {
  switch (params.type) {
    case 'By Deployment':
      if (params.deploymentId) {
        const briefs = params.doc?.deploymentBriefs
        const matches =
          briefs?.filter(
            (brief) => brief.deploymentId.toString() === params.deploymentId
          ).length ?? 0
        return matches > 0
      }

      return true
    case 'This Vehicle':
      return params.doc.vehicleNames
        ?.map((n) => n.toLowerCase())
        .includes(params.vehicleName?.toLowerCase() ?? '')
    case 'Unattached':
      const hasBriefs = params.doc.deploymentBriefs?.length ?? 0
      const hasVehicles = params.doc.vehicleNames?.length ?? 0
      const isTemplate = params.doc.docType === 'TEMPLATE'
      const isForm = params.doc.docType === 'FORM'
      return !hasBriefs && !hasVehicles && !isTemplate && !isForm
    case 'Forms':
      return params.doc.docType === 'FORM'
    case 'Templates':
      return params.doc.docType === 'TEMPLATE'
    default:
      return true
  }
}

export default filterDocuments
