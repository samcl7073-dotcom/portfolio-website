import { Link } from 'react-router-dom'
import type { WPPost } from '../api/wordpress'
import { getFeaturedImage, getCategoryNames, stripHtml } from '../api/wordpress'

interface BlogCardProps {
  blog: WPPost
}

export default function BlogCard({ blog }: BlogCardProps) {
  const img = getFeaturedImage(blog)
  const categories = getCategoryNames(blog)
  const title = blog.title.rendered
  const excerpt = stripHtml(blog.excerpt.rendered)
  const label = categories.length ? categories[0] : ''

  return (
    <Link to={`/blog/${blog.slug}`} className="case-card">
      <div className="case-card-image">
        <img src={img} alt={title} loading="lazy" />
      </div>
      <div className="case-card-body">
        {label && <span className="case-eyebrow">{label.toUpperCase()}</span>}
        <h3 dangerouslySetInnerHTML={{ __html: title }} />
        <p>{excerpt}</p>
        <span className="read-more">Read more</span>
      </div>
    </Link>
  )
}
