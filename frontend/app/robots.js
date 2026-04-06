export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/browse', '/book/'],
        disallow: ['/dashboard', '/admin', '/api/'],
      },
    ],
    sitemap: 'https://bookshare.tech/sitemap.xml',
  }
}
