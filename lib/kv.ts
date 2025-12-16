import { kv } from '@vercel/kv'

export interface Registration {
  id: string
  name: string
  phone: string
  age?: string
  church?: string
  city?: string
  wantsShirt: string // "true" | "false"
  shirtSize?: string
  paymentStatus: 'pending' | 'approved' | 'rejected'
  receiptUrl?: string
  createdAt: string
}

const REGS_INDEX_KEY = 'camp:regs'
const REG_PREFIX = 'camp:reg:'

/**
 * Obtém todos os IDs de inscrições do índice
 */
export async function getAllRegistrationIds(): Promise<string[]> {
  try {
    // Tentar como LIST primeiro
    const listResult = await kv.lrange(REGS_INDEX_KEY, 0, -1)
    if (Array.isArray(listResult) && listResult.length > 0) {
      return listResult.map(String)
    }

    // Tentar como ZSET (sorted set)
    const zsetResult = await kv.zrange(REGS_INDEX_KEY, 0, -1)
    if (Array.isArray(zsetResult) && zsetResult.length > 0) {
      return zsetResult.map(String)
    }

    return []
  } catch (error) {
    console.error('Erro ao obter IDs:', error)
    return []
  }
}

/**
 * Obtém uma inscrição por ID
 */
export async function getRegistration(id: string): Promise<Registration | null> {
  try {
    const data = await kv.hgetall(`${REG_PREFIX}${id}`)
    if (!data || Object.keys(data).length === 0) {
      return null
    }

    // Se receiptUrl começar com "kv://", buscar o comprovante do KV
    let receiptUrl = data.receiptUrl ? String(data.receiptUrl) : undefined
    if (receiptUrl && receiptUrl.startsWith('kv://receipt/')) {
      // O comprovante está no KV, usar a API route para buscar
      receiptUrl = `/api/receipt/${id}`
    }

    return {
      id,
      name: String(data.name || ''),
      phone: String(data.phone || ''),
      age: data.age ? String(data.age) : undefined,
      church: data.church ? String(data.church) : undefined,
      city: data.city ? String(data.city) : undefined,
      wantsShirt: String(data.wantsShirt || 'false'),
      shirtSize: data.shirtSize ? String(data.shirtSize) : undefined,
      paymentStatus: (data.paymentStatus as 'pending' | 'approved' | 'rejected') || 'pending',
      receiptUrl,
      createdAt: String(data.createdAt || ''),
    }
  } catch (error) {
    console.error(`Erro ao obter inscrição ${id}:`, error)
    return null
  }
}

/**
 * Obtém todas as inscrições
 */
export async function getAllRegistrations(): Promise<Registration[]> {
  const ids = await getAllRegistrationIds()
  const registrations = await Promise.all(
    ids.map(id => getRegistration(id))
  )
  
  // Filtrar nulos e ordenar por data (mais recentes primeiro)
  return registrations
    .filter((reg): reg is Registration => reg !== null)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA
    })
}

/**
 * Atualiza o status de pagamento de uma inscrição
 */
export async function updatePaymentStatus(
  id: string,
  paymentStatus: 'pending' | 'approved' | 'rejected'
): Promise<boolean> {
  try {
    await kv.hset(`${REG_PREFIX}${id}`, { paymentStatus })
    return true
  } catch (error) {
    console.error(`Erro ao atualizar status de ${id}:`, error)
    return false
  }
}

/**
 * Valida a chave de admin
 */
export function validateAdminKey(key: string | null): boolean {
  const adminKey = process.env.ADMIN_KEY
  if (!adminKey) {
    console.error('ADMIN_KEY não configurada nas variáveis de ambiente')
    return false
  }
  if (!key) {
    return false
  }
  // Comparação case-sensitive
  return key.trim() === adminKey.trim()
}

