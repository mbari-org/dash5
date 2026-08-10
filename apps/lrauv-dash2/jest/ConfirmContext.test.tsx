import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { ConfirmationProvider, useConfirm } from '../components/ConfirmContext'

const TestComponent = () => {
  const confirm = useConfirm()
  const [result, setResult] = useState('pending')

  return (
    <>
      <button
        onClick={async () => {
          const confirmed = await confirm({
            title: 'Delete this item?',
          })
          setResult(String(confirmed))
        }}
      >
        trigger
      </button>
      <div data-testid="result">{result}</div>
    </>
  )
}

describe('ConfirmContext', () => {
  test('useConfirm throws when used outside of ConfirmationProvider', () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    expect(() => render(<TestComponent />)).toThrow(
      'useConfirm must be used within a ConfirmationProvider'
    )
    consoleErrorSpy.mockRestore()
  })

  test('does not render a modal before confirm is called', () => {
    render(
      <ConfirmationProvider>
        <TestComponent />
      </ConfirmationProvider>
    )

    expect(screen.queryByText('Delete this item?')).not.toBeInTheDocument()
  })

  test('resolves true and closes the modal when Confirm is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ConfirmationProvider>
        <TestComponent />
      </ConfirmationProvider>
    )

    await user.click(screen.getByText('trigger'))
    expect(screen.getByText('Delete this item?')).toBeInTheDocument()

    await user.click(screen.getByText('Confirm'))

    expect(await screen.findByTestId('result')).toHaveTextContent('true')
    expect(screen.queryByText('Delete this item?')).not.toBeInTheDocument()
  })

  test('resolves false and closes the modal when Cancel is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ConfirmationProvider>
        <TestComponent />
      </ConfirmationProvider>
    )

    await user.click(screen.getByText('trigger'))
    expect(screen.getByText('Delete this item?')).toBeInTheDocument()

    await user.click(screen.getByText('Cancel'))

    expect(await screen.findByTestId('result')).toHaveTextContent('false')
    expect(screen.queryByText('Delete this item?')).not.toBeInTheDocument()
  })

  test('resolves false and closes the modal when the close icon is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ConfirmationProvider>
        <TestComponent />
      </ConfirmationProvider>
    )

    await user.click(screen.getByText('trigger'))
    expect(screen.getByText('Delete this item?')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'close' }))

    expect(await screen.findByTestId('result')).toHaveTextContent('false')
    expect(screen.queryByText('Delete this item?')).not.toBeInTheDocument()
  })

  test('supports multiple independently resolving cycles', async () => {
    const user = userEvent.setup()
    render(
      <ConfirmationProvider>
        <TestComponent />
      </ConfirmationProvider>
    )

    await user.click(screen.getByText('trigger'))
    expect(screen.getByText('Delete this item?')).toBeInTheDocument()
    await user.click(screen.getByText('Confirm'))
    expect(await screen.findByTestId('result')).toHaveTextContent('true')

    await user.click(screen.getByText('trigger'))
    expect(screen.getByText('Delete this item?')).toBeInTheDocument()
    await user.click(screen.getByText('Cancel'))
    expect(await screen.findByTestId('result')).toHaveTextContent('false')
  })
})
