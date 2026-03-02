import { useEffect, useState, useRef } from 'react'
import PageTransition from '../components/PageTransition'
import { useCoverHeader } from '../hooks/useCoverHeader'
import { getPage } from '../api/wordpress'

export default function About() {
  const [imgSrc, setImgSrc] = useState('')
  const [introTexts, setIntroTexts] = useState<string[]>([])
  const [bodyHtml, setBodyHtml] = useState('')
  const [loaded, setLoaded] = useState(false)
  const coverRef = useCoverHeader(loaded)
  const photoRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getPage(2).then(page => {
      const temp = document.createElement('div')
      temp.innerHTML = page.content.rendered

      const figure = temp.querySelector('figure, .wp-block-image')
      let src = ''
      if (figure) {
        const img = figure.querySelector('img')
        if (img) src = img.getAttribute('src') ?? ''
        figure.remove()
      }

      const paragraphs = temp.querySelectorAll('p')
      const texts: string[] = []
      const els: Element[] = []
      for (let i = 0; i < paragraphs.length && texts.length < 2; i++) {
        const txt = paragraphs[i].textContent?.trim() ?? ''
        if (txt.length > 20) {
          texts.push(paragraphs[i].innerHTML)
          els.push(paragraphs[i])
        }
      }
      els.forEach(p => p.remove())

      setImgSrc(src)
      setIntroTexts(texts)
      setBodyHtml(temp.innerHTML)
      setLoaded(true)
    }).catch(() => {
      setBodyHtml('<p>Could not load content.</p>')
      setLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (!loaded) return
    const timer = setTimeout(() => {
      photoRef.current?.classList.add('visible')
      const coverText = textRef.current
      if (!coverText) return

      const h1 = coverText.querySelector('h1')
      const subtitle = coverText.querySelector('.cover-subtitle')
      const bios = coverText.querySelectorAll('.cover-bio')

      if (h1) setTimeout(() => h1.classList.add('text-visible'), 200)
      if (subtitle) setTimeout(() => subtitle.classList.add('text-visible'), 400)
      bios.forEach((p, i) => {
        setTimeout(() => p.classList.add('text-visible'), 600 + i * 200)
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [loaded])

  return (
    <PageTransition>
      <div className="about-cover" ref={coverRef} id="about-cover">
        <div className="about-cover-inner">
          <div className="about-cover-photo" ref={photoRef} id="cover-photo">
            {imgSrc && <img src={imgSrc} alt="Samantha C. Lai" />}
          </div>
          <div className="about-cover-text" ref={textRef} id="cover-text">
            <h1>About Me</h1>
            <p className="cover-subtitle">XR Researcher &amp; Interactive Systems Designer</p>
            {introTexts.map((t, i) => (
              <p key={i} className="cover-bio" dangerouslySetInnerHTML={{ __html: t }} />
            ))}
          </div>
        </div>
      </div>

      <main className="content-page">
        <article
          className="content-article"
          dangerouslySetInnerHTML={{ __html: bodyHtml || '<p class="loading-text">Loading...</p>' }}
        />
      </main>
    </PageTransition>
  )
}
