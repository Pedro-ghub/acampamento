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
  searchParams: { k?: string }
}

export default function AdminPage({ searchParams }: PageProps) {
  const key = searchParams.k || null

  // Validar chave - se não for válida, retornar 404
  if (!validateAdminKey(key)) {
    notFound()
  }

  return <AdminPanel adminKey={key!} />
}

