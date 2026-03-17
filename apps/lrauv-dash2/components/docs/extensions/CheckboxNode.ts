import {
  Node,
  mergeAttributes,
  type CommandProps,
  type NodeViewRendererProps,
} from '@tiptap/core'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    checkboxNode: {
      insertCheckbox: (checked?: boolean) => ReturnType
    }
  }
}

export const CheckboxNode = Node.create({
  name: 'checkboxNode',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: false,
  draggable: false,

  addAttributes() {
    return {
      'data-doc-input-id': {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute('data-doc-input-id'),
      },
      checked: {
        default: false,
        parseHTML: (element: HTMLElement) => element.hasAttribute('checked'),
        renderHTML: (attributes: { checked?: boolean }) =>
          attributes.checked ? { checked: '' } : {},
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'input[type="checkbox"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['input', mergeAttributes({ type: 'checkbox' }, HTMLAttributes)]
  },

  addNodeView() {
    return ({ node, getPos, editor }: NodeViewRendererProps) => {
      const dom = document.createElement('input')
      dom.type = 'checkbox'
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
          const tr = editor.view.state.tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            checked: dom.checked,
          })
          editor.view.dispatch(tr)
        })
      }
      return {
        dom,
        ignoreMutation: () => true,
        stopEvent: (event) => {
          const target = (event.target as HTMLElement) ?? null
          return !!target && (target === dom || dom.contains(target))
        },
        update: (updatedNode: ProseMirrorNode) => {
          if (updatedNode.type.name !== this.name) return false
          dom.checked = !!updatedNode.attrs.checked
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
      insertCheckbox:
        (checked = false) =>
        ({ chain }: CommandProps) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: { checked },
            })
            .run()
        },
    }
  },
})
