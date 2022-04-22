import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SendNote, SendNoteValues } from './SendNote'

const handleSubmit = async (values: SendNoteValues) => {
  await new Promise((res) => setTimeout(res, 1000))
  return undefined
}

test('should render the initial value', () => {
  render(
    <SendNote
      defaultValues={{ note: 'example', bugReport: true, critical: true }}
      onSubmit={handleSubmit}
    />
  )

  const bugReportCheckbox = screen.getByLabelText(/bug/i)
  const criticalCheckbox = screen.getByLabelText(/critical/i)

  expect(screen.getByDisplayValue('example')).toBeInTheDocument()
  expect(bugReportCheckbox).toBeInTheDocument()
  expect(bugReportCheckbox).toBeChecked()
  expect(criticalCheckbox).toBeInTheDocument()
  expect(criticalCheckbox).toBeChecked()
})

test('should uncheck checkboxes', () => {
  render(
    <SendNote
      defaultValues={{ note: 'example', bugReport: true, critical: true }}
      onSubmit={handleSubmit}
    />
  )

  const bugReportCheckbox = screen.getByLabelText(/bug/i)
  const criticalCheckbox = screen.getByLabelText(/critical/i)

  expect(bugReportCheckbox).toBeInTheDocument()
  expect(bugReportCheckbox).toBeChecked()
  expect(criticalCheckbox).toBeInTheDocument()
  expect(criticalCheckbox).toBeChecked()

  fireEvent.click(bugReportCheckbox)
  expect(bugReportCheckbox).not.toBeChecked()

  fireEvent.click(criticalCheckbox)
  expect(criticalCheckbox).not.toBeChecked()
})

test('should submit with correct values', async () => {
  const onSubmit = jest.fn()

  render(
    <SendNote
      defaultValues={{ note: 'example', bugReport: true, critical: true }}
      onSubmit={onSubmit}
    />
  )

  const textArea = screen.getByDisplayValue('example')
  const bugReportCheckbox = screen.getByLabelText(/bug/i)
  const submitButton = screen.getByText(/submit form/i)

  expect(bugReportCheckbox).toBeInTheDocument()
  expect(bugReportCheckbox).toBeChecked()

  expect(submitButton).toBeInTheDocument()

  fireEvent.change(textArea, { target: { value: 'Test' } })

  fireEvent.click(bugReportCheckbox)
  expect(bugReportCheckbox).not.toBeChecked()

  fireEvent.submit(submitButton)

  await waitFor(() => {
    expect(onSubmit).toBeCalled()

    expect(onSubmit).toBeCalledWith({
      note: 'Test',
      bugReport: false,
      critical: true,
    })
  })
})
