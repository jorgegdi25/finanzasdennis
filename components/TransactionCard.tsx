'use client'

import { useState } from 'react'

interface TransactionCardProps {
  transaction: {
    id: string
    type: 'income' | 'expense'
    amount: number
    description: string | null
    accountId: string
    account: {
      id: string
      name: string
    }
    createdAt: string
  }
  onDelete: (id: string) => void
  onEdit?: (transaction: TransactionCardProps['transaction']) => void
}

/**
 * Componente de tarjeta para mostrar una transacción
 */
export default function TransactionCard({ transaction, onDelete, onEdit }: TransactionCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onDelete(transaction.id)
      } else {
        let errorMessage = 'Error al eliminar la transacción'
        try {
          const data = await response.json()
          errorMessage = data.error || errorMessage
        } catch (parseError) {
          errorMessage = `Error ${response.status}: ${response.statusText}`
        }
        alert(errorMessage)
      }
    } catch (error) {
      console.error('Error al eliminar:', error)
      const errorMsg = error instanceof Error ? error.message : 'Error de conexión'
      alert(`Error: ${errorMsg}. Por favor intenta de nuevo.`)
    } finally {
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isIncome = transaction.type === 'income'

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
      isIncome ? 'border-green-500' : 'border-red-500'
    } hover:shadow-lg transition-shadow`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              isIncome 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isIncome ? 'Ingreso' : 'Gasto'}
            </span>
            <span className="text-sm text-gray-500">
              {transaction.account.name}
            </span>
          </div>
          {transaction.description && (
            <p className="text-gray-900 font-medium mb-1">
              {transaction.description}
            </p>
          )}
          <p className="text-xs text-gray-500">
            {formatDate(transaction.createdAt)}
          </p>
        </div>
        <div className="flex gap-2 ml-4">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(transaction)
              }}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Editar
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete()
            }}
            disabled={isDeleting}
            className={`text-red-600 hover:text-red-800 text-sm font-medium ${
              showConfirm ? 'bg-red-50 px-3 py-1 rounded' : ''
            } disabled:opacity-50`}
          >
            {showConfirm ? (isDeleting ? 'Eliminando...' : '¿Confirmar?') : 'Eliminar'}
          </button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Monto:</span>
          <span
            className={`text-2xl font-bold ${
              isIncome ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isIncome ? '+' : '-'}{formatAmount(transaction.amount)}
          </span>
        </div>
      </div>
    </div>
  )
}
