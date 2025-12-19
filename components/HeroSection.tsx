'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function HeroSection() {
  const router = useRouter()

  const handleInscricao = () => {
    router.push('/formulario')
  }

  return (
    <div className="p-4 pb-0">
      <div className="relative w-full overflow-hidden rounded-xl bg-blue-900 shadow-xl group">
        {/* Imagem de fundo */}
        <div className="absolute inset-0">
          <Image
            src="/images/foto1.jpg"
            alt="Acampamento de Carnaval 2026 - Vazio"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
          />
        </div>
        
        {/* Conteúdo */}
        <div className="relative flex flex-col items-center justify-center text-center p-8 pt-24 gap-6">
          {/* Badge Edição */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs font-medium tracking-wide">
            <span className="text-yellow-400">✨</span>
            Edição 2026
          </div>
          
          {/* Título */}
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-sm leading-tight">
              Acampamento de <br/>
              <span className="text-yellow-400">Carnaval 2026</span>
            </h1>
            <h2 className="text-lg md:text-xl font-medium text-white/90">
              Vazio
            </h2>
          </div>
          
          {/* Badges de informação */}
          <div className="flex flex-wrap justify-center gap-2 w-full max-w-[280px]">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/30 rounded-lg backdrop-blur-sm text-xs text-white/90 border border-white/10">
              <span>📅</span>
              14 - 16 de fevereiro
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/30 rounded-lg backdrop-blur-sm text-xs text-white/90 border border-white/10">
              <span>📍</span>
              Quintal do Sol
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/30 rounded-lg backdrop-blur-sm text-xs text-white/90 border border-white/10">
              <span>👥</span>
              12+ anos
            </div>
          </div>
          
          {/* Botão CTA */}
          <div className="pt-2 w-full">
            <button
              onClick={handleInscricao}
              className="w-full flex items-center justify-center gap-2 h-12 bg-yellow-400 hover:bg-yellow-500 text-slate-900 text-base font-bold rounded-full shadow-lg shadow-yellow-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Realizar inscrição</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

