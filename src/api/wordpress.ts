const WP_BASE = '/wp-json/wp/v2'
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

async function wpFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${WP_BASE}/${endpoint}`)
  if (!res.ok) throw new Error(`WP API error: ${res.status}`)
  return res.json()
}

export function getProjects(params = '') {
  return wpFetch<WPPost[]>(`project?_embed&per_page=20${params ? '&' + params : ''}`)
}

export function getFeaturedProjects() {
  return wpFetch<WPPost[]>(`project?_embed&categories=${FEATURED_CAT}&per_page=10`)
}

export function getProjectBySlug(slug: string) {
  return wpFetch<WPPost[]>(`project?_embed&slug=${encodeURIComponent(slug)}`)
}

export function getBlogs(params = '') {
  return wpFetch<WPPost[]>(`blog?_embed&per_page=20${params ? '&' + params : ''}`)
}

export function getBlogBySlug(slug: string) {
  return wpFetch<WPPost[]>(`blog?_embed&slug=${encodeURIComponent(slug)}`)
}

export function getPage(id: number) {
  return wpFetch<WPPage>(`pages/${id}`)
}

export function getCategories() {
  return wpFetch<WPTerm[]>('categories?per_page=50')
}

export function getMediaForPost(postId: number) {
  return wpFetch<WPMediaItem[]>(`media?parent=${postId}&per_page=50`)
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
