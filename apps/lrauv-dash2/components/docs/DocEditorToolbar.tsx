import { useState, useEffect } from 'react'
import { useEditor } from '@tiptap/react'
import {
  faBold,
  faItalic,
  faUnderline,
  faStrikethrough,
  faSubscript,
  faSuperscript,
  faAlignLeft,
  faAlignCenter,
  faAlignRight,
  faListUl,
  faListOl,
  faLink,
  faTable,
  faUndo,
  faRedo,
  faRemoveFormat,
  faHeading,
  faQuoteRight,
  faCode,
  faMinus,
  faCheckSquare,
  faCircle,
  faFont,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, Modal, Input } from '@mbari/react-ui'
import clsx from 'clsx'
import ColorPicker from './ColorPicker'

interface DocEditorToolbarProps {
  editor: ReturnType<typeof useEditor> | null
  withFormInputs?: boolean
  onInsertCheckbox?: () => void
  onInsertRadio?: () => void
  onInsertText?: () => void
}

export default function DocEditorToolbar({
  editor,
  withFormInputs,
  onInsertCheckbox,
  onInsertRadio,
  onInsertText,
}: DocEditorToolbarProps) {
  // Force re-render when editor state changes to update button active states
  const [, setUpdateKey] = useState(0)
  useEffect(() => {
    if (!editor) return
    const update = () => setUpdateKey((k) => k + 1)
    editor.on('update', update)
    editor.on('selectionUpdate', update)
    editor.on('transaction', update)
    return () => {
      editor.off('update', update)
      editor.off('selectionUpdate', update)
      editor.off('transaction', update)
    }
  }, [editor])

  // Link dialog state
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  // Table dialog state
  const [tableDialogOpen, setTableDialogOpen] = useState(false)
  const [tableRows, setTableRows] = useState('3')
  const [tableCols, setTableCols] = useState('3')
  const [tableWithHeader, setTableWithHeader] = useState(true)

  if (!editor) return null

  // Helper to check if a mark is active (including stored marks for next character)
  const isMarkActive = (markName: string) => {
    if (!editor) return false
    // Check if mark is active on current selection
    if (editor.isActive(markName)) return true
    // Check if mark is stored (will apply to next typed character)
    const { state } = editor
    const { storedMarks } = state
    if (storedMarks) {
      return storedMarks.some((mark: any) => mark.type.name === markName)
    }
    return false
  }

  const setHeading = (level: 1 | 2 | 3 | 4 | 5) => {
    editor.chain().focus().toggleHeading({ level }).run()
  }

  const setTextAlign = (align: 'left' | 'center' | 'right' | 'justify') => {
    editor.chain().focus().setTextAlign(align).run()
  }

  const setColor = (color: string) => {
    editor.chain().focus().setColor(color).run()
  }

  const setHighlight = (color: string) => {
    editor.chain().focus().setHighlight({ color }).run()
  }

  const setFontSize = (size: string) => {
    if (size === '') {
      editor.chain().focus().unsetFontSize().run()
    } else {
      editor.chain().focus().setFontSize(size).run()
    }
  }

  const getFontSize = () => {
    return editor.getAttributes('textStyle').fontSize || ''
  }

  const insertTable = () => {
    setTableRows('3')
    setTableCols('3')
    setTableWithHeader(true)
    setTableDialogOpen(true)
  }

  const handleTableConfirm = () => {
    const rows = Math.max(1, parseInt(tableRows, 10) || 3)
    const cols = Math.max(1, parseInt(tableCols, 10) || 3)
    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: tableWithHeader })
      .run()
    setTableDialogOpen(false)
  }

  const setLink = () => {
    // Get current link URL if link is active
    const attrs = editor.getAttributes('link')
    const currentUrl = attrs.href || ''
    setLinkUrl(currentUrl)
    setLinkDialogOpen(true)
  }

  const handleLinkConfirm = () => {
    const url = linkUrl.trim()
    if (url) {
      // Add http:// if no protocol is specified
      const finalUrl = url.match(/^https?:\/\//) ? url : `http://${url}`
      editor.chain().focus().setLink({ href: finalUrl }).run()
    } else {
      // Remove link if URL is empty
      editor.chain().focus().unsetLink().run()
    }
    setLinkDialogOpen(false)
    setLinkUrl('')
  }

  const insertHorizontalRule = () => {
    editor.chain().focus().setHorizontalRule().run()
  }

  const getTextColor = () => {
    return editor.getAttributes('textStyle').color || '#000000'
  }

  const getHighlightColor = () => {
    return editor.getAttributes('highlight').color || '#FFFF00'
  }

  return (
    <div className="mb-2 flex flex-wrap items-center gap-1 border-b border-stone-200 pb-2">
      {/* Form Inputs (only for FORM documents) */}
      {withFormInputs && (
        <>
          <span title="Insert checkbox">
            <Button appearance="secondary" tight onClick={onInsertCheckbox}>
              <FontAwesomeIcon icon={faCheckSquare} className="mr-1" />
              Checkbox
            </Button>
          </span>
          <span title="Insert radio button">
            <Button appearance="secondary" tight onClick={onInsertRadio}>
              <FontAwesomeIcon icon={faCircle} className="mr-1" />
              Radio
            </Button>
          </span>
          <span title="Insert text field">
            <Button appearance="secondary" tight onClick={onInsertText}>
              <FontAwesomeIcon icon={faFont} className="mr-1" />
              Text Field
            </Button>
          </span>
          <div className="mx-1 h-6 w-px bg-stone-300" />
        </>
      )}

      {/* Headings */}
      <div className="flex items-center gap-1">
        <span title="Normal text">
          <Button
            appearance="transparent"
            tight
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={clsx(
              editor.isActive('paragraph') && !editor.isActive('heading')
                ? 'bg-stone-200'
                : ''
            )}
          >
            P
          </Button>
        </span>
        <span title="Heading 1">
          <Button
            appearance="transparent"
            tight
            onClick={() => setHeading(1)}
            className={clsx(
              editor.isActive('heading', { level: 1 }) && 'bg-stone-200'
            )}
          >
            H1
          </Button>
        </span>
        <span title="Heading 2">
          <Button
            appearance="transparent"
            tight
            onClick={() => setHeading(2)}
            className={clsx(
              editor.isActive('heading', { level: 2 }) && 'bg-stone-200'
            )}
          >
            H2
          </Button>
        </span>
        <span title="Heading 3">
          <Button
            appearance="transparent"
            tight
            onClick={() => setHeading(3)}
            className={clsx(
              editor.isActive('heading', { level: 3 }) && 'bg-stone-200'
            )}
          >
            H3
          </Button>
        </span>
        <span title="Heading 4">
          <Button
            appearance="transparent"
            tight
            onClick={() => setHeading(4)}
            className={clsx(
              editor.isActive('heading', { level: 4 }) && 'bg-stone-200'
            )}
          >
            H4
          </Button>
        </span>
        <span title="Heading 5">
          <Button
            appearance="transparent"
            tight
            onClick={() => setHeading(5)}
            className={clsx(
              editor.isActive('heading', { level: 5 }) && 'bg-stone-200'
            )}
          >
            H5
          </Button>
        </span>
      </div>

      <div className="mx-1 h-6 w-px bg-stone-300" />

      {/* Text Formatting */}
      <div className="flex items-center gap-1">
        <span title="Bold">
          <Button
            appearance="transparent"
            tight
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={clsx(editor.isActive('bold') && 'bg-stone-200')}
          >
            <FontAwesomeIcon icon={faBold} />
          </Button>
        </span>
        <span title="Italic">
          <Button
            appearance="transparent"
            tight
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={clsx(editor.isActive('italic') && 'bg-stone-200')}
          >
            <FontAwesomeIcon icon={faItalic} />
          </Button>
        </span>
        <span title="Strikethrough">
          <Button
            appearance="transparent"
            tight
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={clsx(editor.isActive('strike') && 'bg-stone-200')}
          >
            <FontAwesomeIcon icon={faStrikethrough} />
          </Button>
        </span>
        <span title="Underline">
          <Button
            appearance="transparent"
            tight
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={clsx(editor.isActive('underline') && 'bg-stone-200')}
          >
            <FontAwesomeIcon icon={faUnderline} />
          </Button>
        </span>
        <span title="Subscript">
          <Button
            appearance="transparent"
            tight
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (!editor) return
              try {
                // Unset superscript first if active (mutual exclusivity)
                if (isMarkActive('superscript')) {
                  editor.chain().focus().toggleSuperscript().run()
                }
                // Toggle subscript
                editor.chain().focus().toggleSubscript().run()
              } catch (error) {
                console.error('Subscript error:', error)
              }
            }}
            className={clsx(isMarkActive('subscript') && 'bg-stone-200')}
          >
            <FontAwesomeIcon icon={faSubscript} />
          </Button>
        </span>
        <span title="Superscript">
          <Button
            appearance="transparent"
            tight
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (!editor) return
              try {
                // Unset subscript first if active (mutual exclusivity)
                if (isMarkActive('subscript')) {
                  editor.chain().focus().toggleSubscript().run()
                }
                // Toggle superscript
                editor.chain().focus().toggleSuperscript().run()
              } catch (error) {
                console.error('Superscript error:', error)
              }
            }}
            className={clsx(isMarkActive('superscript') && 'bg-stone-200')}
          >
            <FontAwesomeIcon icon={faSuperscript} />
          </Button>
        </span>
      </div>

      <div className="mx-1 h-6 w-px bg-stone-300" />

      {/* Lists */}
      <div className="flex items-center gap-1">
        <span title="Bullet list">
          <Button
            appearance="transparent"
            tight
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={clsx(editor.isActive('bulletList') && 'bg-stone-200')}
          >
            <FontAwesomeIcon icon={faListUl} />
          </Button>
        </span>
        <span title="Numbered list">
          <Button
            appearance="transparent"
            tight
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={clsx(editor.isActive('orderedList') && 'bg-stone-200')}
          >
            <FontAwesomeIcon icon={faListOl} />
          </Button>
        </span>
        <span title="Blockquote">
          <Button
            appearance="transparent"
            tight
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={clsx(editor.isActive('blockquote') && 'bg-stone-200')}
          >
            <FontAwesomeIcon icon={faQuoteRight} />
          </Button>
        </span>
        <span title="Code block">
          <Button
            appearance="transparent"
            tight
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={clsx(editor.isActive('codeBlock') && 'bg-stone-200')}
          >
            <FontAwesomeIcon icon={faCode} />
          </Button>
        </span>
      </div>

      <div className="mx-1 h-6 w-px bg-stone-300" />

      {/* Colors and Font Size */}
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-1">
          <span className="text-xs text-stone-600">Size:</span>
          <select
            value={getFontSize()}
            onChange={(e) => setFontSize(e.target.value)}
            className="rounded border border-stone-300 bg-white px-2 py-1 text-sm focus:border-stone-400 focus:outline-none"
            title="Font size"
          >
            <option value="">Default</option>
            <option value="8px">8px</option>
            <option value="10px">10px</option>
            <option value="12px">12px</option>
            <option value="14px">14px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
            <option value="20px">20px</option>
            <option value="24px">24px</option>
            <option value="28px">28px</option>
            <option value="32px">32px</option>
            <option value="36px">36px</option>
            <option value="48px">48px</option>
            <option value="72px">72px</option>
          </select>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-stone-600">Text:</span>
          <ColorPicker
            label="Text color"
            currentColor={getTextColor()}
            onChange={setColor}
          />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-stone-600">Highlight:</span>
          <ColorPicker
            label="Highlight color"
            currentColor={getHighlightColor()}
            defaultColor="#FFFF00"
            onChange={setHighlight}
          />
        </div>
      </div>

      <div className="mx-1 h-6 w-px bg-stone-300" />

      {/* Alignment */}
      <div className="flex items-center gap-1">
        <span title="Align left">
          <Button
            appearance="transparent"
            tight
            onClick={() => setTextAlign('left')}
            className={clsx(
              editor.isActive({ textAlign: 'left' }) && 'bg-stone-200'
            )}
          >
            <FontAwesomeIcon icon={faAlignLeft} />
          </Button>
        </span>
        <span title="Align center">
          <Button
            appearance="transparent"
            tight
            onClick={() => setTextAlign('center')}
            className={clsx(
              editor.isActive({ textAlign: 'center' }) && 'bg-stone-200'
            )}
          >
            <FontAwesomeIcon icon={faAlignCenter} />
          </Button>
        </span>
        <span title="Align right">
          <Button
            appearance="transparent"
            tight
            onClick={() => setTextAlign('right')}
            className={clsx(
              editor.isActive({ textAlign: 'right' }) && 'bg-stone-200'
            )}
          >
            <FontAwesomeIcon icon={faAlignRight} />
          </Button>
        </span>
      </div>

      <div className="mx-1 h-6 w-px bg-stone-300" />

      {/* Links, Tables, Horizontal Rule */}
      <div className="flex items-center gap-1">
        <span title="Insert/edit link">
          <Button
            appearance="transparent"
            tight
            onClick={setLink}
            className={clsx(editor.isActive('link') && 'bg-stone-200')}
          >
            <FontAwesomeIcon icon={faLink} />
          </Button>
        </span>
        <span title="Insert table">
          <Button appearance="transparent" tight onClick={insertTable}>
            <FontAwesomeIcon icon={faTable} />
          </Button>
        </span>
        <span title="Insert horizontal rule">
          <Button appearance="transparent" tight onClick={insertHorizontalRule}>
            <FontAwesomeIcon icon={faMinus} />
          </Button>
        </span>
      </div>

      <div className="mx-1 h-6 w-px bg-stone-300" />

      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <span title="Undo">
          <Button
            appearance="transparent"
            tight
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <FontAwesomeIcon icon={faUndo} />
          </Button>
        </span>
        <span title="Redo">
          <Button
            appearance="transparent"
            tight
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <FontAwesomeIcon icon={faRedo} />
          </Button>
        </span>
        <span title="Clear formatting">
          <Button
            appearance="transparent"
            tight
            onClick={() =>
              editor.chain().focus().clearNodes().unsetAllMarks().run()
            }
          >
            <FontAwesomeIcon icon={faRemoveFormat} />
          </Button>
        </span>
      </div>

      {/* Link Dialog */}
      {linkDialogOpen ? (
        <Modal
          title="Edit Link"
          open
          confirmButtonText="Apply"
          cancelButtonText="Cancel"
          onCancel={() => {
            setLinkDialogOpen(false)
            setLinkUrl('')
          }}
          onClose={() => {
            setLinkDialogOpen(false)
            setLinkUrl('')
          }}
          onConfirm={handleLinkConfirm}
        >
          <div className="py-2">
            <label htmlFor="linkUrl" className="mb-1 block text-sm font-medium">
              URL
            </label>
            <Input
              name="linkUrl"
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
            />
            <p className="mt-2 text-xs text-gray-500">
              Leave empty to remove the link
            </p>
          </div>
        </Modal>
      ) : null}

      {/* Table Dialog */}
      {tableDialogOpen ? (
        <Modal
          title="Insert Table"
          open
          confirmButtonText="Insert"
          cancelButtonText="Cancel"
          onCancel={() => setTableDialogOpen(false)}
          onClose={() => setTableDialogOpen(false)}
          onConfirm={handleTableConfirm}
        >
          <div className="space-y-4 py-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Rows</label>
              <Input
                name="tableRows"
                type="number"
                value={tableRows}
                onChange={(e) => setTableRows(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Columns</label>
              <Input
                name="tableCols"
                type="number"
                value={tableCols}
                onChange={(e) => setTableCols(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="tableWithHeader"
                name="tableWithHeader"
                checked={tableWithHeader}
                onChange={(e) => setTableWithHeader(e.target.checked)}
                className="focus:ring-primary-500 h-4 w-4 rounded border-stone-300 text-primary-600"
              />
              <label htmlFor="tableWithHeader" className="text-sm">
                Include header row
              </label>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
