import clsx from 'clsx'
import React from 'react'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'responsive'
export interface AvatarProps {
  name: string
  color?: string
  imageUrl?: string
  size?: AvatarSize
  className?: string
}

const getInitials = (name: string) =>
  `${name ?? ''}`
    .split(' ')
    .reduce((a, b) => a + b.charAt(0), '')
    .substring(0, 2)

const style = {
  avatar:
    'flex rounded-full hover:shadow-md transition-shadow duration-500 ease-out',
  responsive:
    'h-6 w-6 text-xs md:h-8 md:w-8 md:text-sm lg:h-10 lg:w-10 lg:text-md',
  extraSmall: 'h-6 w-6 text-xs',
  small: 'h-8 w-8 text-sm',
  medium: 'h-10 w-10 text-md',
  large: 'h-12 w-12 text-lg',
}

const styleForSize = (size: AvatarSize) => {
  switch (size) {
    case 'lg':
      return style.large
    case 'md':
      return style.medium
    case 'sm':
      return style.small
    case 'xs':
      return style.extraSmall
    case 'responsive':
      return style.responsive
  }
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  color,
  size = 'md',
  imageUrl,
  className,
}) => (
  <div
    className={clsx(style.avatar, className, styleForSize(size))}
    style={{ background: color ?? '' }}
  >
    {imageUrl ? (
      <span
        className="flex h-full w-full rounded-full bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
    ) : (
      <span className="font-body m-auto flex font-semibold text-white">
        {getInitials(name)}
      </span>
    )}
  </div>
)

Avatar.displayName = 'Navigation.Avatar'
