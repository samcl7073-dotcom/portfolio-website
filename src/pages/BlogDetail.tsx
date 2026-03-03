import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Carousel from '../components/Carousel'
import CoverCard from '../components/CoverCard'
import PageTransition from '../components/PageTransition'
import { useCoverHeader } from '../hooks/useCoverHeader'
import type { WPPost } from '../api/wordpress'
import {
  getBlogBySlug, getFeaturedImage, getCategoryNames, formatDate, stripHtml,
} from '../api/wordpress'

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [blog, setBlog] = useState<WPPost | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [bodyHtml, setBodyHtml] = useState('')
  const [heroMode, setHeroMode] = useState<'carousel' | 'cover' | 'none'>('none')
  const [error, setError] = useState('')

  const coverRef = useCoverHeader(heroMode !== 'none')

  useEffect(() => {
    if (!slug) return
    window.scrollTo(0, 0)

    getBlogBySlug(slug).then(results => {
      if (!results.length) { setError('Blog post not found.'); return }
      const post = results[0]
      setBlog(post)
      document.title = `${post.title.rendered} – Samantha C. Lai`

      const categories = getCategoryNames(post)
      const date = formatDate(post.date)

      const temp = document.createElement('div')
      temp.innerHTML = post.content.rendered.trim()

      const imgs: string[] = []
      temp.querySelectorAll('figure img').forEach(img => {
        const src = img.getAttribute('src')
        if (src) imgs.push(src)
      })

      const featuredImg = getFeaturedImage(post, 'full')
      if (featuredImg && featuredImg !== '/image/DSCF1542.JPEG' && !imgs.includes(featuredImg)) {
        imgs.unshift(featuredImg)
      }

      if (imgs.length) {
        temp.querySelectorAll('figure').forEach(fig => fig.remove())
        setImages(imgs)
        setHeroMode('carousel')

        let content = temp.innerHTML.trim()
        let html = ''
        if (content) html += `<div class="project-body">${content}</div>`
        if (categories.length) {
          html += `<div class="category-tags">${categories.map(c => `<a href="#">${c}</a>`).join('')}</div>`
        }
        setBodyHtml(html || `<p>${stripHtml(post.excerpt.rendered)}</p>`)
      } else {
        setHeroMode('cover')

        let html = `<header class="project-header"><h1>${post.title.rendered}</h1>` +
          `<div class="project-meta"><time>${date}</time><span class="meta-dot">•</span></div></header>`

        if (post.content.rendered.trim()) {
          html += `<div class="project-body">${post.content.rendered}</div>`
        } else if (post.excerpt.rendered.trim()) {
          html += `<p class="project-intro">${stripHtml(post.excerpt.rendered)}</p>`
        }
        if (categories.length) {
          html += `<div class="category-tags">${categories.map(c => `<a href="#">${c}</a>`).join('')}</div>`
        }
        setBodyHtml(html)
      }
    }).catch(() => setError('Could not load blog post.'))

    return () => { document.title = 'Samantha C. Lai' }
  }, [slug])

  if (error) {
    return <PageTransition><main className="project-page"><p>{error}</p></main></PageTransition>
  }

  const date = blog ? formatDate(blog.date) : ''
  const title = blog?.title.rendered ?? ''

  const titleOverlay = (
    <div className="carousel-title-overlay">
      <h1 dangerouslySetInnerHTML={{ __html: title }} />
      <div className="project-meta"><time>{date}</time></div>
    </div>
  )

  return (
    <PageTransition>
      {heroMode === 'carousel' && (
        <section className="project-hero-carousel" ref={coverRef}>
          <Carousel images={images} id="blog-carousel" overlay={titleOverlay} />
        </section>
      )}

      {heroMode === 'cover' && (
        <CoverCard gradient="golden" title={title || 'Blog'} />
      )}

      <main className="project-page">
        <article
          className="project-article"
          dangerouslySetInnerHTML={{ __html: bodyHtml || '<p class="loading-text">Loading blog post...</p>' }}
        />
      </main>
    </PageTransition>
  )
}
