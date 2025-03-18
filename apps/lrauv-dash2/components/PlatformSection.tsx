import React, { useState } from 'react'

// TODO: Use proper type for items prop.
export const PlatformSection: React.FC<{ name: string; items: any[] }> = ({
  name,
  items,
}) => {
  const [open, setOpen] = useState(false)
  const handleToggle = () => setOpen(!open)

  // TODO: Implement a context provider to track all selected platforms similar to how we do this for paths: in SharedPathContextProvider.tsx
  const [selectedPlatforms, setSelectedPlatforms] = useState([] as string[])

  return (
    <>
      <button className="py-2 text-left font-bold" onClick={handleToggle}>
        {name}
      </button>
      {open && (
        <ul>
          {items.map((p) => (
            <li key={p.name} className="flex items-center py-1">
              <input
                type="checkbox"
                id={p.name}
                name={p.name}
                className="mr-2"
                onChange={() =>
                  setSelectedPlatforms((prev) => [...prev, p.name])
                }
                checked={selectedPlatforms.includes(p.name)}
              />
              <label htmlFor={p.name}>
                {p.name}{' '}
                <span className="text-sm text-stone-400">
                  ({p.abbreviation})
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
