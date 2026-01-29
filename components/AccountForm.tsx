'use client'

import { useState, FormEvent } from 'react'

interface AccountFormProps {
  account?: {
    id: string
    name: string
    balance: number
  }
  onSuccess: () => void
  onCancel?: () => void
}

/**
 * Form component to create or edit a bank account
 */
export default function AccountForm({ account, onSuccess, onCancel }: AccountFormProps) {
  const [name, setName] = useState(account?.name || '')
  const [balance, setBalance] = useState(account?.balance?.toString() || '0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEditing = !!account

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = isEditing ? `/api/accounts/${account.id}` : '/api/accounts'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          balance: parseFloat(balance) || 0,
        }),
      })

      if (!response.ok) {
        let errorMessage = 'Error saving account'
        try {
          const data = await response.json()
          errorMessage = data.error || data.message || errorMessage
        } catch (parseError) {
          // If JSON parsing fails, use status text
          errorMessage = `Error ${response.status}: ${response.statusText}`
        }
        setError(errorMessage)
        setLoading(false)
        return
      }

      const data = await response.json()

      // Limpiar formulario solo si no estamos editando
      if (!isEditing) {
        setName('')
        setBalance('0')
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Account Name
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
          placeholder="e.g. Savings Account, Credit Card, etc."
        />
      </div>

      <div>
        <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-1">
          Initial Balance
        </label>
        <input
          id="balance"
          type="number"
          step="0.01"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
          placeholder="0.00"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : isEditing ? 'Update' : 'Create account'}
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
