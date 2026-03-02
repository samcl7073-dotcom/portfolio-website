import { Link } from 'react-router-dom'
import type { WPPost } from '../api/wordpress'
import { getFeaturedImage, formatDate, stripHtml } from '../api/wordpress'

interface ProjectCardProps {
  project: WPPost
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const img = getFeaturedImage(project)
  const date = formatDate(project.date)
  const title = project.title.rendered
  const excerpt = stripHtml(project.excerpt.rendered)

  return (
    <Link to={`/project/${project.slug}`} className="project-card">
      <div className="card-image">
        <img src={img} alt={title} loading="lazy" />
      </div>
      <div className="card-body">
        <time>{date}</time>
        <h3 dangerouslySetInnerHTML={{ __html: title }} />
        <p>{excerpt}</p>
        <span className="read-more">Read more</span>
      </div>
    </Link>
  )
}
