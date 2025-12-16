'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function FormularioInscricao() {
  const [showSegundoAcampante, setShowSegundoAcampante] = useState(false)
  const [queroCamisa, setQueroCamisa] = useState(false)
  const [tamanhoCamisa, setTamanhoCamisa] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    // Dados do Responsável
    nomeResponsavel: '',
    sobrenomeResponsavel: '',
    cpfResponsavel: '',
    dataNascimentoResponsavel: '',
    generoResponsavel: '',
    cepResponsavel: '',
    numeroResponsavel: '',
    cidadeResponsavel: '',
    estadoResponsavel: '',
    celularResponsavel: '',
    emailResponsavel: '',
    
    // Informações do Acampante
    nomeAcampante: '',
    generoAcampante: '',
    idadeAcampante: '',
    dataNascimentoAcampante: '',
    nomeResponsavelLegal: '',
    celularResponsavelLegal: '',
    observacoes: '',
    
    // Segundo Acampante (opcional)
    nomeSegundoAcampante: '',
    generoSegundoAcampante: '',
    idadeSegundoAcampante: '',
    dataNascimentoSegundoAcampante: '',
    nomeResponsavelLegalSegundo: '',
    celularResponsavelLegalSegundo: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
  const valorCamisa = 250
  const valorTotal = valorInscricao + (queroCamisa ? valorCamisa : 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (queroCamisa && !tamanhoCamisa) {
      alert('Por favor, selecione o tamanho da camisa.')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Preparar dados para envio
      const dadosInscricao = {
        ...formData,
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
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-200">
              Dados do Responsável
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nomeResponsavel" className="block text-gray-700 font-semibold mb-2">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nomeResponsavel"
                  name="nomeResponsavel"
                  value={formData.nomeResponsavel}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="sobrenomeResponsavel" className="block text-gray-700 font-semibold mb-2">
                  Sobrenome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="sobrenomeResponsavel"
                  name="sobrenomeResponsavel"
                  value={formData.sobrenomeResponsavel}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="cpfResponsavel" className="block text-gray-700 font-semibold mb-2">
                  CPF <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="cpfResponsavel"
                  name="cpfResponsavel"
                  value={formData.cpfResponsavel}
                  onChange={handleInputChange}
                  required
                  placeholder="000.000.000-00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="dataNascimentoResponsavel" className="block text-gray-700 font-semibold mb-2">
                  Data de nascimento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="dataNascimentoResponsavel"
                  name="dataNascimentoResponsavel"
                  value={formData.dataNascimentoResponsavel}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="generoResponsavel" className="block text-gray-700 font-semibold mb-2">
                  Gênero <span className="text-red-500">*</span>
                </label>
                <select
                  id="generoResponsavel"
                  name="generoResponsavel"
                  value={formData.generoResponsavel}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outro">Outro</option>
                  <option value="prefiro-nao-informar">Prefiro não informar</option>
                </select>
              </div>

              <div>
                <label htmlFor="cepResponsavel" className="block text-gray-700 font-semibold mb-2">
                  CEP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="cepResponsavel"
                  name="cepResponsavel"
                  value={formData.cepResponsavel}
                  onChange={handleInputChange}
                  required
                  placeholder="00000-000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="numeroResponsavel" className="block text-gray-700 font-semibold mb-2">
                  Número <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="numeroResponsavel"
                  name="numeroResponsavel"
                  value={formData.numeroResponsavel}
                  onChange={handleInputChange}
                  required
                  placeholder="Número da residência"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="estadoResponsavel" className="block text-gray-700 font-semibold mb-2">
                  Estado <span className="text-red-500">*</span>
                </label>
                <select
                  id="estadoResponsavel"
                  name="estadoResponsavel"
                  value={formData.estadoResponsavel}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione</option>
                  <option value="AC">Acre</option>
                  <option value="AL">Alagoas</option>
                  <option value="AP">Amapá</option>
                  <option value="AM">Amazonas</option>
                  <option value="BA">Bahia</option>
                  <option value="CE">Ceará</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="ES">Espírito Santo</option>
                  <option value="GO">Goiás</option>
                  <option value="MA">Maranhão</option>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="PA">Pará</option>
                  <option value="PB">Paraíba</option>
                  <option value="PR">Paraná</option>
                  <option value="PE">Pernambuco</option>
                  <option value="PI">Piauí</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="RO">Rondônia</option>
                  <option value="RR">Roraima</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="SP">São Paulo</option>
                  <option value="SE">Sergipe</option>
                  <option value="TO">Tocantins</option>
                </select>
              </div>

              <div>
                <label htmlFor="celularResponsavel" className="block text-gray-700 font-semibold mb-2">
                  Celular <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="celularResponsavel"
                  name="celularResponsavel"
                  value={formData.celularResponsavel}
                  onChange={handleInputChange}
                  required
                  placeholder="(00) 00000-0000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="emailResponsavel" className="block text-gray-700 font-semibold mb-2">
                  E-mail <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="emailResponsavel"
                  name="emailResponsavel"
                  value={formData.emailResponsavel}
                  onChange={handleInputChange}
                  required
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 2. INFORMAÇÕES DO ACAMPANTE */}
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-200">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outro">Outro</option>
                  <option value="prefiro-nao-informar">Prefiro não informar</option>
                </select>
              </div>

              <div>
                <label htmlFor="idadeAcampante" className="block text-gray-700 font-semibold mb-2">
                  Idade <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="idadeAcampante"
                  name="idadeAcampante"
                  value={formData.idadeAcampante}
                  onChange={handleInputChange}
                  required
                  min="12"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="nomeResponsavelLegal" className="block text-gray-700 font-semibold mb-2">
                  Nome completo do responsável legal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nomeResponsavelLegal"
                  name="nomeResponsavelLegal"
                  value={formData.nomeResponsavelLegal}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="celularResponsavelLegal" className="block text-gray-700 font-semibold mb-2">
                  Celular do responsável (WhatsApp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="celularResponsavelLegal"
                  name="celularResponsavelLegal"
                  value={formData.celularResponsavelLegal}
                  onChange={handleInputChange}
                  required
                  placeholder="(00) 00000-0000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="observacoes" className="block text-gray-700 font-semibold mb-2">
                  Observações <span className="text-gray-500 text-sm">(opcional)</span>
                </label>
                <textarea
                  id="observacoes"
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Informações adicionais que considera importante..."
                />
              </div>
            </div>
          </div>

          {/* 3. SEGUNDO ACAMPANTE (OPCIONAL) */}
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-blue-200">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Segundo Acampante <span className="text-gray-500 text-lg font-normal">(opcional)</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowSegundoAcampante(!showSegundoAcampante)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showSegundoAcampante ? 'Ocultar' : 'Adicionar'}
              </button>
            </div>

            {showSegundoAcampante && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                <div className="md:col-span-2">
                  <label htmlFor="nomeSegundoAcampante" className="block text-gray-700 font-semibold mb-2">
                    Nome completo do acampante
                  </label>
                  <input
                    type="text"
                    id="nomeSegundoAcampante"
                    name="nomeSegundoAcampante"
                    value={formData.nomeSegundoAcampante}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="generoSegundoAcampante" className="block text-gray-700 font-semibold mb-2">
                    Gênero
                  </label>
                  <select
                    id="generoSegundoAcampante"
                    name="generoSegundoAcampante"
                    value={formData.generoSegundoAcampante}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="outro">Outro</option>
                    <option value="prefiro-nao-informar">Prefiro não informar</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="idadeSegundoAcampante" className="block text-gray-700 font-semibold mb-2">
                    Idade
                  </label>
                  <input
                    type="number"
                    id="idadeSegundoAcampante"
                    name="idadeSegundoAcampante"
                    value={formData.idadeSegundoAcampante}
                    onChange={handleInputChange}
                    min="12"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="dataNascimentoSegundoAcampante" className="block text-gray-700 font-semibold mb-2">
                    Data de nascimento
                  </label>
                  <input
                    type="date"
                    id="dataNascimentoSegundoAcampante"
                    name="dataNascimentoSegundoAcampante"
                    value={formData.dataNascimentoSegundoAcampante}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="nomeResponsavelLegalSegundo" className="block text-gray-700 font-semibold mb-2">
                    Nome completo do responsável legal
                  </label>
                  <input
                    type="text"
                    id="nomeResponsavelLegalSegundo"
                    name="nomeResponsavelLegalSegundo"
                    value={formData.nomeResponsavelLegalSegundo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="celularResponsavelLegalSegundo" className="block text-gray-700 font-semibold mb-2">
                    Celular do responsável (WhatsApp)
                  </label>
                  <input
                    type="tel"
                    id="celularResponsavelLegalSegundo"
                    name="celularResponsavelLegalSegundo"
                    value={formData.celularResponsavelLegalSegundo}
                    onChange={handleInputChange}
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3.5. OPÇÃO DE CAMISA */}
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg border-2 border-blue-200">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-200">
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
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="queroCamisa" className="text-gray-700 font-semibold text-lg cursor-pointer">
                  Desejo adquirir a camisa do acampamento (+ R$ {valorCamisa.toFixed(2)})
                </label>
              </div>

              {queroCamisa && (
                <div className="animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Imagem da Camisa */}
                    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                      <div className="relative w-full max-w-xs aspect-square">
                        <Image
                          src="/images/camisaeex.webp"
                          alt="Camisa do Acampamento"
                          fill
                          className="object-contain rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Campo de Tamanho */}
                    <div className="flex flex-col justify-center">
                      <label htmlFor="tamanhoCamisa" className="block text-gray-700 font-semibold mb-2">
                        Tamanho da camisa <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="tamanhoCamisa"
                        value={tamanhoCamisa}
                        onChange={(e) => setTamanhoCamisa(e.target.value)}
                        required={queroCamisa}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              )}
            </div>
          </div>

          {/* 4. SEÇÃO DE PAGAMENTO - PIX */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 md:p-8 shadow-lg border-2 border-blue-200">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-300">
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
                      <span className="text-blue-600 font-bold text-xl">
                        R$ {valorInscricao.toFixed(2)}
                      </span>
                    </div>
                    {queroCamisa && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">+</span>
                        <span className="text-gray-700 font-semibold text-lg">Camisa:</span>
                        <span className="text-blue-600 font-bold text-xl">
                          R$ {valorCamisa.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="pt-3 border-t border-gray-300 flex items-center justify-between">
                    <span className="text-gray-900 font-bold text-lg">Valor total:</span>
                    <span className="text-blue-600 font-bold text-2xl">
                      R$ {valorTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                  <p className="text-yellow-800 font-semibold mb-2">📅 Valores por período:</p>
                  <ul className="text-yellow-800 text-sm space-y-1">
                    <li>• <strong>R$ 150,00</strong> - Até 31/12/2025</li>
                    <li>• <strong>R$ 170,00</strong> - Até 15/01/2026</li>
                    <li>• <strong>R$ 180,00</strong> - Até 30/01/2026</li>
                    <li>• <strong>R$ 200,00</strong> - Até 10/02/2026</li>
                  </ul>
                  <p className="text-yellow-800 text-sm mt-3 font-semibold">
                    ⏰ Período atual: {(() => {
                      const hoje = new Date()
                      hoje.setHours(0, 0, 0, 0)
                      const data150 = new Date('2025-12-31')
                      const data170 = new Date('2026-01-15')
                      const data180 = new Date('2026-01-30')
                      const data200 = new Date('2026-02-10')
                      
                      if (hoje <= data150) return 'Até 31/12/2025'
                      if (hoje <= data170) return 'Até 15/01/2026'
                      if (hoje <= data180) return 'Até 30/01/2026'
                      if (hoje <= data200) return 'Até 10/02/2026'
                      return 'Após 10/02/2026'
                    })()}
                  </p>
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
                  : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
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

