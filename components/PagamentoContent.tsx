'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import PagamentoPix from './PagamentoPix'

export default function PagamentoContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [inscricaoId, setInscricaoId] = useState<string | null>(null)

  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      setInscricaoId(id)
    } else {
      // Se não tiver ID, redirecionar para formulário
      router.push('/formulario')
    }
  }, [searchParams, router])

  if (!inscricaoId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-600">Carregando...</p>
      </div>
    )
  }

  return <PagamentoPix inscricaoId={inscricaoId} />
}


