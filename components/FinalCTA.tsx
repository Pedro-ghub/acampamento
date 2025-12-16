'use client'

import { useRouter } from 'next/navigation'

export default function FinalCTA() {
  const router = useRouter()

  const handleInscricao = () => {
    router.push('/formulario')
  }

  return (
    <>
      <div className="h-8"></div>
      <div className="sticky bottom-4 left-4 right-4 z-40 px-4">
        <div className="bg-blue-900 rounded-xl p-4 shadow-xl shadow-blue-900/20 border border-white/10 flex flex-col gap-3 animate-pulse-soft">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/10 rounded-full shrink-0">
              <span className="text-yellow-400 text-xl">✓</span>
            </div>
            <div className="flex flex-col">
              <p className="text-white font-bold text-sm leading-tight">Vagas limitadas!</p>
              <p className="text-white/70 text-xs leading-tight mt-1">
                Garanta a sua participação nesse tempo especial com Deus.
              </p>
            </div>
          </div>
          <button
            onClick={handleInscricao}
            className="w-full h-11 bg-white text-blue-900 font-bold text-sm rounded-full flex items-center justify-center gap-2 shadow-sm hover:bg-slate-50 transition-colors"
          >
            Inscrever agora
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}

