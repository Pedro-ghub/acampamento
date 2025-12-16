import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import AdminPanel from '@/components/AdminPanel'
import { validateAdminKey } from '@/lib/kv'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

interface PageProps {
  searchParams: Promise<{ k?: string }> | { k?: string }
}

export default async function AdminPage(props: PageProps) {
  // Next.js 14+ pode retornar searchParams como Promise
  const searchParams = await Promise.resolve(props.searchParams)
  const key = searchParams.k || null

  console.log('🔍 AdminPage - Chave recebida:', key ? `${key.substring(0, 10)}...` : 'null')
  console.log('🔍 AdminPage - ADMIN_KEY configurada:', !!process.env.ADMIN_KEY)
  console.log('🔍 AdminPage - ADMIN_KEY valor:', process.env.ADMIN_KEY ? `${process.env.ADMIN_KEY.substring(0, 10)}...` : 'não configurada')

  // Validar chave - se não for válida, retornar 404
  const isValid = validateAdminKey(key)
  console.log('🔍 AdminPage - Validação resultou em:', isValid)
  
  if (!isValid) {
    console.error('❌ AdminPage - Chave inválida, retornando 404')
    notFound()
  }

  console.log('✅ AdminPage - Chave válida, renderizando AdminPanel')
  return <AdminPanel adminKey={key!} />
}

