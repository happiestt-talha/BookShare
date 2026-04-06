export default function AuthLayout({ children }) {
    return (
        <div className="min-h-screen bg-ivory flex">
            {/* Left decorative panel */}
            <div className="hidden lg:flex w-1/2 bg-forest flex-col justify-between p-12">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sage/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <span className="font-display text-xl text-white font-semibold">BookShare</span>
                </div>

                <div className="space-y-6">
                    <blockquote className="font-display text-3xl text-white/90 leading-relaxed italic">
                        "A reader lives a thousand lives before he dies."
                    </blockquote>
                    <p className="text-sage font-body text-sm">— George R.R. Martin</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {[
                        { num: '500+', label: 'Books shared' },
                        { num: '200+', label: 'Members' },
                        { num: '1.2k+', label: 'Borrows' },
                    ].map(({ num, label }) => (
                        <div key={label}>
                            <p className="font-display text-2xl text-white font-semibold">{num}</p>
                            <p className="text-white/50 text-xs font-body mt-0.5">{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right form panel */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 mb-8 lg:hidden">
                        <div className="w-7 h-7 rounded-md bg-forest flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <span className="font-display text-lg text-forest font-semibold">BookShare</span>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    )
}