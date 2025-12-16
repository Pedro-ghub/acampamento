import { NextRequest, NextResponse } from 'next/server'
import { getAllRegistrations, validateAdminKey } from '@/lib/kv'

function escapeCsvField(field: string | undefined): string {
  if (!field) return ''
  const str = String(field)
  // Se contém vírgula, aspas ou quebra de linha, precisa de aspas
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

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

    // Cabeçalhos CSV
    const headers = [
      'id',
      'name',
      'phone',
      'age',
      'church',
      'city',
      'wantsShirt',
      'shirtSize',
      'paymentStatus',
      'receiptUrl',
      'createdAt',
    ]

    // Criar CSV
    const csvRows = [
      headers.join(','),
      ...registrations.map(reg => [
        escapeCsvField(reg.id),
        escapeCsvField(reg.name),
        escapeCsvField(reg.phone),
        escapeCsvField(reg.age),
        escapeCsvField(reg.church),
        escapeCsvField(reg.city),
        escapeCsvField(reg.wantsShirt),
        escapeCsvField(reg.shirtSize),
        escapeCsvField(reg.paymentStatus),
        escapeCsvField(reg.receiptUrl),
        escapeCsvField(reg.createdAt),
      ].join(','))
    ]

    const csvContent = csvRows.join('\n')
    // Adicionar BOM UTF-8 para Excel
    const bom = '\uFEFF'
    const csvWithBom = bom + csvContent

    return new NextResponse(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="inscritos-acampamento-carnaval-2026.csv"',
      },
    })
  } catch (error) {
    console.error('Erro ao exportar CSV:', error)
    return NextResponse.json(
      { error: 'Erro ao exportar CSV' },
      { status: 500 }
    )
  }
}

