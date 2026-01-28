import { redirect } from 'next/navigation'

/**
 * Página inicial
 * 
 * Redirige a /login
 */
export default function Home() {
  redirect('/login')
}
