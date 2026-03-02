import { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import type { WPPost } from '../api/wordpress'
import { getProjects, getBlogs, getFeaturedImage } from '../api/wordpress'

interface PortfolioItem {
  slug: string
  title: string
  image: string
  type: 'project' | 'blog'
}

export default function Portfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const wrapperRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

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

  const updateCovers = useCallback(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const lis = wrapper.querySelectorAll<HTMLLIElement>('.cf-item')
    const scrollLeft = wrapper.scrollLeft
    const wrapperW = wrapper.offsetWidth
    const center = scrollLeft + wrapperW / 2

    lis.forEach(li => {
      const img = li.querySelector<HTMLImageElement>('img')
      if (!img) return
      const liCenter = li.offsetLeft + li.offsetWidth / 2
      const dist = (liCenter - center) / li.offsetWidth
      const clamped = Math.max(-2.5, Math.min(2.5, dist))
      const absDist = Math.abs(clamped)

      let tx: number, ry: number, tz: number, sc: number
      if (absDist < 0.5) {
        const t = absDist / 0.5
        ry = 0 + clamped * 45 * t
        tx = 0
        tz = (1 - t) * 60
        sc = 1.5 - t * 0.5
      } else {
        const sign = clamped > 0 ? 1 : -1
        ry = sign * 45
        const moveT = Math.min((absDist - 0.5) / 1.5, 1)
        tx = sign * moveT * 100
        tz = 0
        sc = 1
      }

      img.style.transform =
        `translateX(${tx}%) rotateY(${ry}deg) translateZ(${tz}px) scale(${sc})`
      li.style.zIndex = String(Math.round(100 - absDist * 40))
    })
  }, [])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper || items.length === 0) return

    let rafId: number
    function onScroll() {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(updateCovers)
    }

    wrapper.addEventListener('scroll', onScroll, { passive: true })
    updateCovers()

    const center = wrapper.scrollWidth / 2 - wrapper.offsetWidth / 2
    wrapper.scrollLeft = center

    return () => {
      wrapper.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [items, updateCovers])

  return (
    <PageTransition>
      <div className="cf-page">
        {items.length === 0 ? (
          <p className="loading-text" style={{ textAlign: 'center', padding: '40vh 0', color: '#999' }}>Loading...</p>
        ) : (
          <div className="cf-wrapper" ref={wrapperRef}>
            <ul className="cf-list" ref={listRef}>
              {items.map((item, i) => (
                <li key={item.slug} className="cf-item">
                  <Link to={`/${item.type}/${item.slug}`}>
                    <img src={item.image} alt={item.title} draggable={false} />
                    <span
                      className="cf-caption"
                      dangerouslySetInnerHTML={{ __html: item.title }}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
