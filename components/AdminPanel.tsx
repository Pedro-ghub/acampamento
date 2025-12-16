'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

// Componente para exibir comprovante do KV
function ReceiptImage({ receiptUrl, registrationId }: { receiptUrl: string; registrationId: string }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const response = await fetch(receiptUrl)
        const data = await response.json()
        if (data.success && data.receiptUrl) {
          setImageSrc(data.receiptUrl) // Já é um data URL (base64)
        }
      } catch (error) {
        console.error('Erro ao buscar comprovante:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchReceipt()
  }, [receiptUrl])

  if (loading) {
    return <p className="text-gray-500 text-sm">Carregando...</p>
  }

  if (!imageSrc) {
    return <p className="text-gray-500 text-sm">Erro ao carregar comprovante</p>
  }

  return (
    <div className="space-y-2">
      <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
        <Image
          src={imageSrc}
          alt="Comprovante"
          fill
          className="object-contain"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => {
            const modal = document.createElement('div')
            modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50'
            modal.innerHTML = `
              <div class="relative max-w-4xl max-h-[90vh] p-4">
                <button class="absolute top-2 right-2 text-white text-2xl" onclick="this.closest('div').remove()">×</button>
                <img src="${imageSrc}" alt="Comprovante" class="max-w-full max-h-[90vh] rounded" />
              </div>
            `
            document.body.appendChild(modal)
            modal.querySelector('button')?.addEventListener('click', () => modal.remove())
          }}
          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
        >
          Abrir
        </button>
        <a
          href={imageSrc}
          download={`comprovante-${registrationId}.png`}
          className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors text-center"
        >
          Baixar
        </a>
      </div>
    </div>
  )
}

interface Registration {
  id: string
  name: string
  phone: string
  age?: string
  church?: string
  city?: string
  wantsShirt: string
  shirtSize?: string
  paymentStatus: 'pending' | 'approved' | 'rejected'
  receiptUrl?: string
  createdAt: string
}

interface AdminPanelProps {
  adminKey: string
}

