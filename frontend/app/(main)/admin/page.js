'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { adminGetReports } from '@/lib/api'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Users, BookOpen, RefreshCw, BarChart2, Shield, Flag } from 'lucide-react'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'

export default function AdminPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [stats, setStats] = useState(null)
    const [period, setPeriod] = useState('all')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading) {
            if (!user) router.push('/auth/login')
            else if (user.role !== 'admin') router.push('/dashboard')
        }
    }, [user, authLoading, router])

    useEffect(() => {
        if (!user || user.role !== 'admin') return
        setLoading(true)
        adminGetReports(period)
            .then(r => setStats(r.data))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [period, user])

    if (authLoading || !user || user.role !== 'admin') return null

    return (
        <div className="space-y-8 animate-fade-up">

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-5 h-5 text-forest" />
                        <h1 className="font-display text-3xl font-bold text-forest">Admin Panel</h1>
                    </div>
                    <p className="text-muted-foreground font-body text-sm">Platform overview and moderation tools.</p>
                </div>
                <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-36 border-warm bg-white font-body text-sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all" className="font-body">All time</SelectItem>
                        <SelectItem value="30days" className="font-body">Last 30 days</SelectItem>
                        <SelectItem value="7days" className="font-body">Last 7 days</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Stats */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-white border border-warm rounded-xl animate-pulse" />)}
                </div>
            ) : stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Users', value: stats.total_users, icon: Users, color: 'text-forest' },
                        { label: 'Total Books', value: stats.total_books, icon: BookOpen, color: 'text-forest' },
                        { label: 'Active Borrows', value: stats.active_borrows, icon: RefreshCw, color: 'text-amber-600' },
                        { label: 'Total Returned', value: stats.total_returned, icon: BarChart2, color: 'text-forest' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="bg-white border border-warm rounded-xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-muted-foreground font-body uppercase tracking-wide">{label}</span>
                                <Icon className={`w-4 h-4 ${color} opacity-50`} />
                            </div>
                            <p className="font-display text-3xl font-semibold text-forest">{value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* More stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Physical Books', value: stats.physical_books },
                        { label: 'Digital Books', value: stats.digital_books },
                        { label: 'Total Requests', value: stats.total_requests },
                    ].map(({ label, value }) => (
                        <div key={label} className="bg-white border border-warm rounded-xl p-4">
                            <span className="text-xs text-muted-foreground font-body">{label}</span>
                            <p className="font-display text-2xl font-semibold text-forest mt-1">{value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick links */}
            <div>
                <h2 className="font-display text-xl font-semibold text-forest mb-4">Moderation</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { href: '/admin/users', icon: Users, title: 'Manage Users', desc: 'View, block, or promote members' },
                        { href: '/admin/books', icon: BookOpen, title: 'Manage Books', desc: 'Edit, delete, or review flagged books' },
                    ].map(({ href, icon: Icon, title, desc }) => (
                        <Link key={href} href={href}>
                            <div className="bg-white border border-warm rounded-xl p-5 hover:border-forest/20 hover:shadow-sm transition-all group">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-9 h-9 rounded-lg bg-forest/8 flex items-center justify-center group-hover:bg-forest/12 transition-colors">
                                        <Icon className="w-4 h-4 text-forest" />
                                    </div>
                                    <h3 className="font-display font-semibold text-forest">{title}</h3>
                                </div>
                                <p className="text-sm text-muted-foreground font-body">{desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}