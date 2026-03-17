declare module '@tiptap/react' {
  import * as React from 'react'
  export const useEditor: (...args: any[]) => any
  export const EditorContent: React.ComponentType<any>
}
