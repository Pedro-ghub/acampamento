import { NextRequest, NextResponse } from 'next/server'
import { getAllRegistrations, validateAdminKey } from '@/lib/kv'

export async function GET(request: NextRequest) {
  // Validar chave
  const searchParams = request.nextUrl.searchParams
  const key = searchParams.get('k')
  const headerKey = request.headers.get('x-admin-key')

  console.log('🔍 GET /api/admin/registrations - Chave recebida:', key ? `${key.substring(0, 10)}...` : 'null')

  if (!validateAdminKey(key || headerKey)) {
    console.error('❌ GET /api/admin/registrations - Chave inválida')
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    console.log('✅ GET /api/admin/registrations - Buscando inscrições...')
    const registrations = await getAllRegistrations()
    console.log(`✅ GET /api/admin/registrations - Encontradas ${registrations.length} inscrições`)
    return NextResponse.json({ registrations })
  } catch (error: any) {
    console.error('❌ Erro ao buscar inscrições:', {
      message: error?.message,
      stack: error?.stack
    })
    return NextResponse.json(
      { error: 'Erro ao buscar inscrições' },
      { status: 500 }
    )
  }
}

