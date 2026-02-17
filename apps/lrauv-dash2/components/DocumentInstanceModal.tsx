import React, { useEffect, useRef, useState } from 'react'
import { Modal, Input, AccessoryButton, Button, Dialog } from '@mbari/react-ui'
import useGlobalModalId from '../lib/useGlobalModalId'
import {
  useDocumentInstance,
  useCreateDocument,
  useCreateDocumentInstance,
  useDeleteDocumentInstance,
} from '@mbari/api-client'
import { useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import { wait } from '@mbari/utils'
import { DateTime } from 'luxon'
import DocEditor from './docs/DocEditor'
import DocViewer from './docs/DocViewer'
import DocInstanceSelect from './docs/DocInstanceSelect'
import { DocumentType, NewDocRequest } from './docs/types/docTypes'
import { useDocuments } from '@mbari/api-client'

function isDocumentType(s?: string): s is DocumentType {
  return s === 'NORMAL' || s === 'FORM' || s === 'TEMPLATE' || s === 'FILLED'
}

function isMeaningfulHtml(html: string): boolean {
  if (!html) return false
  // Allow form-only docs that may have no text content.
  if (/<(input|textarea)\b/i.test(html)) return true
  // Strip tags and whitespace (including &nbsp;) to detect real text.
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > 0
}

function deriveCreateDocType(
  req: NewDocRequest | undefined,
  duplicate?: boolean
) {
  if (!req) return duplicate ? ('NORMAL' as const) : ('NORMAL' as const)
  if (req.action === 'newEmpty') return req.docType
  return req.sourceDoc.docType === 'FORM'
    ? ('FILLED' as const)
    : ('NORMAL' as const)
}

const DocumentInstanceModal: React.FC<{ onClose?: () => void }> = ({
  onClose,
}) => {
  const { globalModalId, setGlobalModalId } = useGlobalModalId()
  const docInstanceId = globalModalId?.meta?.docInstanceId
  const duplicate = globalModalId?.meta?.duplicate
  const newDocRequest = globalModalId?.meta?.newDocRequest

  const [localStateLoading, setLocalStateLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [revisionToDelete, setRevisionToDelete] = useState<{
    docInstanceId: number
    revisionName: string
  } | null>(null)
  const queryClient = useQueryClient()
  const { mutateAsync: createDocument, isLoading: creatingDocument } =
    useCreateDocument()
  const { mutateAsync: createRevision, isLoading: updatingDocument } =
    useCreateDocumentInstance()
  const { mutateAsync: deleteRevision, isLoading: deletingRevision } =
    useDeleteDocumentInstance()
  const [content, setContent] = useState('')
  const isEditingExisting = !!docInstanceId && !duplicate && !newDocRequest
  const isCreateFlow = !isEditingExisting

  // Track current revision ID separately to allow switching between revisions
  const [currentDocInstanceId, setCurrentDocInstanceId] = useState<
    number | null | undefined
  >(docInstanceId)

  const sourceInstanceId =
    newDocRequest?.action === 'useDoc'
      ? newDocRequest.sourceDoc.latestDocInstanceId
      : undefined

  const existingInstanceQuery = useDocumentInstance(
    {
      docInstanceId: currentDocInstanceId?.toString() ?? '',
    },
    { enabled: !!currentDocInstanceId && !duplicate && !newDocRequest }
  )
  const sourceInstanceQuery = useDocumentInstance(
    { docInstanceId: sourceInstanceId ? String(sourceInstanceId) : '' },
    { enabled: !!sourceInstanceId && newDocRequest?.action === 'useDoc' }
  )
  const existingData = existingInstanceQuery.data
  const sourceData = sourceInstanceQuery.data
  const isLoading =
    existingInstanceQuery.isLoading || sourceInstanceQuery.isLoading

  // Fetch docType for mode switching
  const { data: docs } = useDocuments(
    existingData?.docId ? { docId: String(existingData.docId) } : undefined,
    { enabled: !!existingData?.docId }
  )

  const existingDocType: DocumentType = React.useMemo(() => {
    const fromList =
      docs && docs[0]?.docType && isDocumentType(docs[0].docType as string)
        ? (docs[0].docType as DocumentType)
        : undefined
    if (fromList) return fromList
    if ((content || '').match(/<(input|textarea)\b/i)) return 'FILLED'
    return 'NORMAL'
  }, [docs, content])

  const createDocType = deriveCreateDocType(newDocRequest, duplicate)
  const docType: DocumentType = isCreateFlow ? createDocType : existingDocType
  const withFormInputs = docType === 'FORM'

  const [documentName, setDocumentName] = useState('')

  const lastLoadedExistingId = useRef<number | null | undefined>(null)
  const lastLoadedSourceId = useRef<number | null | undefined>(null)

  // Initialize currentDocInstanceId when modal opens
  useEffect(() => {
    if (docInstanceId && !duplicate && !newDocRequest) {
      setCurrentDocInstanceId(docInstanceId)
    }
  }, [docInstanceId, duplicate, newDocRequest])

  useEffect(() => {
    // Create flow: initialize editor immediately.
    if (newDocRequest) {
      setIsEditing(true)
      if (newDocRequest.action === 'newEmpty') {
        setContent('<p></p>')
        setDocumentName('NoName')
      }
      if (
        newDocRequest.action === 'useDoc' &&
        sourceInstanceId &&
        lastLoadedSourceId.current !== sourceInstanceId &&
        sourceData?.text !== undefined &&
        sourceData?.text !== null &&
        sourceData.text.trim() !== '' &&
        !sourceInstanceQuery.isLoading &&
        sourceInstanceQuery.isSuccess
      ) {
        lastLoadedSourceId.current = sourceInstanceId
        setContent(sourceData.text)
        setDocumentName(`${newDocRequest.sourceDoc.name ?? ''} (copy)`)
      }
      return
    }

    // Existing doc (or duplicate) flow.
    if (
      lastLoadedExistingId.current !== currentDocInstanceId &&
      existingData?.text !== null &&
      !existingInstanceQuery.isLoading &&
      currentDocInstanceId
    ) {
      lastLoadedExistingId.current = currentDocInstanceId
      setContent(existingData?.text ?? '')
      setDocumentName(
        `${existingData?.docName ?? ''}${duplicate ? ' (duplicate)' : ''}`
      )
      setIsEditing(false)
    }

    // Handle case where revision was deleted
    if (
      existingInstanceQuery.isError &&
      currentDocInstanceId &&
      !existingInstanceQuery.isLoading &&
      lastLoadedExistingId.current === currentDocInstanceId
    ) {
      // If current revision doesn't exist, try to fall back to latest revision
      const latestId = docs?.[0]?.latestRevision?.docInstanceId
      if (latestId && latestId !== currentDocInstanceId) {
        toast.error('Revision not found, loading latest revision')
        setCurrentDocInstanceId(latestId)
        lastLoadedExistingId.current = null // Reset to allow reload
      } else if (
        docs?.[0]?.docInstanceBriefs &&
        docs[0].docInstanceBriefs.length > 0
      ) {
        // Fall back to first available revision from docs list
        const firstAvailableId = docs[0].docInstanceBriefs[0]?.docInstanceId
        if (firstAvailableId && firstAvailableId !== currentDocInstanceId) {
          toast.error('Revision not found, loading available revision')
          setCurrentDocInstanceId(firstAvailableId)
          lastLoadedExistingId.current = null // Reset to allow reload
        }
      }
    }

    // Fallback: if opened without an id/request, treat as new NORMAL.
    if (!docInstanceId && !duplicate) {
      setIsEditing(true)
      setContent('<p></p>')
      setDocumentName('NoName')
    }
  }, [
    docInstanceId,
    duplicate,
    newDocRequest,
    existingData,
    sourceData,
    sourceInstanceId,
    existingInstanceQuery.isLoading,
    sourceInstanceQuery.isLoading,
    currentDocInstanceId,
  ])

  // Handle revision switching
  const handleRevisionChange = (newDocInstanceId: string) => {
    const newId = parseInt(newDocInstanceId, 10)
    if (isNaN(newId)) return

    // Verify the revision exists in the briefs list
    const revisionExists = existingData?.docInstanceBriefs?.some(
      (brief) => brief.docInstanceId === newId
    )
    if (!revisionExists) {
      toast.error('Selected revision no longer exists')
      return
    }

    // Exit edit mode when switching revisions (prevents data loss)
    setIsEditing(false)
    setCurrentDocInstanceId(newId)
    // The useDocumentInstance hook will automatically refetch with the new ID
  }

  const handleNameChange: React.ChangeEventHandler<HTMLInputElement> = (e) =>
    setDocumentName(e.target.value)

  // Format revision name for display (matches DocInstanceSelect format)
  const formatRevisionName = (
    brief: { docInstanceId?: number; unixTime?: number; user?: string } | null
  ): string => {
    if (!brief) return 'Unknown revision'
    const timestamp = brief.unixTime
      ? DateTime.fromMillis(brief.unixTime).toLocaleString(
          DateTime.DATETIME_MED
        )
      : 'Unknown date'
    return `${timestamp}${brief.user ? ` – ${brief.user}` : ''}`
  }

  // Handle delete revision button click
  const handleDeleteRevisionClick = () => {
    if (!currentDocInstanceId || !existingData?.docInstanceBriefs) return

    const revisionToDeleteBrief = existingData.docInstanceBriefs.find(
      (brief) => brief.docInstanceId === currentDocInstanceId
    )

    if (!revisionToDeleteBrief) return

    // Don't allow deleting if it's the only revision
    if (existingData.docInstanceBriefs.length === 1) {
      toast.error(
        'Cannot delete the only revision. Delete the document instead.'
      )
      return
    }

    setRevisionToDelete({
      docInstanceId: currentDocInstanceId,
      revisionName: formatRevisionName(revisionToDeleteBrief),
    })
  }

  // Handle confirmed deletion
  const handleConfirmDelete = async () => {
    if (!revisionToDelete) return

    const deletedRevisionId = revisionToDelete.docInstanceId
    const wasCurrentRevision = deletedRevisionId === currentDocInstanceId

    try {
      await deleteRevision({
        docInstanceId: String(deletedRevisionId),
      })

      // If we deleted the currently viewed revision, switch to another one first
      if (wasCurrentRevision && existingData?.docInstanceBriefs) {
        const remainingRevisions = existingData.docInstanceBriefs.filter(
          (brief) => brief.docInstanceId !== deletedRevisionId
        )

        if (remainingRevisions.length > 0) {
          // Find latest remaining revision
          const latestRemaining = [...remainingRevisions].sort(
            (a, b) => (b.unixTime ?? 0) - (a.unixTime ?? 0)
          )[0]

          if (latestRemaining?.docInstanceId) {
            setCurrentDocInstanceId(latestRemaining.docInstanceId)
            lastLoadedExistingId.current = null // Reset to allow reload
          }
        } else {
          // No revisions left, close the modal
          toast.success(`Deleted revision: ${revisionToDelete.revisionName}`)
          setRevisionToDelete(null)
          setGlobalModalId(null)
          onClose?.()
          return
        }
      }

      // Refresh queries
      await queryClient.invalidateQueries(['document', 'documents'])
      await queryClient.invalidateQueries(['document', 'documents', 'instance'])
      await existingInstanceQuery.refetch()

      toast.success(`Deleted revision: ${revisionToDelete.revisionName}`)
      setRevisionToDelete(null)
    } catch (error) {
      toast.error('Failed to delete revision')
    }
  }

  const handleConfirm = async () => {
    setLocalStateLoading(true)
    try {
      const name = documentName.trim()
      if (!name || name.toLowerCase() === 'noname') {
        toast.error('Please provide a document name.')
        return
      }

      if (isEditingExisting) {
        if (!existingData?.docId) {
          toast.error('No document data present.')
          return
        }
        const saved = await createRevision({
          docId: existingData.docId as number,
          newName: name,
          text: content,
        })
        // Update to the new revision
        setCurrentDocInstanceId(saved.docInstanceId)
        setContent(saved.text ?? content)
        setDocumentName(saved.docName ?? name)
        setIsEditing(false)
        // Refetch to get updated docInstanceBriefs
        await existingInstanceQuery.refetch()
      } else {
        // Create (new empty / use form / use template / duplicate)
        await createDocument({
          docType: createDocType,
          name,
          text: content,
        })
      }

      await wait(2)
      queryClient.invalidateQueries(['document', 'documents'])
      queryClient.invalidateQueries(['document', 'documents', 'instance'])
      toast.success('Document saved.')
      // Close modal after saving (for both new and existing documents)
      setGlobalModalId(null)
      onClose?.()
    } finally {
      setLocalStateLoading(false)
    }
  }

  const okToSave = React.useMemo(() => {
    if (!isEditing) return false
    const name = documentName.trim()
    if (!name || name.toLowerCase() === 'noname') return false

    if (isEditingExisting) {
      return Boolean(content)
    }

    // Create flow
    if (newDocRequest?.action === 'useDoc' && sourceInstanceQuery.isLoading) {
      return false
    }

    if (
      newDocRequest?.action === 'newEmpty' ||
      (!newDocRequest && !duplicate && !docInstanceId)
    ) {
      return isMeaningfulHtml(content)
    }
    // useDoc (form/template) or duplicate: allow save even if unchanged.
    return true
  }, [
    isEditing,
    documentName,
    content,
    isEditingExisting,
    newDocRequest,
    duplicate,
    docInstanceId,
    sourceInstanceQuery.isLoading,
  ])

  return (
    <Modal
      title={docInstanceId && !duplicate ? `Document` : 'New Document'}
      onClose={onClose}
      confirmButtonText="Save"
      disableConfirm={!okToSave}
      onConfirm={handleConfirm}
      loading={
        isLoading ||
        creatingDocument ||
        updatingDocument ||
        localStateLoading ||
        deletingRevision
      }
      maximized
      bodyOverflowHidden
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
              disabled={!isEditing && !!docInstanceId && !duplicate}
            />
            {docInstanceId && (
              <div className="ml-1 flex items-center">
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    appearance="primary"
                  >
                    {docType === 'FILLED' ? 'Fill in' : 'Edit'}
                  </Button>
                ) : (
                  <AccessoryButton
                    label="Cancel"
                    onClick={() => setIsEditing(false)}
                  />
                )}
              </div>
            )}
          </div>
          {isEditingExisting &&
            existingData?.docInstanceBriefs &&
            existingData.docInstanceBriefs.length > 1 &&
            !existingInstanceQuery.isError && (
              <div className="my-2 flex items-center gap-2 px-2">
                <label className="whitespace-nowrap text-sm font-medium text-stone-700">
                  Revision:
                </label>
                <DocInstanceSelect
                  instances={existingData.docInstanceBriefs}
                  value={String(currentDocInstanceId ?? '')}
                  onChange={handleRevisionChange}
                  latestDocInstanceId={docs?.[0]?.latestRevision?.docInstanceId}
                />
                <Button
                  onClick={handleDeleteRevisionClick}
                  appearance="secondary"
                  className="hover:bg-red-600 hover:text-white"
                  disabled={isEditing}
                >
                  Delete Revision
                </Button>
              </div>
            )}
          <div style={{ height: 'calc(100vh - 280px)', overflow: 'auto' }}>
            {!isEditing ? (
              <DocViewer html={content} />
            ) : (
              <DocEditor
                docType={docType}
                isEditing
                html={content}
                withFormInputs={withFormInputs}
                onChange={setContent}
                onSaveFilled={async (updated) => {
                  if (!existingData?.docId) return
                  setLocalStateLoading(true)
                  const saved = await createRevision({
                    docId: existingData.docId as number,
                    newName: documentName,
                    text: updated,
                  })
                  // Update to the new revision
                  setCurrentDocInstanceId(saved.docInstanceId)
                  await wait(2)
                  // refresh both lists and instances
                  queryClient.invalidateQueries(['document', 'documents'])
                  queryClient.invalidateQueries([
                    'document',
                    'documents',
                    'instance',
                  ])
                  // Refetch to get updated docInstanceBriefs
                  await existingInstanceQuery.refetch()
                  setContent(saved.text ?? updated)
                  setIsEditing(false)
                  toast.success('Document saved.')
                  setLocalStateLoading(false)
                  // Close modal after saving
                  setGlobalModalId(null)
                  onClose?.()
                }}
              />
            )}
          </div>
        </>
      )}
      {revisionToDelete && (
        <Dialog
          open
          title="Delete Revision"
          message={`Are you sure you want to delete the revision "${revisionToDelete.revisionName}"?`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setRevisionToDelete(null)}
          onClose={() => setRevisionToDelete(null)}
          loading={deletingRevision}
          confirmButtonText="Delete"
          cancelButtonText="Cancel"
        />
      )}
    </Modal>
  )
}

export default DocumentInstanceModal
