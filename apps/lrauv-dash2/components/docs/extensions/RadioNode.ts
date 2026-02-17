import { Node, mergeAttributes } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    radioNode: {
      insertRadio: (
        name?: string,
        checked?: boolean,
        value?: string
      ) => ReturnType
    }
  }
}

export const RadioNode = Node.create({
  name: 'radioNode',
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
      name: {
        default: '',
      },
      value: {
        default: '',
      },
      checked: {
        default: false,
        parseHTML: (element) => element.hasAttribute('checked'),
        renderHTML: (attributes) => (attributes.checked ? { checked: '' } : {}),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'input[type="radio"]',
        getAttrs: (element) => {
          const el = element as HTMLInputElement
          return {
            'data-doc-input-id': el.getAttribute('data-doc-input-id') || null,
            name: el.getAttribute('name') || '',
            value: el.getAttribute('value') || '',
            checked: el.hasAttribute('checked'),
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['input', mergeAttributes({ type: 'radio' }, HTMLAttributes)]
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement('input')
      dom.type = 'radio'
      const name = (node.attrs.name as string) || ''
      dom.setAttribute('name', name)
      dom.value = (node.attrs.value as string) || ''
      dom.checked = !!node.attrs.checked
      dom.disabled = !editor.isEditable
      const dataId = (node.attrs['data-doc-input-id'] as string) || null
      if (dataId) {
        dom.setAttribute('data-doc-input-id', dataId)
      }
      if (editor.isEditable) {
        dom.addEventListener('change', () => {
          const pos = typeof getPos === 'function' ? getPos() : null
          if (pos == null) return
          // Uncheck all radios with same name, then check this one
          const { state } = editor.view
          let transaction = state.tr
          state.doc.descendants((n, p) => {
            if (n.type.name === node.type.name && n.attrs.name === name) {
              transaction = transaction.setNodeMarkup(p, undefined, {
                ...n.attrs,
                checked: false,
              })
            }
            return true
          })
          transaction = transaction.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            checked: true,
          })
          editor.view.dispatch(transaction)
        })
      }
      return {
        dom,
        ignoreMutation: () => true,
        stopEvent: (event) => {
          const target = (event.target as HTMLElement) ?? null
          return !!target && (target === dom || dom.contains(target))
        },
        update: (updatedNode) => {
          if (updatedNode.type.name !== this.name) return false
          dom.checked = !!updatedNode.attrs.checked
          dom.setAttribute('name', (updatedNode.attrs.name as string) || '')
          dom.value = (updatedNode.attrs.value as string) || ''
          dom.disabled = !editor.isEditable
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
      insertRadio:
        (name = '', checked = false, value = '') =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: { name, checked, value },
            })
            .run()
        },
    }
  },
})
