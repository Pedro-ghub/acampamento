import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID não fornecido' },
        { status: 400 }
      )
    }

    // Buscar comprovante no KV
    try {
      const { kv } = await import('@vercel/kv')
      const RECEIPT_PREFIX = 'camp:receipt:'
      
      const receiptData = await kv.get<string>(`${RECEIPT_PREFIX}${id}`)
      
      if (!receiptData) {
        return NextResponse.json(
          { success: false, message: 'Comprovante não encontrado' },
          { status: 404 }
        )
      }

      // Retornar o data URL (base64)
      return NextResponse.json(
        { success: true, receiptUrl: receiptData },
        { status: 200 }
      )
    } catch (kvError: any) {
      console.error('Erro ao buscar comprovante no KV:', kvError?.message)
      return NextResponse.json(
        { success: false, message: 'Erro ao buscar comprovante' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { success: false, message: 'Erro ao processar requisição' },
      { status: 500 }
    )
  }
}

