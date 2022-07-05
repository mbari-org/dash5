import { CellVirtualizer, Virtualizer } from '@mbari/react-ui'
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

    return (
      <div className="border-b border-b-stone-200">
        <p className="font-bold">{item.note}</p>
        <p>{item.isoTime}</p>
      </div>
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
