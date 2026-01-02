import DocEditorTipTap from './DocEditorTipTap'
import DocViewer from './DocViewer'
import DocFormEditor from './DocFormEditor'
import { DocumentType, getEditMode } from './types/docTypes'
import { useState, useEffect } from 'react'

export interface DocEditorProps {
  docType: DocumentType
  isEditing: boolean
  html: string
  onChange: (html: string) => void
  onSaveFilled?: (updatedHtml: string) => void
  withFormInputs?: boolean
}

export default function DocEditor(props: DocEditorProps) {
  const { docType, isEditing, html, onChange, onSaveFilled, withFormInputs } =
    props
  const mode = getEditMode(docType, isEditing)

  const [filledHtml, setFilledHtml] = useState(html)

  // Sync filledHtml when html prop changes (important for form copying)
  useEffect(() => {
    if (html !== filledHtml) {
      setFilledHtml(html)
    }
  }, [html])

  if (mode === 'full-edit') {
    return (
      <DocEditorTipTap
        html={html}
        onChange={onChange}
        withFormInputs={withFormInputs}
      />
    )
  }

  if (mode === 'edit') {
    return (
      <DocFormEditor
        html={filledHtml}
        onChange={(updated) => {
          setFilledHtml(updated)
          onChange(updated)
        }}
      />
    )
  }

  return <DocViewer html={html} />
}
