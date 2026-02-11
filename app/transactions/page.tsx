'use client'

import { useState } from 'react'
import AppLayout from '@/components/AppLayout'
import TransactionCard from '@/components/TransactionCard'
import TransactionForm from '@/components/TransactionForm'
import { Plus, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react'
import useSWR, { mutate } from 'swr'
import { fetcher } from '@/lib/fetcher'

interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string | null
  accountId: string
  account: { id: string; name: string }
  createdAt: string
}

export default function TransactionsPage() {
  const { data, error: swrError, isLoading } = useSWR('/api/transactions', fetcher)
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')

  const transactions: Transaction[] = data?.transactions || []
  const error = swrError?.message || null

  const handleSuccess = () => {
    setShowForm(false)
    setEditingTransaction(null)
    mutate('/api/transactions')
    mutate('/api/accounts')
  }

  const filteredTransactions = transactions.filter(t => filter === 'all' || t.type === filter)

  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const net = income - expenses

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        mutate('/api/transactions');
        mutate('/api/accounts');
      }
    } catch (err) {
      alert('Error deleting');
    }
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500 mt-1">Record income and expenses</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          New Transaction
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="mb-6 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">
            {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
          </h2>
          <TransactionForm
            transaction={editingTransaction || undefined}
            onSuccess={handleSuccess}
            onCancel={() => {
              setShowForm(false)
              setEditingTransaction(null)
            }}
          />
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <ArrowUpRight className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500 font-medium">Income</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">{formatCurrency(income)}</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <ArrowDownRight className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-500 font-medium">Expenses</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 tracking-tight">{formatCurrency(expenses)}</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-gray-900" />
            </div>
            <span className="text-sm text-gray-500 font-medium">Net Balance</span>
          </div>
          <p className={`text-2xl font-bold tracking-tight ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(net)}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'income', 'expense'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === type
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
          >
            {type === 'all' ? 'All' : type === 'income' ? 'Income' : 'Expenses'}
          </button>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded text-red-700">
          {error}
        </div>
      )}

      {/* Transactions List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-gray-900">No transactions</h3>
          <p className="text-gray-500 mt-2">Record your first transaction</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onDelete={handleDelete}
              onEdit={(t) => {
                setEditingTransaction(t as Transaction)
                setShowForm(true)
              }}
            />
          ))}
        </div>
      )}
    </AppLayout>
  )
}
