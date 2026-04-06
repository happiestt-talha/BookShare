'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { updateProfile, changePassword } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { User, Lock, Upload } from 'lucide-react'

export default function ProfilePage() {
    const { user, loading: authLoading, refreshUser } = useAuth()
    const router = useRouter()


    const [profileForm, setProfileForm] = useState({ name: '', phone: '', bio: '' })
    const [avatarFile, setAvatarFile] = useState(null)
    const [profileLoading, setProfileLoading] = useState(false)

    const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' })
    const [pwLoading, setPwLoading] = useState(false)
    const [pwError, setPwError] = useState('')

    useEffect(() => {
        if (!authLoading && !user) router.push('/auth/login')
        if (user) setProfileForm({ name: user.name || '', phone: user.phone || '', bio: user.bio || '' })
    }, [user, authLoading, router])

    const handleProfileSubmit = async e => {
        e.preventDefault()
        setProfileLoading(true)
        try {
            const data = new FormData()
            data.append('name', profileForm.name)
            data.append('phone', profileForm.phone)
            data.append('bio', profileForm.bio)
            if (avatarFile) data.append('avatar', avatarFile)
            await updateProfile(data)
            await refreshUser()
            toast.success('Profile updated successfully!')
        } catch (err) {
            toast.error(err.response?.data?.error || 'Error updating profile')
        } finally {
            setProfileLoading(false)
        }
    }

    const handlePwSubmit = async e => {
        e.preventDefault()
        setPwError('')
        if (pwForm.new_password !== pwForm.confirm) {
            setPwError('New passwords do not match.')
            return
        }
        if (pwForm.new_password.length < 8) {
            setPwError('Password must be at least 8 characters.')
            return
        }
        setPwLoading(true)
        try {
            await changePassword({ current_password: pwForm.current_password, new_password: pwForm.new_password })
            toast.success('Password changed successfully!')
            setPwForm({ current_password: '', new_password: '', confirm: '' })
        } catch (err) {
            setPwError(err.response?.data?.error || 'Error changing password')
        } finally {
            setPwLoading(false)
        }
    }

    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

    return (
        <div className="max-w-2xl space-y-8 animate-fade-up">
            <div>
                <h1 className="font-display text-3xl font-bold text-forest">Profile Settings</h1>
                <p className="text-muted-foreground font-body mt-1 text-sm">Manage your account details.</p>
            </div>

            {/* Profile form */}
            <div className="bg-white border border-warm rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-forest" />
                    <h2 className="font-display text-lg font-semibold text-forest">Personal Info</h2>
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16" src={`${process.env.NEXT_PUBLIC_API_URL}${user?.avatar_url}`}>
                        <AvatarFallback className="bg-forest/15 text-forest text-xl font-semibold font-display">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <label htmlFor="avatar-upload" className="cursor-pointer">
                            <div className="inline-flex items-center gap-2 text-sm text-forest font-body hover:underline underline-offset-2">
                                <Upload className="w-3.5 h-3.5" />
                                {avatarFile ? avatarFile.name : 'Change profile picture'}
                            </div>
                        </label>
                        <input
                            id="avatar-upload"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={e => setAvatarFile(e.target.files[0])}
                        />
                        <p className="text-xs text-muted-foreground font-body mt-0.5">JPG, PNG or WEBP</p>
                    </div>
                </div>

                <Separator className="bg-warm-border" />

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground font-body">Full Name</Label>
                        <Input
                            value={profileForm.name}
                            onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                            className="border-warm bg-ivory focus-visible:ring-forest/30 font-body"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground font-body">Email</Label>
                        <Input
                            value={user?.email || ''}
                            disabled
                            className="border-warm bg-warm-sand font-body text-muted-foreground cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground font-body">Email cannot be changed.</p>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground font-body">Phone</Label>
                        <Input
                            value={profileForm.phone}
                            onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                            placeholder="+92 300 0000000"
                            className="border-warm bg-ivory focus-visible:ring-forest/30 font-body"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground font-body">Bio</Label>
                        <Textarea
                            value={profileForm.bio}
                            onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                            placeholder="Tell the community a bit about yourself..."
                            className="border-warm bg-ivory focus-visible:ring-forest/30 font-body resize-none"
                            rows={3}
                        />
                    </div>
                    <Button type="submit" disabled={profileLoading} className="bg-forest text-white hover:bg-forest-light font-body">
                        {profileLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </form>
            </div>

            {/* Password form */}
            <div className="bg-white border border-warm rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-forest" />
                    <h2 className="font-display text-lg font-semibold text-forest">Change Password</h2>
                </div>
                <form onSubmit={handlePwSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground font-body">Current Password</Label>
                        <Input
                            type="password"
                            value={pwForm.current_password}
                            onChange={e => setPwForm(p => ({ ...p, current_password: e.target.value }))}
                            required
                            className="border-warm bg-ivory focus-visible:ring-forest/30 font-body"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground font-body">New Password</Label>
                        <Input
                            type="password"
                            value={pwForm.new_password}
                            onChange={e => setPwForm(p => ({ ...p, new_password: e.target.value }))}
                            required
                            className="border-warm bg-ivory focus-visible:ring-forest/30 font-body"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground font-body">Confirm New Password</Label>
                        <Input
                            type="password"
                            value={pwForm.confirm}
                            onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                            required
                            className="border-warm bg-ivory focus-visible:ring-forest/30 font-body"
                        />
                    </div>
                    {pwError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                            <p className="text-sm text-red-700 font-body">{pwError}</p>
                        </div>
                    )}
                    <Button type="submit" disabled={pwLoading} variant="outline" className="border-warm text-forest hover:bg-warm-sand font-body">
                        {pwLoading ? 'Updating...' : 'Update Password'}
                    </Button>
                </form>
            </div>
        </div>
    )
}