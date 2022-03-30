import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AccordionHeader } from './AccordionHeader'

test('should render child content', async () => {
  render(<AccordionHeader>Click Here</AccordionHeader>)
  expect(screen.getByText(/Click Here/i)).toHaveTextContent('Click Here')
})
