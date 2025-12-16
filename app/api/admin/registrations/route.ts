import { NextRequest, NextResponse } from 'next/server'
import { getAllRegistrations, validateAdminKey } from '@/lib/kv'

export async function GET(request: NextRequest) {
  // Validar chave
  const searchParams = request.nextUrl.searchParams
  const key = searchParams.get('k')
  const headerKey = request.headers.get('x-admin-key')

  if (!validateAdminKey(key || headerKey)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const registrations = await getAllRegistrations()
    return NextResponse.json({ registrations })
  } catch (error) {
    console.error('Erro ao buscar inscrições:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar inscrições' },
      { status: 500 }
    )
  }
}

