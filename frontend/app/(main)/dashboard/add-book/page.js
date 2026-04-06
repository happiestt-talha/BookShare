'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { createBook } from '@/lib/api'
import BookForm from '@/components/BookForm'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

export default function AddBookPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!authLoading && !user) router.push('/auth/login')
    }, [user, authLoading, router])

    const handleSubmit = async (formData) => {
        setLoading(true)
        try {
            await createBook(formData)
            toast.success('Book added successfully!')
            router.push('/dashboard')
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error adding book')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl space-y-8 animate-fade-up">
            <div>
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-forest transition-colors font-body mb-4"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>
                <h1 className="font-display text-3xl font-bold text-forest">Share a Book</h1>
                <p className="text-muted-foreground font-body mt-1 text-sm">
                    Add a book to your collection and make it available to the community.
                </p>
            </div>

            <div className="bg-white border border-warm rounded-2xl p-6">
                <BookForm
                    onSubmit={handleSubmit}
                    loading={loading}
                    submitLabel="Add Book"
                />
            </div>
        </div>
    )
}