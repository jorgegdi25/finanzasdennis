'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Componente de botón de logout
 * 
 * Maneja el cierre de sesión y redirige al login
 */
export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    } finally {
      // Siempre redirigir, usar replace para evitar que pueda volver atrás
      router.replace('/login')
      // También forzar recarga completa como respaldo
      setTimeout(() => {
        window.location.href = window.location.origin + '/login'
      }, 200)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Cerrando...' : 'Cerrar sesión'}
    </button>
  )
}
