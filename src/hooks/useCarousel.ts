import { useState, useEffect, useCallback, useRef } from 'react'

export function useCarousel(totalSlides: number, autoDelay = 4000) {
  const [current, setCurrent] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined)

  const next = useCallback(() => {
    if (totalSlides === 0) return
    setCurrent(prev => (prev + 1) % totalSlides)
  }, [totalSlides])

  const prev = useCallback(() => {
    if (totalSlides === 0) return
    setCurrent(prev => ((prev - 1) + totalSlides) % totalSlides)
  }, [totalSlides])

  const startAuto = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % totalSlides)
    }, autoDelay)
  }, [totalSlides, autoDelay])

  useEffect(() => {
    if (totalSlides > 1) {
      startAuto()
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [totalSlides, startAuto])

  const handlePrev = useCallback(() => {
    prev()
    startAuto()
  }, [prev, startAuto])

  const handleNext = useCallback(() => {
    next()
    startAuto()
  }, [next, startAuto])

  return { current, handlePrev, handleNext, total: totalSlides }
}
