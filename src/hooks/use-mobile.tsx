
import * as React from "react"

const MOBILE_BREAKPOINT = 768 // Aligned with Tailwind's default md breakpoint

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Check if window is defined (ensuring it runs only on the client-side)
    if (typeof window === 'undefined') {
      return;
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = () => {
      setIsMobile(mql.matches); // Use mql.matches for reliability
    }
    
    // Set initial state
    onChange(); 
    
    mql.addEventListener("change", onChange)
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile === undefined ? false : isMobile; // Default to false during SSR or before hydration
}

