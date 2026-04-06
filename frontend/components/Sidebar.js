'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
    BookOpen, Home, Search, LayoutDashboard,
    PlusCircle, Shield, LogOut, BookMarked, Bell
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useState, useEffect } from 'react'
import { getNotifications } from '@/lib/api'
import Image from 'next/image'

const guestLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/browse', label: 'Browse Books', icon: Search },
]

const memberLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/browse', label: 'Browse Books', icon: Search },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/add-book', label: 'Add a Book', icon: PlusCircle },
]

const adminLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/browse', label: 'Browse Books', icon: Search },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/add-book', label: 'Add a Book', icon: PlusCircle },
    { href: '/admin', label: 'Admin Panel', icon: Shield },
]

export default function Sidebar() {
    const { user, logout, loading } = useAuth()
    const pathname = usePathname()
    const [unread, setUnread] = useState(0)

    useEffect(() => {
        if (!user) return
        getNotifications()
            .then(r => setUnread(r.data.unread_count))
            .catch(() => { })
    }, [user, pathname])

    const links = !user ? guestLinks : user.role === 'admin' ? adminLinks : memberLinks

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?'

    return (
        <aside className="fixed inset-y-0 left-0 w-60 bg-forest flex flex-col z-40 sidebar-scroll overflow-y-auto">
            {/* Logo */}
            <div role="banner" className="px-6 py-6 flex items-center gap-3">
                <Link href="/" aria-label="BookShare home" className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sage/20 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 text-sage" />
                    </div>
                    <span className="font-display text-lg text-white font-semibold tracking-wide">
                        BookShare
                    </span>
                    {/* <Image
                        src="/logo.png"
                        alt="BookShare Logo"
                        width={40}
                        height={40}
                        className="rounded-lg"
                    /> */}
                </Link>
            </div>

            <Separator className="bg-white/10 mx-4" />

            {/* Nav links */}
            <nav aria-label="Main navigation" className="flex-1 px-3 py-4 space-y-1">
                {links.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href || (href !== '/' && pathname.startsWith(href))
                    return (
                        <Link
                            key={href}
                            href={href}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-all duration-150',
                                active
                                    ? 'bg-white/15 text-white font-medium'
                                    : 'text-white/60 hover:bg-white/8 hover:text-white/90'
                            )}
                        >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            {label}
                            {label === 'Dashboard' && unread > 0 && (
                                <span className="ml-auto bg-sage text-forest text-xs font-semibold px-1.5 py-0.5 rounded-full">
                                    {unread}
                                </span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            <Separator className="bg-white/10 mx-4" />

            {/* User section */}
            <div className="px-3 py-4">
                {loading ? null : user ? (
                    <div className="space-y-2">
                        <Link
                            href="/dashboard/profile"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/8 transition-colors group"
                        >
                            <Avatar className="w-8 h-8 flex-shrink-0">
                                <AvatarFallback className="bg-sage/30 text-white text-xs font-medium">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{user.name}</p>
                                <p className="text-white/50 text-xs truncate">{user.role}</p>
                            </div>
                        </Link>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={logout}
                            className="w-full justify-start gap-3 text-white/50 hover:text-white hover:bg-white/8 px-3"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign out
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-2 px-1">
                        <Link href="/auth/login">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-white/70 hover:text-white hover:bg-white/8 border border-white/20"
                            >
                                Sign in
                            </Button>
                        </Link>
                        <Link href="/auth/register">
                            <Button
                                size="sm"
                                className="w-full bg-sage text-forest hover:bg-sage/90 font-medium"
                            >
                                Register
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </aside>
    )
}