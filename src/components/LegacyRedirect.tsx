import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function LegacyRedirect() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const slug = params.get('slug')

    if (slug) {
      if (location.pathname.startsWith('/project')) {
        navigate(`/project/${slug}`, { replace: true })
      } else if (location.pathname.startsWith('/blog')) {
        navigate(`/blog/${slug}`, { replace: true })
      }
    }

    const htmlMap: Record<string, string> = {
      '/index.html': '/',
      '/projects.html': '/projects',
      '/blogs.html': '/blogs',
      '/about.html': '/about',
      '/contact.html': '/contact',
    }
    if (htmlMap[location.pathname]) {
      navigate(htmlMap[location.pathname], { replace: true })
    }
  }, [location, navigate])

  return null
}
