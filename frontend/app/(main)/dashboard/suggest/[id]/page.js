'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { suggestAlternative } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { ArrowLeft, Calendar, Clock, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function SuggestPage() {
    const { id } = useParams()
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()

    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({ proposed_date: '', proposed_time: '10:00', location: '' })

    useEffect(() => {
        if (!authLoading && !user) router.push('/auth/login')
    }, [user, authLoading, router])

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

    const handleSubmit = async e => {
        e.preventDefault()
        setLoading(true)
        try {
            await suggestAlternative(id, form)
            toast.success('Alternative schedule sent to borrower!')
            router.push('/dashboard')
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-lg space-y-8 animate-fade-up">
            <div>
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-forest transition-colors font-body mb-4">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>
                <h1 className="font-display text-3xl font-bold text-forest">Suggest Alternative</h1>
                <p className="text-muted-foreground font-body mt-1 text-sm">
                    Propose a different date, time, or location for this borrow request.
                </p>
            </div>

            <div className="bg-white border border-warm rounded-2xl p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground font-body flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" /> New Proposed Date
                        </Label>
                        <Input
                            name="proposed_date"
                            type="date"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={form.proposed_date}
                            onChange={handleChange}
                            className="border-warm bg-ivory focus-visible:ring-forest/30 font-body"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground font-body flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> New Preferred Time
                        </Label>
                        <Input
                            name="proposed_time"
                            type="time"
                            required
                            value={form.proposed_time}
                            onChange={handleChange}
                            className="border-warm bg-ivory focus-visible:ring-forest/30 font-body"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground font-body flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" /> New Pickup Location
                        </Label>
                        <Input
                            name="location"
                            required
                            placeholder="e.g. Library main gate"
                            value={form.location}
                            onChange={handleChange}
                            className="border-warm bg-ivory focus-visible:ring-forest/30 font-body"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Link href="/dashboard" className="flex-1">
                            <Button type="button" variant="outline" className="w-full border-warm font-body">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={loading} className="flex-1 bg-forest text-white hover:bg-forest-light font-body">
                            {loading ? 'Sending...' : 'Send Suggestion'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}