import { useState } from 'react'
import { AccordionCells, DocCell, SelectField } from '@mbari/react-ui'
import {
  useDeployments,
  useDocuments,
  GetDocumentsResponse,
} from '@mbari/api-client'
import { DateTime } from 'luxon'
import { faPlus } from '@fortawesome/pro-regular-svg-icons'
import { AccessoryButton } from '@mbari/react-ui'

type FilterType =
  | 'This Vehicle'
  | 'By Deployment'
  | 'Unattached'
  | 'Forms'
  | 'Templates'
  | 'All Documents'

const FILTER_TYPES: FilterType[] = [
  'This Vehicle',
  'By Deployment',
  'Unattached',
  'Forms',
  'Templates',
  'All Documents',
]

const filterByType = (params: {
  type: FilterType
  doc: GetDocumentsResponse
  deploymentId: string | null
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
      return params.doc.vehicleNames?.includes(params.vehicleName ?? '')
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

interface DocsSectionProps {
  authenticated?: boolean
  vehicleName: string
  onSelect?: () => void
  onSelectMore?: () => void
  onSelectMission?: (id: string) => void
}

const DocsSection: React.FC<DocsSectionProps> = ({
  authenticated,
  onSelect,
  onSelectMission,
  onSelectMore,
  vehicleName,
}) => {
  const [selectedType, setSelectedType] = useState<FilterType>('All Documents')
  const [selectedDeployment, setSelectedDeployment] =
    useState<null | string>(null)
  const isFilteringDeployment = selectedType === 'By Deployment'

  const { data: documentData } = useDocuments()
  const { data: deploymentData } = useDeployments(
    {
      vehicle: vehicleName,
    },
    {
      enabled: isFilteringDeployment,
    }
  )
  const data = documentData?.filter((doc) =>
    filterByType({
      type: selectedType,
      doc,
      deploymentId: selectedDeployment,
      vehicleName,
    })
  )

  const cellAtIndex = (index: number) => {
    const item = data?.[index]
    const briefs = item?.deploymentBriefs?.map(({ deploymentId, name }) => ({
      id: deploymentId ? deploymentId.toString() : '',
      name: name ?? '',
    }))

    const unixTime = item?.latestRevision?.unixTime
    const time = unixTime
      ? DateTime.fromMillis(unixTime).toLocaleString(
          DateTime.TIME_24_WITH_SECONDS
        )
      : ''

    const date = unixTime
      ? DateTime.fromMillis(unixTime).toLocaleString(DateTime.DATE_FULL)
      : ''

    return (
      <DocCell
        className={'border-b border-slate-200'}
        label={item?.name ?? ''}
        missions={briefs?.length ? briefs : []}
        time={time}
        date={date}
        onSelectMission={() => onSelectMission}
        onSelectMore={() => onSelectMore}
        onSelect={() => onSelect}
      />
    )
  }

  return (
    <>
      <header className="flex p-2">
        <div className="flex flex-grow flex-col">
          <SelectField
            name="Filter"
            options={FILTER_TYPES.map((name) => ({ name, id: name }))}
            className="flex-grow"
            value={selectedType}
            onSelect={(id) =>
              setSelectedType((id ?? 'All Documents') as FilterType)
            }
          />
          {isFilteringDeployment && (
            <SelectField
              name="Deployment"
              options={deploymentData?.map((d) => ({
                name: d.name,
                id: d.deploymentId?.toString(),
              }))}
              className="flex-grow"
              value={selectedDeployment ?? ''}
              onSelect={(id) => setSelectedDeployment(id ?? null)}
              clearable
            />
          )}
        </div>
        {authenticated && (
          <div className="mb-auto flex pl-2">
            <AccessoryButton icon={faPlus} label={'Add Document'} />
          </div>
        )}
      </header>
      <AccordionCells cellAtIndex={cellAtIndex} count={data?.length} />
    </>
  )
}

export default DocsSection
