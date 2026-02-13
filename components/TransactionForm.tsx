'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n'

interface Account {
  id: string
  name: string
}

interface TransactionFormProps {
  transaction?: {
    id: string
    type: 'income' | 'expense'
    amount: number
    description: string | null
    accountId: string
    debtId?: string | null
  }
  onSuccess: () => void
  onCancel?: () => void
}

interface Debt {
  id: string
  name: string
  remainingAmount: number
}

/**
 * Form component to create or edit a transaction
 */
export default function TransactionForm({ transaction, onSuccess, onCancel }: TransactionFormProps) {
  const { t, locale } = useTranslation()
  const [type, setType] = useState<'income' | 'expense'>(transaction?.type || 'expense')
  const [amount, setAmount] = useState(transaction?.amount?.toString() || '')
  const [description, setDescription] = useState(transaction?.description || '')
  const [accountId, setAccountId] = useState(transaction?.accountId || '')
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [debtId, setDebtId] = useState(transaction?.debtId || '')
  const [debts, setDebts] = useState<Debt[]>([])

  // Recurrence states
  const [isRecurring, setIsRecurring] = useState(false)
  const [frequency, setFrequency] = useState('monthly')
  const [startDate, setStartDate] = useState(
    transaction?.id
      ? new Date().toISOString().split('T')[0] // Default to today for new recurrence
      : new Date().toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState('')

  const isEditing = !!transaction

  useEffect(() => {
    // Cargar cuentas disponibles
    const fetchAccounts = async () => {
      try {
        const response = await fetch('/api/accounts')
        if (response.ok) {
          const data = await response.json()
          const accountsList = data.accounts || []
          setAccounts(accountsList)
          // Si no hay accountId seleccionado y hay cuentas, seleccionar la primera
          if (!accountId && accountsList.length > 0) {
            setAccountId(accountsList[0].id)
          }
        }
      } catch (err) {
        console.error('Error loading accounts:', err)
        setError('Error loading accounts')
      } finally {
        setLoadingAccounts(false)
      }
    }

    const fetchDebts = async () => {
      try {
        const response = await fetch('/api/debts')
        if (response.ok) {
          const data = await response.json()
          setDebts(data.debts || [])
        }
      } catch (err) {
        console.error('Error loading debts:', err)
      }
    }

    fetchAccounts()
    fetchDebts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Solo ejecutar una vez al montar el componente

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Basic validation
    if (!accountId) {
      setError(t('tform.selectAccount'))
      setLoading(false)
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount greater than 0') // Can reuse or add key, but this is error msg
      setLoading(false)
      return
    }

    try {
      // Determinar URL y método basado en si es edición o si es recurrente
      let url = isEditing ? `/api/transactions/${transaction.id}` : '/api/transactions'
      let method = isEditing ? 'PUT' : 'POST'

      // Si es una creación y es recurrente, usamos el endpoint de transacciones recurrentes
      if (!isEditing && isRecurring) {
        url = '/api/recurring-transactions'
      }

      let requestBody: any = {
        type,
        amount: amountNum,
        description: description.trim() || null,
        accountId,
        debtId: type === 'expense' && debtId ? debtId : null,
      }

      // Añadir campos de recurrencia si aplica
      if (isRecurring && !isEditing) {
        requestBody = {
          ...requestBody,
          frequency,
          startDate,
          endDate: endDate || null,
        }
      }

      console.log('Enviando transacción:', requestBody)

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        let errorMessage = data.error || data.message || 'Error saving transaction'

        // Improve common error messages
        if (errorMessage.includes('no existe') || errorMessage.includes('does not exist') || errorMessage.includes('table')) {
          errorMessage = 'The Transaction table does not exist in the database. Run the SQL script in Supabase (create_transactions_table.sql)'
        } else if (errorMessage.includes('findMany') || errorMessage.includes('undefined')) {
          errorMessage = 'The Transaction model is not available. Restart the server after running: npx prisma generate'
        }

        console.error('Error creating transaction:', {
          status: response.status,
          error: errorMessage,
          details: data.details
        })

        setError(errorMessage)
        setLoading(false)
        return
      }

      // If we are editing AND the user checked "isRecurring", create the template too
      if (isEditing && isRecurring) {
        console.log('Creating recurring template from existing transaction...')
        await fetch('/api/recurring-transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            amount: amountNum,
            description: description.trim() || null,
            accountId,
            debtId: type === 'expense' && debtId ? debtId : null,
            frequency,
            startDate,
            endDate: endDate || null,
          }),
        })
      }

      console.log('Transaction processed successfully:', data)

      // Limpiar formulario solo si no estamos editando
      if (!isEditing) {
        setType('expense')
        setAmount('')
        setDescription('')
        setIsRecurring(false)
        if (accounts.length > 0) {
          setAccountId(accounts[0].id)
        }
      }
      onSuccess()
    } catch (err) {
      console.error('Form error:', err)
      const errorMessage = err instanceof Error
        ? `Error: ${err.message}`
        : 'Connection error. Please try again.'
      setError(errorMessage)
      setLoading(false)
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(locale === 'es' ? 'es-CO' : 'en-US', { style: 'currency', currency: 'USD' }).format(val)
  }

  if (loadingAccounts) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">{t('tform.loadingAccounts')}</p>
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
        <p className="font-medium">{t('tform.noAccounts')}</p>
        <p className="text-sm mt-1">
          {t('tform.noAccountsDesc')}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            {t('form.type')}
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as 'income' | 'expense')}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
          >
            <option value="expense">{t('transactions.expenses')}</option>
            <option value="income">{t('transactions.income')}</option>
          </select>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            {t('form.amount')}
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-1">
          {t('form.account')}
        </label>
        <select
          id="accountId"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          required
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
        >
          <option value="">{t('tform.selectAccount')}</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          {t('form.description')} {t('form.optional')}
        </label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
          placeholder={t('form.descriptionPlaceholder')}
        />
      </div>

      {type === 'expense' && debts.length > 0 && (
        <div>
          <label htmlFor="debtId" className="block text-sm font-medium text-gray-700 mb-1">
            {t('tform.linkDebt')}
          </label>
          <select
            id="debtId"
            value={debtId}
            onChange={(e) => setDebtId(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
          >
            <option value="">{t('tform.generalExpense')}</option>
            {debts.map((debt) => (
              <option key={debt.id} value={debt.id}>
                {debt.name}
              </option>
            ))}
          </select>
          {debtId && (
            <p className="mt-2 text-sm font-medium text-indigo-600 bg-indigo-50 p-2 rounded">
              {t('tform.currentBalance')} {formatCurrency(debts.find(d => d.id === debtId)?.remainingAmount || 0)}
            </p>
          )}
        </div>
      )}

      {/* Recurrence Toggle - Now available during edit too */}
      <div className="pt-2">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="sr-only peer"
          />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          <span className="ms-3 text-sm font-medium text-gray-900">
            {isEditing ? t('tform.convertToRecurring') : t('tform.isRecurring')}
          </span>
        </label>

        {isRecurring && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                {t('form.frequency')}
              </label>
              <select
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="daily">{t('freq.daily')}</option>
                <option value="weekly">{t('freq.weekly')}</option>
                <option value="monthly">{t('freq.monthly')}</option>
                <option value="yearly">{t('freq.yearly')}</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.startDate')}
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required={isRecurring}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.endDate')} <span className="text-gray-400 font-normal">{t('form.optional')}</span>
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {isEditing
                ? t('tform.recurringUpdateHint')
                : t('tform.recurringCreateHint')}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading || !accountId}
          className="flex-1 bg-black text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? t('form.saving') : isEditing ? t('tform.updateTransaction') : isRecurring ? t('tform.createRecurring') : t('tform.createTransaction')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 transition-colors"
          >
            {t('form.cancel')}
          </button>
        )}
      </div>
    </form>
  )
}
