import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AccordionHeader, AccordionHeaderProps } from './AccordionHeader'

const props: AccordionHeaderProps = {
  label: 'Any string',
  ariaLabel: 'Accordion container',
  onToggle: () => {},
}

test('should render the label', async () => {
  render(<AccordionHeader {...props} />)

  expect(screen.getByText(props.label)).toBeInTheDocument()
})

test('should render the secondary label when supplied', async () => {
  render(<AccordionHeader {...props} secondaryLabel={'second label'} />)

  expect(screen.getByText(/second label/i)).toBeInTheDocument()
})

test('should render the header with a white background when closed', async () => {
  render(<AccordionHeader {...props} open={false} />)

  expect(screen.getByLabelText(/Accordion container/i)).toHaveClass('bg-white')
})

test('should render the header with a blue background when open', async () => {
  render(<AccordionHeader {...props} open={true} />)

  expect(screen.getByLabelText(/Accordion container/i)).toHaveClass(
    'bg-primary-600'
  )
})

test('should render the expand icon when appropriate', async () => {
  render(<AccordionHeader {...props} open={true} onExpand={() => {}} />)

  expect(screen.getByTitle(/expand icon/i)).toBeInTheDocument()
})
