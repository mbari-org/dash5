import '@testing-library/jest-dom'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import DocEditorToolbar from '../components/docs/DocEditorToolbar'

// ── Minimal TipTap editor mock ────────────────────────────────────────────────
// We never run a real ProseMirror instance in jsdom; instead we build a
// chainable mock that satisfies every method the toolbar calls at render time
// and on button click.

type AnyFn = (...args: unknown[]) => unknown

// Returns an object whose every property is either a jest.fn() that returns
// itself or, for terminal calls like .run(), a jest.fn().
function makeChain(): Record<string, AnyFn> {
  const chain: Record<string, AnyFn> = {}
  const handler: ProxyHandler<object> = {
    get(_: object, prop: string) {
      if (!(prop in chain)) {
        chain[prop] = jest.fn((..._args) => new Proxy({}, handler))
      }
      return chain[prop]
    },
    apply(_target, _this, args) {
      return new Proxy({}, handler)
    },
  }
  return new Proxy({}, handler) as Record<string, AnyFn>
}

// Tracks calls so tests can assert on them
const setParagraphFn = jest.fn(() => makeChain())
const unsetFontSizeFn = jest.fn(() => makeChain())
const chainResult = {
  focus: jest.fn(() => ({
    ...makeChain(),
    setParagraph: setParagraphFn,
    unsetFontSize: unsetFontSizeFn,
  })),
}

const mockEditor = {
  on: jest.fn(),
  off: jest.fn(),
  isActive: jest.fn(() => false),
  getAttributes: jest.fn(() => ({})),
  can: jest.fn(() => ({ undo: () => false, redo: () => false })),
  chain: jest.fn(() => chainResult),
  state: { storedMarks: null },
} as unknown as ReturnType<typeof import('@tiptap/react').useEditor>

beforeEach(() => {
  jest.clearAllMocks()
  // Re-wire the chain so setParagraph returns an object that has unsetFontSize
  ;(chainResult.focus as jest.Mock).mockReturnValue({
    ...makeChain(),
    setParagraph: setParagraphFn,
    unsetFontSize: unsetFontSizeFn,
  })
  setParagraphFn.mockReturnValue({ unsetFontSize: unsetFontSizeFn })
  unsetFontSizeFn.mockReturnValue({ run: jest.fn() })
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('DocEditorToolbar — sticky positioning (fix #619 item 2)', () => {
  it('renders the toolbar with a sticky class so it stays visible while scrolling', () => {
    const { container } = render(<DocEditorToolbar editor={mockEditor} />)
    const toolbar = container.firstChild as HTMLElement
    expect(toolbar).toHaveClass('sticky')
  })

  it('renders with top-0 class to anchor it at the top of its scroll container', () => {
    const { container } = render(<DocEditorToolbar editor={mockEditor} />)
    const toolbar = container.firstChild as HTMLElement
    expect(toolbar).toHaveClass('top-0')
  })
})

describe('DocEditorToolbar — P button clears font size (fix #619 item 3)', () => {
  it('renders the P (Normal text) button', () => {
    render(<DocEditorToolbar editor={mockEditor} />)
    // The button's visible text is "P"; "Normal text" is the wrapping span's title
    expect(screen.getByRole('button', { name: 'P' })).toBeInTheDocument()
  })

  it('chains unsetFontSize() after setParagraph() when the P button is clicked', () => {
    render(<DocEditorToolbar editor={mockEditor} />)

    const pButton = screen.getByTitle('Normal text').querySelector('button')!
    fireEvent.click(pButton)

    expect(setParagraphFn).toHaveBeenCalled()
    expect(unsetFontSizeFn).toHaveBeenCalled()
  })
})