export default function AdminPanel({ adminKey }: AdminPanelProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [shirtFilter, setShirtFilter] = useState<'all' | 'with' | 'without'>('all')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  const toggleCard = (id: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  useEffect(() => {
    loadRegistrations()
  }, [])

  useEffect(() => {
    filterRegistrations()
  }, [registrations, searchTerm, paymentFilter, shirtFilter])

  const loadRegistrations = async () => {
    try {
      console.log('📥 Carregando inscrições...')
      const response = await fetch(`/api/admin/registrations?k=${adminKey}`)
      console.log('📥 Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📥 Dados recebidos:', {
          total: data.registrations?.length || 0,
          registrations: data.registrations
        })
        setRegistrations(data.registrations || [])
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ Erro na resposta:', response.status, errorData)
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar inscrições:', {
        message: error?.message,
        stack: error?.stack
      })
    } finally {
      setLoading(false)
    }
  }

  const filterRegistrations = () => {
    let filtered = [...registrations]

    // Busca por nome ou telefone
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        reg =>
          reg.name.toLowerCase().includes(term) ||
          reg.phone.includes(term)
      )
    }

    // Filtro de pagamento
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(reg => reg.paymentStatus === paymentFilter)
    }

    // Filtro de camiseta
    if (shirtFilter === 'with') {
      filtered = filtered.filter(reg => reg.wantsShirt === 'true')
    } else if (shirtFilter === 'without') {
      filtered = filtered.filter(reg => reg.wantsShirt !== 'true')
    }

    setFilteredRegistrations(filtered)
  }

  const updatePaymentStatus = async (id: string, status: 'pending' | 'approved' | 'rejected') => {
    setUpdating(id)
    try {
      const response = await fetch(`/api/admin/registrations/${id}?k=${adminKey}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentStatus: status }),
      })

      if (response.ok) {
        // Atualizar localmente
        setRegistrations(prev =>
          prev.map(reg =>
            reg.id === id ? { ...reg, paymentStatus: status } : reg
          )
        )
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao atualizar status. Tente novamente.')
    } finally {
      setUpdating(null)
    }
  }

  const copyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone)
    alert('Telefone copiado!')
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
    }
    const labels = {
      pending: 'Pendente',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
    }
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles] || styles.pending}`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  const exportCSV = () => {
    window.open(`/api/admin/export.csv?k=${adminKey}`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando inscrições...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Área Administrativa
              </h1>
              <p className="text-gray-600">
                Gerenciamento de Inscrições - Acampamento de Carnaval 2026
              </p>
            </div>
            <button
              onClick={exportCSV}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-colors"
            >
              📥 Exportar CSV (Excel)
            </button>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Busca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nome ou telefone..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro de Pagamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status de Pagamento
              </label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="pending">Pendente</option>
                <option value="approved">Aprovado</option>
                <option value="rejected">Rejeitado</option>
              </select>
            </div>

            {/* Filtro de Camiseta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Camiseta
              </label>
              <select
                value={shirtFilter}
                onChange={(e) => setShirtFilter(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="with">Somente com camiseta</option>
                <option value="without">Sem camiseta</option>
              </select>
            </div>
          </div>

          {/* Contador */}
          <div className="mt-4 text-sm text-gray-600">
            Mostrando {filteredRegistrations.length} de {registrations.length} inscrições
          </div>
        </div>

        {/* Lista de Inscrições */}
        <div className="space-y-4">
          {filteredRegistrations.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 text-lg">Nenhuma inscrição encontrada.</p>
            </div>
          ) : (
            filteredRegistrations.map((reg) => {
              const isExpanded = expandedCards.has(reg.id)
              
              return (
              <div
                key={reg.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                {/* Header do Card - Sempre Visível */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleCard(reg.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                          title={isExpanded ? 'Minimizar' : 'Expandir'}
                        >
                          {isExpanded ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">
                            {reg.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600">
                            <span className="whitespace-nowrap">ID: {reg.id}</span>
                            <span className="whitespace-nowrap">{formatDate(reg.createdAt)}</span>
                            {reg.phone && (
                              <span className="text-blue-600 truncate">{reg.phone}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {getStatusBadge(reg.paymentStatus)}
                    </div>
                  </div>
                </div>

                {/* Conteúdo Expandido */}
                {isExpanded && (
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Informações Principais */}
                      <div className="lg:col-span-2">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <span className="text-sm font-medium text-gray-700">Telefone:</span>
                            <div className="flex items-center gap-2 mt-1">
                              <a
                                href={`https://wa.me/55${reg.phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {reg.phone}
                              </a>
                              <button
                                onClick={() => copyPhone(reg.phone)}
                                className="text-gray-400 hover:text-gray-600"
                                title="Copiar telefone"
                              >
                                📋
                              </button>
                            </div>
                          </div>

                          {reg.age && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">Idade:</span>
                              <p className="text-gray-900">{reg.age} anos</p>
                            </div>
                          )}

                          {reg.city && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">Cidade:</span>
                              <p className="text-gray-900">{reg.city}</p>
                            </div>
                          )}

                          {reg.church && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">Igreja:</span>
                              <p className="text-gray-900">{reg.church}</p>
                            </div>
                          )}

                          <div>
                            <span className="text-sm font-medium text-gray-700">Camiseta:</span>
                            <p className="text-gray-900">
                              {reg.wantsShirt === 'true' ? 'Sim' : 'Não'}
                              {reg.wantsShirt === 'true' && reg.shirtSize && ` (${reg.shirtSize})`}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Comprovante e Ações */}
                      <div className="border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6">
                        {/* Comprovante */}
                        <div className="mb-4">
                          <span className="text-sm font-medium text-gray-700 block mb-2">
                            Comprovante:
                          </span>
                          {reg.receiptUrl ? (
                            reg.receiptUrl.startsWith('/api/receipt/') ? (
                              <ReceiptImage receiptUrl={reg.receiptUrl} registrationId={reg.id} />
                            ) : (
                              <div className="space-y-2">
                                <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                                  <Image
                                    src={reg.receiptUrl}
                                    alt="Comprovante"
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setSelectedImage(reg.receiptUrl || null)}
                                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                                  >
                                    Abrir
                                  </button>
                                  <a
                                    href={reg.receiptUrl}
                                    download
                                    className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors text-center"
                                  >
                                    Baixar
                                  </a>
                                </div>
                              </div>
                            )
                          ) : (
                            <p className="text-gray-500 text-sm">Sem comprovante</p>
                          )}
                        </div>

                        {/* Ações de Status */}
                        <div>
                          <span className="text-sm font-medium text-gray-700 block mb-2">
                            Ações:
                          </span>
                          <div className="space-y-2">
                            <button
                              onClick={() => updatePaymentStatus(reg.id, 'approved')}
                              disabled={updating === reg.id || reg.paymentStatus === 'approved'}
                              className={`w-full px-3 py-2 text-sm rounded-lg transition-colors ${
                                reg.paymentStatus === 'approved'
                                  ? 'bg-green-200 text-green-800 cursor-not-allowed'
                                  : 'bg-green-600 hover:bg-green-700 text-white'
                              }`}
                            >
                              {updating === reg.id ? 'Atualizando...' : '✓ Aprovar'}
                            </button>
                            <button
                              onClick={() => updatePaymentStatus(reg.id, 'rejected')}
                              disabled={updating === reg.id || reg.paymentStatus === 'rejected'}
                              className={`w-full px-3 py-2 text-sm rounded-lg transition-colors ${
                                reg.paymentStatus === 'rejected'
                                  ? 'bg-red-200 text-red-800 cursor-not-allowed'
                                  : 'bg-red-600 hover:bg-red-700 text-white'
                              }`}
                            >
                              {updating === reg.id ? 'Atualizando...' : '✗ Rejeitar'}
                            </button>
                            <button
                              onClick={() => updatePaymentStatus(reg.id, 'pending')}
                              disabled={updating === reg.id || reg.paymentStatus === 'pending'}
                              className={`w-full px-3 py-2 text-sm rounded-lg transition-colors ${
                                reg.paymentStatus === 'pending'
                                  ? 'bg-yellow-200 text-yellow-800 cursor-not-allowed'
                                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                              }`}
                            >
                              {updating === reg.id ? 'Atualizando...' : '↩ Pendente'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
            })
          )}
        </div>
      </div>

      {/* Modal de Imagem */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75"
            >
              ✕
            </button>
            <div className="relative w-full h-[80vh]">
              <Image
                src={selectedImage}
                alt="Comprovante"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

