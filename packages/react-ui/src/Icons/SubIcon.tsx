import React from 'react'
import clsx from 'clsx'

export interface SubIconProps {
  className?: string
  style?: React.CSSProperties
  large?: boolean
}

export const SubIcon: React.FC<SubIconProps> = ({
  className = 'text-black',
  style,
  large,
}) => {
  return (
    <div
      className={clsx(className)}
      style={style}
      aria-label="vehicle underwater icon"
    >
      <svg
        width={large ? '54' : '31'}
        height={large ? '44' : '25'}
        viewBox="0 8 31 17"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.66004 24.2106L7.69886 24.2017L22.7906 24.0722C24.5911 24.0568 25.9613 23.3159 26.7906 22.0989C27.5353 21.0059 27.683 19.7639 27.6758 18.9243C27.6657 17.7439 27.1375 16.5326 26.3722 15.6291C25.5836 14.6981 24.3246 13.847 22.703 13.8609L14.6221 13.9302L14.6037 11.781L14.5865 9.78103L12.5866 9.79819L10.5069 9.81603L8.50699 9.83318L8.52414 11.8331L8.54258 13.9824L7.61128 13.9903L6.57245 13.9993L5.98237 14.8543L3.82609 17.9787L3.02762 19.1357L3.84581 20.2788L6.05538 23.3658L6.66004 24.2106ZM12.6222 13.9474L12.6394 15.9473L14.6393 15.9301L22.7201 15.8608C24.4593 15.8459 25.665 17.6782 25.6759 18.9414C25.6867 20.2046 25.1975 22.0515 22.7734 22.0723L7.68171 22.2017L5.47214 19.1147L7.62843 15.9903L8.55973 15.9823L10.5597 15.9651L10.5425 13.9652L10.5412 13.8159L10.5241 11.816L10.6039 11.8153L12.524 11.7988L12.6038 11.7981L12.6209 13.798L12.6222 13.9474Z"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    </div>
  )
}
