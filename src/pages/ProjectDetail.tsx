import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Carousel from '../components/Carousel'
import ProjectCard from '../components/ProjectCard'
import PageTransition from '../components/PageTransition'
import { useCoverHeader } from '../hooks/useCoverHeader'
import type { WPPost } from '../api/wordpress'
import {
  getProjectBySlug, getProjects, getMediaForPost,
  getFeaturedImage, getCategoryNames, formatDate, stripHtml,
} from '../api/wordpress'

const CAROUSEL_SLUGS = ['buffering-please-wait-2023', 'television-writing-narrative-systems-design', 'more-tv']

const CAROUSEL_IMAGE_POSITION: Record<string, string> = {
  'more-tv': 'center 65%',
}

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [project, setProject] = useState<WPPost | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [bodyHtml, setBodyHtml] = useState('')
  const [related, setRelated] = useState<WPPost[]>([])
  const [heroMode, setHeroMode] = useState<'carousel' | 'static' | 'none'>('none')
  const [staticImg, setStaticImg] = useState('')
  const [error, setError] = useState('')

  const useCarousel = slug ? CAROUSEL_SLUGS.includes(slug) : false
  const coverRef = useCoverHeader(heroMode !== 'none')

  useEffect(() => {
    if (!slug) return
    window.scrollTo(0, 0)

    getProjectBySlug(slug).then(results => {
      if (!results.length) { setError('Project not found.'); return }
      const proj = results[0]
      setProject(proj)
      document.title = `${proj.title.rendered} – Samantha C. Lai`

      const categories = getCategoryNames(proj)
      const isCarousel = CAROUSEL_SLUGS.includes(slug)

      let content = proj.content.rendered.trim()
      if (content) {
        const temp = document.createElement('div')
        temp.innerHTML = content
        if (isCarousel) {
          temp.querySelectorAll('figure').forEach(fig => fig.remove())
        }
        const children = temp.children
        for (let i = children.length - 1; i >= 0; i--) {
          const text = children[i].textContent?.trim().toLowerCase() ?? ''
          if (text === 'related work' || text === 'other film and tv projects' || text === '') {
            children[i].remove()
          } else break
        }
        content = temp.innerHTML.trim()
      }

      let html = ''
      if (content) {
        html += `<div class="project-body">${content}</div>`
      }
      if (categories.length) {
        html += `<div class="category-tags">${categories.map(c => `<a href="#">${c}</a>`).join('')}</div>`
      }
      setBodyHtml(html || `<p>${stripHtml(proj.excerpt.rendered)}</p>`)

      if (isCarousel) {
        getMediaForPost(proj.id).then(media => {
          const imgs = media
            .filter(m => m.mime_type?.startsWith('image'))
            .map(m => m.source_url)
          const featuredImg = getFeaturedImage(proj, 'full')
          if (featuredImg && imgs.includes(featuredImg)) {
            imgs.splice(imgs.indexOf(featuredImg), 1)
            imgs.unshift(featuredImg)
          } else if (featuredImg && featuredImg !== '/image/DSCF1542.JPEG') {
            imgs.unshift(featuredImg)
          }
          if (imgs.length) {
            setImages(imgs)
            setHeroMode('carousel')
          } else {
            setStaticImg(getFeaturedImage(proj, 'full'))
            setHeroMode('static')
          }
        }).catch(() => {
          setStaticImg(getFeaturedImage(proj, 'full'))
          setHeroMode('static')
        })
      } else {
        setStaticImg(getFeaturedImage(proj, 'full'))
        setHeroMode('static')
      }
    }).catch(() => setError('Could not load project.'))

    getProjects().then(projects => {
      setRelated(projects.filter(p => p.slug !== slug))
    }).catch(() => {})

    return () => { document.title = 'Samantha C. Lai' }
  }, [slug])

  if (error) {
    return <PageTransition><main className="project-page"><p>{error}</p></main></PageTransition>
  }

  const date = project ? formatDate(project.date) : ''
  const title = project?.title.rendered ?? ''

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
          <Carousel
            images={images}
            id="project-carousel"
            overlay={titleOverlay}
            imagePosition={slug ? CAROUSEL_IMAGE_POSITION[slug] : undefined}
          />
        </section>
      )}

      {heroMode === 'static' && (
        <section className="project-hero-banner" ref={coverRef}>
          <img src={staticImg} alt={title} />
          <div className="carousel-overlay" />
          {titleOverlay}
        </section>
      )}

      <main className="project-page">
        <article
          className="project-article"
          dangerouslySetInnerHTML={{ __html: bodyHtml || '<p class="loading-text">Loading project...</p>' }}
        />
      </main>

      {related.length > 0 && (
        <section className="past-projects">
          <h2 className="section-heading">RELATED WORK</h2>
          <div className="projects-grid">
            {related.map(p => <ProjectCard key={p.id} project={p} />)}
          </div>
        </section>
      )}
    </PageTransition>
  )
}
