import { useMemo } from 'react'
import { Modal, ModalProps } from '@mbari/react-ui'
import { useDocuments } from '@mbari/api-client'
import useGlobalModalId from '../lib/useGlobalModalId'
import type {
  CreatableDocumentType,
  NewDocRequest,
  SourceDocumentType,
} from './docs/types/docTypes'

export type AddDocumentModalProps = Omit<ModalProps, 'title' | 'open'>

function isSourceDocType(s?: string): s is SourceDocumentType {
  return s === 'FORM' || s === 'TEMPLATE'
}

export default function AddDocumentModal(props: AddDocumentModalProps) {
  const { setGlobalModalId } = useGlobalModalId()
  const { data: docs, isLoading, isFetching } = useDocuments()

  const forms = useMemo(
    () => (docs ?? []).filter((d) => d.docType === 'FORM'),
    [docs]
  )
  const templates = useMemo(
    () => (docs ?? []).filter((d) => d.docType === 'TEMPLATE'),
    [docs]
  )

  const close = () => setGlobalModalId(null)

  const openEditor = (newDocRequest: NewDocRequest) => {
    setGlobalModalId({
      id: 'editDocument',
      meta: { newDocRequest },
    })
  }

  const openNewEmpty = (docType: CreatableDocumentType) => {
    openEditor({ action: 'newEmpty', docType })
  }

  const openFromSource = (doc: {
    docId?: number
    name?: string
    docType?: string
    latestRevision?: { docInstanceId?: number }
  }) => {
    if (!doc.docId) return
    if (!isSourceDocType(doc.docType)) return
    const latestDocInstanceId = doc.latestRevision?.docInstanceId
    if (!latestDocInstanceId) return

    openEditor({
      action: 'useDoc',
      sourceDoc: {
        docId: doc.docId,
        docType: doc.docType,
        name: doc.name ?? '',
        latestDocInstanceId,
      },
    })
  }

  const loading = isLoading || isFetching

  return (
    <Modal
      {...props}
      title="Add document"
      open
      onCancel={close}
      onClose={close}
    >
      {loading ? (
        <div className="py-2">Loading…</div>
      ) : (
        <div className="flex flex-col gap-4">
          <section>
            <div className="mb-2 font-medium">New empty</div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded border border-stone-300 bg-white px-3 py-2 hover:bg-stone-50"
                onClick={() => openNewEmpty('NORMAL')}
              >
                Document
              </button>
              <button
                type="button"
                className="rounded border border-stone-300 bg-white px-3 py-2 hover:bg-stone-50"
                onClick={() => openNewEmpty('FORM')}
              >
                Form
              </button>
              <button
                type="button"
                className="rounded border border-stone-300 bg-white px-3 py-2 hover:bg-stone-50"
                onClick={() => openNewEmpty('TEMPLATE')}
              >
                Template
              </button>
            </div>
          </section>

          <section>
            <div className="mb-2 font-medium">Use form…</div>
            <div className="max-h-64 overflow-auto rounded border border-stone-200">
              {(forms ?? []).length ? (
                <ul className="divide-y divide-stone-200">
                  {forms.map((d) => {
                    const disabled = !d.latestRevision?.docInstanceId
                    return (
                      <li key={String(d.docId)}>
                        <button
                          type="button"
                          className="w-full px-3 py-2 text-left hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={disabled}
                          onClick={() => openFromSource(d)}
                        >
                          {d.name}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div className="px-3 py-2 text-sm text-stone-500">
                  No forms found.
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="mb-2 font-medium">Use template…</div>
            <div className="max-h-64 overflow-auto rounded border border-stone-200">
              {(templates ?? []).length ? (
                <ul className="divide-y divide-stone-200">
                  {templates.map((d) => {
                    const disabled = !d.latestRevision?.docInstanceId
                    return (
                      <li key={String(d.docId)}>
                        <button
                          type="button"
                          className="w-full px-3 py-2 text-left hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={disabled}
                          onClick={() => openFromSource(d)}
                        >
                          {d.name}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div className="px-3 py-2 text-sm text-stone-500">
                  No templates found.
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </Modal>
  )
}

AddDocumentModal.displayName = 'Dash2.Components.AddDocumentModal'
