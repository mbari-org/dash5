import { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextAlign } from '@tiptap/extension-text-align'
import { Color } from '@tiptap/extension-color'
import { TextStyle, FontSize } from '@tiptap/extension-text-style'
import { Highlight } from '@tiptap/extension-highlight'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { Link } from '@tiptap/extension-link'
import { Underline } from '@tiptap/extension-underline'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'

// Configure extensions with mutual exclusivity
const CustomSubscript = Subscript.extend({
  excludes: 'superscript',
})

const CustomSuperscript = Superscript.extend({
  excludes: 'subscript',
})
import { HorizontalRule } from '@tiptap/extension-horizontal-rule'
import clsx from 'clsx'
import { Button, Input, Modal } from '@mbari/react-ui'

import {
  CheckboxNode,
  RadioNode,
  TextFieldNode,
  TextAreaNode,
} from './extensions'
import DocEditorToolbar from './DocEditorToolbar'

export interface DocEditorTipTapProps {
  html: string
  onChange: (html: string) => void
  withFormInputs?: boolean
  className?: string
}

export default function DocEditorTipTap(props: DocEditorTipTapProps) {
  const { html, onChange, withFormInputs, className } = props

  const [radioDialogOpen, setRadioDialogOpen] = useState(false)
  const [radioGroupName, setRadioGroupName] = useState('')
  const [textFieldDialogOpen, setTextFieldDialogOpen] = useState(false)
  const [textFieldRows, setTextFieldRows] = useState('1')
  const [textFieldCols, setTextFieldCols] = useState('30')

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5] },
        horizontalRule: false, // Use the extension version instead
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color.extend({
        addAttributes() {
          return {
            // Override to parse inline style colors
            color: {
              default: null,
              parseHTML: (element: HTMLElement) => {
                const el = element as HTMLElement
                // Try to get color from inline style first
                if (el.style?.color) {
                  return el.style.color
                }
                // Fall back to data-color attribute
                if (el.getAttribute('data-color')) {
                  return el.getAttribute('data-color')
                }
                // Fall back to style attribute parsing
                const styleAttr = el.getAttribute('style')
                if (styleAttr) {
                  const colorMatch = styleAttr.match(/color:\s*([^;]+)/i)
                  if (colorMatch) {
                    return colorMatch[1].trim()
                  }
                }
                return null
              },
              renderHTML: (attributes: { color?: string }) => {
                if (!attributes.color) {
                  return {}
                }
                return { style: `color: ${attributes.color}` }
              },
            },
          }
        },
      }).configure({
        types: ['textStyle'],
      }),
      FontSize,
      Highlight.configure({ multicolor: true }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-600 underline',
        },
      }),
      Underline,
      CustomSubscript,
      CustomSuperscript,
      HorizontalRule,
      CheckboxNode,
      RadioNode,
      TextFieldNode,
      TextAreaNode,
    ],
    content: html || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && typeof html === 'string') {
      const current = editor.getHTML()
      if (current !== html) {
        editor.commands.setContent(html, { emitUpdate: false })
      }
    }
  }, [html, editor])

  const handleInsertCheckbox = () => {
    editor?.chain().focus().insertCheckbox().run()
  }

  const handleInsertRadio = () => {
    setRadioGroupName('')
    setRadioDialogOpen(true)
  }

  const handleInsertText = () => {
    setTextFieldRows('1')
    setTextFieldCols('30')
    setTextFieldDialogOpen(true)
  }

  const handleTextFieldConfirm = () => {
    const rows = Math.max(1, parseInt(textFieldRows, 10) || 1)
    const cols = Math.max(1, parseInt(textFieldCols, 10) || 30)
    if (rows > 1) {
      editor?.chain().focus().insertTextArea('', rows, cols).run()
    } else {
      editor?.chain().focus().insertTextField('', cols).run()
    }
    setTextFieldDialogOpen(false)
  }

  return (
    <div className={className}>
      <DocEditorToolbar
        editor={editor}
        withFormInputs={withFormInputs}
        onInsertCheckbox={handleInsertCheckbox}
        onInsertRadio={handleInsertRadio}
        onInsertText={handleInsertText}
      />

      {radioDialogOpen ? (
        <Modal
          title="Radio group name"
          open
          confirmButtonText="Insert"
          cancelButtonText="Cancel"
          onCancel={() => setRadioDialogOpen(false)}
          onClose={() => setRadioDialogOpen(false)}
          disableConfirm={!radioGroupName.trim()}
          onConfirm={() => {
            const name = radioGroupName.trim()
            editor?.chain().focus().insertRadio(name, false, '').run()
            setRadioDialogOpen(false)
          }}
        >
          <div className="py-2">
            <Input
              name="radioGroupName"
              value={radioGroupName}
              onChange={(e) => setRadioGroupName(e.target.value)}
            />
          </div>
        </Modal>
      ) : null}

      {textFieldDialogOpen ? (
        <Modal
          title="Insert Text Field"
          open
          confirmButtonText="Insert"
          cancelButtonText="Cancel"
          onCancel={() => setTextFieldDialogOpen(false)}
          onClose={() => setTextFieldDialogOpen(false)}
          onConfirm={handleTextFieldConfirm}
        >
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Rows (1 for input, &gt;1 for textarea)
              </label>
              <Input
                name="textFieldRows"
                type="number"
                value={textFieldRows}
                onChange={(e) => setTextFieldRows(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Width/Cols (characters)
              </label>
              <Input
                name="textFieldCols"
                type="number"
                value={textFieldCols}
                onChange={(e) => setTextFieldCols(e.target.value)}
              />
            </div>
          </div>
        </Modal>
      ) : null}

      <div className={clsx('docs-content docs-editor')}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
