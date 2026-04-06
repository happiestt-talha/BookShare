'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Upload, Link as LinkIcon, MapPin } from 'lucide-react'

const CATEGORIES = [
    'Fiction', 'Non-Fiction', 'Academic', 'Technology',
    'Science', 'History', 'Biography', 'Self-Help', 'Other'
]

export default function BookForm({ initial = {}, onSubmit, loading, submitLabel = 'Save Book' }) {
    const [form, setForm] = useState({
        title: initial.title || '',
        author: initial.author || '',
        category: initial.category || '',
        type: initial.type || 'physical',
        location: initial.location || '',
        file_link: initial.file_link || '',
    })
    const [file, setFile] = useState(null)
    const [error, setError] = useState('')

    const set = (key, val) => setForm(p => ({ ...p, [key]: val }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (!form.title || !form.author || !form.category || !form.type) {
            setError('Please fill in all required fields.')
            return
        }
        if (form.type === 'physical' && !form.location) {
            setError('Location is required for physical books.')
            return
        }

        const data = new FormData()
        data.append('title', form.title)
        data.append('author', form.author)
        data.append('category', form.category)
        data.append('type', form.type)
        data.append('location', form.location)
        data.append('file_link', form.file_link)
        if (file) data.append('file', file)

        try {
            await onSubmit(data)
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong.')
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground font-body">
                        Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={form.title}
                        onChange={e => set('title', e.target.value)}
                        placeholder="e.g. Atomic Habits"
                        required
                        className="border-warm bg-ivory focus-visible:ring-forest/30 font-body"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground font-body">
                        Author <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={form.author}
                        onChange={e => set('author', e.target.value)}
                        placeholder="e.g. James Clear"
                        required
                        className="border-warm bg-ivory focus-visible:ring-forest/30 font-body"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground font-body">
                        Category <span className="text-red-500">*</span>
                    </Label>
                    <Select value={form.category} onValueChange={v => set('category', v)}>
                        <SelectTrigger className="border-warm bg-ivory focus:ring-forest/30 font-body">
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            {CATEGORIES.map(c => <SelectItem key={c} value={c} className="font-body">{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground font-body">
                        Book Type <span className="text-red-500">*</span>
                    </Label>
                    <Select value={form.type} onValueChange={v => set('type', v)}>
                        <SelectTrigger className="border-warm bg-ivory focus:ring-forest/30 font-body">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="physical" className="font-body">Physical Book</SelectItem>
                            <SelectItem value="digital" className="font-body">Digital Book</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Physical: location */}
            {form.type === 'physical' && (
                <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground font-body flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> Pickup Location <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={form.location}
                        onChange={e => set('location', e.target.value)}
                        placeholder="e.g. Johar Town, Lahore"
                        required
                        className="border-warm bg-ivory focus-visible:ring-forest/30 font-body"
                    />
                </div>
            )}

            {/* Digital: file upload or link */}
            {form.type === 'digital' && (
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground font-body flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5" /> Upload File (PDF / EPUB, max 10MB)
                        </Label>
                        <div className="border border-dashed border-warm rounded-lg p-6 text-center hover:border-forest/30 transition-colors cursor-pointer bg-ivory">
                            <input
                                type="file"
                                accept=".pdf,.epub"
                                onChange={e => setFile(e.target.files[0])}
                                className="hidden"
                                id="file-upload"
                            />
                            <label htmlFor="file-upload" className="cursor-pointer">
                                <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm font-body text-muted-foreground">
                                    {file ? file.name : 'Click to upload or drag and drop'}
                                </p>
                                {file && (
                                    <p className="text-xs text-forest mt-1">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                )}
                            </label>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground font-body flex items-center gap-1.5">
                            <LinkIcon className="w-3.5 h-3.5" /> Or paste an external link
                        </Label>
                        <Input
                            value={form.file_link}
                            onChange={e => set('file_link', e.target.value)}
                            placeholder="https://drive.google.com/..."
                            className="border-warm bg-ivory focus-visible:ring-forest/30 font-body"
                        />
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                    <p className="text-sm text-red-700 font-body">{error}</p>
                </div>
            )}

            <Button
                type="submit"
                disabled={loading}
                className="w-full bg-forest text-white hover:bg-forest-light h-11 font-body font-medium"
            >
                {loading ? 'Saving...' : submitLabel}
            </Button>
        </form>
    )
}