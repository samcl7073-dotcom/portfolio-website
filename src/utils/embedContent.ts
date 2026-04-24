function getYouTubeEmbedUrl(url: string): string | null {
  let id: string | null = null
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com') && u.pathname === '/watch') {
      id = u.searchParams.get('v')
    } else if (u.hostname === 'youtu.be') {
      id = u.pathname.slice(1)
    } else if (u.hostname.includes('youtube.com') && u.pathname.startsWith('/embed/')) {
      return url
    }
  } catch { return null }
  return id ? `https://www.youtube.com/embed/${id}` : null
}

function normalizeVimeoPlayerSrc(src: string): string {
  try {
    const u = new URL(src)
    if (!u.hostname.includes('vimeo.com')) return src
    if (!u.searchParams.has('playsinline')) u.searchParams.set('playsinline', '1')
    return u.toString()
  } catch {
    return src
  }
}

/** Vimeo oEmbed from WordPress often has no iframe in API HTML — only a URL in the wrapper. */
function getVimeoEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '')
    if (host === 'player.vimeo.com') {
      const m = u.pathname.match(/^\/video\/(\d+)/i)
      if (!m) return null
      const out = new URL(`https://player.vimeo.com/video/${m[1]}`)
      u.searchParams.forEach((v, k) => out.searchParams.set(k, v))
      return normalizeVimeoPlayerSrc(out.toString())
    }
    if (!host.includes('vimeo.com')) return null
    const parts = u.pathname.split('/').filter(Boolean)
    for (let i = parts.length - 1; i >= 0; i--) {
      if (/^\d+$/.test(parts[i])) {
        const out = new URL(`https://player.vimeo.com/video/${parts[i]}`)
        u.searchParams.forEach((v, k) => out.searchParams.set(k, v))
        return normalizeVimeoPlayerSrc(out.toString())
      }
    }
  } catch { return null }
  return null
}

const VIDEO_IFRAME_ALLOW =
  'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen'

function prepareVideoIframe(iframe: HTMLIFrameElement, provider: 'vimeo' | 'youtube' | 'video') {
  let src = iframe.getAttribute('src')?.trim() || ''
  if (provider === 'vimeo' && src) {
    src = normalizeVimeoPlayerSrc(src)
    iframe.setAttribute('src', src)
  }
  iframe.classList.add('embed-video-iframe')
  iframe.setAttribute('loading', 'eager')
  iframe.setAttribute('allow', VIDEO_IFRAME_ALLOW)
  iframe.setAttribute('allowfullscreen', '')
  iframe.removeAttribute('width')
  iframe.removeAttribute('height')
}

function isBareLink(anchor: HTMLAnchorElement): boolean {
  const href = anchor.getAttribute('href') || ''
  const text = anchor.textContent?.trim() || ''
  if (!href.startsWith('http')) return false
  return text === href || text === decodeURIComponent(href)
}

function getDomain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '') }
  catch { return url }
}

