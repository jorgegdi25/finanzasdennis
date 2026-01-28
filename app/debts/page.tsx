'use client'

import { useState } from 'react'
import AppLayout from '@/components/AppLayout'
import DebtCard from '@/components/DebtCard'
import DebtForm from '@/components/DebtForm'
import { Plus, DollarSign, CheckCircle, AlertCircle } from 'lucide-react'
import useSWR, { mutate } from 'swr'
import { fetcher } from '@/lib/fetcher'

interface Debt {
    id: string
    name: string
    totalAmount: number
    paidAmount: number
    remainingAmount: number
    dueDate: string | null
    categoryId: string
    category: {
        id: string
        name: string
    }
}

export default function DebtsPage() {
    const { data, error: swrError, isLoading } = useSWR('/api/debts', fetcher)
    const [showForm, setShowForm] = useState(false)
    const [editingDebt, setEditingDebt] = useState<Debt | null>(null)

    const debts: Debt[] = data?.debts || []
    const error = swrError?.message || null

    const handleSuccess = () => {
        setShowForm(false)
        setEditingDebt(null)
        mutate('/api/debts')
    }

    const totalDebt = debts.reduce((sum, d) => sum + d.totalAmount, 0)
    const totalPaid = debts.reduce((sum, d) => sum + d.paidAmount, 0)
    const totalRemaining = totalDebt - totalPaid

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
    }

    return (
        <AppLayout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Debts & Payments</h1>
                    <p className="text-gray-500 mt-1">Track your debts and payment progress</p>
                </div>
                <button
                    onClick={() => { setEditingDebt(null); setShowForm(true) }}
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Add Debt
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="mb-6 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-lg font-semibold mb-4">
                        {editingDebt ? 'Edit Debt' : 'New Debt'}
                    </h2>
                    <DebtForm
                        debt={editingDebt}
                        onSuccess={handleSuccess}
                        onCancel={() => setShowForm(false)}
                    />
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-gray-50 rounded-lg">
                            <DollarSign className="w-5 h-5 text-gray-900" />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Total Debt</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 tracking-tight">{formatCurrency(totalDebt)}</p>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Total Paid</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600 tracking-tight">{formatCurrency(totalPaid)}</p>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-red-50 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Remaining Balance</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600 tracking-tight">{formatCurrency(totalRemaining)}</p>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded text-red-700">
                    {error}
                </div>
            )}

            {/* Debts Grid */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
            ) : debts.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <div className="text-5xl mb-4">🏠</div>
                    <h3 className="text-xl font-bold text-gray-900">No debts registered</h3>
                    <p className="text-gray-500 mt-2">Add your first debt to track your payments</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {debts.map((debt) => (
                        <DebtCard
                            key={debt.id}
                            debt={debt}
                            onEdit={(d) => {
                                setEditingDebt(d)
                                setShowForm(true)
                            }}
                        />
                    ))}
                </div>
            )}
        </AppLayout>
    )
}
