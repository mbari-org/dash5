import { useEffect } from 'react'
import { SendNoteModal } from '@mbari/react-ui'
import { useCreateNote } from '@mbari/api-client'
import { useRouter } from 'next/router'
import { SendNoteFormValues } from '@mbari/react-ui/dist/Forms/SendNoteForm'
import toast from 'react-hot-toast'
import { capitalize } from '@mbari/utils'

const SendNote: React.FC<{ onClose?: () => void }> = ({
  onClose: handleClose,
}) => {
  const router = useRouter()
  const vehicle = router.query.deployment?.[0] as string
  const {
    mutate: createNote,
    isLoading,
    isError,
    error,
    data,
    isSuccess,
  } = useCreateNote()
  const handleSendNote = async (values: SendNoteFormValues) => {
    createNote({
      vehicle,
      note: values.note,
    })
    return undefined
  }

  useEffect(() => {
    if (!isLoading && isError) {
      toast.error((error as Error)?.message ?? 'Could not send your note.')
    }
  }, [isLoading, isError, error])

  useEffect(() => {
    if (!isLoading && isSuccess) {
      toast.success(
        `Your note about ${capitalize(data.vehicle)} has been sent.`
      )
      handleClose?.()
    }
  }, [isLoading, isSuccess, data, handleClose])

  return (
    <SendNoteModal
      onClose={handleClose}
      vehicleName={vehicle}
      onSubmit={handleSendNote}
      loading={isLoading}
      open
    />
  )
}

export default SendNote
