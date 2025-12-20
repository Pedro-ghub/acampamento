'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface InscricaoData {
  id: string
  dataInscricao: string
  nomeResponsavel: string
  sobrenomeResponsavel: string
  emailResponsavel: string
  nomeAcampante: string
  generoAcampante: string
  idadeAcampante: string
  dataNascimentoAcampante: string
  nomeResponsavelLegal: string
  celularResponsavelLegal: string
  queroCamisa: boolean
  tamanhoCamisa?: string
  valorInscricao: number
  valorCamisa: number
  valorTotal: number
}

interface PagamentoPixProps {
  inscricaoId: string
}

export default function PagamentoPix({ inscricaoId }: PagamentoPixProps) {
  const router = useRouter()
  const [inscricao, setInscricao] = useState<InscricaoData | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [loading, setLoading] = useState(true)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [enviado, setEnviado] = useState(false)
  
  // Chave PIX (e-mail)
  const chavePix = 'elainesgarionemodesto@gmail.com'
  
  // WhatsApp para envio do comprovante
  const whatsappNumero = '5545998193069'
  const whatsappNome = 'João Pedro Modesto'
  const whatsappDisplay = '(45) 9819-3069'

  useEffect(() => {
    // Buscar dados da inscrição
    const buscarInscricao = async () => {
      try {
        const response = await fetch(`/api/inscricoes?id=${inscricaoId}`)
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        console.log('📥 Dados recebidos da API:', data)
        
        if (data.inscricao) {
          console.log('✅ Inscrição encontrada:', {
            id: data.inscricao.id,
            nomeAcampante: data.inscricao.nomeAcampante,
            valorTotal: data.inscricao.valorTotal,
            dataInscricao: data.inscricao.dataInscricao,
            generoAcampante: data.inscricao.generoAcampante,
            dataNascimentoAcampante: data.inscricao.dataNascimentoAcampante,
            nomeResponsavelLegal: data.inscricao.nomeResponsavelLegal
          })
          setInscricao(data.inscricao)
        } else {
          // Se não encontrar, redirecionar
          console.error('❌ Inscrição não encontrada nos dados:', data)
          alert('Inscrição não encontrada. Redirecionando...')
          router.push('/formulario')
        }
      } catch (error) {
        console.error('Erro ao buscar inscrição:', error)
        alert('Erro ao carregar dados da inscrição.')
        router.push('/formulario')
      } finally {
        setLoading(false)
      }
    }
    
    buscarInscricao()
  }, [inscricaoId, router])

  const copiarChavePix = () => {
    navigator.clipboard.writeText(chavePix)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 3000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo
      const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
      if (!tiposPermitidos.includes(file.type)) {
        alert('Por favor, envie uma imagem (JPG, PNG, WEBP) ou PDF.')
        return
      }
      
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('O arquivo deve ter no máximo 5MB.')
        return
      }

      setArquivo(file)
      
      // Criar preview se for imagem
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setPreview(null)
      }
    }
  }

  const handleFinalizar = async () => {
    // Se houver arquivo, enviar o comprovante
    if (arquivo) {
      setIsSubmitting(true)
      try {
        const formData = new FormData()
        formData.append('comprovante', arquivo)
        formData.append('inscricaoId', inscricaoId)

        const response = await fetch('/api/comprovante', {
          method: 'POST',
          body: formData,
        })

        const result = await response.json()

        if (result.success) {
          setEnviado(true)
          alert('Comprovante enviado com sucesso! Sua inscrição será verificada em breve.')
        } else {
          throw new Error(result.message || 'Erro ao enviar comprovante')
        }
      } catch (error) {
        console.error('Erro ao enviar comprovante:', error)
        alert('Erro ao enviar comprovante. Você ainda pode enviar pelo WhatsApp.')
      } finally {
        setIsSubmitting(false)
      }
    } else {
      // Se não houver arquivo, apenas confirmar
      alert('Lembre-se de enviar o comprovante pelo WhatsApp para agilizar a confirmação!')
    }
  }

  const formatarData = (dataISO: string | undefined) => {
    if (!dataISO) return 'Data não disponível'
    try {
      const data = new Date(dataISO)
      if (isNaN(data.getTime())) {
        console.error('Data inválida:', dataISO)
        return 'Data inválida'
      }
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error('Erro ao formatar data:', error, dataISO)
      return 'Data inválida'
    }
  }
  
  const formatarDataNascimento = (dataISO: string | undefined) => {
    if (!dataISO) return 'Não informado'
    try {
      // Se a data está no formato YYYY-MM-DD, tratar como data local
      // para evitar problemas de timezone que causam diferença de um dia
      if (dataISO.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [ano, mes, dia] = dataISO.split('-').map(Number)
        const data = new Date(ano, mes - 1, dia) // mês é 0-indexed
        if (isNaN(data.getTime())) {
          return 'Data inválida'
        }
        return data.toLocaleDateString('pt-BR')
      }
      
      // Para outros formatos, usar conversão normal
      const data = new Date(dataISO)
      if (isNaN(data.getTime())) {
        return 'Data inválida'
      }
      return data.toLocaleDateString('pt-BR')
    } catch (error) {
      return 'Data inválida'
    }
  }

  if (loading) {
    return (
      <section className="w-full bg-gradient-to-b from-red-50 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600">Carregando informações...</p>
        </div>
      </section>
    )
  }

  if (!inscricao) {
    return (
      <section className="w-full bg-gradient-to-b from-red-50 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600">Inscrição não encontrada.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full bg-gradient-to-b from-red-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Título Principal */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-red-900 mb-4">
            Inscrição recebida
          </h1>
          <p className="text-gray-700 text-lg md:text-xl max-w-2xl mx-auto">
            Obrigado. Sua inscrição foi registrada com sucesso.
            Para confirmá-la, realize o pagamento via PIX conforme instruções abaixo.
          </p>
        </div>

        {/* Resumo da Inscrição */}
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg mb-8 border-2 border-red-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumo da Inscrição</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Número da inscrição</p>
              <p className="text-gray-900 font-semibold">{inscricao.id}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Data da inscrição</p>
              <p className="text-gray-900 font-semibold">{formatarData(inscricao.dataInscricao)}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">E-mail</p>
              <p className="text-gray-900 font-semibold">{inscricao.emailResponsavel}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Valor total</p>
              <p className="text-red-600 font-bold text-2xl">R$ {inscricao.valorTotal.toFixed(2)}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-600 text-sm mb-1">Forma de pagamento</p>
              <p className="text-gray-900 font-semibold">PIX</p>
            </div>
          </div>
        </div>

        {/* Detalhes da Inscrição */}
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Detalhes da Inscrição</h2>
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-700">Evento:</span>
              <span className="text-gray-900 font-semibold">Acampamento de Carnaval 2026 – Vazio</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-700">Quantidade:</span>
              <span className="text-gray-900 font-semibold">1 inscrição</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-gray-700">Valor da inscrição:</span>
              <span className="text-gray-900 font-semibold">R$ {inscricao.valorInscricao.toFixed(2)}</span>
            </div>
            {inscricao.queroCamisa && (
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-700">Camisa do acampamento:</span>
                <span className="text-gray-900 font-semibold">
                  R$ {inscricao.valorCamisa.toFixed(2)} {inscricao.tamanhoCamisa && `(Tamanho: ${inscricao.tamanhoCamisa})`}
                </span>
              </div>
            )}
            <div className="flex justify-between py-3 bg-red-50 rounded-lg px-4">
              <span className="text-gray-900 font-bold text-lg">Total:</span>
              <span className="text-red-600 font-bold text-xl">R$ {inscricao.valorTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Dados do Acampante */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Dados do Acampante</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm mb-1">Nome completo</p>
                <p className="text-gray-900 font-semibold">{inscricao.nomeAcampante}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Gênero</p>
                <p className="text-gray-900 font-semibold capitalize">{inscricao.generoAcampante}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Idade</p>
                <p className="text-gray-900 font-semibold">{inscricao.idadeAcampante} anos</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Data de nascimento</p>
                <p className="text-gray-900 font-semibold">
                  {formatarDataNascimento(inscricao.dataNascimentoAcampante)}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Responsável legal</p>
                <p className="text-gray-900 font-semibold">{inscricao.nomeResponsavelLegal}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Celular (WhatsApp)</p>
                <p className="text-gray-900 font-semibold">{inscricao.celularResponsavelLegal}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Pagamento PIX */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 md:p-8 shadow-lg border-2 border-red-200 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-red-300">
            Pagamento via PIX
          </h2>
          
          <div className="space-y-6">
            {/* Instruções */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Siga estes passos:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Abra o aplicativo do seu banco.</li>
                <li>Acesse a opção PIX.</li>
                <li>Escolha "PIX para E-mail" ou "Pix Copia e Cola".</li>
                <li>Cole o e-mail abaixo ou digite manualmente.</li>
                <li>Insira o valor de <strong>R$ {inscricao?.valorTotal.toFixed(2)}</strong> e confirme.</li>
                <li>Após o pagamento, envie uma foto do comprovante pelo WhatsApp.</li>
              </ol>
            </div>

            {/* Chave PIX E-mail */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Chave PIX (E-mail)</h3>
              <div className="mb-4">
                <div className="bg-gray-50 border-2 border-red-300 rounded-lg p-4 mb-3">
                  <p className="text-lg text-gray-900 font-mono text-center break-all">
                    {chavePix}
                  </p>
                </div>
                <button
                  onClick={copiarChavePix}
                  className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors duration-200 ${
                    copiado
                      ? 'bg-green-600 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {copiado ? '✓ Chave PIX copiada com sucesso!' : 'Copiar chave PIX'}
                </button>
              </div>
              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-800 text-center">
                  <strong>Valor a pagar:</strong>{' '}
                  <span className="text-2xl font-bold">R$ {inscricao?.valorTotal.toFixed(2)}</span>
                </p>
              </div>
            </div>

            {/* WhatsApp para envio do comprovante */}
            <div className="bg-green-50 rounded-lg p-6 border-2 border-green-300">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">📱</span> Envie o comprovante pelo WhatsApp
              </h3>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1">
                  <p className="text-gray-700 mb-2">
                    Após realizar o pagamento, envie a foto do comprovante para:
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {whatsappDisplay} - {whatsappNome}
                  </p>
                </div>
                <a
                  href={`https://wa.me/${whatsappNumero}?text=Olá! Segue o comprovante de pagamento da inscrição ${inscricao?.id} - ${inscricao?.nomeAcampante}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Abrir WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Anexo de Comprovante (Opcional) */}
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg mb-8 border-2 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Anexar Comprovante (Opcional)</h2>
          <p className="text-gray-600 text-sm mb-6">
            Você pode anexar o comprovante aqui para manter um registro salvo. 
            <strong className="text-green-700"> A prioridade é enviar pelo WhatsApp acima.</strong>
          </p>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="comprovante" className="block text-gray-700 font-semibold mb-2">
                Anexar comprovante <span className="text-gray-500 text-sm">(opcional)</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
                <input
                  type="file"
                  id="comprovante"
                  name="comprovante"
                  accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="comprovante"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-700 font-semibold mb-1">
                    Clique para selecionar o arquivo
                  </p>
                  <p className="text-gray-500 text-xs">
                    Formatos aceitos: JPG, PNG, WEBP ou PDF (máx. 5MB)
                  </p>
                  {arquivo && (
                    <p className="text-red-600 text-sm mt-2 font-semibold">
                      ✓ {arquivo.name}
                    </p>
                  )}
                </label>
              </div>
            </div>

            {/* Preview da Imagem */}
            {preview && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 font-semibold mb-2 text-sm">Pré-visualização:</p>
                <div className="relative w-full max-w-xs mx-auto aspect-video">
                  <Image
                    src={preview}
                    alt="Preview do comprovante"
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Aviso Importante */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg p-4 mb-8">
          <p className="text-yellow-800">
            <strong>⚠️ Importante:</strong> A inscrição só será confirmada após a conferência do pagamento.
            {arquivo ? ' O comprovante anexado será verificado.' : ' Envie o comprovante pelo WhatsApp para agilizar.'}
          </p>
        </div>

        {/* Botão Final */}
        <div className="text-center">
          <button
            onClick={handleFinalizar}
            disabled={isSubmitting}
            className={`inline-block text-white font-bold text-xl md:text-2xl px-12 py-5 rounded-full shadow-2xl transition-all duration-300 transform ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 hover:scale-105'
            }`}
          >
            {isSubmitting ? 'Enviando...' : enviado ? '✓ Comprovante enviado!' : 'Já realizei o pagamento'}
          </button>
          {enviado && (
            <p className="text-green-600 font-semibold mt-4">
              ✓ Comprovante enviado com sucesso! Sua inscrição será verificada em breve.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

