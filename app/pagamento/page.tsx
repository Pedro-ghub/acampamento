'use client'

import { Suspense } from 'react'
import Header from '@/components/Header'
import PagamentoPix from '@/components/PagamentoPix'
import PagamentoContent from '@/components/PagamentoContent'

export default function PagamentoPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-600">Carregando...</p>
        </div>
      }>
        <PagamentoContent />
      </Suspense>
      <footer className="w-full bg-gray-900 text-white py-8 px-4 text-center">
        <p className="text-gray-400 text-sm">
          © 2026 Jardins de Genebra. Todos os direitos reservados.
        </p>
      </footer>
    </main>
  )
}


