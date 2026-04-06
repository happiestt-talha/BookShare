'use client'
import { useState, useEffect, useCallback } from 'react'
import { getBooks } from '@/lib/api'
import BookCard from '@/components/BookCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

const CATEGORIES = ['Fiction', 'Non-Fiction', 'Academic', 'Technology', 'Science', 'History', 'Biography', 'Self-Help', 'Other']

export default function BrowsePage() {
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('all')
    const [type, setType] = useState('all')
    const [status, setStatus] = useState('all')

    const debouncedSearch = useDebounce(search, 350)

    const fetchBooks = useCallback(async () => {
        setLoading(true)
        try {
            const params = {}
            if (debouncedSearch) params.search = debouncedSearch
            if (category !== 'all') params.category = category
            if (type !== 'all') params.type = type
            if (status !== 'all') params.status = status
            const res = await getBooks(params)
            setBooks(res.data.books)
        } catch {
            setBooks([])
        } finally {
            setLoading(false)
        }
    }, [debouncedSearch, category, type, status])

    useEffect(() => { fetchBooks() }, [fetchBooks])

    const clearFilters = () => {
        setSearch('')
        setCategory('all')
        setType('all')
        setStatus('all')
    }

    const hasFilters = search || category !== 'all' || type !== 'all' || status !== 'all'

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="animate-fade-up">
                <h1 className="font-display text-3xl font-bold text-forest">Browse Books</h1>
                <p className="text-muted-foreground font-body mt-1">
                    Discover books shared by your community
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white border border-warm rounded-xl p-5 animate-fade-up animate-fade-up-1">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by title or author..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-9 border-warm bg-ivory focus-visible:ring-forest/30"
                        />
                    </div>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="w-full md:w-44 border-warm bg-ivory">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger className="w-full md:w-36 border-warm bg-ivory">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="physical">Physical</SelectItem>
                            <SelectItem value="digital">Digital</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-full md:w-40 border-warm bg-ivory">
                            <SelectValue placeholder="Availability" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="borrowed">Borrowed</SelectItem>
                        </SelectContent>
                    </Select>
                    {hasFilters && (
                        <Button variant="ghost" size="icon" onClick={clearFilters} className="text-muted-foreground hover:text-forest flex-shrink-0">
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between animate-fade-up animate-fade-up-2">
                <p className="text-sm text-muted-foreground font-body">
                    {loading ? 'Loading...' : `Showing ${books.length} book${books.length !== 1 ? 's' : ''}`}
                </p>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-white border border-warm rounded-xl p-5 h-52 animate-pulse" />
                    ))}
                </div>
            ) : books.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-16 h-16 rounded-full bg-forest/5 flex items-center justify-center mx-auto mb-4">
                        <Search className="w-7 h-7 text-forest/30" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-forest mb-2">No books found</h3>
                    <p className="text-muted-foreground font-body text-sm">
                        Try adjusting your search or filters.
                    </p>
                    {hasFilters && (
                        <Button variant="ghost" onClick={clearFilters} className="mt-4 text-forest">
                            Clear all filters
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {books.map(book => <BookCard key={book.id} book={book} />)}
                </div>
            )}
        </div>
    )
}