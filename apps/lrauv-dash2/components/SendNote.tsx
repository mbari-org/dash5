import { SendNoteModal } from '@mbari/react-ui'
import { useRouter } from 'next/router'

const SendNote: React.FC<{ onClose?: () => void }> = ({
  onClose: handleClose,
}) => {
  const router = useRouter()

  return (
    <SendNoteModal
      onClose={handleClose}
      vehicleName={router.query.deployment?.[0] as string}
      onSubmit={async (values) => {
        console.log('Create note:', values)
        return undefined
      }}
      open
    />
  )
}

export default SendNote
