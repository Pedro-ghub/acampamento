import { NextRequest, NextResponse } from 'next/server'
import { updatePaymentStatus, validateAdminKey } from '@/lib/kv'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Validar chave
  const searchParams = request.nextUrl.searchParams
  const key = searchParams.get('k')
  const headerKey = request.headers.get('x-admin-key')

  if (!validateAdminKey(key || headerKey)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const body = await request.json()
    const { paymentStatus } = body

    if (!paymentStatus || !['pending', 'approved', 'rejected'].includes(paymentStatus)) {
      return NextResponse.json(
        { error: 'paymentStatus inválido' },
        { status: 400 }
      )
    }

    const success = await updatePaymentStatus(params.id, paymentStatus)

    if (!success) {
      return NextResponse.json(
        { error: 'Erro ao atualizar status' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar status' },
      { status: 500 }
    )
  }
}

