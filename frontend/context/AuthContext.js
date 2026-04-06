'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getMe, logout as apiLogout } from '@/lib/api'
import { useRouter } from 'next/navigation'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const fetchUser = useCallback(async () => {
        try {
            const res = await getMe()
            setUser(res.data.user)
        } catch {
            setUser(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchUser()
    }, [fetchUser])

    const logout = async () => {
        try {
            await apiLogout()
        } catch { }
        setUser(null)
        router.push('/')
    }

    const refreshUser = () => fetchUser()

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}