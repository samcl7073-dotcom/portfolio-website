import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import type { WPPost } from '../api/wordpress'
import { getProjects, getBlogs, getFeaturedImage } from '../api/wordpress'

function distributeToColumns<T>(items: T[], cols: number): T[][] {
  const columns: T[][] = Array.from({ length: cols }, () => [])
  items.forEach((item, i) => columns[i % cols].push(item))
  return columns
}

interface PortfolioItem {
  slug: string
  title: string
  image: string
  type: 'project' | 'blog'
}

export default function Portfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const columnsRef = useRef<HTMLDivElement>(null)
  const reverseRefs = useRef<HTMLDivElement[]>([])

  const setReverseRef = useCallback((i: number) => (el: HTMLDivElement | null) => {
    if (el) reverseRefs.current[i] = el
  }, [])

  useEffect(() => {
    Promise.all([
      getProjects().catch(() => [] as WPPost[]),
      getBlogs().catch(() => [] as WPPost[]),
    ]).then(([projects, blogs]) => {
      const all: PortfolioItem[] = [
        ...projects.map(p => ({
          slug: p.slug,
          title: p.title.rendered,
          image: getFeaturedImage(p, 'large'),
          type: 'project' as const,
        })),
        ...blogs.map(b => ({
          slug: b.slug,
          title: b.title.rendered,
          image: getFeaturedImage(b, 'large'),
          type: 'blog' as const,
        })),
      ]
      setItems(all)
    })
  }, [])

  useEffect(() => {
    const wrapper = columnsRef.current
    if (!wrapper || items.length === 0) return

    const reverseCols = reverseRefs.current.filter(Boolean)
    if (!reverseCols.length) return

    let ticking = false

    function update() {
      ticking = false
      const wrapperRect = wrapper!.getBoundingClientRect()
      const wrapperTop = window.scrollY + wrapperRect.top
      const totalScroll = wrapper!.scrollHeight - window.innerHeight
      if (totalScroll <= 0) return
      const scrollY = window.scrollY - wrapperTop
      const progress = Math.min(Math.max(scrollY / totalScroll, 0), 1)

      reverseCols.forEach(col => {
        const colH = col.scrollHeight
        const vpH = window.innerHeight
        const maxShift = colH - vpH
        if (maxShift <= 0) return
        const from = -maxShift
        const to = maxShift
        const offset = from + progress * (to - from)
        col.style.transform = `translateY(${Math.max(from, Math.min(to, offset))}px)`
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
  }, [items])

  const columns = distributeToColumns(items, 3)

  return (
    <PageTransition>
      <div className="portfolio-page">
        {items.length === 0 ? (
          <p className="loading-text" style={{ textAlign: 'center', padding: '40vh 0' }}>Loading...</p>
        ) : (
          <div className="rs-columns" ref={columnsRef}>
            {columns.map((col, colIdx) => {
              const isReverse = colIdx === 0 || colIdx === 2
              return (
                <div
                  key={colIdx}
                  className={`rs-column${isReverse ? ' rs-column-reverse' : ''}`}
                  ref={isReverse ? setReverseRef(colIdx === 0 ? 0 : 1) : undefined}
                >
                  {col.map(item => (
                    <Link
                      key={item.slug}
                      to={`/${item.type}/${item.slug}`}
                      className="rs-item"
                    >
                      <div className="rs-item-imgwrap">
                        <img src={item.image} alt={item.title} loading="lazy" />
                      </div>
                      <figcaption
                        className="rs-item-caption"
                        dangerouslySetInnerHTML={{ __html: item.title }}
                      />
                    </Link>
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
