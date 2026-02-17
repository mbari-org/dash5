import { Node, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textFieldNode: {
      insertTextField: (value?: string, size?: number) => ReturnType
    }
  }
}

export const TextFieldNode = Node.create({
  name: 'textFieldNode',
  group: 'inline',
  inline: true,
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
      size: {
        default: 30,
        parseHTML: (element) => {
          const attr = (element as HTMLElement).getAttribute('size')
          const parsed = attr ? parseInt(attr, 10) : 30
          return isNaN(parsed) ? 30 : parsed
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'input[type="text"]',
        getAttrs: (element) => {
          const el = element as HTMLInputElement
          return {
            'data-doc-input-id': el.getAttribute('data-doc-input-id') || null,
            value: el.getAttribute('value') || '',
            size: el.getAttribute('size') || 30,
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['input', mergeAttributes({ type: 'text' }, HTMLAttributes)]
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement('input')
      dom.type = 'text'
      dom.value = (node.attrs.value as string) || ''
      const size = Number(node.attrs.size) || 30
      dom.setAttribute('size', String(size))
      dom.readOnly = !editor.isEditable
      dom.disabled = !editor.isEditable
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
            size,
          })
          editor.view.dispatch(tr)
        })
      }
      return {
        dom,
        ignoreMutation: () => true,
        stopEvent: (event) => {
          const target = (event.target as HTMLElement) ?? null
          // Ensure the input handles its own key events (e.g., Backspace)
          return !!target && (target === dom || dom.contains(target))
        },
        update: (updatedNode) => {
          if (updatedNode.type.name !== this.name) return false
          dom.value = (updatedNode.attrs.value as string) || ''
          dom.setAttribute('size', String(updatedNode.attrs.size || size))
          dom.readOnly = !editor.isEditable
          dom.disabled = !editor.isEditable
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
      insertTextField:
        (value = '', size = 30) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: { value, size },
            })
            .run()
        },
    }
  },
})
