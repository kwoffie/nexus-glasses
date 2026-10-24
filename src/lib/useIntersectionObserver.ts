import { useRef, useEffect } from 'react'

export function useIntersectionObserver(
  callback: (isIntersecting: boolean) => void,
  options?: IntersectionObserverInit
) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          callback(true)
          // Add animate-in class for CSS animations
          entry.target.classList.add('animate-in')
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px 0px',
        ...options,
      }
    )

    observer.observe(ref.current)

    // Fallback: if element is already in viewport, trigger immediately
    const rect = ref.current.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      callback(true)
      ref.current.classList.add('animate-in')
    }

    // Fallback: ensure content is visible after 2 seconds even if observer doesn't fire
    const fallbackTimeout = setTimeout(() => {
      if (ref.current && !ref.current.classList.contains('animate-in')) {
        ref.current.classList.add('animate-in')
      }
    }, 2000)

    return () => {
      observer.disconnect()
      clearTimeout(fallbackTimeout)
    }
  }, [callback, options])

  return ref
}

// Utility to observe multiple elements
export function useIntersectionObserverMultiple(
  count: number,
  callback: (isIntersecting: boolean, index: number) => void,
  options?: IntersectionObserverInit
) {
  const refs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    refs.current.forEach((el, index) => {
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            callback(true, index)
            entry.target.classList.add('animate-in')
          }
        },
        {
          threshold: 0.1,
          rootMargin: '50px 0px',
          ...options,
        }
      )

      observer.observe(el)
      observers.push(observer)

      // Fallback: if element is already in viewport, trigger immediately
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        callback(true, index)
        el.classList.add('animate-in')
      }
    })

    // Fallback: ensure content is visible after 2 seconds
    const fallbackTimeout = setTimeout(() => {
      refs.current.forEach((el) => {
        if (el && !el.classList.contains('animate-in')) {
          el.classList.add('animate-in')
        }
      })
    }, 2000)

    return () => {
      observers.forEach((obs) => obs.disconnect())
      clearTimeout(fallbackTimeout)
    }
  }, [count, callback, options])

  return refs
}