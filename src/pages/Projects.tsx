import { useEffect, useState } from 'react'
import ProjectCard from '../components/ProjectCard'
import CoverCard from '../components/CoverCard'
import PageTransition from '../components/PageTransition'
import type { WPPost } from '../api/wordpress'
import { getProjects } from '../api/wordpress'

export default function Projects() {
  const [projects, setProjects] = useState<WPPost[]>([])

  useEffect(() => {
    getProjects().then(setProjects).catch(() => {})
  }, [])

  return (
    <PageTransition>
      <CoverCard gradient="sunset" title="Projects" subtitle="Research-Driven Systems Design" />

      <main className="listing-page">
        <div className="projects-grid">
          {projects.length === 0 ? (
            <p className="loading-text">Loading projects...</p>
          ) : (
            projects.map(p => <ProjectCard key={p.id} project={p} />)
          )}
        </div>
      </main>
    </PageTransition>
  )
}
