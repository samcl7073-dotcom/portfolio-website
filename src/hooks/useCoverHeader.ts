import { useEffect, useRef, useCallback } from 'react'

export function useCoverHeader(enabled = true) {
  const coverRef = useRef<HTMLDivElement>(null)
  const spacerRef = useRef<HTMLDivElement | null>(null)

  const setupRef = useCallback((el: HTMLDivElement | null) => {
    coverRef.current = el
  }, [])

  useEffect(() => {
    if (!enabled) return

    const coverEl = coverRef.current
    if (!coverEl) return

    const header = document.querySelector('.site-header') as HTMLElement | null

    const getHeaderHeight = () => header?.offsetHeight ?? 56
    let vh = window.innerHeight
    let scrollDistance = vh * 0.9
    let minHeight = getHeaderHeight()

    coverEl.style.position = 'fixed'
    coverEl.style.top = '0'
    coverEl.style.left = '0'
    coverEl.style.width = '100%'
    coverEl.style.zIndex = '10'
    coverEl.style.overflow = 'hidden'
    coverEl.style.height = vh + 'px'

    if (coverEl.classList.contains('project-hero-banner')) {
      coverEl.classList.add('as-cover')
    }

    let spacer = spacerRef.current
    if (!spacer) {
      spacer = document.createElement('div')
      spacer.className = 'cover-spacer'
      spacerRef.current = spacer
    }
    spacer.style.height = vh + 'px'
    if (coverEl.parentNode && !spacer.parentNode) {
      coverEl.parentNode.insertBefore(spacer, coverEl.nextSibling)
    }

    if (header) {
      header.classList.add('header-over-cover')
    }

    const contentOverlay = coverEl.querySelector('.carousel-title-overlay') ??
      coverEl.querySelector('.hero-content-overlay') ??
      coverEl.querySelector('.cover-card-content') ??
      coverEl.querySelector('.about-cover-inner')
    const arrows = coverEl.querySelectorAll<HTMLElement>('.carousel-arrow')
    const counter = coverEl.querySelector<HTMLElement>('.carousel-counter')
    const gradientOverlay = coverEl.querySelector<HTMLElement>('.carousel-overlay')

    let ticking = false

    function update() {
      ticking = false
      const scrollY = window.pageYOffset || document.documentElement.scrollTop
      const progress = Math.min(Math.max(scrollY / scrollDistance, 0), 1)

      const height = vh - (vh - minHeight) * progress
      coverEl!.style.height = height + 'px'

      const imgs = coverEl!.getElementsByTagName('img')
      for (let i = 0; i < imgs.length; i++) {
        imgs[i].style.objectPosition = `50% ${progress * 40}%`
      }

      if (contentOverlay) {
        const fade = Math.max(1 - progress * 2.5, 0)
        ;(contentOverlay as HTMLElement).style.opacity = String(fade)
        ;(contentOverlay as HTMLElement).style.transform = `translateY(${-progress * 50}px)`
        ;(contentOverlay as HTMLElement).style.visibility = fade < 0.1 ? 'hidden' : ''
        ;(contentOverlay as HTMLElement).style.pointerEvents = fade < 0.1 ? 'none' : ''
      }

      arrows.forEach(arrow => {
        arrow.style.visibility = progress > 0.5 ? 'hidden' : ''
      })
      if (counter) {
        counter.style.visibility = progress > 0.5 ? 'hidden' : ''
      }

      if (gradientOverlay) {
        gradientOverlay.style.opacity = String(Math.max(1 - progress * 1.5, 0.2))
      }

      if (header) {
        if (progress > 0.3) {
          header.classList.remove('header-over-cover')
        } else {
          header.classList.add('header-over-cover')
        }
      }
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update)
        ticking = true
      }
    }

    function onResize() {
      vh = window.innerHeight
      scrollDistance = vh * 0.9
      minHeight = getHeaderHeight()
      if (spacer) spacer.style.height = vh + 'px'
      update()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    update()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      if (header) {
        header.classList.remove('header-over-cover')
      }
      coverEl.style.position = ''
      coverEl.style.top = ''
      coverEl.style.left = ''
      coverEl.style.width = ''
      coverEl.style.zIndex = ''
      coverEl.style.overflow = ''
      coverEl.style.height = ''
      if (spacer?.parentNode) {
        spacer.parentNode.removeChild(spacer)
      }
      spacerRef.current = null
    }
  }, [enabled])

  return setupRef
}
