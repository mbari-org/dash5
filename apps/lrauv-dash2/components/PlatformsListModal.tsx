import React from 'react'
import { usePlatforms } from '@mbari/api-client'
import { Modal } from '@mbari/react-ui'
import { PlatformSection } from './PlatformSection'

export const PlatformsListModal: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const { data: platforms } = usePlatforms(
    { refresh: 'true' as any },
    { baseUrl: process.env.NEXT_PUBLIC_ODSS2BASE_URL }
  )

  const groups =
    platforms?.reduce((acc, p) => {
      const group = acc[p.typeName] ?? []
      group.push(p)
      return { ...acc, [p.typeName]: group }
    }, {} as Record<string, any>) ?? {}

  return (
    <Modal
      title={<div className={'text-lg font-bold'}>Platforms</div>}
      onClose={onClose}
      draggable
      open
    >
      <ul
        className="flex flex-col overflow-auto"
        style={{ height: 300, overflowY: 'auto' }}
      >
        {Object.keys(groups)?.map((groupName) => (
          <li key={groupName}>
            <PlatformSection name={groupName} items={groups[groupName]} />
          </li>
        ))}
      </ul>
    </Modal>
  )
}
