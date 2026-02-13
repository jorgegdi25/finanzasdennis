'use client'

import { useState } from 'react'
import AppLayout from '@/components/AppLayout'
import AccountCard from '@/components/AccountCard'
import AccountForm from '@/components/AccountForm'
import { Plus } from 'lucide-react'
import useSWR, { mutate } from 'swr'
import { fetcher } from '@/lib/fetcher'
import { useTranslation } from '@/lib/i18n'

interface Account {
  id: string
  name: string
  balance: number
  createdAt: string
  updatedAt: string
}

export default function AccountsPage() {
  const { t, locale } = useTranslation()
  const { data, error: swrError, isLoading } = useSWR('/api/accounts', fetcher)
  const [showForm, setShowForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)

  const accounts: Account[] = data?.accounts || []
  const error = swrError?.message || null

  const handleSuccess = () => {
    setShowForm(false)
    setEditingAccount(null)
    mutate('/api/accounts')
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('accounts.confirmDelete'))) return
    try {
      const res = await fetch(`/api/accounts/${id}`, { method: 'DELETE' })
      if (res.ok) {
        mutate('/api/accounts')
      }
    } catch (err) {
      alert(t('accounts.deleteError'))
    }
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('accounts.title')}</h1>
          <p className="text-gray-500 mt-1">{t('accounts.subtitle')}</p>
        </div>
        <button
          onClick={() => { setEditingAccount(null); setShowForm(true) }}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          {t('accounts.new')}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">
            {editingAccount ? t('accounts.edit') : t('accounts.new')}
          </h2>
          <AccountForm
            account={editingAccount || undefined}
            onSuccess={handleSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
        <p className="text-sm font-medium text-gray-500">{t('accounts.totalBalance')}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">
          {new Intl.NumberFormat(locale === 'es' ? 'es-CO' : 'en-US', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
          }).format(totalBalance)}
        </p>
        <p className="text-sm text-gray-500 mt-2">{t('accounts.count', { n: accounts.length })}</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded text-red-700">{error}</div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : accounts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-4">🏦</div>
          <h3 className="text-xl font-bold text-gray-900">{t('accounts.noAccounts')}</h3>
          <p className="text-gray-500 mt-2">{t('accounts.noAccountsDesc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={(acc) => { setEditingAccount(acc); setShowForm(true) }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </AppLayout>
  )
}
