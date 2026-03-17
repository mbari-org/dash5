// @ts-nocheck
import { Node, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textAreaNode: {
      insertTextArea: (
        value?: string,
        rows?: number,
        cols?: number
      ) => ReturnType
    }
  }
}

export const TextAreaNode = Node.create({
  name: 'textAreaNode',
  group: 'block',
  atom: true,
  selectable: false,
  draggable: false,

  addAttributes() {
    return {
      'data-doc-input-id': {
        default: null,
        parseHTML: (element) =>
          (element as HTMLElement).getAttribute('data-doc-input-id'),
      },
      value: {
        default: '',
      },
      rows: {
        default: 1,
        parseHTML: (element) => {
          const attr = (element as HTMLElement).getAttribute('rows')
          const parsed = attr ? parseInt(attr, 10) : 1
          return isNaN(parsed) ? 1 : parsed
        },
      },
      cols: {
        default: 30,
        parseHTML: (element) => {
          const attr = (element as HTMLElement).getAttribute('cols')
          const parsed = attr ? parseInt(attr, 10) : 30
          return isNaN(parsed) ? 30 : parsed
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'textarea',
        getAttrs: (element) => {
          const el = element as HTMLTextAreaElement
          return {
            'data-doc-input-id': el.getAttribute('data-doc-input-id') || null,
            value: el.textContent || '',
            rows: el.getAttribute('rows') || 1,
            cols: el.getAttribute('cols') || 30,
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { value, ...rest } = HTMLAttributes as { value?: string }
    return ['textarea', mergeAttributes(rest), value || '']
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement('textarea')
      const rows = Number(node.attrs.rows) || 1
      const cols = Number(node.attrs.cols) || 30
      dom.setAttribute('rows', String(rows))
      dom.setAttribute('cols', String(cols))
      dom.value = (node.attrs.value as string) || ''
      dom.readOnly = !editor.isEditable
      // Visible styling for fill-in mode (not persisted to saved HTML)
      dom.style.border = '1px solid #cbd5e1'
      dom.style.backgroundColor = '#ffffff'
      dom.style.color = '#000000'
      dom.style.padding = '2px 4px'
      dom.style.borderRadius = '4px'
      const dataId = (node.attrs['data-doc-input-id'] as string) || null
      if (dataId) {
        dom.setAttribute('data-doc-input-id', dataId)
      }
      if (editor.isEditable) {
        dom.addEventListener('input', () => {
          const pos = typeof getPos === 'function' ? getPos() : null
          if (pos == null) return
          const tr = editor.view.state.tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            value: dom.value,
            rows,
            cols,
          })
          editor.view.dispatch(tr)
        })
      }
      return {
        dom,
        ignoreMutation: () => true,
        stopEvent: (event) => {
          const target = (event.target as HTMLElement) ?? null
          // Ensure the textarea handles its own key events (e.g., Backspace)
          return !!target && (target === dom || dom.contains(target))
        },
        update: (updatedNode) => {
          if (updatedNode.type.name !== this.name) return false
          dom.value = (updatedNode.attrs.value as string) || ''
          dom.setAttribute('rows', String(updatedNode.attrs.rows || rows))
          dom.setAttribute('cols', String(updatedNode.attrs.cols || cols))
          dom.readOnly = !editor.isEditable
          // Keep styling consistent during updates
          dom.style.border = '1px solid #cbd5e1'
          dom.style.backgroundColor = '#ffffff'
          dom.style.color = '#000000'
          dom.style.padding = '2px 4px'
          dom.style.borderRadius = '4px'
          const updatedDataId =
            (updatedNode.attrs['data-doc-input-id'] as string) || null
          if (updatedDataId) {
            dom.setAttribute('data-doc-input-id', updatedDataId)
          } else {
            dom.removeAttribute('data-doc-input-id')
          }
          return true
        },
      }
    }
  },

  addCommands() {
    return {
      insertTextArea:
        (value = '', rows = 1, cols = 30) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: { value, rows, cols },
            })
            .run()
        },
    }
  },
})
