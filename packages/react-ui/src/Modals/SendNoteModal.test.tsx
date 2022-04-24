import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SendNoteModal, SendNoteModalProps } from './SendNoteModal'
import { SendNoteFormValues } from '../Forms/SendNoteForm'
import { wait } from '@mbari/utils'

const props: SendNoteModalProps = {
  vehicleName: 'example',
  open: true,
  onSubmit: async (values: SendNoteFormValues) => {
    await wait(1)
    return undefined
  },
}

test.todo('should have tests')

test('should render the component', async () => {
  expect(() => render(<SendNoteModal {...props} />)).not.toThrow()
})
