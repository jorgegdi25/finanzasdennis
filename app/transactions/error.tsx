'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log el error para debugging
    console.error('Error en página de transacciones:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mb-4">
            <span className="text-6xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Algo salió mal
          </h1>
          <p className="text-gray-600 mb-6">
            {error.message || 'Ocurrió un error al cargar las transacciones'}
          </p>
          
          {error.message?.includes('findMany') || error.message?.includes('Transaction') ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-yellow-800 mb-2">
                Solución:
              </p>
              <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1">
                <li>Reinicia completamente el servidor de desarrollo</li>
                <li>Verifica que ejecutaste: <code className="bg-yellow-100 px-1 rounded">npx prisma generate</code></li>
                <li>Verifica que la tabla Transaction existe en Supabase</li>
              </ol>
            </div>
          ) : null}

          <div className="flex gap-3 justify-center">
            <button
              onClick={reset}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Intentar de nuevo
            </button>
            <Link
              href="/dashboard"
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Volver al Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
