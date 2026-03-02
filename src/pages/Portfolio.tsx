import { useEffect, useState } from 'react'
import CoverCard from '../components/CoverCard'
import PageTransition from '../components/PageTransition'
import { getPage } from '../api/wordpress'

export default function Portfolio() {
  const [html, setHtml] = useState('')

  useEffect(() => {
    getPage(248).then(page => {
      document.title = `${page.title.rendered} – Samantha C. Lai`
      setHtml(page.content.rendered)
    }).catch(() => {
      setHtml('<p>Could not load content.</p>')
    })
    return () => { document.title = 'Samantha C. Lai' }
  }, [])

  return (
    <PageTransition>
      <CoverCard gradient="sunset" title="Portfolio" subtitle="Research-Driven Systems Design" />

      <main className="content-page">
        <article
          className="content-article"
          dangerouslySetInnerHTML={{ __html: html || '<p class="loading-text">Loading...</p>' }}
        />
      </main>
    </PageTransition>
  )
}
