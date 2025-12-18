import { useState, useRef, useEffect } from 'react'
import { HexColorPicker } from 'react-colorful'
import { Button } from '@mbari/react-ui'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPalette } from '@fortawesome/free-solid-svg-icons'
import clsx from 'clsx'

interface ColorPickerProps {
  label: string
  currentColor?: string
  defaultColor?: string
  onChange: (color: string) => void
  className?: string
}

const COMMON_COLORS = [
  '#000000',
  '#333333',
  '#666666',
  '#999999',
  '#CCCCCC',
  '#FFFFFF',
  '#FF0000',
  '#FF6600',
  '#FFCC00',
  '#00FF00',
  '#0066FF',
  '#0000FF',
  '#6600FF',
  '#FF00FF',
]

export default function ColorPicker({
  label,
  currentColor,
  defaultColor = '#000000',
  onChange,
  className,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempColor, setTempColor] = useState(currentColor || defaultColor)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (currentColor) {
      setTempColor(currentColor)
    }
  }, [currentColor])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  const handleColorSelect = (color: string) => {
    setTempColor(color)
    onChange(color)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className={clsx('relative', className)}>
      <Button
        appearance="transparent"
        tight
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center gap-1',
          currentColor && currentColor !== defaultColor && 'bg-stone-200'
        )}
      >
        <FontAwesomeIcon icon={faPalette} />
        <div
          className="h-3 w-3 rounded border border-stone-300"
          style={{ backgroundColor: currentColor || defaultColor }}
        />
      </Button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 rounded-md border border-stone-300 bg-white p-2 shadow-lg">
          <div className="mb-2">
            <HexColorPicker
              color={tempColor}
              onChange={setTempColor}
              style={{ width: '200px', height: '120px' }}
            />
          </div>
          <div className="mb-2 flex flex-wrap gap-1">
            {COMMON_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={clsx(
                  'h-6 w-6 rounded border',
                  tempColor === color && 'ring-2 ring-primary-600 ring-offset-1'
                )}
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
                title={color}
              />
            ))}
          </div>
          <div className="flex gap-1">
            <Button
              appearance="secondary"
              tight
              onClick={() => handleColorSelect(tempColor)}
            >
              Apply
            </Button>
            <Button
              appearance="secondary"
              tight
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
