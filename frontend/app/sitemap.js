export default async function sitemap() {
  const baseUrl = 'https://bookshare.tech'

  // Fetch all books for dynamic routes
  let books = []
  try {
    const response = await fetch('http://api.bookshare.tech/api/books')
    const data = await response.json()
    books = data.books || []
  } catch (error) {
    console.error('Sitemap fetch failed:', error)
  }

  const bookUrls = books.map((book) => ({
    url: `${baseUrl}/book/${book.id}`,
    lastModified: book.created_at || new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/browse`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  return [...staticUrls, ...bookUrls]
}