export function embedDocumentsAndVideos(container: HTMLElement) {
  // 1) WordPress file blocks
  container.querySelectorAll('.wp-block-file').forEach(block => {
    const link = block.querySelector('a[href]') as HTMLAnchorElement | null
    if (!link) return
    const url = link.getAttribute('href') || ''
    const label = link.textContent || 'Document'

    let embedHtml = ''
    if (/\.pdf$/i.test(url)) {
      embedHtml = `<div class="pdf-carousel" data-pdf-url="${url}">
        <div class="pdf-carousel-frame">
          <div class="pdf-carousel-track"></div>
          <button class="pdf-carousel-arrow pdf-carousel-prev" aria-label="Previous page">\u2039</button>
          <button class="pdf-carousel-arrow pdf-carousel-next" aria-label="Next page">\u203A</button>
        </div>
        <div class="pdf-carousel-bar">
          <span class="pdf-carousel-counter"></span>
          <a href="${url}" class="pdf-carousel-dl" title="${label}" download>Download \u2193</a>
        </div>
      </div>`
    } else if (/\.(docx?|pptx?)$/i.test(url)) {
      const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`
      embedHtml = `<div class="embed-doc-viewer">
        <p class="embed-doc-label">${label}</p>
        <iframe src="${viewerUrl}" class="embed-doc-iframe" frameborder="0"></iframe>
        <a href="${url}" class="embed-doc-download" download>Download</a>
      </div>`
    } else if (/\.html?$/i.test(url)) {
      embedHtml = `<div class="embed-doc-viewer">
        <p class="embed-doc-label">${label}</p>
        <iframe src="${url}" class="embed-doc-iframe embed-doc-iframe-tall" frameborder="0"></iframe>
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="embed-doc-download">Open in new tab</a>
      </div>`
    }

    if (embedHtml) {
      const wrapper = document.createElement('div')
      wrapper.innerHTML = embedHtml
      block.replaceWith(wrapper.firstElementChild!)
    }
  })

  // 2) WordPress video embed blocks (YouTube, Vimeo — often URL-only in REST HTML, no iframe)
  const videoEmbedSelector =
    '.wp-block-embed-youtube, .wp-block-embed-vimeo, .wp-block-embed.is-provider-youtube, .wp-block-embed.is-provider-vimeo, .wp-block-embed.is-type-video'
  container.querySelectorAll(videoEmbedSelector).forEach(block => {
    const iframeEl = block.querySelector('iframe')
    let src = iframeEl?.getAttribute('src')?.trim() || ''

    if (iframeEl && src) {
      const provider =
        (src.includes('player.vimeo.com') || src.includes('vimeo.com/video')) ? 'vimeo'
          : (src.includes('youtube.com') || src.includes('youtu.be') ? 'youtube' : 'video')
      prepareVideoIframe(iframeEl as HTMLIFrameElement, provider)

      const wrapper = document.createElement('div')
      wrapper.className = 'embed-video-viewer'
      wrapper.appendChild(iframeEl.cloneNode(true))
      block.replaceWith(wrapper)
      return
    }

    if (!src) {
      const wrap = block.querySelector('.wp-block-embed__wrapper')
      const link = block.querySelector('a[href^="http"]') as HTMLAnchorElement | null
      const raw =
        link?.getAttribute('href') ||
        wrap?.textContent?.trim() ||
        block.textContent?.trim() ||
        ''
      const url = raw.split('\n')[0].trim()
      if (!url.startsWith('http')) return
      const vimeo = getVimeoEmbedUrl(url)
      const yt = getYouTubeEmbedUrl(url)
      src = vimeo || yt || ''
      if (!src) return
    }

    const title = src.includes('vimeo.com') ? 'Vimeo video' : 'YouTube video'
    const embedHtml = `<div class="embed-video-viewer">
      <iframe src="${src}" title="${title.replace(/"/g, '&quot;')}" class="embed-video-iframe" frameborder="0" loading="eager" allow="${VIDEO_IFRAME_ALLOW}" allowfullscreen></iframe>
    </div>`
    const wrapper = document.createElement('div')
    wrapper.innerHTML = embedHtml
    block.replaceWith(wrapper.firstElementChild!)
  })

  // 3) Bare URL links
  container.querySelectorAll('a[href]').forEach(anchor => {
    const a = anchor as HTMLAnchorElement
    if (!isBareLink(a)) return

    const parent = a.parentElement
    if (!parent || parent.tagName !== 'P') return
    const otherContent = parent.textContent?.trim().replace(a.textContent?.trim() || '', '').trim()
    if (otherContent) return

    const url = a.getAttribute('href')!
    const domain = getDomain(url)

    const vimeoEmbed = getVimeoEmbedUrl(url)
    if (vimeoEmbed) {
      const embedHtml = `<div class="embed-video-viewer">
        <iframe src="${vimeoEmbed}" title="Vimeo video" class="embed-video-iframe" frameborder="0" loading="eager" allow="${VIDEO_IFRAME_ALLOW}" allowfullscreen></iframe>
      </div>`
      const wrapper = document.createElement('div')
      wrapper.innerHTML = embedHtml
      parent.replaceWith(wrapper.firstElementChild!)
      return
    }

    const ytEmbed = getYouTubeEmbedUrl(url)
    if (ytEmbed) {
      const embedHtml = `<div class="embed-video-viewer">
        <iframe src="${ytEmbed}" title="YouTube video" class="embed-video-iframe" frameborder="0" loading="eager" allow="${VIDEO_IFRAME_ALLOW}" allowfullscreen></iframe>
      </div>`
      const wrapper = document.createElement('div')
      wrapper.innerHTML = embedHtml
      parent.replaceWith(wrapper.firstElementChild!)
      return
    }

    const embedHtml = `<div class="embed-doc-viewer">
      <p class="embed-doc-label">${domain}</p>
      <iframe src="${url}" class="embed-doc-iframe embed-doc-iframe-tall" frameborder="0" sandbox="allow-scripts allow-same-origin allow-popups"></iframe>
      <a href="${url}" target="_blank" rel="noopener noreferrer" class="embed-doc-download">Open in new tab \u2197</a>
    </div>`
    const wrapper = document.createElement('div')
    wrapper.innerHTML = embedHtml
    parent.replaceWith(wrapper.firstElementChild!)
  })

  // 4) Side-by-side layout for PDF carousels preceded by descriptive text
  container.querySelectorAll<HTMLElement>('.pdf-carousel').forEach(carousel => {
    const pdfUrl = carousel.dataset.pdfUrl || ''
    if (!pdfUrl.includes('BiasBusters')) return

    const textElements: Element[] = []
    let sibling = carousel.previousElementSibling
    while (sibling) {
      const tag = sibling.tagName
      const text = sibling.textContent || ''
      if (tag === 'H2' || tag === 'H3' || tag === 'HR') break
      if (text.includes('Persuasive Design') && tag === 'P' && text.includes('The Skill')) break
      textElements.unshift(sibling)
      sibling = sibling.previousElementSibling
    }

    if (textElements.length === 0) return

    const wrapper = document.createElement('div')
    wrapper.className = 'pdf-text-side-by-side'

    const leftCol = document.createElement('div')
    leftCol.className = 'pdf-side-left'

    const rightCol = document.createElement('div')
    rightCol.className = 'pdf-side-right'

    carousel.before(wrapper)
    leftCol.appendChild(carousel)
    textElements.forEach(el => rightCol.appendChild(el))

    wrapper.appendChild(leftCol)
    wrapper.appendChild(rightCol)
  })
}

export async function initPdfSlideshows(root: HTMLElement) {
  const containers = root.querySelectorAll<HTMLElement>('.pdf-carousel')
  if (containers.length === 0) return

  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).href

  containers.forEach(async (container) => {
    const url = container.dataset.pdfUrl
    if (!url) return

    const track = container.querySelector<HTMLElement>('.pdf-carousel-track')
    const counter = container.querySelector<HTMLElement>('.pdf-carousel-counter')
    const prevBtn = container.querySelector<HTMLButtonElement>('.pdf-carousel-prev')
    const nextBtn = container.querySelector<HTMLButtonElement>('.pdf-carousel-next')
    if (!track || !counter || !prevBtn || !nextBtn) return

    try {
      const pdf = await pdfjsLib.getDocument(url).promise
      const totalPages = pdf.numPages

      const firstPage = await pdf.getPage(1)
      const baseVp = firstPage.getViewport({ scale: 1 })
      const pageRatio = baseVp.width / baseVp.height

      const frame = container.querySelector<HTMLElement>('.pdf-carousel-frame')!
      frame.style.aspectRatio = `${pageRatio.toFixed(4)} / 1`

      const renderScale = Math.max(1.5, 1200 / baseVp.width)

      async function renderPageToBlob(num: number): Promise<string> {
        const page = await pdf.getPage(num)
        const vp = page.getViewport({ scale: renderScale })
        const canvas = document.createElement('canvas')
        canvas.width = vp.width
        canvas.height = vp.height
        await page.render({ canvas, viewport: vp }).promise
        const blob = await new Promise<Blob>((resolve) =>
          canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.92)
        )
        return URL.createObjectURL(blob)
      }

      function createSlide(imgUrl: string, pageNum: number): HTMLElement {
        const slide = document.createElement('div')
        slide.className = 'pdf-carousel-slide'
        const img = document.createElement('img')
        img.src = imgUrl
        img.alt = `Page ${pageNum}`
        img.draggable = false
        slide.appendChild(img)
        return slide
      }

      const firstImgUrl = await renderPageToBlob(1)
      track!.appendChild(createSlide(firstImgUrl, 1))

      let currentPage = 1
      counter.textContent = `1 / ${totalPages}`
      prevBtn.disabled = true
      nextBtn.disabled = totalPages <= 1

      function updateNav() {
        counter!.textContent = `${currentPage} / ${totalPages}`
        prevBtn!.disabled = currentPage <= 1
        nextBtn!.disabled = currentPage >= totalPages
      }

      const AUTO_INTERVAL = 4000
      const PAUSE_AFTER_INTERACT = 8000
      let autoTimer: ReturnType<typeof setInterval> | null = null
      let resumeTimer: ReturnType<typeof setTimeout> | null = null
      let allRendered = false

      function scrollToPage(page: number) {
        track!.scrollTo({ left: (page - 1) * track!.clientWidth, behavior: 'smooth' })
      }

      function autoAdvance() {
        if (!allRendered) return
        if (currentPage >= totalPages) {
          scrollToPage(1)
        } else {
          scrollToPage(currentPage + 1)
        }
      }

      function startAuto() {
        stopAuto()
        autoTimer = setInterval(autoAdvance, AUTO_INTERVAL)
      }

      function stopAuto() {
        if (autoTimer) { clearInterval(autoTimer); autoTimer = null }
      }

      function pauseAndResume() {
        stopAuto()
        if (resumeTimer) clearTimeout(resumeTimer)
        resumeTimer = setTimeout(() => { if (isInView) startAuto() }, PAUSE_AFTER_INTERACT)
      }

      let isInView = false

      const observer = new IntersectionObserver(([entry]) => {
        isInView = entry.isIntersecting
        if (isInView && allRendered) {
          startAuto()
        } else {
          stopAuto()
        }
      }, { threshold: 0.9 })
      observer.observe(container)

      ;(async () => {
        for (let i = 2; i <= totalPages; i++) {
          const imgUrl = await renderPageToBlob(i)
          track!.appendChild(createSlide(imgUrl, i))
        }
        allRendered = true
        if (isInView) startAuto()
      })()

      track.addEventListener('scroll', () => {
        const newPage = Math.round(track!.scrollLeft / track!.clientWidth) + 1
        if (newPage !== currentPage && newPage >= 1 && newPage <= totalPages) {
          currentPage = newPage
          updateNav()
        }
      })

      prevBtn.addEventListener('click', () => {
        pauseAndResume()
        if (currentPage > 1) {
          scrollToPage(currentPage - 1)
        }
      })

      nextBtn.addEventListener('click', () => {
        pauseAndResume()
        if (currentPage < totalPages) {
          scrollToPage(currentPage + 1)
        }
      })

      track.addEventListener('pointerdown', pauseAndResume)
      track.addEventListener('wheel', pauseAndResume, { passive: true })

    } catch (err) {
      console.error('PDF load error:', err)
      const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`
      container.innerHTML = `<div class="embed-doc-viewer">
        <iframe src="${viewerUrl}" class="embed-doc-iframe" frameborder="0"></iframe>
        <a href="${url}" class="embed-doc-download" download>Download</a>
      </div>`
    }
  })
}
