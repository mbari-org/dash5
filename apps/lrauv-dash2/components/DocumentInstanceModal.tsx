import React, { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Modal, Input } from '@mbari/react-ui'
import useSelectedDocumentInstance from '../lib/useSelectedDocumentInstance'
import {
  useDocumentInstance,
  useCreateDocument,
  useCreateDocumentInstance,
} from '@mbari/api-client'
import { useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import { wait } from '@mbari/utils'

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
})

const DocumentInstanceModal: React.FC<{ onClose?: () => void }> = ({
  onClose,
}) => {
  const [localStateLoading, setLocalStateLoading] = useState(false)

  const queryClient = useQueryClient()
  const { selectedDocumentInstance } = useSelectedDocumentInstance()
  const { mutate: createDocument, isLoading: creatingDocument } =
    useCreateDocument()
  const { mutate: updateDocument, isLoading: updatingDocument } =
    useCreateDocumentInstance()
  const [content, setContent] = useState('')
  const { data, isLoading } = useDocumentInstance(
    {
      docInstanceId: selectedDocumentInstance?.docInstanceId?.toString() ?? '0',
    },
    {
      enabled: !!selectedDocumentInstance?.docInstanceId,
    }
  )

  const [documentName, setDocumentName] = useState('')

  // Quill parses the raw HTML string into a slightly processed format.
  const [quillOriginalContent, setQuillOriginalContent] = useState('')
  const handleChange = (value: string) => {
    if (quillOriginalContent === '') {
      setQuillOriginalContent(value)
    }
    setContent(value)
  }

  const lastLoadedId = useRef<number | null | undefined>(null)
  useEffect(() => {
    if (
      lastLoadedId.current !== selectedDocumentInstance &&
      data?.text !== null &&
      !isLoading
    ) {
      lastLoadedId.current = selectedDocumentInstance?.docInstanceId
      setContent(data?.text ?? '')
      setDocumentName(
        `${data?.docName ?? ''}${
          selectedDocumentInstance?.duplicate ? ' (duplicate)' : ''
        }`
      )
      setQuillOriginalContent('')
    }
  }, [data, isLoading, lastLoadedId, selectedDocumentInstance])

  const handleNameChange: React.ChangeEventHandler<HTMLInputElement> = (e) =>
    setDocumentName(e.target.value)

  const handleConfirm = async () => {
    setLocalStateLoading(true)
    if (
      !selectedDocumentInstance?.duplicate &&
      selectedDocumentInstance?.docInstanceId
    ) {
      if (!data?.docId) {
        toast.error('No document data present.')
        return
      }
      await updateDocument({
        docId: data?.docId,
        newName: documentName,
        text: content,
      })
    } else {
      await createDocument({
        docType: 'NORMAL',
        name: documentName,
        text: content,
      })
    }
    await wait(2)
    queryClient.invalidateQueries(['document', 'documents'])
    toast.success('Document saved.')
    setLocalStateLoading(false)
    onClose?.()
  }

  return (
    <Modal
      title={
        selectedDocumentInstance?.docInstanceId &&
        !selectedDocumentInstance?.duplicate
          ? `Editing Document`
          : 'New Document'
      }
      onClose={onClose}
      confirmButtonText="Save"
      disableConfirm={
        !content ||
        (quillOriginalContent === content &&
          !selectedDocumentInstance?.duplicate)
      }
      onConfirm={handleConfirm}
      loading={
        isLoading || creatingDocument || updatingDocument || localStateLoading
      }
      maximized
      disableBodyScroll
      open
    >
      {isLoading ? null : (
        <>
          <div className="mb-2 flex">
            <Input
              name="documentName"
              value={documentName}
              className="flex-grow"
              onChange={handleNameChange}
            />
          </div>
          <div
            style={{
              height: 'calc(100vh - 280px)',
            }}
          >
            <ReactQuill
              theme="snow"
              value={content}
              onChange={handleChange}
              style={{
                height: 'calc(100% - 10px)',
              }}
            />
          </div>
        </>
      )}
    </Modal>
  )
}

export default DocumentInstanceModal
