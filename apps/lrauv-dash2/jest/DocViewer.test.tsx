import '@testing-library/jest-dom'
import React from 'react'
import { render, waitFor } from '@testing-library/react'
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

/**
 * Render DocViewer and wait for the ProseMirror editor to mount.
 * DocViewer uses immediatelyRender: false, so the .ProseMirror element
 * isn't present synchronously — we must wait for the effect to run.
 */
async function getEditorContainer(html: string) {
  const { container } = render(<DocViewer html={html} />)
  await waitFor(() => {
    expect(container.querySelector('.ProseMirror')).not.toBeNull()
  })
  return container
}

describe('DocViewer formatting preservation', () => {
  it('renders highlight (mark element with background colour)', async () => {
    const html = `<p><mark data-color="#ffff00" style="background-color: #ffff00; color: inherit">highlighted text</mark></p>`
    const container = await getEditorContainer(html)
    const mark = container.querySelector('mark')
    expect(mark).toBeInTheDocument()
    expect(mark?.getAttribute('data-color')).toBe('#ffff00')
  })

  it('renders text-align: center on paragraphs', async () => {
    const container = await getEditorContainer(
      `<p style="text-align: center">centered text</p>`
    )
    expect(container.querySelector('.ProseMirror')?.innerHTML).toMatch(
      /text-align:\s*center/
    )
  })

  it('renders text-align: right on paragraphs', async () => {
    const container = await getEditorContainer(
      `<p style="text-align: right">right-aligned text</p>`
    )
    expect(container.querySelector('.ProseMirror')?.innerHTML).toMatch(
      /text-align:\s*right/
    )
  })

  it('preserves font-size in inline styles', async () => {
    const container = await getEditorContainer(
      `<p><span style="font-size: 24px">big text</span></p>`
    )
    await waitFor(() => {
      const spans = Array.from(container.querySelectorAll('span'))
      const sized = spans.find((s) =>
        s.getAttribute('style')?.includes('font-size')
      )
      expect(sized).toBeInTheDocument()
      expect(sized?.getAttribute('style')).toMatch(/font-size:\s*24px/)
    })
  })

  it('preserves text colour in inline styles', async () => {
    const container = await getEditorContainer(
      `<p><span style="color: rgb(255, 0, 0)">red text</span></p>`
    )
    await waitFor(() => {
      const spans = Array.from(container.querySelectorAll('span'))
      const coloured = spans.find((s) =>
        s.getAttribute('style')?.includes('color')
      )
      expect(coloured).toBeInTheDocument()
      expect(coloured?.getAttribute('style')).toMatch(/color/)
    })
  })

  it('preserves font-family for dash4 <font face> compatibility', async () => {
    // The convertedHtml step converts <font face="Arial"> to
    // <span style="font-family: Arial">. That font-family must survive
    // the TextStyle.parseHTML whitelist.
    const container = await getEditorContainer(
      `<p><span style="font-family: Arial">legacy font</span></p>`
    )
    await waitFor(() => {
      const spans = Array.from(container.querySelectorAll('span'))
      const fonted = spans.find((s) =>
        s.getAttribute('style')?.includes('font-family')
      )
      expect(fonted).toBeInTheDocument()
      expect(fonted?.getAttribute('style')).toMatch(/font-family/)
    })
  })

  it('strips disallowed CSS properties from inline styles (security)', async () => {
    const container = await getEditorContainer(
      `<p><span style="font-size: 18px; position: fixed; top: 0">text</span></p>`
    )
    await waitFor(() => {
      const spans = Array.from(container.querySelectorAll('span'))
      const allStyles = spans
        .map((s) => s.getAttribute('style') ?? '')
        .join(' ')
      expect(allStyles).not.toMatch(/position/)
    })
  })

  it('renders links with safe rel and target attributes', async () => {
    const container = await getEditorContainer(
      `<p><a href="https://mbari.org">MBARI</a></p>`
    )
    await waitFor(() => {
      const link = container.querySelector('a')
      expect(link).toBeInTheDocument()
      expect(link?.getAttribute('rel')).toContain('noopener')
      expect(link?.getAttribute('target')).toBe('_blank')
    })
  })

  it('does not open javascript: protocol links', async () => {
    const container = await getEditorContainer(
      `<p><a href="javascript:alert(1)">xss</a></p>`
    )
    // Link should either not render or have its href stripped
    const link = container.querySelector('a')
    if (link) {
      expect(link.getAttribute('href')).not.toMatch(/javascript:/i)
    }
  })
})
