'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n'

interface Account {
    id: string
    name: string
}

interface Debt {
    id: string
    name: string
}

interface RecurringTransactionFormProps {
    onSuccess: () => void
    onCancel: () => void
}

export default function RecurringTransactionForm({ onSuccess, onCancel }: RecurringTransactionFormProps) {
    const { t } = useTranslation()
    const [type, setType] = useState<'income' | 'expense'>('expense')
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')
    const [frequency, setFrequency] = useState('monthly')
    const [accountId, setAccountId] = useState('')
    const [debtId, setDebtId] = useState('')
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
    const [endDate, setEndDate] = useState('')

    const [accounts, setAccounts] = useState<Account[]>([])
    const [debts, setDebts] = useState<Debt[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [accRes, debtRes] = await Promise.all([
                    fetch('/api/accounts'),
                    fetch('/api/debts')
                ])
                if (accRes.ok) {
                    const accData = await accRes.json()
                    setAccounts(accData.accounts || [])
                    if (accData.accounts?.length > 0) setAccountId(accData.accounts[0].id)
                }
                if (debtRes.ok) {
                    const debtData = await debtRes.json()
                    setDebts(debtData.debts || [])
                }
            } catch (err) {
                console.error('Error fetching data for recurring form:', err)
            }
        }
        fetchData()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/recurring-transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    amount: parseFloat(amount),
                    description,
                    frequency,
                    accountId,
                    debtId: debtId || null, // Allow linking both income and expense
                    startDate,
                    endDate: endDate || null,
                }),
            })

            if (response.ok) {
                onSuccess()
            } else {
                const data = await response.json()
                setError(data.error || 'Error')
            }
        } catch (err) {
            setError('Connection error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('form.type')}</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option value="income">{t('form.typeIncome')}</option>
                        <option value="expense">{t('form.typeExpense')}</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('form.frequency')}</label>
                    <select
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option value="daily">{t('freq.daily')}</option>
                        <option value="weekly">{t('freq.weekly')}</option>
                        <option value="monthly">{t('freq.monthly')}</option>
                        <option value="yearly">{t('freq.yearly')}</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('form.amount')}</label>
                    <input
                        type="number"
                        step="0.01"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('form.startDate')}</label>
                    <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        {t('form.endDate')} <span className="text-gray-400 font-normal">{t('form.optional')}</span>
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">{t('form.description')}</label>
                <input
                    type="text"
                    required
                    placeholder={t('form.descriptionPlaceholder')}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">{t('form.account')}</label>
                <select
                    value={accountId}
                    required
                    onChange={(e) => setAccountId(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                    {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                </select>
            </div>

            {/* Link to Debt — available for BOTH income and expense */}
            {debts.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        {t('recurring.linkDebt')} <span className="text-gray-400 font-normal">{t('recurring.linkDebtHint')}</span>
                    </label>
                    <select
                        value={debtId}
                        onChange={(e) => setDebtId(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option value="">{t('recurring.none')}</option>
                        {debts.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    {t('form.cancel')}
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                    {loading ? t('form.saving') : t('form.scheduleTransaction')}
                </button>
            </div>
        </form>
    )
}
