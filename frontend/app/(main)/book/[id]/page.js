import BookDetailClient from './BookDetailClient'
import { notFound } from 'next/navigation'

async function getBookData(id) {
  try {
    const res = await fetch(`http://api.bookshare.tech/api/books/${id}`, {
      next: { revalidate: 60 } // Cache for 1 minute
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.book
  } catch (error) {
    return null
  }
}

export async function generateMetadata({ params }) {
  const { id } = params
  const book = await getBookData(id)

  if (!book) {
    return {
      title: 'Book Not Found | BookShare',
      description: 'The requested book could not be found on BookShare.'
    }
  }

  const title = `${book.title} by ${book.author}`
  const description = `Borrow "${book.title}" by ${book.author} on BookShare. ${book.type === 'physical' ? `Available for pickup in ${book.location}.` : 'Available as a digital book.'} Free community book sharing.`

  return {
    title,
    description,
    alternates: {
      canonical: `https://bookshare.tech/book/${id}`,
    },
    openGraph: {
      type: 'book',
      title,
      description,
      url: `https://bookshare.tech/book/${id}`,
      images: [
        {
          url: '/og-book.png',
          width: 1200,
          height: 630,
          alt: book.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-book.png'],
    },
  }
}

export default async function BookPage({ params }) {
  const { id } = params
  const book = await getBookData(id)

  if (!book) {
    notFound()
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": book.title,
    "author": { "@type": "Person", "name": book.author },
    "bookFormat": book.type === 'physical' ? "https://schema.org/Paperback" : "https://schema.org/EBook",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "PKR",
      "availability": book.status === 'available' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "url": `https://bookshare.tech/book/${book.id}`
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BookDetailClient initialBook={book} />
    </>
  )
}