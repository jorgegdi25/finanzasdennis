'use client'

import { useState } from 'react'
import Link from 'next/link'

/**
 * Página de diagnóstico para transacciones
 */
export default function TransactionsDebugPage() {
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runDiagnostics = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/transactions/test')
      const data = await response.json()
      setDiagnostics(data)
    } catch (error) {
      setDiagnostics({
        error: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Diagnóstico de Transacciones</h1>
          
          <button
            onClick={runDiagnostics}
            disabled={loading}
            className="mb-6 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Ejecutando diagnóstico...' : 'Ejecutar Diagnóstico'}
          </button>

          {diagnostics && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <h2 className="font-semibold mb-2">Resultados del Diagnóstico:</h2>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(diagnostics, null, 2)}
                </pre>
              </div>

              {diagnostics.diagnostics && (
                <div className="space-y-2">
                  <div className={`p-3 rounded ${diagnostics.diagnostics.session === 'OK' ? 'bg-green-50' : 'bg-red-50'}`}>
                    <strong>Sesión:</strong> {diagnostics.diagnostics.session}
                  </div>
                  
                  <div className={`p-3 rounded ${diagnostics.diagnostics.prismaAvailable ? 'bg-green-50' : 'bg-red-50'}`}>
                    <strong>Prisma disponible:</strong> {diagnostics.diagnostics.prismaAvailable ? 'Sí' : 'No'}
                  </div>
                  
                  <div className={`p-3 rounded ${diagnostics.diagnostics.transactionModelAvailable ? 'bg-green-50' : 'bg-red-50'}`}>
                    <strong>Modelo Transaction disponible:</strong> {diagnostics.diagnostics.transactionModelAvailable ? 'Sí' : 'No'}
                  </div>
                  
                  {diagnostics.diagnostics.tableExists !== undefined && (
                    <div className={`p-3 rounded ${diagnostics.diagnostics.tableExists ? 'bg-green-50' : 'bg-red-50'}`}>
                      <strong>Tabla existe en BD:</strong> {diagnostics.diagnostics.tableExists ? 'Sí' : 'No'}
                      {!diagnostics.diagnostics.tableExists && (
                        <div className="mt-2 text-sm">
                          <p className="font-semibold">Solución:</p>
                          <p>Ejecuta el script SQL en Supabase: <code className="bg-gray-200 px-1 rounded">create_transactions_table.sql</code></p>
                        </div>
                      )}
                    </div>
                  )}

                  {diagnostics.diagnostics.tableError && (
                    <div className="p-3 rounded bg-yellow-50">
                      <strong>Error de tabla:</strong> {diagnostics.diagnostics.tableError}
                      <br />
                      <strong>Código:</strong> {diagnostics.diagnostics.errorCode}
                    </div>
                  )}
                </div>
              )}

              {diagnostics.error && (
                <div className="p-4 bg-red-50 rounded">
                  <strong className="text-red-800">Error:</strong>
                  <p className="text-red-700">{diagnostics.error}</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 pt-6 border-t">
            <Link
              href="/transactions"
              className="text-indigo-600 hover:text-indigo-800"
            >
              ← Volver a Transacciones
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
