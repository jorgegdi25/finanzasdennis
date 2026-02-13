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
            </div>
        </AppLayout>
    )
}
