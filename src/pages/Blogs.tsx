import { useEffect, useState } from 'react'
import BlogCard from '../components/BlogCard'
import CoverCard from '../components/CoverCard'
import PageTransition from '../components/PageTransition'
import type { WPPost } from '../api/wordpress'
import { getBlogs } from '../api/wordpress'

export default function Blogs() {
  const [blogs, setBlogs] = useState<WPPost[]>([])

  useEffect(() => {
    getBlogs().then(setBlogs).catch(() => {})
  }, [])

  return (
    <PageTransition>
      <CoverCard gradient="ocean" title="Blogs" subtitle="Case Studies & Insights" />

      <main className="listing-page">
        <div className="case-studies-grid">
          {blogs.length === 0 ? (
            <p className="loading-text">Loading blogs...</p>
          ) : (
            blogs.map(b => <BlogCard key={b.id} blog={b} />)
          )}
        </div>
      </main>
    </PageTransition>
  )
}
