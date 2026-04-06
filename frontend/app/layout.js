import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { Toaster } from 'sonner'

export const metadata = {
  metadataBase: new URL('https://bookshare.tech'),
  title: {
    default: 'BookShare — Share & Borrow Books Free',
    template: '%s | BookShare',
  },
  description: 'BookShare is a free community platform to share and borrow physical and digital books. Discover thousands of books shared by readers near you.',
  keywords: ['book sharing', 'borrow books', 'free books', 'digital books', 'book community', 'Pakistan books', 'share books online', 'university books'],
  authors: [{ name: 'BookShare Team', url: 'https://bookshare.tech' }],
  creator: 'BookShare',
  publisher: 'BookShare',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: 'https://bookshare.tech',
    siteName: 'BookShare',
    title: 'BookShare — Share & Borrow Books Free',
    description: 'BookShare is a free community platform to share and borrow physical and digital books.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BookShare — Share and Borrow Books',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BookShare — Share & Borrow Books Free',
    description: 'BookShare is a free community platform to share and borrow physical and digital books.',
    creator: '@booksharetech',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'icon',
        sizes: '32x32',
        url: '/favicon-32x32.png',
      },
    ],
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: 'https://bookshare.tech',
  },
  category: 'education',
}

export const viewport = {
  themeColor: '#2D4A3E',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}