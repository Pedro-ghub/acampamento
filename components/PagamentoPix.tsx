'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'

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
  
  // Chave PIX - SUBSTITUA pela chave real quando tiver
  const chavePix = 'pix-acampamento-2026@exemplo.com'
  
  // Função simplificada para CRC16 (para produção, use biblioteca adequada)
  const calcularCRC16 = (data: string): string => {
    // Esta é uma versão simplificada. Em produção, implemente o algoritmo CRC16-CCITT correto
    // Por enquanto, retorna um valor fixo para demonstração
    return 'ABCD'
  }
  
  // Gerar código PIX Copia e Cola (formato EMV)
  const gerarCodigoPix = (valor: number) => {
    const valorFormatado = valor.toFixed(2)
    const nomeBeneficiario = 'Acampamento Carnaval'
    const cidade = 'BRASILIA'
    
    // Construir payload EMV
    const payloadFormatIndicator = '000201'
    const merchantAccountInfo = `26${(25 + chavePix.length).toString().padStart(2, '0')}0014br.gov.bcb.pix01${chavePix.length.toString().padStart(2, '0')}${chavePix}`
    const merchantCategoryCode = '52040000'
    const transactionCurrency = '5303986'
    const transactionAmount = `54${valorFormatado.length.toString().padStart(2, '0')}${valorFormatado}`
    const countryCode = '5802BR'
    const merchantName = `59${nomeBeneficiario.length.toString().padStart(2, '0')}${nomeBeneficiario}`
    const merchantCity = `60${cidade.length.toString().padStart(2, '0')}${cidade}`
    const additionalDataField = '62070503***'
    
    const payload = payloadFormatIndicator + merchantAccountInfo + merchantCategoryCode + 
                    transactionCurrency + transactionAmount + countryCode + 
                    merchantName + merchantCity + additionalDataField + '6304'
    
    // CRC16 simplificado (em produção, use biblioteca adequada ou gere corretamente)
    const crc = calcularCRC16(payload)
    return payload + crc
  }

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

  const codigoPix = inscricao ? gerarCodigoPix(inscricao.valorTotal) : ''

  const copiarCodigoPix = () => {
    navigator.clipboard.writeText(codigoPix)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 3000)
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
      <section className="w-full bg-gradient-to-b from-blue-50 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600">Carregando informações...</p>
        </div>
      </section>
    )
  }

  if (!inscricao) {
    return (
      <section className="w-full bg-gradient-to-b from-blue-50 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600">Inscrição não encontrada.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Título Principal */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
            Inscrição recebida
          </h1>
          <p className="text-gray-700 text-lg md:text-xl max-w-2xl mx-auto">
            Obrigado. Sua inscrição foi registrada com sucesso.
            Para confirmá-la, realize o pagamento via PIX conforme instruções abaixo.
          </p>
        </div>

        {/* Resumo da Inscrição */}
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg mb-8 border-2 border-blue-200">
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
              <p className="text-blue-600 font-bold text-2xl">R$ {inscricao.valorTotal.toFixed(2)}</p>
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
              <span className="text-gray-900 font-semibold">Acampamento de Carnaval 2026 – As Coroas do Rei</span>
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
            <div className="flex justify-between py-3 bg-blue-50 rounded-lg px-4">
              <span className="text-gray-900 font-bold text-lg">Total:</span>
              <span className="text-blue-600 font-bold text-xl">R$ {inscricao.valorTotal.toFixed(2)}</span>
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
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 md:p-8 shadow-lg border-2 border-blue-200 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-blue-300">
            Pagamento via PIX
          </h2>
          
          <div className="space-y-6">
            {/* Instruções */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Siga estes passos:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Abra o aplicativo do seu banco.</li>
                <li>Acesse a opção PIX.</li>
                <li>Escolha "Pagar com QR Code" ou "PIX Copia e Cola".</li>
                <li>Confirme as informações e finalize o pagamento.</li>
                <li>Após o pagamento, siga para a próxima etapa para envio do comprovante.</li>
              </ol>
            </div>

            {/* QR Code e Código PIX */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* QR Code */}
              <div className="bg-white rounded-lg p-6 text-center">
                <h3 className="font-semibold text-gray-900 mb-4">QR Code PIX</h3>
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                    {codigoPix && (
                      <QRCodeSVG
                        value={codigoPix}
                        size={200}
                        level="H"
                        includeMargin={true}
                      />
                    )}
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Escaneie com o app do seu banco</p>
              </div>

              {/* Código PIX Copia e Cola */}
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">PIX Copia e Cola</h3>
                <div className="mb-4">
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-3 max-h-32 overflow-y-auto">
                    <p className="text-xs text-gray-600 break-all font-mono">
                      {codigoPix || 'Gerando código...'}
                    </p>
                  </div>
                  <button
                    onClick={copiarCodigoPix}
                    disabled={!codigoPix}
                    className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors duration-200 ${
                      copiado
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {copiado ? '✓ Código PIX copiado com sucesso!' : 'Copiar código PIX'}
                  </button>
                </div>
                <p className="text-gray-600 text-sm">
                  Chave PIX: <strong>{chavePix}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Aviso Importante */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg p-4 mb-8">
          <p className="text-yellow-800">
            <strong>⚠️ Importante:</strong> A inscrição só será confirmada após a conferência do pagamento.
            Guarde o comprovante para a próxima etapa.
          </p>
        </div>

        {/* Botão Final */}
        <div className="text-center">
          <button
            onClick={() => router.push(`/comprovante?id=${inscricaoId}`)}
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl md:text-2xl px-12 py-5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            Já realizei o pagamento
          </button>
        </div>
      </div>
    </section>
  )
}

