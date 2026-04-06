'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { register } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Eye, EyeOff, Check } from 'lucide-react'

export default function RegisterPage() {
    const router = useRouter()
    const { setUser } = useAuth()

    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [form, setForm] = useState({ name: '', email: '', password: '' })
    const [error, setError] = useState('')

    const handleChange = e => {
        setForm(p => ({ ...p, [e.target.name]: e.target.value }))
        setError('')
    }

    const passwordStrength = () => {
        const p = form.password
        if (!p) return []
        const checks = [
            { label: 'At least 8 characters', pass: p.length >= 8 },
            { label: 'Contains a number', pass: /\d/.test(p) },
            { label: 'Contains a letter', pass: /[a-zA-Z]/.test(p) },
        ]
        return checks
    }

    const handleSubmit = async e => {
        e.preventDefault()
        if (form.password.length < 8) {
            setError('Password must be at least 8 characters.')
            return
        }
        setLoading(true)
        setError('')
        try {
            const res = await register(form)
            setUser(res.data.user)
            toast.success(`Welcome to BookShare, ${res.data.user.name}!`)
            router.push('/dashboard')
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const checks = passwordStrength()

    return (
        <div className="animate-fade-up space-y-8">
            <div>
                <h1 className="font-display text-3xl font-bold text-forest">Create account</h1>
                <p className="text-muted-foreground font-body mt-2 text-sm">
                    Join the BookShare community — it&apos;s free.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs uppercase tracking-wide text-muted-foreground font-body">
                        Full Name
                    </Label>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        placeholder="Ali Ahmed"
                        value={form.name}
                        onChange={handleChange}
                        className="border-warm bg-white focus-visible:ring-forest/30 h-11 font-body"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs uppercase tracking-wide text-muted-foreground font-body">
                        Email Address
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        className="border-warm bg-white focus-visible:ring-forest/30 h-11 font-body"
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs uppercase tracking-wide text-muted-foreground font-body">
                        Password
                    </Label>
                    <div className="relative">
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            required
                            placeholder="Min. 8 characters"
                            value={form.password}
                            onChange={handleChange}
                            className="border-warm bg-white focus-visible:ring-forest/30 h-11 font-body pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(p => !p)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-forest transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {form.password && (
                        <div className="space-y-1 pt-1">
                            {checks.map(({ label, pass }) => (
                                <div key={label} className="flex items-center gap-2">
                                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${pass ? 'bg-sage' : 'bg-warm-border'}`}>
                                        {pass && <Check className="w-2 h-2 text-forest" />}
                                    </div>
                                    <span className={`text-xs font-body ${pass ? 'text-forest' : 'text-muted-foreground'}`}>{label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                        <p className="text-sm text-red-700 font-body">{error}</p>
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-forest text-white hover:bg-forest-light h-11 font-body font-medium text-sm"
                >
                    {loading ? 'Creating account...' : 'Create account'}
                </Button>
            </form>

            <p className="text-center text-sm font-body text-muted-foreground">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-forest font-medium hover:underline underline-offset-2">
                    Sign in
                </Link>
            </p>
        </div>
    )
}