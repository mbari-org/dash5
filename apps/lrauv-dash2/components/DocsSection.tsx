import {
  AccordionCells,
  DocCell,
  SelectField,
  Virtualizer,
} from '@mbari/react-ui'
import { useDocuments } from '@mbari/api-client'
import { DateTime } from 'luxon'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/pro-regular-svg-icons'

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

  const cellAtIndex = (index: number, _virtualizer: Virtualizer) => {
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
            <button className="rounded border-[1px] border-black/80 px-2">
              <FontAwesomeIcon icon={faPlus} /> Add Document
            </button>
          </span>
        )}
      </header>
      <AccordionCells cellAtIndex={cellAtIndex} count={data?.length} />
    </>
  )
}

export default DocsSection
