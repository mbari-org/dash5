import React, { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Modal } from '@mbari/react-ui'
import useSelectedDocumentInstance from '../lib/useSelectedDocumentInstance'
import { useDocumentInstance } from '@mbari/api-client'

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
})

const DocumentInstanceModal: React.FC<{ onClose?: () => void }> = ({
  onClose,
}) => {
  const { selectedDocumentInstance } = useSelectedDocumentInstance()
  const [content, setContent] = useState('')
  const { data, isLoading } = useDocumentInstance(
    { docInstanceId: selectedDocumentInstance ?? '0' },
    {
      enabled: !!selectedDocumentInstance,
    }
  )
  const lastLoadedId = useRef<string | null>(null)
  useEffect(() => {
    if (
      lastLoadedId.current !== selectedDocumentInstance &&
      data?.text !== null
    ) {
      lastLoadedId.current = selectedDocumentInstance
      setContent(data?.text ?? '')
    }
  }, [data, isLoading, lastLoadedId, selectedDocumentInstance])

  return (
    <Modal
      title={`Editing Instance: ${selectedDocumentInstance}`}
      onClose={onClose}
      open
    >
      {isLoading ? null : (
        <ReactQuill theme="snow" value={content} onChange={setContent} />
      )}
    </Modal>
  )
}

export default DocumentInstanceModal
