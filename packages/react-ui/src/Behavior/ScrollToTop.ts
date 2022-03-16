/*
// Adjust this to your needs for example if you want to use nextJS:
import { useRouter} from "next/router";
export const ScrollToTop: React.FC = () => {
  const { pathname } = useRouter();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};
*/

import React, { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

ScrollToTop.displayName = 'Behavior.ScrollToTop'
