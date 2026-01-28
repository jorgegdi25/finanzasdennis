'use client'

import { useState } from 'react'

export default function TestTransactionsPage() {
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')

  const handleClick = () => {
    setMessage('Botón clickeado!')
    setShowForm(!showForm)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Prueba de Transacciones</h1>
        
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleClick}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            {showForm ? 'Ocultar Formulario' : 'Mostrar Formulario'}
          </button>

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {message}
            </div>
          )}

          {showForm && (
            <div className="bg-gray-50 border border-gray-200 rounded p-4">
              <p className="font-semibold">Formulario visible</p>
              <p className="text-sm text-gray-600 mt-2">
                Si ves esto, el estado está funcionando correctamente.
              </p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t">
            <a href="/transactions" className="text-indigo-600 hover:text-indigo-800">
              ← Volver a Transacciones
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
