import { CellVirtualizer, HandoffCell, Virtualizer } from '@mbari/react-ui'
import { useEvents } from '@mbari/api-client'

interface HandoffSectionProps {
  vehicleName: string
  from: string
  to?: string
}

const HandoffSection: React.FC<HandoffSectionProps> = ({
  vehicleName,
  from,
  to,
}) => {
  const { data } = useEvents({
    vehicles: [vehicleName],
    eventTypes: ['note'],
    from,
    to,
  })
  const cellAtIndex = (index: number, _virtualizer: Virtualizer) => {
    const item = data?.[index]
    const isPicNote = item.note === 'Signing in as PIC'
    const previousPic = isPicNote
      ? data?.find((d, i) => i > index && d.note === 'Signing in as PIC')
      : undefined
    return (
      <HandoffCell
        date={item.isoTime}
        note={
          isPicNote
            ? `${item.note} from ${previousPic?.user ?? 'previous PIC'}.`
            : item.note
        }
        pilot={item.user}
        pic={isPicNote}
        className="border-b border-slate-200"
      />
    )
  }

  return (
    <div className="relative flex h-full flex-shrink flex-grow">
      <CellVirtualizer
        cellAtIndex={cellAtIndex}
        count={data?.length ?? 0}
        className="absolute inset-0 w-full"
      />
    </div>
  )
}

export default HandoffSection
