import { useState } from 'react'
import { useRouter } from 'next/router'
import { useCreateDocument, useTethysApiContext } from '@mbari/api-client'
import DocEditorTipTap from '../../components/docs/DocEditorTipTap'
import { DocumentType } from '../../components/docs/types/docTypes'

export default function NewDocPage() {
  const router = useRouter()
  const { authenticated, loading: authLoading } = useTethysApiContext()
  const createDoc = useCreateDocument()
  const [name, setName] = useState('')
  const [docType, setDocType] = useState<DocumentType>('NORMAL')
  const [html, setHtml] = useState<string>('<p></p>')

  const handleCreate = async () => {
    if (!authenticated) return
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

  if (authLoading) {
    return (
      <div style={{ padding: 16 }}>
        <h1>New Document</h1>
        <div>Loading…</div>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div style={{ padding: 16 }}>
        <h1>New Document</h1>
        <p style={{ fontStyle: 'italic', color: '#57534e' }}>
          Sign in to add or edit
        </p>
      </div>
    )
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
