"use client"

import { useEffect } from "react"

type KeyHandler = (e: KeyboardEvent) => void

/** Attach a keydown listener that's automatically cleaned up. */
export function useKeyboardShortcut(handler: KeyHandler, deps: unknown[] = []) {
  useEffect(() => {
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
}
