'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function FormularioInscricao() {
  const [queroCamisa, setQueroCamisa] = useState(false)
  const [tamanhoCamisa, setTamanhoCamisa] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    // Dados do Responsável (simplificado)
    nomeResponsavel: '',
    sobrenomeResponsavel: '', // Mantido para compatibilidade, mas não será usado
    cidadeResponsavel: '',
    celularResponsavel: '',
    
    // Informações do Acampante (simplificado)
    nomeAcampante: '',
    generoAcampante: '',
    dataNascimentoAcampante: '',
    celularResponsavelLegal: '', // Celular do acampante
    observacoes: '', // Restrições médicas/alimentares
    
    // Campos mantidos para compatibilidade com backend (preenchidos automaticamente)
    cpfResponsavel: '',
    dataNascimentoResponsavel: '',
    generoResponsavel: '',
    cepResponsavel: '',
    numeroResponsavel: '',
    estadoResponsavel: '',
    emailResponsavel: '',
    idadeAcampante: '',
    nomeResponsavelLegal: '',
    nomeSegundoAcampante: '',
    generoSegundoAcampante: '',
    idadeSegundoAcampante: '',
    dataNascimentoSegundoAcampante: '',
    nomeResponsavelLegalSegundo: '',
    celularResponsavelLegalSegundo: '',
  })

  // Função para formatar telefone
  const formatarTelefone = (valor: string): string => {
    // Remove tudo que não é número
    const apenasNumeros = valor.replace(/\D/g, '')
    
    // Limita a 11 dígitos (com DDD + 9 dígitos)
    const numerosLimitados = apenasNumeros.slice(0, 11)
    
    // Aplica a máscara
    if (numerosLimitados.length <= 10) {
      // Telefone fixo: (XX) XXXX-XXXX
      return numerosLimitados
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
    } else {
      // Celular: (XX) XXXXX-XXXX
      return numerosLimitados
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
    }
  }

  // Função para validar telefone
  const validarTelefone = (valor: string): boolean => {
    const apenasNumeros = valor.replace(/\D/g, '')
    // Deve ter pelo menos 10 dígitos (DDD + número)
    return apenasNumeros.length >= 10 && apenasNumeros.length <= 11
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // Se for um campo de telefone, aplicar formatação
    if (name === 'celularResponsavel' || name === 'celularResponsavelLegal') {
      const valorFormatado = formatarTelefone(value)
      setFormData(prev => ({
        ...prev,
        [name]: valorFormatado
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  // Função para calcular o valor baseado na data
  const calcularValor = (): number => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    // R$ 150 - Até 31/12/2025
    const data150 = new Date('2025-12-31')
    data150.setHours(23, 59, 59, 999)

    // R$ 170 - Até 15/01/2026
    const data170 = new Date('2026-01-15')
    data170.setHours(23, 59, 59, 999)

    // R$ 180 - Até 30/01/2026
    const data180 = new Date('2026-01-30')
    data180.setHours(23, 59, 59, 999)

    // R$ 200 - Até 10/02/2026
    const data200 = new Date('2026-02-10')
    data200.setHours(23, 59, 59, 999)

    if (hoje <= data150) {
      return 150
    } else if (hoje <= data170) {
      return 170
    } else if (hoje <= data180) {
      return 180
    } else if (hoje <= data200) {
      return 200
    } else {
      // Após 10/02, retorna o valor máximo
      return 200
    }
  }

  const valorInscricao = calcularValor()
  const valorCamisa = 40
  const valorTotal = valorInscricao + (queroCamisa ? valorCamisa : 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar telefones
    if (!validarTelefone(formData.celularResponsavel)) {
      alert('Por favor, informe um telefone válido para o responsável (com DDD).')
      return
    }
    
    if (!validarTelefone(formData.celularResponsavelLegal)) {
      alert('Por favor, informe um telefone válido para o acampante (com DDD).')
      return
    }
    
    if (queroCamisa && !tamanhoCamisa) {
      alert('Por favor, selecione o tamanho da camisa.')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Calcular idade do acampante a partir da data de nascimento
      let idadeCalculada = ''
      if (formData.dataNascimentoAcampante) {
        const nascimento = new Date(formData.dataNascimentoAcampante)
        const hoje = new Date()
        let idade = hoje.getFullYear() - nascimento.getFullYear()
        const mes = hoje.getMonth() - nascimento.getMonth()
        if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
          idade--
        }
        idadeCalculada = idade.toString()
      }
      
      // Preparar dados para envio (mantendo compatibilidade com backend)
      const dadosInscricao = {
        ...formData,
        // Preencher campos necessários para compatibilidade
        nomeResponsavelLegal: formData.nomeResponsavel, // Usar nome do responsável
        idadeAcampante: idadeCalculada,
        queroCamisa,
        tamanhoCamisa: queroCamisa ? tamanhoCamisa : undefined,
        valorInscricao,
        valorCamisa: queroCamisa ? valorCamisa : 0,
        valorTotal,
      }
      
      // Enviar para API
      const response = await fetch('/api/inscricoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosInscricao),
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Redirecionar para próxima página de pagamento com ID
        window.location.href = `/pagamento?id=${result.id}`
      } else {
        throw new Error(result.message || 'Erro ao salvar inscrição')
      }
    } catch (error) {
      console.error('Erro ao salvar inscrição:', error)
      alert('Erro ao salvar inscrição. Por favor, tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full bg-white min-h-screen">
      {/* Banner com fogueira e degradê */}
      <div className="relative w-full h-[45vh] min-h-[350px] max-h-[500px] overflow-hidden">
        {/* Imagem de fundo - fogueira */}
        <div className="absolute inset-0">
          <Image
            src="/images/foto1.jpg"
            alt="Fogueira do Acampamento"
            fill
            className="object-cover object-center"
            priority
          />
        </div>
        
        {/* Degradê suave do topo para o branco na parte inferior */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white"></div>
      </div>

      {/* Painel branco com conteúdo - sobrepondo a imagem */}
      <div className="relative bg-white -mt-16 md:-mt-20 rounded-t-3xl shadow-2xl">
        <div className="px-6 pt-12 pb-6 md:pt-16 md:pb-8">
          {/* Título */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-black mb-4 leading-tight">
            Formulário de Inscrição
          </h1>
          
          {/* Texto descritivo */}
          <p className="text-black text-base md:text-lg leading-relaxed mb-8 max-w-3xl">
            Preencha os dados abaixo para garantir sua vaga no Acampamento de Carnaval 2026. Deus tem grandes coisas preparadas!
          </p>
        </div>

      {/* Formulário */}
      <div className="max-w-4xl mx-auto pb-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. DADOS DO RESPONSÁVEL */}
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-red-200">
              Dados do Responsável
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="nomeResponsavel" className="block text-gray-700 font-semibold mb-2">
                  Nome completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nomeResponsavel"
                  name="nomeResponsavel"
                  value={formData.nomeResponsavel}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="cidadeResponsavel" className="block text-gray-700 font-semibold mb-2">
                  Cidade <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="cidadeResponsavel"
                  name="cidadeResponsavel"
                  value={formData.cidadeResponsavel}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="celularResponsavel" className="block text-gray-700 font-semibold mb-2">
                  Número de Telefone do responsável <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="celularResponsavel"
                  name="celularResponsavel"
                  value={formData.celularResponsavel}
                  onChange={handleInputChange}
                  required
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {formData.celularResponsavel && !validarTelefone(formData.celularResponsavel) && (
                  <p className="text-red-500 text-sm mt-1">Informe um telefone válido com DDD</p>
                )}
              </div>
            </div>
          </div>

          {/* 2. INFORMAÇÕES DO ACAMPANTE */}
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-red-200">
              Informações do Acampante
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="nomeAcampante" className="block text-gray-700 font-semibold mb-2">
                  Nome completo do acampante <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nomeAcampante"
                  name="nomeAcampante"
                  value={formData.nomeAcampante}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="generoAcampante" className="block text-gray-700 font-semibold mb-2">
                  Gênero <span className="text-red-500">*</span>
                </label>
                <select
                  id="generoAcampante"
                  name="generoAcampante"
                  value={formData.generoAcampante}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Selecione</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                </select>
              </div>

              <div>
                <label htmlFor="dataNascimentoAcampante" className="block text-gray-700 font-semibold mb-2">
                  Data de nascimento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="dataNascimentoAcampante"
                  name="dataNascimentoAcampante"
                  value={formData.dataNascimentoAcampante}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="celularResponsavelLegal" className="block text-gray-700 font-semibold mb-2">
                  Celular do Acampante <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="celularResponsavelLegal"
                  name="celularResponsavelLegal"
                  value={formData.celularResponsavelLegal}
                  onChange={handleInputChange}
                  required
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {formData.celularResponsavelLegal && !validarTelefone(formData.celularResponsavelLegal) && (
                  <p className="text-red-500 text-sm mt-1">Informe um telefone válido com DDD</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="observacoes" className="block text-gray-700 font-semibold mb-2">
                  Você possui alguma restrição médica ou alimentar? Se sim, qual? <span className="text-gray-500 text-sm">(opcional)</span>
                </label>
                <textarea
                  id="observacoes"
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Descreva aqui qualquer restrição médica ou alimentar..."
                />
              </div>
            </div>
          </div>

          {/* 3. OPÇÃO DE CAMISA */}
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg border-2 border-red-200">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-red-200">
              Camisa do Acampamento
            </h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="queroCamisa"
                  checked={queroCamisa}
                  onChange={(e) => {
                    setQueroCamisa(e.target.checked)
                    if (!e.target.checked) {
                      setTamanhoCamisa('')
                    }
                  }}
                  className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="queroCamisa" className="text-gray-700 font-semibold text-lg cursor-pointer">
                  Desejo adquirir a camisa do acampamento (+ R$ {valorCamisa.toFixed(2)})
                </label>
              </div>

              <div className="animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Imagens das Camisas */}
                  <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center gap-4">
                    <div className="relative w-1/2 aspect-square">
                      <Image
                        src="/images/camisa.jpg"
                        alt="Camisa do Acampamento"
                        fill
                        className="object-contain rounded-lg"
                      />
                    </div>
                    <div className="relative w-1/2 aspect-square">
                      <Image
                        src="/images/camisafem.jpg"
                        alt="Camisa Feminina do Acampamento"
                        fill
                        className="object-contain rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Campo de Tamanho */}
                  <div className="flex flex-col justify-center">
                    <label htmlFor="tamanhoCamisa" className="block text-gray-700 font-semibold mb-2">
                      Tamanho da camisa {queroCamisa && <span className="text-red-500">*</span>}
                    </label>
                    <select
                      id="tamanhoCamisa"
                      value={tamanhoCamisa}
                      onChange={(e) => setTamanhoCamisa(e.target.value)}
                      required={queroCamisa}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Selecione o tamanho</option>
                      <option value="PP">PP</option>
                      <option value="P">P</option>
                      <option value="M">M</option>
                      <option value="G">G</option>
                      <option value="GG">GG</option>
                      <option value="XG">XG</option>
                    </select>
                    <p className="text-gray-600 text-sm mt-2">
                      Selecione o tamanho desejado para a camisa
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. SEÇÃO DE PAGAMENTO - PIX */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 md:p-8 shadow-lg border-2 border-red-200">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-red-300">
              Forma de Pagamento
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 text-lg leading-relaxed">
                O pagamento da inscrição será realizado via <strong>PIX</strong>.
                Após o preenchimento do formulário, você será direcionado para a próxima etapa,
                onde deverá enviar o comprovante de pagamento.
              </p>
              
              <div className="bg-white rounded-lg p-6 mt-6">
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 font-semibold text-lg">Valor da inscrição:</span>
                      <span className="text-red-600 font-bold text-xl">
                        R$ {valorInscricao.toFixed(2)}
                      </span>
                    </div>
                    {queroCamisa && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">+</span>
                        <span className="text-gray-700 font-semibold text-lg">Camisa:</span>
                        <span className="text-red-600 font-bold text-xl">
                          R$ {valorCamisa.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="pt-3 border-t border-gray-300 flex items-center justify-between">
                    <span className="text-gray-900 font-bold text-lg">Valor total:</span>
                    <span className="text-red-600 font-bold text-2xl">
                      R$ {valorTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-gray-600 text-sm">
                    💳 Pagamento via <strong>PIX</strong>
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    ⚠️ A inscrição só será validada após conferência do comprovante de pagamento.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 5. BOTÃO FINAL */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-block text-white font-bold text-xl md:text-2xl px-12 py-5 rounded-full shadow-2xl transition-all duration-300 transform ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 hover:scale-105'
              }`}
            >
              {isSubmitting ? 'Salvando...' : 'Continuar para pagamento'}
            </button>
            <p className="text-gray-600 text-sm mt-4">
              Ao continuar, você será redirecionado para a página de envio do comprovante
            </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

