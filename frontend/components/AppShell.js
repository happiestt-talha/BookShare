'use client'
import Sidebar from './Sidebar'

export default function AppShell({ children }) {
    return (
        <div className="min-h-screen bg-ivory">
            <Sidebar />
            <main className="ml-60 min-h-screen">
                <div className="max-w-6xl mx-auto px-8 py-8">
                    {children}
                </div>
            </main>
        </div>
    )
}