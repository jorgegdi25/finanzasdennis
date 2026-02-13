'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { useTranslation, type Locale } from '@/lib/i18n'
import {
    LayoutDashboard,
    Wallet,
    ArrowLeftRight,
    CreditCard,
    Calendar,
    LogOut,
    Menu,
    X,
    Settings,
    Globe
} from 'lucide-react'

export default function Sidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const { t, locale, setLocale } = useTranslation()

    const navItems = [
        { href: '/dashboard', label: t('nav.panel'), icon: LayoutDashboard },
        { href: '/accounts', label: t('nav.accounts'), icon: Wallet },
        { href: '/transactions', label: t('nav.transactions'), icon: ArrowLeftRight },
        { href: '/debts', label: t('nav.debts'), icon: CreditCard },
        { href: '/recurring', label: t('nav.recurring'), icon: Calendar },
        { href: '/settings', label: t('nav.settings'), icon: Settings },
    ]

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        window.location.href = '/login'
    }

    return (
        <>
            {/* Mobile hamburger button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 h-full bg-gray-50 border-r border-gray-200 z-40
        w-64 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static
      `}>
                <div className="flex flex-col h-full">
                    {/* Logo/Brand */}
                    <div className="p-6 border-b border-gray-100 bg-white">
                        <div className="flex items-center gap-3">
                            <div className="bg-black text-white p-2 rounded-lg shadow-sm">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M15 9H9V15H15M12 9V15M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-none">Finance</h1>
                                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mt-1">Pro Control</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href
                            const Icon = item.icon

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                    ${isActive
                                            ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                        }
                  `}
                                >
                                    <Icon size={18} className={isActive ? 'text-gray-900' : 'text-gray-400'} />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Footer with Language and logout */}
                    <div className="p-4 border-t border-gray-100 space-y-2">
                        {/* Language Toggle */}
                        <div className="flex bg-gray-200 rounded-lg p-1 mb-2">
                            <button
                                onClick={() => setLocale('en')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all ${locale === 'en'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <span>🇺🇸</span> EN
                            </button>
                            <button
                                onClick={() => setLocale('es')}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-all ${locale === 'es'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <span>🇪🇸</span> ES
                            </button>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                            <LogOut size={20} />
                            <span>{t('nav.logout')}</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}
