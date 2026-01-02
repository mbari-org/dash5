import React, { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { CheckboxNode } from './extensions/CheckboxNode'
import { RadioNode } from './extensions/RadioNode'
import { TextFieldNode } from './extensions/TextFieldNode'
import { TextAreaNode } from './extensions/TextAreaNode'

export interface DocViewerProps {
  html: string
  className?: string
}

export default function DocViewer(props: DocViewerProps) {
  const { html, className } = props

  const convertedHtml = React.useMemo(() => {
    if (!html) return ''
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // Convert <font> tags to <span> tags with inline styles
    // Gives a deprecated warning due to the font tag which is used to be compatible with dash4
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

    return doc.body.innerHTML
  }, [html])

  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
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
      CheckboxNode,
      RadioNode,
      TextFieldNode,
      TextAreaNode,
    ],
    content: convertedHtml || '',
  })

  // Keep content in sync when html prop changes
  useEffect(() => {
    if (!editor || typeof convertedHtml !== 'string') return
    const current = editor.getHTML()
    if (current !== convertedHtml) {
      editor.commands.setContent(convertedHtml, { emitUpdate: false })
    }
  }, [editor, convertedHtml, html])

  return (
    <div className={className}>
      <div className="docs-content">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
