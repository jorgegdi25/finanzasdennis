'use client'

import { useState, FormEvent, useEffect } from 'react'

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
}

/**
 * Form component to create or edit a transaction
 */
export default function TransactionForm({ transaction, onSuccess, onCancel }: TransactionFormProps) {
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
      setError('Please select an account')
      setLoading(false)
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount greater than 0')
      setLoading(false)
      return
    }

    try {
      const url = isEditing ? `/api/transactions/${transaction.id}` : '/api/transactions'
      const method = isEditing ? 'PUT' : 'POST'

      const requestBody = {
        type,
        amount: amountNum,
        description: description.trim() || null,
        accountId,
        debtId: type === 'expense' && debtId ? debtId : null,
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

      console.log('Transaction created successfully:', data)

      // Limpiar formulario solo si no estamos editando
      if (!isEditing) {
        setType('expense')
        setAmount('')
        setDescription('')
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

  if (loadingAccounts) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500">Loading accounts...</p>
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
        <p className="font-medium">No accounts available</p>
        <p className="text-sm mt-1">
          You need to create at least one account before adding transactions.
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

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          Transaction Type
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as 'income' | 'expense')}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      <div>
        <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-1">
          Account
        </label>
        <select
          id="accountId"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          required
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
        >
          <option value="">Select an account</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          Amount
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

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description (optional)
        </label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
          placeholder="e.g. Supermarket, Salary, etc."
        />
      </div>

      {type === 'expense' && debts.length > 0 && (
        <div>
          <label htmlFor="debtId" className="block text-sm font-medium text-gray-700 mb-1">
            Link to debt (optional)
          </label>
          <select
            id="debtId"
            value={debtId}
            onChange={(e) => setDebtId(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
          >
            <option value="">None - General expense</option>
            {debts.map((debt) => (
              <option key={debt.id} value={debt.id}>
                {debt.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            If you select a debt, this expense will be recorded as a payment towards it.
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || !accountId}
          className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : isEditing ? 'Update' : 'Create transaction'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
