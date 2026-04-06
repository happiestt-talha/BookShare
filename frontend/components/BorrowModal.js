'use client'
import { useState } from 'react'
import { submitBorrowRequest } from '@/lib/api'
import { toast } from 'sonner'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BookOpen, Calendar, Clock, MapPin } from 'lucide-react'

export default function BorrowModal({ open, onClose, book, onSuccess }) {

    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({ proposed_date: '', proposed_time: '10:00', location: '' })

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

    const handleSubmit = async e => {
        e.preventDefault()
        setLoading(true)
        try {
            const payload = { book_id: book.id }
            if (book.type === 'physical') {
                payload.proposed_date = form.proposed_date
                payload.proposed_time = form.proposed_time
                payload.location = form.location
            }
            await submitBorrowRequest(payload)
            toast.success('Request sent!', { description: 'The owner will review your request.' })
            onSuccess()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error sending request')
        } finally {
            setLoading(false)
        }
    }

    if (!book) return null

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md font-body">
                <DialogHeader>
                    <DialogTitle className="font-display text-forest text-lg">Request to Borrow</DialogTitle>
                    <DialogDescription className="font-body">
                        {book.type === 'physical'
                            ? 'Propose a date, time, and location for pickup.'
                            : 'Send a borrow request for this digital book.'}
                    </DialogDescription>
                </DialogHeader>

                {/* Book info */}
                <div className="flex items-center gap-3 p-3 bg-ivory rounded-lg border border-warm">
                    <div className="w-10 h-10 rounded-md bg-forest/10 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-forest/50" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-forest">{book.title}</p>
                        <p className="text-xs text-muted-foreground">by {book.author}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {book.type === 'physical' && (
                        <>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" /> Proposed Date
                                </Label>
                                <Input
                                    name="proposed_date"
                                    type="date"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    value={form.proposed_date}
                                    onChange={handleChange}
                                    className="border-warm bg-ivory focus-visible:ring-forest/30"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" /> Preferred Time
                                </Label>
                                <Input
                                    name="proposed_time"
                                    type="time"
                                    required
                                    value={form.proposed_time}
                                    onChange={handleChange}
                                    className="border-warm bg-ivory focus-visible:ring-forest/30"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5" /> Pickup Location
                                </Label>
                                <Input
                                    name="location"
                                    placeholder="e.g. Library main gate, Sector 4"
                                    required
                                    value={form.location}
                                    onChange={handleChange}
                                    className="border-warm bg-ivory focus-visible:ring-forest/30"
                                />
                            </div>
                        </>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 border-warm text-muted-foreground hover:text-forest"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-forest text-white hover:bg-forest-light"
                        >
                            {loading ? 'Sending...' : 'Send Request'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}