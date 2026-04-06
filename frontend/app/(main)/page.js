'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getBooks } from '@/lib/api'
import BookCard from '@/components/BookCard'
import { Button } from '@/components/ui/button'
import { BookOpen, ArrowRight, Users, RefreshCw, Star } from 'lucide-react'

export default function HomePage() {
    const [featuredBooks, setFeaturedBooks] = useState([])

    useEffect(() => {
        getBooks({ status: 'available' })
            .then(r => setFeaturedBooks(r.data.books.slice(0, 6)))
            .catch(() => { })
    }, [])

    return (
        <div className="space-y-20">

            {/* Hero */}
            <section className="pt-10 pb-4">
                <div className="max-w-2xl animate-fade-up">
                    <p className="text-sage text-sm font-body font-medium tracking-widest uppercase mb-4">
                        Community Book Sharing
                    </p>
                    <h1 className="font-display text-5xl font-bold text-forest leading-tight mb-6">
                        Share books.<br />
                        <em className="font-normal text-forest/60">Build community.</em>
                    </h1>
                    <p className="text-lg text-muted-foreground font-body leading-relaxed mb-8 max-w-lg">
                        Discover, borrow, and share physical and digital books with people around you.
                        Every book has a story — pass it on.
                    </p>
                    <div className="flex items-center gap-3">
                        <Link href="/browse">
                            <Button className="bg-forest text-white hover:bg-forest-light px-6 h-11 font-body font-medium gap-2">
                                Browse Books <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                        <Link href="/auth/register">
                            <Button variant="outline" className="border-warm text-forest hover:bg-warm-sand px-6 h-11 font-body">
                                Join for free
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="animate-fade-up animate-fade-up-1">
                <h2 className="font-display text-2xl font-semibold text-forest mb-8">How it works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            icon: BookOpen,
                            title: 'List your books',
                            desc: 'Add physical or digital books to share with your community. Set your own availability and location.',
                        },
                        {
                            icon: RefreshCw,
                            title: 'Request & schedule',
                            desc: 'Find a book you like and send a borrow request. Coordinate pickup time and location directly.',
                        },
                        {
                            icon: Star,
                            title: 'Borrow for free',
                            desc: 'Exchange books freely with community members. Return when done, keep the cycle going.',
                        },
                    ].map(({ icon: Icon, title, desc }, i) => (
                        <div
                            key={title}
                            className="bg-white border border-warm rounded-xl p-6 hover:shadow-md transition-shadow"
                            style={{ animationDelay: `${i * 0.08}s` }}
                        >
                            <div className="w-10 h-10 rounded-lg bg-forest/8 flex items-center justify-center mb-4">
                                <Icon className="w-5 h-5 text-forest" />
                            </div>
                            <h3 className="font-display font-semibold text-forest text-lg mb-2">{title}</h3>
                            <p className="text-sm text-muted-foreground font-body leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Featured books */}
            {featuredBooks.length > 0 && (
                <section className="animate-fade-up animate-fade-up-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-display text-2xl font-semibold text-forest">Available now</h2>
                        <Link href="/browse">
                            <Button variant="ghost" className="text-forest hover:bg-forest/5 gap-1 text-sm">
                                View all <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                        {featuredBooks.map(book => (
                            <BookCard key={book.id} book={book} />
                        ))}
                    </div>
                </section>
            )}

            {/* CTA Banner */}
            <section className="animate-fade-up animate-fade-up-3">
                <div className="bg-forest rounded-2xl px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className="font-display text-2xl font-semibold text-white mb-2">
                            Have books collecting dust?
                        </h2>
                        <p className="text-white/60 font-body">
                            List them on BookShare and let someone else enjoy them.
                        </p>
                    </div>
                    <Link href="/dashboard/add-book" className="flex-shrink-0">
                        <Button className="bg-sage text-forest hover:bg-sage/90 font-medium px-6 h-11">
                            Share a book
                        </Button>
                    </Link>
                </div>
            </section>

        </div>
    )
}