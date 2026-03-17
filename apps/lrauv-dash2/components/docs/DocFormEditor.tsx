import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextAlign } from '@tiptap/extension-text-align'
import { Color } from '@tiptap/extension-color'
import { TextStyle, FontSize } from '@tiptap/extension-text-style'
import { Highlight } from '@tiptap/extension-highlight'
import { Underline } from '@tiptap/extension-underline'
import { Link } from '@tiptap/extension-link'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Heading } from '@tiptap/extension-heading'
import { CheckboxNode } from './extensions/CheckboxNode'
import { RadioNode } from './extensions/RadioNode'
import { TextFieldNode } from './extensions/TextFieldNode'
import { TextAreaNode } from './extensions/TextAreaNode'

export interface DocFormEditorProps {
  html: string
  onChange?: (html: string) => void
  className?: string
}

export default function DocFormEditor(props: DocFormEditorProps) {
  const { html, onChange, className } = props
  const originalAnnotatedRef = React.useRef<string>('')
  const [contentWithIds, setContentWithIds] = React.useState<string>(html || '')

  // Annotate inputs with stable ids once per html change
  React.useEffect(() => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html || '', 'text/html')

    // Convert <font> tags to <span> tags with inline styles
    doc.querySelectorAll('font').forEach((fontEl) => {
      const font = fontEl as HTMLElement
      const span = doc.createElement('span')

      // Get existing style attribute if any
      const existingStyle = font.getAttribute('style') || ''
      const styles: string[] = []

      // Parse color attribute
      const color = font.getAttribute('color')
      if (color) {
        // Convert hex color to rgb if needed, or use as-is
        const colorValue = color.startsWith('#')
          ? `#${color.substring(1)}`
          : color
        styles.push(`color: ${colorValue}`)
      }

      // Parse size attribute (convert to font-size)
      const size = font.getAttribute('size')
      if (size) {
        // Map size numbers to font sizes (approximate)
        const sizeMap: Record<string, string> = {
          '1': '10px',
          '2': '13px',
          '3': '16px',
          '4': '18px',
          '5': '24px',
          '6': '32px',
          '7': '48px',
        }
        const fontSize = sizeMap[size] || `${parseInt(size) * 4}px`
        styles.push(`font-size: ${fontSize}`)
      }

      // Parse face attribute (font-family)
      const face = font.getAttribute('face')
      if (face) {
        styles.push(`font-family: ${face}`)
      }

      // Combine existing style with new styles
      const newStyle = existingStyle
        ? `${existingStyle}; ${styles.join('; ')}`
        : styles.join('; ')

      if (newStyle) {
        span.setAttribute('style', newStyle)
      }

      // Copy all child nodes
      while (font.firstChild) {
        span.appendChild(font.firstChild)
      }

      // Replace font with span
      font.parentNode?.replaceChild(span, font)
    })

    let nextId = 1
    doc
      .querySelectorAll(
        'input[type="checkbox"], input[type="radio"], input[type="text"], textarea'
      )
      .forEach((el) => {
        const element = el as HTMLElement
        if (!element.getAttribute('data-doc-input-id')) {
          element.setAttribute('data-doc-input-id', `doc-input-${nextId++}`)
        }
      })
    const annotated = doc.body.innerHTML
    originalAnnotatedRef.current = annotated
    setContentWithIds(annotated)
  }, [html])

  // Compute diff against the original annotated HTML so checked/value attrs are guaranteed in output
  const computeDiffHtml = React.useCallback((currentHtml: string) => {
    const parser = new DOMParser()
    const current = parser.parseFromString(currentHtml || '', 'text/html')
    const base = parser.parseFromString(
      originalAnnotatedRef.current || '',
      'text/html'
    )

    // Checkboxes
    current
      .querySelectorAll('input[type="checkbox"][data-doc-input-id]')
      .forEach((el) => {
        const id = el.getAttribute('data-doc-input-id') || ''
        const checked =
          (el as HTMLInputElement).checked || el.hasAttribute('checked')
        const target = base.querySelector(
          `input[type="checkbox"][data-doc-input-id="${id}"]`
        )
        if (target) {
          if (checked) target.setAttribute('checked', '')
          else target.removeAttribute('checked')
        }
      })

    // Text inputs
    current
      .querySelectorAll('input[type="text"][data-doc-input-id]')
      .forEach((el) => {
        const id = el.getAttribute('data-doc-input-id') || ''
        const value =
          (el as HTMLInputElement).value || el.getAttribute('value') || ''
        const target = base.querySelector(
          `input[type="text"][data-doc-input-id="${id}"]`
        ) as HTMLInputElement | null
        if (target) {
          target.setAttribute('value', value)
        }
      })

    // Textareas
    current.querySelectorAll('textarea[data-doc-input-id]').forEach((el) => {
      const id = el.getAttribute('data-doc-input-id') || ''
      const value = (el as HTMLTextAreaElement).value || el.textContent || ''
      const target = base.querySelector(`textarea[data-doc-input-id="${id}"]`)
      if (target) {
        target.textContent = value
      }
    })

    // Radios
    const radiosByName: Record<string, string | null> = {}
    current
      .querySelectorAll('input[type="radio"][name][data-doc-input-id]')
      .forEach((el) => {
        const input = el as HTMLInputElement
        const name = input.getAttribute('name') || ''
        const id = input.getAttribute('data-doc-input-id') || ''
        if (input.checked || input.hasAttribute('checked')) {
          radiosByName[name] = id
        } else if (!(name in radiosByName)) {
          radiosByName[name] = null
        }
      })
    Object.entries(radiosByName).forEach(([name, trueId]) => {
      base
        .querySelectorAll(`input[type="radio"][name="${name}"]`)
        .forEach((el) => el.removeAttribute('checked'))
      if (trueId) {
        const target = base.querySelector(
          `input[type="radio"][data-doc-input-id="${trueId}"]`
        )
        if (target) target.setAttribute('checked', '')
      }
    })

    return base.body.innerHTML
  }, [])

  const editor = useEditor({
    immediatelyRender: false,
    editable: true,
    extensions: [
      StarterKit.configure({
        heading: false,
        paragraph: false,
      }),
      Paragraph.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            style: {
              default: null,
              parseHTML: (element: HTMLElement) => {
                return (element as HTMLElement).getAttribute('style')
              },
              renderHTML: (attributes: { style?: string }) => {
                if (!attributes.style) {
                  return {}
                }
                return { style: attributes.style }
              },
            },
          }
        },
      }),
      Heading.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            style: {
              default: null,
              parseHTML: (element: HTMLElement) => {
                return (element as HTMLElement).getAttribute('style')
              },
              renderHTML: (attributes: { style?: string }) => {
                if (!attributes.style) {
                  return {}
                }
                return { style: attributes.style }
              },
            },
          }
        },
      }).configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            style: {
              default: null,
              parseHTML: (element: HTMLElement) => {
                const el = element as HTMLElement
                const style = el.getAttribute('style')
                // Preserve style attribute if it contains color
                if (style && /color:/i.test(style)) {
                  return style
                }
                return null
              },
              renderHTML: (attributes: { style?: string }) => {
                if (!attributes.style) {
                  return {}
                }
                return { style: attributes.style }
              },
            },
          }
        },
      }),
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
      // Note: StarterKit doesn't include Underline or Link, so we add them
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-600 underline',
        },
      }),
      CheckboxNode,
      RadioNode,
      TextFieldNode,
      TextAreaNode,
    ],
    content: contentWithIds || '',
    onUpdate: ({ editor }: { editor: { getHTML: () => string } }) => {
      const current = editor.getHTML()
      const diffed = computeDiffHtml(current)
      onChange?.(diffed)
    },
    editorProps: {
      handleTextInput: (view: any, from: any, to: any, text: any) => {
        const target = (view.dom.ownerDocument?.activeElement ??
          null) as HTMLElement | null
        if (
          target &&
          (target.tagName.toLowerCase() === 'input' ||
            target.tagName.toLowerCase() === 'textarea')
        ) {
          return false
        }
        return true
      },
      handlePaste: (view: any, event: any) => {
        const target = (view.dom.ownerDocument?.activeElement ??
          null) as HTMLElement | null
        if (
          target &&
          (target.tagName.toLowerCase() === 'input' ||
            target.tagName.toLowerCase() === 'textarea')
        ) {
          return false
        }
        return true
      },
      handleKeyDown: (view: any, event: any) => {
        const target = (view.dom.ownerDocument?.activeElement ??
          null) as HTMLElement | null
        if (
          target &&
          (target.tagName.toLowerCase() === 'input' ||
            target.tagName.toLowerCase() === 'textarea')
        ) {
          return false
        }
        const blockKeys = ['Backspace', 'Delete', 'Enter', 'Tab', ' ']
        if (blockKeys.includes(event.key)) return true
        if (event.key.length === 1) return true
        return false
      },
    },
  })

  // Keep content in sync when html prop changes
  React.useEffect(() => {
    if (!editor || typeof contentWithIds !== 'string') return
    const current = editor.getHTML()
    // Use a more lenient comparison to avoid unnecessary updates
    // but ensure we update when content actually changes
    if (current !== contentWithIds && contentWithIds.trim() !== '') {
      // Use parseOptions to preserve HTML structure and styles
      editor.commands.setContent(contentWithIds, {
        emitUpdate: false,
        parseOptions: {
          preserveWhitespace: 'full',
        },
      })
    }
  }, [editor, contentWithIds])

  return (
    <div className={className}>
      <div className="docs-content" style={{ minHeight: 200 }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
