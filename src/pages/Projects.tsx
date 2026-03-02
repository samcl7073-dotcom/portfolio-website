import { useEffect, useState, useRef, useCallback } from 'react'
import ProjectCard from '../components/ProjectCard'
import CoverCard from '../components/CoverCard'
import PageTransition from '../components/PageTransition'
import type { WPPost } from '../api/wordpress'
import { getProjects } from '../api/wordpress'

function distributeToColumns(items: WPPost[], cols: number): WPPost[][] {
  const columns: WPPost[][] = Array.from({ length: cols }, () => [])
  items.forEach((item, i) => columns[i % cols].push(item))
  return columns
}

export default function Projects() {
  const [projects, setProjects] = useState<WPPost[]>([])
  const columnsRef = useRef<HTMLDivElement>(null)
  const reverseRefs = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    getProjects().then(setProjects).catch(() => {})
  }, [])

  const setReverseRef = useCallback((i: number) => (el: HTMLDivElement | null) => {
    if (el) reverseRefs.current[i] = el
  }, [])

  useEffect(() => {
    const wrapper = columnsRef.current
    if (!wrapper || projects.length === 0) return

    const reverseCols = reverseRefs.current.filter(Boolean)
    if (!reverseCols.length) return

    let ticking = false

    function update() {
      ticking = false
      const wrapperRect = wrapper!.getBoundingClientRect()
      const wrapperTop = window.scrollY + wrapperRect.top
      const scrollableHeight = wrapper!.scrollHeight - window.innerHeight
      const scrollY = window.scrollY - wrapperTop
      const progress = Math.min(Math.max(scrollY / scrollableHeight, 0), 1)

      reverseCols.forEach(col => {
        const colHeight = col.scrollHeight
        const viewportH = window.innerHeight
        const maxShift = colHeight - viewportH
        if (maxShift <= 0) return
        const offset = -maxShift + progress * maxShift * 2
        const clamped = Math.max(-maxShift, Math.min(maxShift, offset))
        col.style.transform = `translateY(${clamped}px)`
      })
    }

    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    update()

    return () => window.removeEventListener('scroll', onScroll)
  }, [projects])

  const columns = distributeToColumns(projects, 3)

  return (
    <PageTransition>
      <CoverCard gradient="sunset" title="Projects" subtitle="Research-Driven Systems Design" />

      <main className="listing-page reverse-scroll-listing">
        {projects.length === 0 ? (
          <p className="loading-text">Loading projects...</p>
        ) : (
          <div className="reverse-columns" ref={columnsRef}>
            {columns.map((col, colIndex) => {
              const isReverse = colIndex === 0 || colIndex === 2
              return (
                <div
                  key={colIndex}
                  className={`reverse-column${isReverse ? ' column-reverse' : ''}`}
                  ref={isReverse ? setReverseRef(colIndex === 0 ? 0 : 1) : undefined}
                >
                  {col.map(p => <ProjectCard key={p.id} project={p} />)}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </PageTransition>
  )
}
