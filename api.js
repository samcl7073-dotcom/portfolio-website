const WP_BASE = '/wp-json/wp/v2';

const FEATURED_CAT = 8;

async function wpFetch(endpoint) {
  const res = await fetch(`${WP_BASE}/${endpoint}`);
  if (!res.ok) throw new Error(`WP API error: ${res.status}`);
  return res.json();
}

function getProjects(params = '') {
  return wpFetch(`project?_embed&per_page=20${params ? '&' + params : ''}`);
}

function getFeaturedProjects() {
  return wpFetch(`project?_embed&categories=${FEATURED_CAT}&per_page=10`);
}

function getProjectBySlug(slug) {
  return wpFetch(`project?_embed&slug=${encodeURIComponent(slug)}`);
}

function getBlogs(params = '') {
  return wpFetch(`blog?_embed&per_page=20${params ? '&' + params : ''}`);
}

function getBlogBySlug(slug) {
  return wpFetch(`blog?_embed&slug=${encodeURIComponent(slug)}`);
}

function getPage(id) {
  return wpFetch(`pages/${id}`);
}

function getCategories() {
  return wpFetch('categories?per_page=50');
}

function getMediaForPost(postId) {
  return wpFetch(`media?parent=${postId}&per_page=50`);
}

// Helpers

function getFeaturedImage(post, size = 'large') {
  try {
    const media = post._embedded['wp:featuredmedia'][0];
    const src = media.media_details.sizes[size]?.source_url || media.source_url;
    return src;
  } catch {
    return 'image/DSCF1542.JPEG';
  }
}

function getCategoryNames(post) {
  try {
    return post._embedded['wp:term'][0].map(t => t.name);
  } catch {
    return [];
  }
}

function getCategorySlugs(post) {
  try {
    return post._embedded['wp:term'][0].map(t => t.slug);
  } catch {
    return [];
  }
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent.trim();
}

function getSlugParam() {
  return new URLSearchParams(window.location.search).get('slug');
}

function renderProjectCard(project, basePath = '') {
  const img = getFeaturedImage(project);
  const date = formatDate(project.date);
  const title = project.title.rendered;
  const excerpt = stripHtml(project.excerpt.rendered);
  const slug = project.slug;

  return `
    <a href="${basePath}project/?slug=${slug}" class="project-card">
      <div class="card-image">
        <img src="${img}" alt="${title}" loading="lazy">
      </div>
      <div class="card-body">
        <time>${date}</time>
        <h3>${title}</h3>
        <p>${excerpt}</p>
        <span class="read-more">Read more</span>
      </div>
    </a>
  `;
}

function renderBlogCard(blog, basePath = '') {
  const img = getFeaturedImage(blog);
  const categories = getCategoryNames(blog);
  const title = blog.title.rendered;
  const excerpt = stripHtml(blog.excerpt.rendered);
  const slug = blog.slug;
  const label = categories.length ? categories[0] : '';

  return `
    <a href="${basePath}blog/?slug=${slug}" class="case-card">
      <div class="case-card-image">
        <img src="${img}" alt="${title}" loading="lazy">
      </div>
      <div class="case-card-body">
        ${label ? `<span class="case-eyebrow">${label.toUpperCase()}</span>` : ''}
        <h3>${title}</h3>
        <p>${excerpt}</p>
        <span class="read-more">Read more</span>
      </div>
    </a>
  `;
}
