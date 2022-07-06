import { useMutation } from 'react-query'
import { createNote, CreateNoteParams } from '../../axios'
import { useTethysApiContext } from '../TethysApiProvider'

export const useCreateNote = () => {
  const { axiosInstance, token } = useTethysApiContext()
  const mutation = useMutation(
    (params: CreateNoteParams) => {
      return createNote(params, {
        instance: axiosInstance,
        headers: { Authorization: `Bearer ${token}` },
      })
    },
    {
      onSettled: (data) => {
        console.log('created note:', data)
      },
    }
  )
  return mutation
}
