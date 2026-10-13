"use client"

import * as React from "react"

const MOBILE_BREAKPOINT = 768
const DESKTOP_BREAKPOINT = 1024

export function useBreakpoint() {
  const [width, setWidth] = React.useState<number>(
    typeof window !== "undefined" ? window.innerWidth : DESKTOP_BREAKPOINT
  )

  React.useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth)
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return {
    isMobile: width < MOBILE_BREAKPOINT,
    isTablet: width >= MOBILE_BREAKPOINT && width < DESKTOP_BREAKPOINT,
    isDesktop: width >= DESKTOP_BREAKPOINT,
    width,
  }
}
