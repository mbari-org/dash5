import { AccordionCells, DocCell, SelectField } from '@mbari/react-ui'
import { useDocuments } from '@mbari/api-client'
import { DateTime } from 'luxon'
import { faPlus } from '@fortawesome/pro-regular-svg-icons'
import { AccessoryButton } from '@mbari/react-ui'

interface DocsSectionProps {
  authenticated?: boolean
  onSelect?: () => void
  onSelectMore?: () => void
  onSelectMission?: (id: string) => void
}

const DocsSection: React.FC<DocsSectionProps> = ({
  authenticated,
  onSelect,
  onSelectMission,
  onSelectMore,
}) => {
  const { data } = useDocuments()

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
        <SelectField name="Filter"></SelectField>
        {authenticated && (
          <span className="flex flex-grow justify-end">
            <AccessoryButton icon={faPlus} label={'Add Document'} />
          </span>
        )}
      </header>
      <AccordionCells cellAtIndex={cellAtIndex} count={data?.length} />
    </>
  )
}

export default DocsSection
