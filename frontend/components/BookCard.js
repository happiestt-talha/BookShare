'use client'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { BookOpen, MapPin, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

const statusConfig = {
    available: { label: 'Available', class: 'bg-sage/20 text-forest border-sage/30' },
    pending: { label: 'Pending', class: 'bg-amber-100 text-amber-800 border-amber-200' },
    borrowed: { label: 'Borrowed', class: 'bg-warm-sand text-warm-brown border-warm-border' },
}

const categoryColors = [
    'bg-emerald-50 text-emerald-700',
    'bg-sky-50 text-sky-700',
    'bg-violet-50 text-violet-700',
    'bg-rose-50 text-rose-700',
    'bg-amber-50 text-amber-700',
    'bg-teal-50 text-teal-700',
]

function getCategoryColor(category) {
    let hash = 0
    for (let c of category) hash = c.charCodeAt(0) + hash * 31
    return categoryColors[Math.abs(hash) % categoryColors.length]
}

export default function BookCard({ book, className }) {
    const status = statusConfig[book.status] || statusConfig.available

    return (
        <Link href={`/book/${book.id}`} className={cn('block group', className)}>
            <div className="bg-white border border-warm rounded-xl p-5 h-full flex flex-col gap-3 hover:shadow-md hover:border-forest/20 transition-all duration-200 hover:-translate-y-0.5">

                {/* Book icon placeholder */}
                <div className="w-full h-32 rounded-lg bg-forest/5 flex items-center justify-center group-hover:bg-forest/8 transition-colors">
                    <BookOpen className="w-10 h-10 text-forest/25" />
                </div>

                {/* Title + author */}
                <div className="flex-1">
                    <h3 className="font-display font-semibold text-forest text-base leading-snug line-clamp-2 group-hover:text-forest-dark transition-colors">
                        {book.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5 font-body">{book.author}</p>
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                        variant="outline"
                        className={cn('text-xs font-medium', getCategoryColor(book.category))}
                    >
                        {book.category}
                    </Badge>
                    <Badge
                        variant="outline"
                        className={cn('text-xs font-medium capitalize', status.class)}
                    >
                        {status.label}
                    </Badge>
                </div>

                {/* Type + location */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {book.type === 'physical' ? (
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                    ) : (
                        <Globe className="w-3 h-3 flex-shrink-0" />
                    )}
                    <span className="truncate">
                        {book.type === 'physical'
                            ? (book.location || 'Location not set')
                            : 'Digital book'}
                    </span>
                </div>

                {/* Owner */}
                {book.owner && (
                    <div className="flex items-center gap-2 pt-1 border-t border-warm">
                        <div className="w-5 h-5 rounded-full bg-forest/15 flex items-center justify-center text-forest text-xs font-semibold">
                            {book.owner.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-xs text-muted-foreground truncate">{book.owner.name}</span>
                    </div>
                )}
            </div>
        </Link>
    )
}