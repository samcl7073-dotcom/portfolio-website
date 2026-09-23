const FEATURED_CAT = 8

export interface WPMedia {
  source_url: string
  media_details: {
    sizes: Record<string, { source_url: string }>
  }
}

export interface WPTerm {
  name: string
  slug: string
}

export interface WPPost {
  id: number
  slug: string
  date: string
  title: { rendered: string }
  content: { rendered: string }
  excerpt: { rendered: string }
  _embedded?: {
    'wp:featuredmedia'?: WPMedia[]
    'wp:term'?: WPTerm[][]
  }
}

export interface WPPage {
  id: number
  title: { rendered: string }
  content: { rendered: string }
}

export interface WPMediaItem {
  id: number
  source_url: string
  mime_type: string
}

// Content used to come from the WordPress REST API. WordPress was retired
// (Sep 2026) and the content now ships as static JSON in /public/content,
// exported from the WordPress database in the same shape the REST API returned.
const cache = new Map<string, Promise<unknown>>()

function loadJson<T>(name: string): Promise<T> {
  if (!cache.has(name)) {
    const p = fetch(`/content/${name}.json`).then(res => {
      if (!res.ok) throw new Error(`Content load error: ${res.status}`)
      return res.json()
    })
    p.catch(() => cache.delete(name))
    cache.set(name, p)
  }
  return cache.get(name) as Promise<T>
}

type StaticPost = WPPost & { categories?: number[] }

export async function getFrontpageContent(): Promise<string> {
  // The old custom WordPress endpoint is gone; Home falls back to its built-in title.
  return ''
}

export function extractH1(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.querySelector('h1')?.textContent?.trim() ?? ''
}

export async function getProjects(_params = ''): Promise<WPPost[]> {
  return loadJson<StaticPost[]>('projects')
}

export async function getFeaturedProjects(): Promise<WPPost[]> {
  const all = await loadJson<StaticPost[]>('projects')
  return all.filter(p => p.categories?.includes(FEATURED_CAT)).slice(0, 10)
}

export async function getProjectBySlug(slug: string): Promise<WPPost[]> {
  const all = await loadJson<StaticPost[]>('projects')
  return all.filter(p => p.slug === slug)
}

export async function getBlogs(_params = ''): Promise<WPPost[]> {
  return loadJson<StaticPost[]>('blogs')
}

export async function getBlogBySlug(slug: string): Promise<WPPost[]> {
  const all = await loadJson<StaticPost[]>('blogs')
  return all.filter(p => p.slug === slug)
}

export async function getPage(id: number): Promise<WPPage> {
  const pages = await loadJson<Record<string, WPPage>>('pages')
  const page = pages[String(id)]
  if (!page) throw new Error(`Page ${id} not found`)
  return page
}

export async function getCategories(): Promise<WPTerm[]> {
  return loadJson<WPTerm[]>('categories')
}

export async function getMediaForPost(postId: number): Promise<WPMediaItem[]> {
  const media = await loadJson<Record<string, WPMediaItem[]>>('media')
  return media[String(postId)] ?? []
}

export function getFeaturedImage(post: WPPost, size: 'large' | 'full' = 'large'): string {
  try {
    const media = post._embedded?.['wp:featuredmedia']?.[0]
    if (!media) return '/image/DSCF1542.JPEG'
    return media.media_details.sizes[size]?.source_url || media.source_url
  } catch {
    return '/image/DSCF1542.JPEG'
  }
}

export function getCategoryNames(post: WPPost): string[] {
  try {
    return post._embedded?.['wp:term']?.[0]?.map(t => t.name) ?? []
  } catch {
    return []
  }
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function stripHtml(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent?.trim() ?? ''
}
