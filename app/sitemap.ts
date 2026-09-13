import { getBlogPosts } from 'app/blog/utils'
import { getPublishedMemorySlugs } from 'app/memories/data'

export const baseUrl = 'https://sarakim23.vercel.app'

export default async function sitemap() {
  const memoryRoutes = (await getPublishedMemorySlugs()).map(
    (slug) => `/memories/${slug}`
  )
  let blogs = getBlogPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }))

  let routes = ['', '/about', '/writing/poetry', '/blog', ...memoryRoutes].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date().toISOString().split('T')[0],
    })
  )

  return [...routes, ...blogs]
}
