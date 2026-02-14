'use client'

import { useState } from 'react'
import AppLayout from '@/components/AppLayout'
import RecurringTransactionForm from '@/components/RecurringTransactionForm'
import { Plus, Clock, ArrowUpCircle, ArrowDownCircle, Trash2, Calendar } from 'lucide-react'
import useSWR, { mutate } from 'swr'
import { fetcher } from '@/lib/fetcher'
import { useTranslation, type TranslationKey } from '@/lib/i18n'

export default function RecurringTransactionsPage() {
    const { t, locale } = useTranslation()
    const { data, error, isLoading } = useSWR('/api/recurring-transactions', fetcher)
    const [showForm, setShowForm] = useState(false)

    const recurring = data?.recurring || []

    const handleDelete = async (id: string) => {
        if (!confirm(t('recurring.confirmDelete'))) return
        try {
            const res = await fetch(`/api/recurring-transactions/${id}`, { method: 'DELETE' })
            if (res.ok) { mutate('/api/recurring-transactions') }
        } catch (err) { alert(t('recurring.deleteError')) }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(locale === 'es' ? 'es-CO' : 'en-US', {
            style: 'currency',
            currency: 'USD',
            currencyDisplay: 'narrowSymbol'
        }).format(amount)
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(locale === 'es' ? 'es-CO' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    const getFrequencyLabel = (f: string) => {
        const key = `freq.${f}` as TranslationKey
        return t(key)
    }

    return (
        <AppLayout>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('recurring.title')}</h1>
                    <p className="text-gray-500 mt-1">{t('recurring.subtitle')}</p>
                </div>
                <button
                    onClick={() => { setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                    <Plus className="w-5 h-5" />
                    {t('recurring.new')}
                </button>
            </div>

            {showForm && (
                <div id="recurring-form-container" className="mb-6 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-lg font-semibold mb-4">{t('recurring.scheduleNew')}</h2>
                    <RecurringTransactionForm
                        onSuccess={() => { setShowForm(false); mutate('/api/recurring-transactions') }}
                        onCancel={() => setShowForm(false)}
                    />
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>
            ) : recurring.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <div className="text-5xl mb-4">📅</div>
                    <h3 className="text-xl font-bold text-gray-900">{t('recurring.noSchedules')}</h3>
                    <p className="text-gray-500 mt-2">{t('recurring.noSchedulesDesc')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recurring.map((item: any) => (
                        <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2 rounded-lg ${item.type === 'income' ? 'bg-green-50' : 'bg-red-50'}`}>
                                    {item.type === 'income' ? <ArrowUpCircle className="w-5 h-5 text-green-600" /> : <ArrowDownCircle className="w-5 h-5 text-red-600" />}
                                </div>
                                <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <h3 className="font-semibold text-gray-900 mb-1">{item.description}</h3>
                            <p className={`text-2xl font-bold mb-4 tracking-tight ${item.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(item.amount)}
                            </p>

                            <div className="space-y-2 pt-4 border-t border-gray-100">
                                <div className="flex items-center text-sm text-gray-500 gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{t('recurring.frequency')} <span className="font-medium text-gray-700">{getFrequencyLabel(item.frequency)}</span></span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500 gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>{t('recurring.next')} <span className="font-medium text-gray-700">{formatDate(item.nextExecutionDate)}</span></span>
                                </div>
                                {item.endDate && (
                                    <div className="flex items-center text-sm text-gray-500 gap-2">
                                        <Clock className="w-4 h-4" />
                                        <span>{t('recurring.ends')} <span className="font-medium text-gray-700">{formatDate(item.endDate)}</span></span>
                                    </div>
                                )}
                                <p className="text-xs text-gray-400 mt-2">{t('recurring.account')} {item.account?.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AppLayout>
    )
}
