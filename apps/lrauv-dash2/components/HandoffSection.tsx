import { CellVirtualizer, HandoffCell, Virtualizer } from '@mbari/react-ui'
import { useEvents } from '@mbari/api-client'
import { AccessoryButton } from '@mbari/react-ui'
import { faPlus } from '@fortawesome/pro-regular-svg-icons'
import useGlobalModalId from '../lib/useGlobalModalId'

const PIC_NOTE = 'Signing in as PIC'
const ON_CALL_NOTE = 'Signing in as On-Call'

interface HandoffSectionProps {
  vehicleName: string
  from: string
  to?: string
  authenticated?: boolean
  activeDeployment?: boolean
}

const HandoffSection: React.FC<HandoffSectionProps> = ({
  vehicleName,
  from,
  to,
  authenticated,
  activeDeployment,
}) => {
  const { setGlobalModalId } = useGlobalModalId()
  const { data } = useEvents({
    vehicles: [vehicleName],
    eventTypes: ['note'],
    from,
    to,
  })

  const handleAddNote = () => {
    console.log('add note')
    setGlobalModalId('sendNote')
  }

  const cellAtIndex = (index: number, _virtualizer: Virtualizer) => {
    const item = data?.[index]
    const isPicNote = item?.note === PIC_NOTE
    const isOnCall = item?.note === ON_CALL_NOTE
    const previousSignin = isPicNote
      ? data?.find(
          (d, i) => i > index && d.note === (isOnCall ? PIC_NOTE : ON_CALL_NOTE)
        )
      : undefined
    const displayNote = isPicNote
      ? `${item?.note} from ${previousSignin?.user ?? 'previous operator'}.`
      : item?.note
    return (
      <HandoffCell
        date={item?.isoTime ?? ''}
        note={displayNote ?? ''}
        pilot={item?.user ?? ''}
        pic={isPicNote || isOnCall}
        className="border-b border-slate-200"
      />
    )
  }

  return (
    <>
      {authenticated && (
        <header className="flex p-2">
          <AccessoryButton
            icon={faPlus}
            label="Add Note"
            onClick={handleAddNote}
            disabled={!activeDeployment}
          />
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
