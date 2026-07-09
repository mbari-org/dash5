import '@testing-library/jest-dom'
import React from 'react'
import { render, act } from '@testing-library/react'

// ── Mock @tiptap/react ────────────────────────────────────────────────────────
// Variables accessible inside jest.mock factories must be prefixed with "mock".
let mockCapturedOnUpdate: ((args: { editor: unknown }) => void) | null = null
const mockSetContent = jest.fn()
const mockGetHTML = jest.fn(() => '<p>initial</p>')
const mockEditorInstance = {
  getHTML: mockGetHTML,
  commands: { setContent: mockSetContent },
  isDestroyed: false,
}

jest.mock('@tiptap/react', () => ({
  useEditor: jest.fn((opts) => {
    mockCapturedOnUpdate = opts.onUpdate
    return mockEditorInstance
  }),
  EditorContent: () => <div data-testid="editor-content" />,
}))

// Self-referential chainable stub: ext.extend() returns ext, so
// Color.extend({...}).configure({...}) works without errors.
jest.mock('@tiptap/starter-kit', () => ({
  __esModule: true,
  default: { configure: () => ({}) },
}))
jest.mock('@tiptap/extension-text-align', () => {
  const ext = { configure: () => ext, extend: () => ext }
  return { TextAlign: ext }
})
jest.mock('@tiptap/extension-color', () => {
  const ext = { configure: () => ext, extend: () => ext }
  return { Color: ext }
})
jest.mock('@tiptap/extension-text-style', () => {
  const ext = { configure: () => ext, extend: () => ext }
  return { TextStyle: ext, FontSize: ext }
})
jest.mock('@tiptap/extension-highlight', () => {
  const ext = { configure: () => ext, extend: () => ext }
  return { Highlight: ext }
})
jest.mock('@tiptap/extension-table', () => {
  const ext = { configure: () => ext, extend: () => ext }
  return { Table: ext }
})
jest.mock('@tiptap/extension-table-row', () => {
  const ext = { configure: () => ext, extend: () => ext }
  return { TableRow: ext }
})
jest.mock('@tiptap/extension-table-cell', () => {
  const ext = { configure: () => ext, extend: () => ext }
  return { TableCell: ext }
})
jest.mock('@tiptap/extension-table-header', () => {
  const ext = { configure: () => ext, extend: () => ext }
  return { TableHeader: ext }
})
jest.mock('@tiptap/extension-link', () => {
  const ext = { configure: () => ext, extend: () => ext }
  return { Link: ext }
})
jest.mock('@tiptap/extension-underline', () => {
  const ext = { configure: () => ext, extend: () => ext }
  return { Underline: ext }
})
jest.mock('@tiptap/extension-subscript', () => {
  const ext = {
    configure: () => ext,
    extend: () => ({ excludes: 'superscript', configure: () => ext }),
  }
  return { Subscript: ext }
})
jest.mock('@tiptap/extension-superscript', () => {
  const ext = {
    configure: () => ext,
    extend: () => ({ excludes: 'subscript', configure: () => ext }),
  }
  return { Superscript: ext }
})
jest.mock('@tiptap/extension-horizontal-rule', () => {
  const ext = { configure: () => ext, extend: () => ext }
  return { HorizontalRule: ext }
})
jest.mock('../components/docs/extensions', () => {
  const ext = { configure: () => ext, extend: () => ext }
  return {
    CheckboxNode: ext,
    RadioNode: ext,
    TextFieldNode: ext,
    TextAreaNode: ext,
  }
})
jest.mock('../components/docs/DocEditorToolbar', () => ({
  __esModule: true,
  default: () => <div data-testid="toolbar" />,
}))
jest.mock('@mbari/react-ui', () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode
    onClick?: () => void
  }) => <button onClick={onClick}>{children}</button>,
  Input: ({
    onChange,
  }: {
    onChange?: React.ChangeEventHandler<HTMLInputElement>
  }) => <input onChange={onChange} />,
  Modal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Import after mocks are defined
import DocEditorTipTap from '../components/docs/DocEditorTipTap'

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
  mockCapturedOnUpdate = null
  mockGetHTML.mockReturnValue('<p>initial</p>')
})

describe('DocEditorTipTap — clipboard preservation (fix #740)', () => {
  it('does NOT call setContent when html prop updates to the value the editor just emitted (internal edit)', () => {
    const onChange = jest.fn()
    const { rerender } = render(
      <DocEditorTipTap html="<p>initial</p>" onChange={onChange} />
    )

    // Simulate user typing: editor's onUpdate fires, parent is notified
    mockGetHTML.mockReturnValue('<p>edited</p>')
    act(() => {
      mockCapturedOnUpdate?.({ editor: mockEditorInstance })
    })
    expect(onChange).toHaveBeenCalledWith('<p>edited</p>')

    // Parent re-renders with the same html the editor just produced
    rerender(<DocEditorTipTap html="<p>edited</p>" onChange={onChange} />)

    // setContent must NOT be called — the editor already has this content.
    // Calling it would reset ProseMirror's clipboard, breaking repeated Ctrl+V.
    expect(mockSetContent).not.toHaveBeenCalled()
  })

  it('DOES call setContent when html prop changes to a value the editor did not produce (external load)', () => {
    const onChange = jest.fn()
    const { rerender } = render(
      <DocEditorTipTap html="<p>initial</p>" onChange={onChange} />
    )

    // External change: parent loads a completely different document
    rerender(<DocEditorTipTap html="<p>new document</p>" onChange={onChange} />)

    expect(mockSetContent).toHaveBeenCalledWith('<p>new document</p>', {
      emitUpdate: false,
    })
  })

  it('does NOT call setContent again when the same external html is re-rendered unchanged', () => {
    const onChange = jest.fn()
    const { rerender } = render(
      <DocEditorTipTap html="<p>initial</p>" onChange={onChange} />
    )

    rerender(<DocEditorTipTap html="<p>loaded doc</p>" onChange={onChange} />)
    mockSetContent.mockClear()

    // Same html rendered again — no change, no setContent
    rerender(<DocEditorTipTap html="<p>loaded doc</p>" onChange={onChange} />)
    expect(mockSetContent).not.toHaveBeenCalled()
  })
})
