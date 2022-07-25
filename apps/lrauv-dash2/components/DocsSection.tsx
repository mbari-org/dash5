import { useState } from 'react'
import { AccordionCells, DocCell, SelectField } from '@mbari/react-ui'
import { useDeployments, useDocuments } from '@mbari/api-client'
import { DateTime } from 'luxon'
import { faPlus } from '@fortawesome/pro-regular-svg-icons'
import { AccessoryButton } from '@mbari/react-ui'
import filterDocuments, {
  DOCUMENT_FILTER_TYPES,
  DocumentFilterType,
} from '../lib/filterDocuments'
import useGlobalModalId from '../lib/useGlobalModalId'
import useSelectedDocumentInstance from '../lib/useSelectedDocumentInstance'
import { swallow } from '@mbari/utils'

interface DocsSectionProps {
  authenticated?: boolean
  vehicleName: string
}

const DocsSection: React.FC<DocsSectionProps> = ({
  authenticated,
  vehicleName,
}) => {
  const { setGlobalModalId } = useGlobalModalId()
  const { setSelectedDocumentInstance } = useSelectedDocumentInstance()
  const [selectedType, setSelectedType] =
    useState<DocumentFilterType>('All Documents')
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
    filterDocuments({
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
        onSelectMission={() => undefined}
        onSelectMore={() => undefined}
        onSelect={() => {
          console.log('Selecting document: ', item?.name)
          setGlobalModalId('editDocument')
          setSelectedDocumentInstance(
            item?.latestRevision?.docInstanceId?.toString() ?? null
          )
        }}
      />
    )
  }

  const handleAddClick = swallow(() => {
    setGlobalModalId('editDocument')
    setSelectedDocumentInstance(null)
  })

  return (
    <>
      <header className="flex p-2">
        <div className="flex flex-grow flex-col">
          <SelectField
            name="Filter"
            options={DOCUMENT_FILTER_TYPES.map((name) => ({ name, id: name }))}
            className="flex-grow"
            value={selectedType}
            onSelect={(id) =>
              setSelectedType((id ?? 'All Documents') as DocumentFilterType)
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
            <AccessoryButton
              icon={faPlus}
              label={'Add Document'}
              onClick={handleAddClick}
            />
          </div>
        )}
      </header>
      <AccordionCells cellAtIndex={cellAtIndex} count={data?.length} />
    </>
  )
}

export default DocsSection
