import HomeClient from './HomeClient'

export const revalidate = 300 // ISR: revalidate home page every 5 minutes

export const metadata = {
    title: 'Share & Borrow Books Free in Pakistan',
    description: 'Join BookShare — Pakistan\'s free community book platform. Share physical books, borrow digital titles, and connect with readers near you.',
    alternates: { canonical: 'https://bookshare.tech' },
    openGraph: {
        title: 'BookShare — Share & Borrow Books Free',
        description: 'Pakistan\'s free community book sharing platform.',
        url: 'https://bookshare.tech',
        images: [{ url: '/og-home.png', width: 1200, height: 630, alt: 'BookShare — Share and Borrow Books' }],
    },
}

export default function HomePage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "BookShare",
        "url": "https://bookshare.tech",
        "description": "Free community book sharing platform",
        "potentialAction": {
            "@type": "SearchAction",
            "target": { "@type": "EntryPoint", "urlTemplate": "https://bookshare.tech/browse?search={search_term_string}" },
            "query-input": "required name=search_term_string"
        },
        "publisher": {
            "@type": "Organization",
            "name": "BookShare",
            "url": "https://bookshare.tech",
            "logo": { "@type": "ImageObject", "url": "https://bookshare.tech/logo.png" }
        }
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <HomeClient />
        </>
    )
}