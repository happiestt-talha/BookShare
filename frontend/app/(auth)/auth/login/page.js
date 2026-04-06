'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const { setUser } = useAuth()

    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [form, setForm] = useState({ email: '', password: '', remember: false })
    const [error, setError] = useState('')

    const handleChange = e => {
        const { name, value, type, checked } = e.target
        setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
        setError('')
    }

    const handleSubmit = async e => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const res = await login(form)
            setUser(res.data.user)
            toast.success(`Welcome back, ${res.data.user.name}!`)
            router.push('/dashboard')
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="animate-fade-up space-y-8">
            <div>
                <h1 className="font-display text-3xl font-bold text-forest">Welcome back</h1>
                <p className="text-muted-foreground font-body mt-2 text-sm">
                    Sign in to your BookShare account
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                            autoComplete="current-password"
                            required
                            placeholder="••••••••"
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
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="remember"
                        name="remember"
                        checked={form.remember}
                        onChange={handleChange}
                        className="rounded border-warm accent-forest w-4 h-4"
                    />
                    <Label htmlFor="remember" className="text-sm font-body text-muted-foreground cursor-pointer">
                        Remember me for 30 days
                    </Label>
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
                    {loading ? 'Signing in...' : 'Sign in'}
                </Button>
            </form>

            <p className="text-center text-sm font-body text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" className="text-forest font-medium hover:underline underline-offset-2">
                    Create one free
                </Link>
            </p>
        </div>
    )
}