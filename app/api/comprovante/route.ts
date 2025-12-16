import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const comprovante = formData.get('comprovante') as File
    const inscricaoId = formData.get('inscricaoId') as string

    console.log('📤 Recebendo comprovante:', {
      inscricaoId,
      nomeArquivo: comprovante?.name,
      tipo: comprovante?.type,
      tamanho: comprovante?.size
    })

    if (!comprovante || !inscricaoId) {
      return NextResponse.json(
        { success: false, message: 'Dados incompletos' },
        { status: 400 }
      )
    }

    // Validar tipo de arquivo
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
    if (!tiposPermitidos.includes(comprovante.type)) {
      return NextResponse.json(
        { success: false, message: 'Tipo de arquivo não permitido' },
        { status: 400 }
      )
    }

    // Validar tamanho (máximo 5MB)
    if (comprovante.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'Arquivo muito grande (máx. 5MB)' },
        { status: 400 }
      )
    }

    // Converter arquivo para base64 para salvar no KV
    const bytes = await comprovante.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${comprovante.type};base64,${base64}`

    const extensao = comprovante.name.split('.').pop()
    const nomeArquivo = `${inscricaoId}-${Date.now()}.${extensao}`
    
    console.log('💾 Salvando comprovante no KV:', {
      inscricaoId,
      nomeArquivo,
      tamanhoBase64: base64.length
    })

    // Salvar no KV
    try {
      const { kv } = await import('@vercel/kv')
      const REG_PREFIX = 'camp:reg:'
      const RECEIPT_PREFIX = 'camp:receipt:'
      
      // Salvar o comprovante como base64 no KV
      await kv.set(`${RECEIPT_PREFIX}${inscricaoId}`, dataUrl, { ex: 60 * 60 * 24 * 365 }) // Expira em 1 ano
      
      // Atualizar o registro com a URL do comprovante (referência)
      const receiptUrl = `kv://receipt/${inscricaoId}`
      await kv.hset(`${REG_PREFIX}${inscricaoId}`, { receiptUrl })
      
      console.log('✅ Comprovante salvo no KV com sucesso')
    } catch (kvError: any) {
      console.error('❌ Erro ao salvar comprovante no KV:', {
        message: kvError?.message,
        stack: kvError?.stack
      })
      throw new Error('Erro ao salvar comprovante no banco de dados')
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Comprovante enviado com sucesso!',
        arquivo: nomeArquivo,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('❌ Erro ao processar comprovante:', {
      message: error?.message,
      stack: error?.stack
    })
    return NextResponse.json(
      { 
        success: false, 
        message: error?.message || 'Erro ao salvar comprovante' 
      },
      { status: 500 }
    )
  }
}


