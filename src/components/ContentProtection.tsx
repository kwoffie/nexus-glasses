import { useEffect } from 'react'

export default function ContentProtection() {
  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    // Disable keyboard shortcuts for save/print/screen capture
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S, Ctrl+P, Ctrl+Shift+I, Ctrl+Shift+J, F12, Ctrl+U
      if (
        (e.ctrlKey && (e.key === 's' || e.key === 'p' || e.key === 'u')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        e.key === 'F12'
      ) {
        e.preventDefault()
        alert('This action is disabled to protect our content.')
      }
    }

    // Disable drag start
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault()
    }

    // Disable copy
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault()
    }

    // Disable cut
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault()
    }

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('dragstart', handleDragStart)
    document.addEventListener('copy', handleCopy)
    document.addEventListener('cut', handleCut)

    // DevTools detection (basic)
    const devToolsCheck = setInterval(() => {
      const threshold = 160
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        console.clear()
        console.log('DevTools detected. Content is protected.')
      }
    }, 1000)

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('dragstart', handleDragStart)
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('cut', handleCut)
      clearInterval(devToolsCheck)
    }
  }, [])

  useEffect(() => {
    // Add copyright notice dynamically
    const copyright = document.createElement('div')
    copyright.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.4);
      font-family: monospace;
      z-index: 10000;
      pointer-events: none;
      text-align: right;
      line-height: 1.4;
    `
    copyright.textContent = `© ${new Date().getFullYear()} NEXUS Spectacle\nAll Rights Reserved.`
    document.body.appendChild(copyright)

    return () => {
      document.body.removeChild(copyright)
    }
  }, [])

  return null
}