'use client'

import { useState, useMemo } from 'react'
import AppLayout from '@/components/AppLayout'
import TransactionCard from '@/components/TransactionCard'
import TransactionForm from '@/components/TransactionForm'
import { Plus, ArrowUpRight, ArrowDownRight, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react'
import useSWR, { mutate } from 'swr'
import { fetcher } from '@/lib/fetcher'
import { useTranslation, type TranslationKey } from '@/lib/i18n'

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
  const { t, locale } = useTranslation()
  const { data, error: swrError, isLoading } = useSWR('/api/transactions', fetcher)
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')

  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth())
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())

  const transactions: Transaction[] = data?.transactions || []
  const error = swrError?.message || null

  const handleSuccess = () => {
    setShowForm(false)
    setEditingTransaction(null)
    mutate('/api/transactions')
    mutate('/api/accounts')
  }

  const monthName = t(`month.${selectedMonth}` as TranslationKey)

  const monthFiltered = useMemo(() => {
    return transactions.filter(tr => {
      const d = new Date(tr.createdAt)
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
    })
  }, [transactions, selectedMonth, selectedYear])

  const filteredTransactions = monthFiltered.filter(tr => filter === 'all' || tr.type === filter)

  const income = monthFiltered.filter(tr => tr.type === 'income').reduce((sum, tr) => sum + tr.amount, 0)
  const expenses = monthFiltered.filter(tr => tr.type === 'expense').reduce((sum, tr) => sum + tr.amount, 0)
  const net = income - expenses

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('transactions.confirmDelete'))) return
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
      if (res.ok) { mutate('/api/transactions'); mutate('/api/accounts') }
    } catch (err) {
      alert(t('transactions.deleteError'))
    }
  }

  const goToPrevMonth = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1) }
    else { setSelectedMonth(m => m - 1) }
  }

  const goToNextMonth = () => {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1) }
    else { setSelectedMonth(m => m + 1) }
  }

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('transactions.title')}</h1>
          <p className="text-gray-500 mt-1">{t('transactions.subtitle')}</p>
        </div>
        <button
          onClick={() => { setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          {t('transactions.new')}
        </button>
      </div>

      {showForm && (
        <div id="transaction-form-container" className="mb-6 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">
            {editingTransaction ? t('transactions.edit') : t('transactions.new')}
          </h2>
          <TransactionForm
            transaction={editingTransaction || undefined}
            onSuccess={handleSuccess}
            onCancel={() => { setShowForm(false); setEditingTransaction(null) }}
          />
        </div>
      )}

      {/* Month Selector */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button onClick={goToPrevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-bold text-gray-900 min-w-[200px] text-center">
          {monthName} {selectedYear}
        </h2>
        <button onClick={goToNextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-50 rounded-lg"><ArrowUpRight className="w-5 h-5 text-green-600" /></div>
            <span className="text-sm text-gray-500 font-medium">{t('transactions.income')}</span>
          </div>
          <p className="text-2xl font-bold text-green-600 tracking-tight">{formatCurrency(income)}</p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-50 rounded-lg"><ArrowDownRight className="w-5 h-5 text-red-600" /></div>
            <span className="text-sm text-gray-500 font-medium">{t('transactions.expenses')}</span>
          </div>
          <p className="text-2xl font-bold text-red-600 tracking-tight">{formatCurrency(expenses)}</p>
        </div>
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gray-50 rounded-lg"><TrendingUp className="w-5 h-5 text-gray-900" /></div>
            <span className="text-sm text-gray-500 font-medium">{t('transactions.netBalance')}</span>
          </div>
          <p className={`text-2xl font-bold tracking-tight ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(net)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'income', 'expense'] as const).map((type) => (
          <button key={type} onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === type ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            {type === 'all' ? t('transactions.all') : type === 'income' ? t('transactions.incomeFilter') : t('transactions.expenseFilter')}
          </button>
        ))}
      </div>

      {error && <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded text-red-700">{error}</div>}

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>
      ) : filteredTransactions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-gray-900">{t('transactions.noTransactions')}</h3>
          <p className="text-gray-500 mt-2">{t('transactions.noTransactionsFor', { month: monthName, year: String(selectedYear) })}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTransactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} onDelete={handleDelete}
              onEdit={(tr) => { setEditingTransaction(tr as Transaction); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
          ))}
        </div>
      )}
    </AppLayout>
  )
}
