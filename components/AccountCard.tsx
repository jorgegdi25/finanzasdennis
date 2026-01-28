'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AccountCardProps {
  account: {
    id: string
    name: string
    balance: number
    createdAt: string
    updatedAt: string
  }
  onDelete: (id: string) => void
  onEdit?: (account: AccountCardProps['account']) => void
}

/**
 * Componente de tarjeta para mostrar una cuenta bancaria
 */
export default function AccountCard({ account, onDelete, onEdit }: AccountCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/accounts/${account.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onDelete(account.id)
      } else {
        let errorMessage = 'Error al eliminar la cuenta'
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

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(balance)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{account.name}</h3>
          <p className="text-sm text-gray-500 mt-1">
            Creada el {formatDate(account.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(account)
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
            className={`text-red-600 hover:text-red-800 text-sm font-medium ${showConfirm ? 'bg-red-50 px-3 py-1 rounded' : ''
              } disabled:opacity-50`}
          >
            {showConfirm ? (isDeleting ? 'Eliminando...' : '¿Confirmar?') : 'Eliminar'}
          </button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Balance:</span>
          <span
            className={`text-2xl font-bold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
          >
            {formatBalance(account.balance)}
          </span>
        </div>
      </div>
    </div>
  )
}
