export default async function sitemap() {
  const baseUrl = 'https://bookshare.tech'

  let books = []
  try {
    const response = await fetch('https://api.bookshare.tech/api/books', {
      next: { revalidate: 3600 },
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
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
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/browse`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/auth/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/auth/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  return [...staticUrls, ...bookUrls]
}