'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n'

interface Category {
    id: string
    name: string
}

interface DebtFormProps {
    debt?: any
    onSuccess: () => void
    onCancel: () => void
}

export default function DebtForm({ debt, onSuccess, onCancel }: DebtFormProps) {
    const { t } = useTranslation()
    const [name, setName] = useState(debt?.name || '')
    const [totalAmount, setTotalAmount] = useState(debt?.totalAmount || '')
    const [totalInstallments, setTotalInstallments] = useState(debt?.totalInstallments?.toString() || '')
    const [categoryId, setCategoryId] = useState(debt?.categoryId || '')
    const [dueDate, setDueDate] = useState(debt?.dueDate ? new Date(debt.dueDate).toISOString().split('T')[0] : '')

    const [categories, setCategories] = useState<Category[]>([])
    const [newCategoryName, setNewCategoryName] = useState('')
    const [showAddCategory, setShowAddCategory] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/debt-categories')
            if (response.ok) {
                const data = await response.json()
                setCategories(data.categories || [])
                if (data.categories.length > 0 && !categoryId) {
                    setCategoryId(data.categories[0].id)
                }
            }
        } catch (error) {
            console.error('Error loading categories:', error)
        }
    }

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return
        setLoading(true)
        try {
            const response = await fetch('/api/debt-categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategoryName })
            })
            if (response.ok) {
                const data = await response.json()
                setCategories([...categories, data.category])
                setCategoryId(data.category.id)
                setNewCategoryName('')
                setShowAddCategory(false)
            }
        } catch (err) {
            console.error('Error adding category:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const url = debt ? `/api/debts/${debt.id}` : '/api/debts'
            const method = debt ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    totalAmount: parseFloat(totalAmount),
                    totalInstallments: totalInstallments ? parseInt(totalInstallments) : null,
                    categoryId,
                    dueDate: dueDate || null
                })
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
            {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.name')}</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Bank Loan, Provider Debt"
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.totalAmount')}</label>
                    <input
                        type="number"
                        step="0.01"
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="0.00"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.totalInstallments')}</label>
                    <input
                        type="number"
                        step="1"
                        min="1"
                        value={totalInstallments}
                        onChange={(e) => setTotalInstallments(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="e.g. 12, 24"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.dueDate')}</label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.category')}</label>
                <div className="flex gap-2">
                    {!showAddCategory ? (
                        <>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                required
                            >
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => setShowAddCategory(true)}
                                className="px-4 py-2 text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50"
                            >
                                {t('form.newCategory')}
                            </button>
                        </>
                    ) : (
                        <>
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder={t('form.category')}
                            />
                            <button
                                type="button"
                                onClick={handleAddCategory}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                {t('form.addCategory')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowAddCategory(false)}
                                className="px-4 py-2 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                                {t('form.cancel')}
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                    {loading ? t('form.saving') : debt ? t('form.update') : t('form.save')}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                >
                    {t('form.cancel')}
                </button>
            </div>
        </form>
    )
}
