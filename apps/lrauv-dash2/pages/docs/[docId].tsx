import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import {
  useCreateDocumentInstance,
  useDocumentInstance,
  useDocuments,
  useTethysApiContext,
} from '@mbari/api-client'
import DocEditor from '../../components/docs/DocEditor'
import { DocumentType } from '../../components/docs/types/docTypes'
import DocInstanceSelect from '../../components/docs/DocInstanceSelect'

function toDocType(s?: string): DocumentType {
  if (s === 'FORM' || s === 'TEMPLATE' || s === 'FILLED') return s
  return 'NORMAL'
}

export default function DocDispatchPage() {
  const router = useRouter()
  const { authenticated, axiosInstance, token } = useTethysApiContext()
  const { docId } = router.query
  const [isEditing, setIsEditing] = useState(false)
  const queryDocInstanceId =
    typeof router.query.docInstanceId === 'string'
      ? router.query.docInstanceId
      : undefined

  const { data: docs } = useDocuments(
    typeof docId === 'string' ? { docId } : undefined
  )

  const latestInstanceId = useMemo(() => {
    const doc = (docs ?? [])[0]
    if (!doc) return undefined
    // Prefer latestRevision if available, fallback to first instance brief
    if (doc.latestRevision?.docInstanceId) {
      return String(doc.latestRevision.docInstanceId)
    }
    const first = doc.docInstanceBriefs?.[0]?.docInstanceId
    return first ? String(first) : undefined
  }, [docs])

  const [selectedInstanceId, setSelectedInstanceId] = useState<
    string | undefined
  >(queryDocInstanceId)

  const instanceId =
    selectedInstanceId ?? queryDocInstanceId ?? latestInstanceId

  const instanceQuery = useDocumentInstance(
    instanceId ? { docInstanceId: instanceId } : { docInstanceId: '' },
    { enabled: !!instanceId }
  )
  const createInstance = useCreateDocumentInstance()

  const docType: DocumentType = toDocType((docs ?? [])[0]?.docType)
  const withFormInputs = docType === 'FORM'
  const text = instanceQuery.data?.text ?? ''

  const [fullHtml, setFullHtml] = useState(text)

  useEffect(() => {
    if (!authenticated && isEditing) {
      setIsEditing(false)
    }
  }, [authenticated, isEditing])

  const handleSaveFull = async () => {
    if (!authenticated || !docs?.[0]?.docId) return
    await createInstance.mutateAsync({
      docId: docs[0].docId!,
      text: fullHtml,
    })
    setIsEditing(false)
  }

  const handleSaveFilled = async (updated: string) => {
    if (!authenticated || !docs?.[0]?.docId) return
    await createInstance.mutateAsync({
      docId: docs[0].docId!,
      text: updated,
    })
    setIsEditing(false)
  }

  const handleDeleteRevision = async () => {
    if (!authenticated || !instanceId || !axiosInstance) return
    await axiosInstance.delete('/documents/instance', {
      params: { docInstanceId: instanceId },
      headers: { Authorization: `Bearer ${token}` },
    })
    // refresh
    setSelectedInstanceId(undefined)
  }

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1>{instanceQuery.data?.docName ?? 'Document'}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {instanceQuery.data?.docInstanceBriefs?.length ? (
            <DocInstanceSelect
              instances={instanceQuery.data.docInstanceBriefs}
              value={instanceId}
              onChange={(v) => setSelectedInstanceId(v)}
            />
          ) : null}
          {authenticated ? (
            <>
              {!isEditing ? (
                <button type="button" onClick={() => setIsEditing(true)}>
                  {docType === 'FILLED' ? 'Fill in' : 'Edit'}
                </button>
              ) : docType === 'FILLED' ? null : (
                <button type="button" onClick={handleSaveFull}>
                  Save
                </button>
              )}
              <button type="button" onClick={handleDeleteRevision}>
                Delete revision
              </button>
            </>
          ) : (
            <span style={{ fontStyle: 'italic', color: '#57534e' }}>
              Sign in to add or edit
            </span>
          )}
        </div>
      </div>

      {!instanceId || instanceQuery.isLoading ? (
        <div>Loading…</div>
      ) : (
        <DocEditor
          docType={docType}
          isEditing={authenticated && isEditing}
          html={text}
          onChange={setFullHtml}
          onSaveFilled={handleSaveFilled}
          withFormInputs={withFormInputs}
        />
      )}
    </div>
  )
}
