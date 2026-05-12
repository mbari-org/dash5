import '@testing-library/jest-dom'
import React from 'react'
import { render } from '@testing-library/react'
import DocViewer from '../components/docs/DocViewer'

// TipTap requires getSelection/createRange in jsdom
if (!global.document.createRange) {
  global.document.createRange = () =>
    ({
      setStart: () => {},
      setEnd: () => {},
      commonAncestorContainer: {
        nodeName: 'BODY',
        ownerDocument: document,
      },
    } as unknown as Range)
}
if (!global.window.getSelection) {
  global.window.getSelection = () => null
}

/** Return the inner HTML of the ProseMirror editor produced by DocViewer. */
function getEditorHtml(html: string): string {
  const { container } = render(<DocViewer html={html} />)
  const editor = container.querySelector('.ProseMirror')
  return editor?.innerHTML ?? ''
}

describe('DocViewer formatting preservation', () => {
  it('renders highlight (mark element with background colour)', () => {
    const html = `<p><mark data-color="#ffff00" style="background-color: #ffff00; color: inherit">highlighted text</mark></p>`
    const { container } = render(<DocViewer html={html} />)
    const mark = container.querySelector('mark')
    expect(mark).toBeInTheDocument()
    expect(mark?.getAttribute('data-color')).toBe('#ffff00')
  })

  it('renders text-align: center on paragraphs', () => {
    const html = `<p style="text-align: center">centered text</p>`
    const editorHtml = getEditorHtml(html)
    expect(editorHtml).toMatch(/text-align:\s*center/)
  })

  it('renders text-align: right on paragraphs', () => {
    const html = `<p style="text-align: right">right-aligned text</p>`
    const editorHtml = getEditorHtml(html)
    expect(editorHtml).toMatch(/text-align:\s*right/)
  })

  it('preserves font-size in inline styles', () => {
    const html = `<p><span style="font-size: 24px">big text</span></p>`
    const { container } = render(<DocViewer html={html} />)
    const spans = Array.from(container.querySelectorAll('span'))
    const sized = spans.find((s) =>
      s.getAttribute('style')?.includes('font-size')
    )
    expect(sized).toBeInTheDocument()
    expect(sized?.getAttribute('style')).toMatch(/font-size:\s*24px/)
  })

  it('preserves text colour in inline styles', () => {
    const html = `<p><span style="color: rgb(255, 0, 0)">red text</span></p>`
    const { container } = render(<DocViewer html={html} />)
    const spans = Array.from(container.querySelectorAll('span'))
    const coloured = spans.find((s) =>
      s.getAttribute('style')?.includes('color')
    )
    expect(coloured).toBeInTheDocument()
    expect(coloured?.getAttribute('style')).toMatch(/color/)
  })

  it('strips disallowed CSS properties from inline styles (security)', () => {
    const html = `<p><span style="font-size: 18px; position: fixed; top: 0">text</span></p>`
    const { container } = render(<DocViewer html={html} />)
    const spans = Array.from(container.querySelectorAll('span'))
    const allStyles = spans.map((s) => s.getAttribute('style') ?? '').join(' ')
    expect(allStyles).not.toMatch(/position/)
  })

  it('renders links with safe rel and target attributes', () => {
    const html = `<p><a href="https://mbari.org">MBARI</a></p>`
    const { container } = render(<DocViewer html={html} />)
    const link = container.querySelector('a')
    expect(link).toBeInTheDocument()
    expect(link?.getAttribute('rel')).toContain('noopener')
    expect(link?.getAttribute('target')).toBe('_blank')
  })

  it('does not open javascript: protocol links', () => {
    const html = `<p><a href="javascript:alert(1)">xss</a></p>`
    const { container } = render(<DocViewer html={html} />)
    const link = container.querySelector('a')
    // Link should either not render or have its href stripped
    if (link) {
      expect(link.getAttribute('href')).not.toMatch(/javascript:/i)
    }
  })
})
