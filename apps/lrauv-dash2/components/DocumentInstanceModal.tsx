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

  // Quill parses the raw HTML string into a slightly processed format.
  const [quillOriginalContent, setQuillOriginalContent] = useState('')
  const handleChange = (value: string) => {
    if (quillOriginalContent === '') {
      setQuillOriginalContent(value)
    }
    setContent(value)
  }

  const lastLoadedId = useRef<string | null>(null)
  useEffect(() => {
    if (
      lastLoadedId.current !== selectedDocumentInstance &&
      data?.text !== null &&
      !isLoading
    ) {
      lastLoadedId.current = selectedDocumentInstance
      setContent(data?.text ?? '')
      setQuillOriginalContent('')
    }
  }, [data, isLoading, lastLoadedId, selectedDocumentInstance])

  return (
    <Modal
      title={`Editing Instance: ${selectedDocumentInstance}`}
      onClose={onClose}
      confirmButtonText="Save"
      disableConfirm={!content || quillOriginalContent === content}
      onConfirm={() => {
        console.log('')
      }}
      maximized
      disableBodyScroll
      open
    >
      {isLoading ? null : (
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
      )}
    </Modal>
  )
}

export default DocumentInstanceModal
