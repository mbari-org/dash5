import { CellVirtualizer, HandoffCell, Virtualizer } from '@mbari/react-ui'
import { useEvents } from '@mbari/api-client'
import { AccessoryButton } from '@mbari/react-ui'
import { faPlus } from '@fortawesome/pro-regular-svg-icons'

interface HandoffSectionProps {
  vehicleName: string
  from: string
  to?: string
  authenticated?: boolean
}

const HandoffSection: React.FC<HandoffSectionProps> = ({
  vehicleName,
  from,
  to,
  authenticated,
}) => {
  const { data } = useEvents({
    vehicles: [vehicleName],
    eventTypes: ['note'],
    from,
    to,
  })

  const cellAtIndex = (index: number, _virtualizer: Virtualizer) => {
    const item = data?.[index]
    const isPicNote = item?.note === 'Signing in as PIC'
    const previousPic = isPicNote
      ? data?.find((d, i) => i > index && d.note === 'Signing in as PIC')
      : undefined
    const displayNote = isPicNote
      ? `${item?.note} from ${previousPic?.user ?? 'previous PIC'}.`
      : item?.note
    return (
      <HandoffCell
        date={item?.isoTime ?? ''}
        note={displayNote ?? ''}
        pilot={item?.user ?? ''}
        pic={isPicNote}
        className="border-b border-slate-200"
      />
    )
  }

  return (
    <>
      {authenticated && (
        <header className="flex p-2">
          <AccessoryButton icon={faPlus} label="Add Note" />
        </header>
      )}
      <div className="relative flex h-full flex-shrink flex-grow">
        <CellVirtualizer
          cellAtIndex={cellAtIndex}
          count={data?.length ?? 0}
          className="absolute inset-0 w-full"
        />
      </div>
    </>
  )
}

export default HandoffSection
