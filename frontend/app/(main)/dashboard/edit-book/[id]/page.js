'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { getBook, updateBook } from '@/lib/api'
import BookForm from '@/components/BookForm'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function EditBookPage() {
    const { id } = useParams()
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()

    const [book, setBook] = useState(null)
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)

    useEffect(() => {
        if (!authLoading && !user) router.push('/auth/login')
    }, [user, authLoading, router])

    useEffect(() => {
        getBook(id)
            .then(r => {
                const b = r.data.book
                if (user && b.owner_id !== user.id && user.role !== 'admin') {
                    toast.error('Not authorized')
                    router.push('/dashboard')
                    return
                }
                setBook(b)
            })
            .catch(() => {
                toast.error('Book not found')
                router.push('/dashboard')
            })
            .finally(() => setFetching(false))
    }, [id, user])

    const handleSubmit = async (formData) => {
        setLoading(true)
        try {
            await updateBook(id, formData)
            toast.success('Book updated successfully!')
            router.push('/dashboard')
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error updating book')
        } finally {
            setLoading(false)
        }
    }

    if (fetching) return (
        <div className="max-w-2xl space-y-4">
            <div className="h-8 bg-white rounded-lg w-48 animate-pulse" />
            <div className="h-96 bg-white rounded-2xl animate-pulse" />
        </div>
    )

    return (
        <div className="max-w-2xl space-y-8 animate-fade-up">
            <div>
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-forest transition-colors font-body mb-4">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>
                <h1 className="font-display text-3xl font-bold text-forest">Edit Book</h1>
                <p className="text-muted-foreground font-body mt-1 text-sm">Update the details for &quot;{book?.title}&quot;</p>
            </div>
            <div className="bg-white border border-warm rounded-2xl p-6">
                {book && <BookForm initial={book} onSubmit={handleSubmit} loading={loading} submitLabel="Save Changes" />}
            </div>
        </div>
    )
}