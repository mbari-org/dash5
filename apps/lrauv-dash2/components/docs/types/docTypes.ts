export type DocumentType = 'NORMAL' | 'FORM' | 'TEMPLATE' | 'FILLED'

// Document types that can be created from scratch
export type CreatableDocumentType = 'NORMAL' | 'FORM' | 'TEMPLATE'

// Document types that can be used as sources (forms and templates)
export type SourceDocumentType = 'FORM' | 'TEMPLATE'

export type NewDocRequest =
  | {
      action: 'newEmpty'
      docType: CreatableDocumentType
    }
  | {
      action: 'useDoc'
      sourceDoc: {
        docId: number
        docType: SourceDocumentType
        name: string
        latestDocInstanceId: number
      }
    }

export type EditMode = 'full-edit' | 'edit' | 'readonly'

export function getEditMode(
  docType: DocumentType,
  isEditing: boolean
): EditMode {
  if (!isEditing) return 'readonly'
  if (docType === 'FILLED') return 'edit'
  return 'full-edit'
}

export type InputChangeType = 'checkbox' | 'radio' | 'text' | 'textarea'

// Input types that can have changes tracked (excluding radio which uses RadioGroupChange)
export type TrackableInputType = 'checkbox' | 'text' | 'textarea'

export interface InputChange {
  id: string
  type: TrackableInputType
  origVal: boolean | string
  newVal: boolean | string | null
}

export interface RadioGroupChange {
  name: string
  origTrueId: string | null
  newTrueId: string | null
}
