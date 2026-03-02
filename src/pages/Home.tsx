import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Carousel from '../components/Carousel'
import ProjectCard from '../components/ProjectCard'
import BlogCard from '../components/BlogCard'
import PageTransition from '../components/PageTransition'
import { useCoverHeader } from '../hooks/useCoverHeader'
import type { WPPost } from '../api/wordpress'
import { getFeaturedProjects, getBlogs } from '../api/wordpress'

const HERO_IMAGES = [
  '/wp-content/uploads/2026/02/1-ScaledDown-1-691x1024.png',
  '/image/DSCF1542.JPEG',
  '/image/DSCF1895.JPEG',
  '/image/DSCF2032.JPEG',
  '/image/DSCF2099.JPEG',
  '/image/DSCF2100.JPEG',
  '/image/DSCF2403.JPEG',
  '/image/DSCF3048.JPEG',
  '/image/DSCF3066.JPEG',
]

export default function Home() {
  const [projects, setProjects] = useState<WPPost[]>([])
  const [blogs, setBlogs] = useState<WPPost[]>([])
  const coverRef = useCoverHeader()

  useEffect(() => {
    getFeaturedProjects().then(setProjects).catch(() => {})
    getBlogs().then(setBlogs).catch(() => {})
  }, [])

  const heroOverlay = (
    <div className="hero-content-overlay">
      <h1>XR Researcher | Interactive Systems Designer | Narrative Specialist</h1>
      <p className="hero-subtitle">Master's of Entertainment Technology, Carnegie Mellon University</p>
      <p className="hero-description">I design and validate interaction systems using behavioral and psychological measures.</p>
      <div className="hero-buttons">
        <Link to="/projects" className="btn btn-primary">PORTFOLIO</Link>
        <a href="#" className="btn btn-outline">DEMO REEL</a>
      </div>
    </div>
  )

  return (
    <PageTransition>
      <section className="hero-carousel-section" ref={coverRef}>
        <Carousel images={HERO_IMAGES} id="hero-carousel" overlay={heroOverlay} />
      </section>

      <section className="research-tagline">
        <h2>RESEARCH-DRIVEN SYSTEMS DESIGN</h2>
        <p>Translating behavioral research into actionable product insights across games, XR and digital platforms.</p>
      </section>

      <section className="past-projects" id="projects">
        <h2 className="section-heading">PAST PROJECTS</h2>
        <div className="projects-grid">
          {projects.length === 0 ? (
            <p className="loading-text">Loading projects...</p>
          ) : (
            projects.map(p => <ProjectCard key={p.id} project={p} />)
          )}
        </div>
      </section>

      <section className="case-studies" id="case-studies">
        <h2 className="section-heading">CASE STUDIES</h2>
        <div className="case-studies-grid">
          {blogs.length === 0 ? (
            <p className="loading-text">Loading...</p>
          ) : (
            blogs.map(b => <BlogCard key={b.id} blog={b} />)
          )}
        </div>
      </section>

      <section className="contact-cta" id="contact">
        <p className="contact-eyebrow">Development &amp; Partnerships</p>
        <h2>GET IN TOUCH</h2>
        <p className="contact-tagline">Let's turn insight into impact.</p>
        <a href="mailto:hello@example.com" className="btn btn-primary">CONTACT</a>
      </section>
    </PageTransition>
  )
}
