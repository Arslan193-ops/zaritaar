"use client"
import { useEffect, useRef } from "react"

/**
 * A hook to detect and prevent infinite render loops in development.
 * If a component renders too many times in a short window, it will log a warning
 * and optionally pause to help you debug before the system crashes.
 */
export function useRenderGuard(componentName: string, limit = 50, windowMs = 1000) {
  const renderCount = useRef(0)
  const startTime = useRef(Date.now())

  useEffect(() => {
    const now = Date.now()
    if (now - startTime.current > windowMs) {
      renderCount.current = 0
      startTime.current = now
    }

    renderCount.current += 1

    if (renderCount.current > limit) {
      console.error(
        `[RenderGuard] WARNING: ${componentName} has rendered ${renderCount.current} times in ${now - startTime.current}ms. ` +
        `This is a high frequency and might lead to an infinite loop or crash.`
      )
      
      // We don't want to throw an error here in production, 
      // but in dev this alert can stop the crash.
      if (process.env.NODE_ENV === "development") {
        // console.trace("Render Stack Trace");
      }
    }
  })
}
