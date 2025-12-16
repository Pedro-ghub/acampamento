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
                ? 'text-blue-600 border-b-4 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-500 hover:bg-gray-50'
            }`}
          >
            Descrição
          </button>
          <button
            onClick={() => setActiveTab('informacoes')}
            className={`flex-1 py-4 px-6 text-center font-semibold text-lg transition-all duration-300 ${
              activeTab === 'informacoes'
                ? 'text-blue-600 border-b-4 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-500 hover:bg-gray-50'
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
                Prepare-se para uma aventura real!
              </h2>
              <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
                <p>
                  No <strong>Acampamento de Carnaval 2026</strong>, jovens e adolescentes viverão dias inesquecíveis
                  descobrindo o que significa fazer parte do <strong>Reino de Deus</strong>.
                </p>
                <p>
                  Por meio de brincadeiras, louvor, histórias bíblicas, dinâmicas e gincanas,
                  eles aprenderão que as verdadeiras coroas não são de ouro,
                  mas são recebidas quando seguimos o Rei Jesus com fé, amor e obediência.
                </p>
                <p>
                  Tudo isso em um ambiente seguro, acolhedor e cheio da presença de Deus,
                  onde cada jovem é convidado a viver como um príncipe ou princesa do Reino.
                </p>
              </div>
              <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                <p className="text-yellow-800 font-semibold text-lg">
                  ⚠️ Vagas limitadas.
                </p>
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
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
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
                    <p className="text-gray-700">Jardins de Genebra</p>
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
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl md:text-2xl px-10 py-5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            Ir para o formulário de inscrição
          </a>
        </div>
      </div>
    </section>
  )
}

