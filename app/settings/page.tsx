'use client'

import AppLayout from '@/components/AppLayout'
import PasswordChangeForm from '@/components/PasswordChangeForm'
import { useTranslation, type Locale } from '@/lib/i18n'
import { Globe } from 'lucide-react'

export default function SettingsPage() {
    const { t, locale, setLocale } = useTranslation()

    return (
        <AppLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
                <p className="text-gray-500">{t('settings.subtitle')}</p>
            </div>

            <div className="space-y-6">
                {/* Language Selector */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <Globe className="w-5 h-5 text-gray-700" />
                        <div>
                            <h3 className="font-semibold text-gray-900">{t('settings.language')}</h3>
                            <p className="text-sm text-gray-500">{t('settings.languageDesc')}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setLocale('en')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${locale === 'en'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            🇺🇸 {t('settings.english')}
                        </button>
                        <button
                            onClick={() => setLocale('es')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${locale === 'es'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            🇪🇸 {t('settings.spanish')}
                        </button>
                    </div>
                </div>

                <PasswordChangeForm />

                {/* Danger Zone */}
                <div className="bg-red-50 rounded-xl border border-red-200 p-6 shadow-sm">
                    <h3 className="font-semibold text-red-900 mb-2">Danger Zone</h3>
                    <p className="text-sm text-red-700 mb-4">
                        {t('settings.resetConfirm')}
                    </p>
                    <button
                        onClick={async () => {
                            if (confirm(t('settings.resetConfirm'))) {
                                const btn = document.getElementById('reset-btn') as HTMLButtonElement
                                if (btn) {
                                    btn.disabled = true
                                    btn.innerText = 'Resetting...'
                                }
                                try {
                                    const res = await fetch('/api/reset-demo', { method: 'POST' })
                                    if (res.ok) {
                                        window.location.href = '/dashboard'
                                    } else {
                                        alert('Error resetting data')
                                        if (btn) btn.disabled = false
                                    }
                                } catch (e) {
                                    alert('Connection error')
                                    if (btn) btn.disabled = false
                                }
                            }
                        }}
                        id="reset-btn"
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
                    >
                        {t('settings.resetDemo')}
                    </button>
                </div>
            </div>
        </AppLayout>
    )
}
