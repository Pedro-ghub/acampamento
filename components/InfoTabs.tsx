'use client'

import { useState } from 'react'

export default function InfoTabs() {
  const [activeTab, setActiveTab] = useState<'descricao' | 'informacoes'>('descricao')

  return (
    <section className="w-full bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Sistema de Abas */}
        <div className="flex border-b-2 border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('descricao')}
            className={`flex-1 py-4 px-6 text-center font-semibold text-lg transition-all duration-300 ${
              activeTab === 'descricao'
                ? 'text-red-600 border-b-4 border-red-600 bg-red-50'
                : 'text-gray-600 hover:text-red-500 hover:bg-gray-50'
            }`}
          >
            Descrição
          </button>
          <button
            onClick={() => setActiveTab('informacoes')}
            className={`flex-1 py-4 px-6 text-center font-semibold text-lg transition-all duration-300 ${
              activeTab === 'informacoes'
                ? 'text-red-600 border-b-4 border-red-600 bg-red-50'
                : 'text-gray-600 hover:text-red-500 hover:bg-gray-50'
            }`}
          >
            Informações adicionais
          </button>
        </div>

        {/* Conteúdo das Abas */}
        <div className="min-h-[400px]">
          {/* ABA 1 - DESCRIÇÃO */}
          {activeTab === 'descricao' && (
            <div className="animate-fadeIn">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                O que está te preenchendo?
              </h2>
              <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
                <p className="text-xl">
                  No Acampamento de Carnaval <strong className="text-gray-900">"VAZIO"</strong>, você terá dias intensos de Palavra, comunhão e verdade. Sim, vai ter brincadeiras, dinâmicas e gincanas.
                </p>
                <p className="text-xl">
                  Mas tudo com um propósito maior: <strong className="text-gray-900">sair do automático e ser iluminado por Cristo</strong>.
                </p>
                <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border-l-4 border-red-500 shadow-sm">
                  <p className="text-gray-800 italic text-lg leading-relaxed">
                    <strong className="text-red-700">"Envie a Tua luz e a Tua verdade para brilhar sobre a terra, pois eu sou como a terra, vazia e sem forma até que Tu me iluminas."</strong>
                  </p>
                  <p className="text-gray-600 text-base mt-3 text-right">
                    — Thomas de Kempis
                  </p>
                </div>
                <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                  <p className="text-yellow-800 font-semibold text-lg">
                    ⚠️ Vagas limitadas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ABA 2 - INFORMAÇÕES ADICIONAIS */}
          {activeTab === 'informacoes' && (
            <div className="animate-fadeIn">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Informações adicionais
              </h2>
              <div className="space-y-6">
                {/* Data */}
                <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg">
                  <span className="text-3xl">📅</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Data</h3>
                    <p className="text-gray-700">14 de fevereiro de 2026</p>
                  </div>
                </div>

                {/* Público-alvo e Idade */}
                <div className="flex items-start gap-4 p-4 bg-pink-50 rounded-lg">
                  <span className="text-3xl">👧🧒</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Público-alvo</h3>
                    <p className="text-gray-700 mb-2">Jovens e adolescentes</p>
                    <h3 className="font-semibold text-gray-900 mb-1">Idade</h3>
                    <p className="text-gray-700">12+</p>
                  </div>
                </div>

                {/* Local */}
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                  <span className="text-3xl">📍</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Local</h3>
                    <p className="text-gray-700">Quintal do Sol</p>
                  </div>
                </div>

                {/* Acomodação */}
                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
                  <span className="text-3xl">🏠</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Acomodação</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
                      <li>Alojamento masculino</li>
                      <li>Alojamento feminino</li>
                    </ul>
                    <p className="text-sm text-gray-600 mt-2 italic">
                      (organizado pela equipe do acampamento)
                    </p>
                  </div>
                </div>

                {/* Importante */}
                <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <span className="text-3xl">📄</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Importante</h3>
                    <p className="text-gray-700">
                      A inscrição só será confirmada após o preenchimento do formulário
                      e entrega do documento assinado na secretaria da igreja.
                    </p>
                  </div>
                </div>

                {/* Aviso */}
                <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                  <span className="text-3xl">⚠️</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Aviso</h3>
                    <p className="text-gray-700">As vagas são limitadas.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botão CTA - Sempre visível */}
        <div className="mt-12 text-center">
          <a
            href="/formulario"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold text-xl md:text-2xl px-10 py-5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            Ir para o formulário de inscrição
          </a>
        </div>
      </div>
    </section>
  )
}

