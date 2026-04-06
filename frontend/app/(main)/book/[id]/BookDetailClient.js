'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { flagBook, deleteBook } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import StatusBadge from '@/components/StatusBadge'
import BorrowModal from '@/components/BorrowModal'
import { toast } from 'sonner'
import {
    BookOpen, MapPin, Globe, Flag, Trash2, Edit, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog'

export default function BookDetailClient({ initialBook }) {
    const { user } = useAuth()
    const router = useRouter()
    const [book, setBook] = useState(initialBook)
    const [borrowOpen, setBorrowOpen] = useState(false)

    const fetchBook = async () => {
        try {
            // In a real app, we might want to re-fetch if needed, 
            // but for now we rely on the initial fetch or manual refresh
        } catch { }
    }

    const handleFlag = async () => {
        try {
            await flagBook(book.id)
            setBook(prev => ({ ...prev, is_flagged: !prev.is_flagged }))
            toast.success(book?.is_flagged ? 'Book unflagged' : 'Book flagged')
        } catch {
            toast.error('Error')
        }
    }

    const handleDelete = async () => {
        try {
            await deleteBook(book.id)
            toast.success('Book deleted successfully')
            router.push('/browse')
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error deleting book')
        }
    }

    if (!book) return null

    const isOwner = user?.id === book.owner_id
    const canBorrow = user && !isOwner && book.status === 'available'

    return (
        <div className="space-y-8 max-w-3xl animate-fade-up">

            {/* Back */}
            <Link href="/browse" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-forest transition-colors font-body">
                <ArrowLeft className="w-4 h-4" /> Back to Browse
            </Link>

            {/* Main card */}
            <div className="bg-white border border-warm rounded-2xl overflow-hidden">

                {/* Cover area */}
                <div className="bg-forest/5 px-8 py-10 flex items-center gap-6 border-b border-warm">
                    <div className="w-24 h-32 rounded-lg bg-forest/10 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-10 h-10 text-forest/30" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="font-display text-2xl font-bold text-forest leading-snug mb-1">
                            {book.title}
                        </h1>
                        <p className="text-muted-foreground font-body mb-3">by {book.author}</p>
                        <div className="flex flex-wrap gap-2">
                            <StatusBadge status={book.status} />
                            <StatusBadge status={book.type} />
                            <Badge variant="outline" className="text-xs border-warm text-muted-foreground">
                                {book.category}
                            </Badge>
                            {book.is_flagged && (
                                <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                                    Flagged
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="px-8 py-6 space-y-4">
                    {book.type === 'physical' && book.location && (
                        <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-forest/50 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground font-body uppercase tracking-wide mb-0.5">Pickup Location</p>
                                <p className="text-sm text-forest font-medium">{book.location}</p>
                            </div>
                        </div>
                    )}

                    {book.type === 'digital' && book.file_link && (
                        <div className="flex items-start gap-3">
                            <Globe className="w-4 h-4 text-forest/50 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground font-body uppercase tracking-wide mb-0.5">Digital File</p>
                                
                                <a href={book.file_link.startsWith('http') ? book.file_link : `https://api.bookshare.tech${book.file_link}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-forest underline underline-offset-2 hover:text-forest-light"
                                >
                                    Download / View file
                                </a>
                            </div>
                        </div>
                    )}

                    {book.owner && (
                        <div className="flex items-center gap-3 pt-4 border-t border-warm">
                            <div className="w-8 h-8 rounded-full bg-forest/15 flex items-center justify-center text-forest text-sm font-semibold">
                                {book.owner.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-body">Shared by</p>
                                <p className="text-sm font-medium text-forest">{book.owner.name}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="px-8 py-5 bg-ivory border-t border-warm flex flex-wrap items-center gap-3">

                    {canBorrow && (
                        <Button 
                            onClick={() => setBorrowOpen(true)}
                            className="bg-forest text-white hover:bg-forest-light gap-2 font-body"
                        >
                            <BookOpen className="w-4 h-4" /> Request to Borrow
                        </Button>
                    )}

                    {isOwner && (
                        <>
                            <Link href={`/dashboard/edit-book/${book.id}`}>
                                <Button variant="outline" className="border-warm text-forest hover:bg-warm-sand gap-2 font-body">
                                    <Edit className="w-4 h-4" /> Edit
                                </Button>
                            </Link>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" className="text-red-600 hover:bg-red-50 gap-2 font-body">
                                        <Trash2 className="w-4 h-4" /> Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="font-display">Delete this book?</AlertDialogTitle>
                                        <AlertDialogDescription className="font-body">
                                            This will permanently remove "{book.title}" from the platform. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="font-body">Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 font-body">
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    )}

                    {user && !isOwner && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleFlag}
                            className={`ml-auto gap-2 text-xs font-body ${book.is_flagged ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
                        >
                            <Flag className="w-3.5 h-3.5" />
                            {book.is_flagged ? 'Unflag' : 'Flag as inappropriate'}
                        </Button>
                    )}
                </div>
            </div>

            {/* Borrow modal */}
            <BorrowModal 
                open={borrowOpen} 
                onClose={() => setBorrowOpen(false)} 
                book={book}
                onSuccess={() => { setBorrowOpen(false); /* Might need a route refresh here */ }}
            />
        </div>
    )
}
