import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PrimaryToolbar } from './PrimaryToolbar'

const options = ['Overview', 'Brizo', 'Aku', 'Pontus']

test('should render the specified options', async () => {
  render(<PrimaryToolbar options={options} />)
  options.forEach((option) => {
    expect(screen.getByText(option)).toBeInTheDocument()
  })
})

test('should render the selected option', async () => {
  render(<PrimaryToolbar options={options} currentOption={options[2]} />)
  options.forEach((option) => {
    const backgroundClass =
      option === options[2] ? 'bg-primary-600' : 'bg-transparent'
    expect(screen.getByText(option)).toHaveClass(backgroundClass)
  })
})

test('should render the add button if a handler is present', async () => {
  render(<PrimaryToolbar options={options} onAddClick={() => {}} />)
  expect(screen.queryByLabelText(/add vehicle/i)).toBeInTheDocument()
})

test('should not render the add button if a handler is not present', async () => {
  render(<PrimaryToolbar options={options} />)
  expect(screen.queryByLabelText(/add vehicle/i)).not.toBeInTheDocument()
})

test('should render the login button if the toolbar is not signed in', async () => {
  render(<PrimaryToolbar options={options} />)
  expect(screen.queryByLabelText(/login/i)).toBeInTheDocument()
})

test('should not render the login button if the toolbar is signed in', async () => {
  render(<PrimaryToolbar options={options} signedIn />)
  expect(screen.queryByLabelText(/login/i)).not.toBeInTheDocument()
})

test('should render a generic profile button if there are no profile credentials', async () => {
  render(<PrimaryToolbar options={options} />)
  expect(screen.queryByLabelText(/profile/i)).toBeInTheDocument()
})

test('should not render a generic profile button if there are profile credentials', async () => {
  render(<PrimaryToolbar options={options} signedIn avatarName="Dynamo Test" />)
  expect(screen.queryByLabelText(/profile/i)).not.toBeInTheDocument()
})
