'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { adminGetUsers, adminBlockUser, adminPromoteUser } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import StatusBadge from '@/components/StatusBadge'
import { toast } from 'sonner'
import { ArrowLeft, Search, Shield, Ban } from 'lucide-react'
import Link from 'next/link'

export default function AdminUsersPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()

    const [users, setUsers] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading) {
            if (!user) router.push('/auth/login')
            else if (user.role !== 'admin') router.push('/dashboard')
        }
    }, [user, authLoading, router])

    const fetchUsers = async () => {
        try {
            const res = await adminGetUsers()
            setUsers(res.data.users)
        } catch { }
        finally { setLoading(false) }
    }

    useEffect(() => {
        if (user?.role === 'admin') fetchUsers()
    }, [user])

    const handleBlock = async (uid) => {
        try {
            const res = await adminBlockUser(uid)
            toast.success(res.data.message)
            fetchUsers()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error')
        }
    }

    const handlePromote = async (uid) => {
        try {
            const res = await adminPromoteUser(uid)
            toast.success(res.data.message)
            fetchUsers()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error')
        }
    }

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    )

    if (authLoading || !user || user.role !== 'admin') return null

    return (
        <div className="space-y-8 animate-fade-up">
            <div>
                <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-forest transition-colors font-body mb-4">
                    <ArrowLeft className="w-4 h-4" /> Back to Admin
                </Link>
                <h1 className="font-display text-3xl font-bold text-forest">Manage Users</h1>
                <p className="text-muted-foreground font-body mt-1 text-sm">{users.length} registered members</p>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9 border-warm bg-white focus-visible:ring-forest/30 font-body"
                />
            </div>

            {loading ? (
                <div className="space-y-2">
                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-white border border-warm rounded-xl animate-pulse" />)}
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map(u => (
                        <div key={u.id} className="bg-white border border-warm rounded-xl px-5 py-4 flex items-center gap-4">
                            <div className="w-9 h-9 rounded-full bg-forest/12 flex items-center justify-center text-forest font-semibold text-sm flex-shrink-0">
                                {u.name[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-body font-medium text-forest text-sm truncate">{u.name}</p>
                                <p className="text-xs text-muted-foreground font-body truncate">{u.email}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <StatusBadge status={u.role} />
                                <StatusBadge status={u.status} />
                                {u.id !== user.id && (
                                    <>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleBlock(u.id)}
                                            className={`gap-1.5 text-xs font-body ${u.status === 'blocked' ? 'text-green-700 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}
                                        >
                                            <Ban className="w-3.5 h-3.5" />
                                            {u.status === 'blocked' ? 'Unblock' : 'Block'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handlePromote(u.id)}
                                            className="gap-1.5 text-xs font-body text-forest hover:bg-forest/5"
                                        >
                                            <Shield className="w-3.5 h-3.5" />
                                            {u.role === 'admin' ? 'Demote' : 'Promote'}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground font-body text-sm">No users match your search.</div>
                    )}
                </div>
            )}
        </div>
    )
}