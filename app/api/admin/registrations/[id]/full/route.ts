import { NextRequest, NextResponse } from 'next/server'
import { validateAdminKey } from '@/lib/kv'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const searchParams = request.nextUrl.searchParams
    const key = searchParams.get('k')
    const headerKey = request.headers.get('x-admin-key')

    if (!validateAdminKey(key || headerKey)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Buscar dados completos no KV
    try {
      const { kv } = await import('@vercel/kv')
      const fullDataKey = `camp:full:${id}`
      
      const fullData = await kv.get(fullDataKey)
      
      if (!fullData) {
        return NextResponse.json(
          { error: 'Inscrição não encontrada' },
          { status: 404 }
        )
      }

      // O KV pode retornar como string JSON ou já como objeto
      let inscricao: any
      if (typeof fullData === 'string') {
        inscricao = JSON.parse(fullData)
      } else {
        inscricao = fullData
      }

      return NextResponse.json({ inscricao })
    } catch (kvError: any) {
      console.error('Erro ao buscar dados completos:', kvError?.message)
      return NextResponse.json(
        { error: 'Erro ao buscar dados completos' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro ao processar requisição' },
      { status: 500 }
    )
  }
}

