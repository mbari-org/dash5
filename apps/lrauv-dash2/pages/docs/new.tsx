import { useState } from 'react'
import { useRouter } from 'next/router'
import { useCreateDocument } from '@mbari/api-client'
import DocEditorTipTap from '../../components/docs/DocEditorTipTap'
import { DocumentType } from '../../components/docs/types/docTypes'

export default function NewDocPage() {
  const router = useRouter()
  const createDoc = useCreateDocument()
  const [name, setName] = useState('')
  const [docType, setDocType] = useState<DocumentType>('NORMAL')
  const [html, setHtml] = useState<string>('<p></p>')

  const handleCreate = async () => {
    const typeForCreate = docType === 'FILLED' ? 'FORM' : docType // cannot create FILLED directly
    const created = await createDoc.mutateAsync({
      name: name || 'Untitled',
      docType: typeForCreate as 'NORMAL' | 'FORM' | 'TEMPLATE',
      text: html,
    })
    if (created?.docId) {
      router.push(`/docs/${created.docId}`)
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>New Document</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input
          type="text"
          placeholder="Document name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value as DocumentType)}
        >
          <option value="NORMAL">NORMAL</option>
          <option value="FORM">FORM</option>
          <option value="TEMPLATE">TEMPLATE</option>
        </select>
        <button type="button" onClick={handleCreate}>
          Create
        </button>
      </div>
      <DocEditorTipTap
        html={html}
        onChange={setHtml}
        withFormInputs={docType === 'FORM'}
      />
    </div>
  )
}
