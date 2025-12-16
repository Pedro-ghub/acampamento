'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'

export default function EnvioComprovanteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [inscricaoId, setInscricaoId] = useState<string | null>(null)
  const [inscricao, setInscricao] = useState<any>(null)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [enviado, setEnviado] = useState(false)

  useEffect(() => {
    const id = searchParams.get('id')
    if (id) {
      setInscricaoId(id)
      buscarInscricao(id)
    } else {
      router.push('/formulario')
    }
  }, [searchParams, router])

  const buscarInscricao = async (id: string) => {
    try {
      const response = await fetch(`/api/inscricoes?id=${id}`)
      const data = await response.json()
      if (data.inscricao) {
        setInscricao(data.inscricao)
      }
    } catch (error) {
      console.error('Erro ao buscar inscrição:', error)
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!arquivo) {
      alert('Por favor, selecione o comprovante de pagamento.')
      return
    }

    setIsSubmitting(true)

    try {
      // Criar FormData para enviar arquivo
      const formData = new FormData()
      formData.append('comprovante', arquivo)
      formData.append('inscricaoId', inscricaoId || '')

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
      alert('Erro ao enviar comprovante. Por favor, tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!inscricaoId) {
    return (
      <section className="w-full bg-gradient-to-b from-blue-50 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600">Carregando...</p>
        </div>
      </section>
    )
  }

  if (enviado) {
    return (
      <section className="w-full bg-gradient-to-b from-blue-50 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-xl p-8 md:p-12 shadow-lg">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Comprovante enviado com sucesso!
              </h1>
              <p className="text-gray-700 text-lg mb-6">
                Obrigado. Seu comprovante foi recebido e será verificado em breve.
              </p>
              {inscricao && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-gray-700 text-sm">
                    <strong>Número da inscrição:</strong> {inscricao.id}
                  </p>
                  <p className="text-gray-700 text-sm mt-2">
                    Você receberá uma confirmação por e-mail assim que o pagamento for verificado.
                  </p>
                </div>
              )}
            </div>
          </div>
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
            Enviar Comprovante de Pagamento
          </h1>
          <p className="text-gray-700 text-lg md:text-xl max-w-2xl mx-auto">
            Envie o comprovante do pagamento PIX para confirmar sua inscrição
          </p>
        </div>

        {/* Informações da Inscrição */}
        {inscricao && (
          <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informações da Inscrição</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm mb-1">Número da inscrição</p>
                <p className="text-gray-900 font-semibold">{inscricao.id}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Valor pago</p>
                <p className="text-blue-600 font-bold text-xl">R$ {inscricao.valorTotal.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulário de Upload */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 md:p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Comprovante de Pagamento</h2>
          
          <div className="space-y-6">
            {/* Campo de Upload */}
            <div>
              <label htmlFor="comprovante" className="block text-gray-700 font-semibold mb-2">
                Anexar comprovante <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  id="comprovante"
                  name="comprovante"
                  accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                  required
                  className="hidden"
                />
                <label
                  htmlFor="comprovante"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-700 font-semibold mb-2">
                    Clique para selecionar o arquivo
                  </p>
                  <p className="text-gray-500 text-sm">
                    Formatos aceitos: JPG, PNG, WEBP ou PDF (máx. 5MB)
                  </p>
                  {arquivo && (
                    <p className="text-blue-600 text-sm mt-2 font-semibold">
                      ✓ {arquivo.name}
                    </p>
                  )}
                </label>
              </div>
            </div>

            {/* Preview da Imagem */}
            {preview && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 font-semibold mb-2">Pré-visualização:</p>
                <div className="relative w-full max-w-md mx-auto aspect-video">
                  <Image
                    src={preview}
                    alt="Preview do comprovante"
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Informações Importantes */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg p-4">
              <p className="text-yellow-800 text-sm">
                <strong>⚠️ Importante:</strong>
              </p>
              <ul className="text-yellow-800 text-sm mt-2 space-y-1 list-disc list-inside">
                <li>Envie uma foto ou PDF do comprovante PIX</li>
                <li>Certifique-se de que o comprovante está legível</li>
                <li>A inscrição será confirmada após verificação do comprovante</li>
                <li>Você receberá uma confirmação por e-mail</li>
              </ul>
            </div>

            {/* Botão de Envio */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting || !arquivo}
                className={`inline-block text-white font-bold text-xl md:text-2xl px-12 py-5 rounded-full shadow-2xl transition-all duration-300 transform ${
                  isSubmitting || !arquivo
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
                }`}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar comprovante'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}


