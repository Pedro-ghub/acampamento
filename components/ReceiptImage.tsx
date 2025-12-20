'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface ReceiptImageProps {
  receiptUrl: string
  registrationId: string
}

export default function ReceiptImage({ receiptUrl, registrationId }: ReceiptImageProps) {
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
          className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
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

