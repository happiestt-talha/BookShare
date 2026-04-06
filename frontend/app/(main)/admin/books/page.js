'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { adminGetBooks, adminDeleteBook, flagBook } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import StatusBadge from '@/components/StatusBadge'
import { toast } from 'sonner'
import { ArrowLeft, Search, Trash2, Flag } from 'lucide-react'
import Link from 'next/link'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog'

export default function AdminBooksPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()

    const [books, setBooks] = useState([])
    const [search, setSearch] = useState('')
    const [flaggedOnly, setFlaggedOnly] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading) {
            if (!user) router.push('/auth/login')
            else if (user.role !== 'admin') router.push('/dashboard')
        }
    }, [user, authLoading, router])

    const fetchBooks = async () => {
        try {
            const res = await adminGetBooks(flaggedOnly ? { flagged: 'true' } : {})
            setBooks(res.data.books)
        } catch { }
        finally { setLoading(false) }
    }

    useEffect(() => {
        if (user?.role === 'admin') fetchBooks()
    }, [user, flaggedOnly])

    const handleDelete = async (id, title) => {
        try {
            await adminDeleteBook(id)
            toast.success(`"${title}" removed.`)
            fetchBooks()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error')
        }
    }

    const handleUnflag = async (id) => {
        try {
            await flagBook(id)
            toast.success('Book unflagged.')
            fetchBooks()
        } catch { }
    }

    const filtered = books.filter(b =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase())
    )

    if (authLoading || !user || user.role !== 'admin') return null

    return (
        <div className="space-y-8 animate-fade-up">
            <div>
                <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-forest transition-colors font-body mb-4">
                    <ArrowLeft className="w-4 h-4" /> Back to Admin
                </Link>
                <h1 className="font-display text-3xl font-bold text-forest">Manage Books</h1>
                <p className="text-muted-foreground font-body mt-1 text-sm">{books.length} books in the system</p>
            </div>

            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by title or author..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 border-warm bg-white focus-visible:ring-forest/30 font-body"
                    />
                </div>
                <Button
                    variant={flaggedOnly ? 'default' : 'outline'}
                    onClick={() => setFlaggedOnly(p => !p)}
                    className={`gap-2 font-body text-sm flex-shrink-0 ${flaggedOnly ? 'bg-red-600 hover:bg-red-700 text-white' : 'border-warm text-forest hover:bg-warm-sand'}`}
                >
                    <Flag className="w-4 h-4" />
                    {flaggedOnly ? 'Showing Flagged' : 'Flagged Only'}
                </Button>
            </div>

            {loading ? (
                <div className="space-y-2">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white border border-warm rounded-xl animate-pulse" />)}
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map(book => (
                        <div key={book.id} className={`bg-white border rounded-xl px-5 py-4 flex items-center gap-4 ${book.is_flagged ? 'border-red-200 bg-red-50/30' : 'border-warm'}`}>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-body font-medium text-forest text-sm truncate">{book.title}</p>
                                    {book.is_flagged && (
                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-body flex-shrink-0">Flagged</span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground font-body">by {book.author} · owned by {book.owner?.name}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <StatusBadge status={book.status} />
                                <StatusBadge status={book.type} />
                                {book.is_flagged && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleUnflag(book.id)}
                                        className="text-xs font-body text-muted-foreground hover:text-forest"
                                    >
                                        Unflag
                                    </Button>
                                )}
                                <Link href={`/book/${book.id}`}>
                                    <Button size="sm" variant="ghost" className="text-xs font-body text-forest hover:bg-forest/5">
                                        View
                                    </Button>
                                </Link>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 gap-1 text-xs font-body">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="font-display">Remove this book?</AlertDialogTitle>
                                            <AlertDialogDescription className="font-body">
                                                This will permanently remove &quot;{book.title}&quot; and notify the owner. This cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="font-body">Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDelete(book.id, book.title)}
                                                className="bg-red-600 hover:bg-red-700 font-body"
                                            >
                                                Remove
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground font-body text-sm">
                            {flaggedOnly ? 'No flagged books.' : 'No books match your search.'}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}