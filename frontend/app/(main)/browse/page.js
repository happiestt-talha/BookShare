import BrowseClient from './BrowseClient'

export const metadata = {
  title: 'Browse Books',
  description: 'Explore thousands of physical and digital books available to borrow for free. Filter by category, type, and availability.',
  alternates: { canonical: 'https://bookshare.tech/browse' },
  openGraph: {
    title: 'Browse Books | BookShare',
    description: 'Find your next read — physical and digital books available free.',
    url: 'https://bookshare.tech/browse',
    images: [{ url: '/og-browse.png', width: 1200, height: 630, alt: 'Browse Books on BookShare' }],
  },
}

export default function BrowsePage() {
  return <BrowseClient />
}