import { useEffect, useState } from 'react'
import CoverCard from '../components/CoverCard'
import PageTransition from '../components/PageTransition'
import { getPage } from '../api/wordpress'

export default function Contact() {
  const [html, setHtml] = useState('')

  useEffect(() => {
    getPage(207).then(page => {
      setHtml(page.content.rendered)
    }).catch(() => {
      setHtml('<p>Could not load content.</p>')
    })
  }, [])

  return (
    <PageTransition>
      <CoverCard gradient="dawn" title="Contact" subtitle="Let's turn insight into impact" />

      <main className="content-page">
        <article
          className="content-article"
          dangerouslySetInnerHTML={{ __html: html || '<p class="loading-text">Loading...</p>' }}
        />
      </main>
    </PageTransition>
  )
}
