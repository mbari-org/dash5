import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { IconButton } from './IconButton'
import { faHome } from '@fortawesome/free-solid-svg-icons'

test('should support disabled state', async () => {
  render(<IconButton ariaLabel="home" icon={faHome} disabled />)
  expect(screen.getByLabelText(/home/i)).toHaveClass('pointer-events-none')
})

test('should be large by default', async () => {
  render(<IconButton ariaLabel="home" icon={faHome} />)
  expect(screen.getByLabelText(/home/i)).toHaveClass('text-lg')
  expect(screen.getByLabelText(/home/i)).toHaveClass('h-10')
  expect(screen.getByLabelText(/home/i)).toHaveClass('w-10')
})

test('should adjust for text-xs', async () => {
  render(<IconButton ariaLabel="home" icon={faHome} size="text-xs" />)
  expect(screen.getByLabelText(/home/i)).toHaveClass('text-xs')
  expect(screen.getByLabelText(/home/i)).toHaveClass('h-7')
  expect(screen.getByLabelText(/home/i)).toHaveClass('w-7')
})

test('should adjust for text-sm', async () => {
  render(<IconButton ariaLabel="home" icon={faHome} size="text-sm" />)
  expect(screen.getByLabelText(/home/i)).toHaveClass('text-sm')
  expect(screen.getByLabelText(/home/i)).toHaveClass('h-8')
  expect(screen.getByLabelText(/home/i)).toHaveClass('w-8')
})

test('should adjust for text-md', async () => {
  render(<IconButton ariaLabel="home" icon={faHome} size="text-md" />)
  expect(screen.getByLabelText(/home/i)).toHaveClass('text-md')
  expect(screen.getByLabelText(/home/i)).toHaveClass('h-9')
  expect(screen.getByLabelText(/home/i)).toHaveClass('w-9')
})

test('should adjust for text-xl', async () => {
  render(<IconButton ariaLabel="home" icon={faHome} size="text-xl" />)
  expect(screen.getByLabelText(/home/i)).toHaveClass('text-xl')
  expect(screen.getByLabelText(/home/i)).toHaveClass('h-11')
  expect(screen.getByLabelText(/home/i)).toHaveClass('w-11')
})

test('should adjust for text-2xl', async () => {
  render(<IconButton ariaLabel="home" icon={faHome} size="text-2xl" />)
  expect(screen.getByLabelText(/home/i)).toHaveClass('text-2xl')
  expect(screen.getByLabelText(/home/i)).toHaveClass('h-12')
  expect(screen.getByLabelText(/home/i)).toHaveClass('w-12')
})

test('should adjust for text-3xl', async () => {
  render(<IconButton ariaLabel="home" icon={faHome} size="text-3xl" />)
  expect(screen.getByLabelText(/home/i)).toHaveClass('text-3xl')
  expect(screen.getByLabelText(/home/i)).toHaveClass('h-14')
  expect(screen.getByLabelText(/home/i)).toHaveClass('w-14')
})
