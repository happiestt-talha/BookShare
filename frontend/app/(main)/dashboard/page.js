'use client'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import {
    getBooks, getIncomingRequests, getMyRequests,
    acceptRequest, rejectRequest, returnBook,
    getNotifications, markAllRead
} from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import StatusBadge from '@/components/StatusBadge'
import { toast } from 'sonner'
import Link from 'next/link'
import {
    BookOpen, PlusCircle, Bell, BookMarked,
    Calendar, Clock, MapPin, Check, X,
    RotateCcw, ChevronRight, Inbox
} from 'lucide-react'
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs'

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()


    const [myBooks, setMyBooks] = useState([])
    const [incoming, setIncoming] = useState([])
    const [myRequests, setMyRequests] = useState([])
    const [notifications, setNotifications] = useState([])
    const [unread, setUnread] = useState(0)
    const [loadingData, setLoadingData] = useState(true)

    useEffect(() => {
        if (!authLoading && !user) router.push('/auth/login')
    }, [user, authLoading, router])

    const fetchAll = useCallback(async () => {
        if (!user) return
        setLoadingData(true)
        try {
            const [booksRes, incomingRes, myReqRes, notifRes] = await Promise.all([
                getBooks({ owner_id: user.id }),
                getIncomingRequests(),
                getMyRequests(),
                getNotifications(),
            ])
            setMyBooks(booksRes.data.books)
            setIncoming(incomingRes.data.requests)
            setMyRequests(myReqRes.data.requests)
            setNotifications(notifRes.data.notifications)
            setUnread(notifRes.data.unread_count)
        } catch { }
        finally { setLoadingData(false) }
    }, [user])

    useEffect(() => { fetchAll() }, [fetchAll])

    const handleAccept = async (reqId) => {
        try {
            await acceptRequest(reqId)
            toast.success('Request accepted!')
            fetchAll()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error')
        }
    }

    const handleReject = async (reqId) => {
        try {
            await rejectRequest(reqId)
            toast.info('Request rejected.')
            fetchAll()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error')
        }
    }

    const handleReturn = async (reqId) => {
        try {
            await returnBook(reqId)
            toast.success('Book marked as returned!')
            fetchAll()
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error')
        }
    }

    const handleMarkAllRead = async () => {
        try {
            await markAllRead()
            setUnread(0)
            setNotifications(n => n.map(x => ({ ...x, is_read: true })))
        } catch { }
    }

    const pendingIncoming = incoming.filter(r => r.status === 'pending')
    const activeMyBorrows = myRequests.filter(r => r.status === 'accepted')

    if (authLoading || loadingData) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-white rounded-lg w-48 animate-pulse" />
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />)}
                </div>
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="animate-fade-up flex items-start justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-forest">
                        Good day, {user.name.split(' ')[0]}
                    </h1>
                    <p className="text-muted-foreground font-body mt-1 text-sm">
                        Here&apos;s what&apos;s happening with your books.
                    </p>
                </div>
                <Link href="/dashboard/add-book">
                    <Button className="bg-forest text-white hover:bg-forest-light gap-2 font-body">
                        <PlusCircle className="w-4 h-4" /> Add Book
                    </Button>
                </Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-up animate-fade-up-1">
                {[
                    { label: 'My Books', value: myBooks.length, icon: BookOpen },
                    { label: 'Pending Requests', value: pendingIncoming.length, icon: Inbox },
                    { label: 'Currently Borrowing', value: activeMyBorrows.length, icon: BookMarked },
                    { label: 'Notifications', value: unread, icon: Bell },
                ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-white border border-warm rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground font-body uppercase tracking-wide">{label}</span>
                            <Icon className="w-4 h-4 text-forest/40" />
                        </div>
                        <p className="font-display text-2xl font-semibold text-forest">{value}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="animate-fade-up animate-fade-up-2">
                <Tabs defaultValue="my-books">
                    <TabsList className="bg-white border border-warm h-10 p-1">
                        <TabsTrigger value="my-books" className="font-body text-sm data-[state=active]:bg-forest data-[state=active]:text-white">
                            My Books
                        </TabsTrigger>
                        <TabsTrigger value="incoming" className="font-body text-sm data-[state=active]:bg-forest data-[state=active]:text-white">
                            Incoming
                            {pendingIncoming.length > 0 && (
                                <span className="ml-1.5 bg-sage text-forest text-xs font-semibold px-1.5 py-0.5 rounded-full">
                                    {pendingIncoming.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="borrowing" className="font-body text-sm data-[state=active]:bg-forest data-[state=active]:text-white">
                            Borrowing
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="font-body text-sm data-[state=active]:bg-forest data-[state=active]:text-white">
                            Notifications
                            {unread > 0 && (
                                <span className="ml-1.5 bg-sage text-forest text-xs font-semibold px-1.5 py-0.5 rounded-full">
                                    {unread}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* MY BOOKS */}
                    <TabsContent value="my-books" className="mt-4">
                        {myBooks.length === 0 ? (
                            <EmptyState
                                icon={BookOpen}
                                title="No books yet"
                                desc="Share your first book with the community."
                                action={<Link href="/dashboard/add-book"><Button className="bg-forest text-white hover:bg-forest-light gap-2 font-body mt-4"><PlusCircle className="w-4 h-4" />Add a book</Button></Link>}
                            />
                        ) : (
                            <div className="space-y-2">
                                {myBooks.map(book => (
                                    <div key={book.id} className="bg-white border border-warm rounded-xl px-5 py-4 flex items-center gap-4 hover:border-forest/20 transition-colors">
                                        <div className="w-10 h-10 rounded-lg bg-forest/8 flex items-center justify-center flex-shrink-0">
                                            <BookOpen className="w-5 h-5 text-forest/40" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-display font-semibold text-forest text-sm truncate">{book.title}</p>
                                            <p className="text-xs text-muted-foreground font-body">{book.author}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <StatusBadge status={book.status} />
                                            <StatusBadge status={book.type} />
                                            <Link href={`/dashboard/edit-book/${book.id}`}>
                                                <Button variant="ghost" size="sm" className="text-forest hover:bg-forest/5 font-body text-xs">
                                                    Edit <ChevronRight className="w-3 h-3 ml-1" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* INCOMING REQUESTS */}
                    <TabsContent value="incoming" className="mt-4">
                        {incoming.length === 0 ? (
                            <EmptyState icon={Inbox} title="No requests yet" desc="When someone requests one of your books, it will appear here." />
                        ) : (
                            <div className="space-y-3">
                                {incoming.map(req => (
                                    <div key={req.id} className="bg-white border border-warm rounded-xl p-5 space-y-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="font-display font-semibold text-forest text-sm">
                                                    {req.book?.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground font-body mt-0.5">
                                                    Requested by <span className="font-medium text-forest">{req.borrower?.name}</span>
                                                </p>
                                            </div>
                                            <StatusBadge status={req.status} />
                                        </div>

                                        {req.proposed_date && (
                                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground font-body bg-ivory rounded-lg px-4 py-3">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="w-3 h-3" /> {req.proposed_date}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="w-3 h-3" /> {req.proposed_time}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin className="w-3 h-3" /> {req.location}
                                                </span>
                                            </div>
                                        )}

                                        {req.status === 'pending' && (
                                            <div className="flex gap-2 pt-1">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleAccept(req.id)}
                                                    className="bg-forest text-white hover:bg-forest-light gap-1.5 font-body text-xs"
                                                >
                                                    <Check className="w-3.5 h-3.5" /> Accept
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleReject(req.id)}
                                                    className="border-warm text-red-600 hover:bg-red-50 gap-1.5 font-body text-xs"
                                                >
                                                    <X className="w-3.5 h-3.5" /> Reject
                                                </Button>
                                                <Link href={`/dashboard/suggest/${req.id}`}>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-forest hover:bg-forest/5 font-body text-xs"
                                                    >
                                                        Suggest alternative
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}

                                        {req.status === 'accepted' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleReturn(req.id)}
                                                className="border-warm text-forest hover:bg-warm-sand gap-1.5 font-body text-xs"
                                            >
                                                <RotateCcw className="w-3.5 h-3.5" /> Mark as Returned
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* MY BORROWS */}
                    <TabsContent value="borrowing" className="mt-4">
                        {myRequests.length === 0 ? (
                            <EmptyState icon={BookMarked} title="Not borrowing anything" desc="Find a book you love and send a borrow request." action={<Link href="/browse"><Button variant="outline" className="border-warm text-forest mt-4 font-body">Browse Books</Button></Link>} />
                        ) : (
                            <div className="space-y-3">
                                {myRequests.map(req => (
                                    <div key={req.id} className="bg-white border border-warm rounded-xl p-5 space-y-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="font-display font-semibold text-forest text-sm">
                                                    {req.book?.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground font-body mt-0.5">
                                                    by {req.book?.author} · owned by <span className="font-medium text-forest">{req.book?.owner?.name}</span>
                                                </p>
                                            </div>
                                            <StatusBadge status={req.status} />
                                        </div>

                                        {req.proposed_date && (
                                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground font-body bg-ivory rounded-lg px-4 py-3">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="w-3 h-3" /> {req.proposed_date}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="w-3 h-3" /> {req.proposed_time}
                                                </span>
                                                {req.location && (
                                                    <span className="flex items-center gap-1.5">
                                                        <MapPin className="w-3 h-3" /> {req.location}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {req.status === 'accepted' && req.book?.type === 'digital' && (
                                            <div className="flex gap-2">
                                                {req.book?.file_link && (

                                                    <a href={req.book.file_link.startsWith('http') ? req.book.file_link : `http://localhost:5000${req.book.file_link}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Button size="sm" variant="outline" className="border-warm text-forest hover:bg-warm-sand font-body text-xs">
                                                            Download File
                                                        </Button>
                                                    </a>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleReturn(req.id)}
                                                    className="border-warm text-forest hover:bg-warm-sand gap-1.5 font-body text-xs"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5" /> Mark as Returned
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* NOTIFICATIONS */}
                    <TabsContent value="notifications" className="mt-4">
                        {notifications.length === 0 ? (
                            <EmptyState icon={Bell} title="All clear" desc="You have no notifications." />
                        ) : (
                            <div className="space-y-2">
                                <div className="flex justify-end">
                                    {unread > 0 && (
                                        <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-xs text-muted-foreground hover:text-forest font-body">
                                            Mark all as read
                                        </Button>
                                    )}
                                </div>
                                {notifications.map(n => (
                                    <div
                                        key={n.id}
                                        className={`rounded-xl px-5 py-4 border transition-colors ${n.is_read ? 'bg-white border-warm' : 'bg-sage/10 border-sage/30'}`}
                                    >
                                        <p className="text-sm font-body text-forest">{n.message}</p>
                                        <p className="text-xs text-muted-foreground font-body mt-1">
                                            {new Date(n.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div >
    )
}

function EmptyState({ icon: Icon, title, desc, action }) {
    return (
        <div className="text-center py-16 bg-white border border-warm rounded-xl">
            <div className="w-14 h-14 rounded-full bg-forest/5 flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-forest/30" />
            </div>
            <h3 className="font-display text-lg font-semibold text-forest mb-1">{title}</h3>
            <p className="text-muted-foreground font-body text-sm">{desc}</p>
            {action}
        </div>
    )
}