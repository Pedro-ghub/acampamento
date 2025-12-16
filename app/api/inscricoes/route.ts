import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

interface InscricaoData {
  // Dados do Responsável
  nomeResponsavel: string
  sobrenomeResponsavel: string
  cpfResponsavel: string
  dataNascimentoResponsavel: string
  generoResponsavel: string
  cepResponsavel: string
  numeroResponsavel: string
  cidadeResponsavel: string
  estadoResponsavel: string
  celularResponsavel: string
  emailResponsavel: string
  
  // Informações do Acampante
  nomeAcampante: string
  generoAcampante: string
  idadeAcampante: string
  dataNascimentoAcampante: string
  nomeResponsavelLegal: string
  celularResponsavelLegal: string
  observacoes: string
  
  // Segundo Acampante (opcional)
  nomeSegundoAcampante?: string
  generoSegundoAcampante?: string
  idadeSegundoAcampante?: string
  dataNascimentoSegundoAcampante?: string
  nomeResponsavelLegalSegundo?: string
  celularResponsavelLegalSegundo?: string
  
  // Camisa
  queroCamisa: boolean
  tamanhoCamisa?: string
  
  // Valores
  valorInscricao: number
  valorCamisa: number
  valorTotal: number
  
  // Metadados
  dataInscricao: string
  id: string
}

export async function POST(request: NextRequest) {
  let inscricaoCompleta: InscricaoData | null = null
  
  try {
    const data: InscricaoData = await request.json()
    
    // Adicionar metadados
    inscricaoCompleta = {
      ...data,
      dataInscricao: new Date().toISOString(),
      id: `INS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }
    
    // Salvar no KV (fonte principal na Vercel)
    let kvSaved = false
    try {
      // Verificar se as variáveis de ambiente do KV estão configuradas
      if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
        console.warn('Variáveis do KV não configuradas. Tentando salvar apenas no JSON.')
        throw new Error('KV não configurado')
      }
      
      const { kv } = await import('@vercel/kv')
      const REGS_INDEX_KEY = 'camp:regs'
      const REG_PREFIX = 'camp:reg:'
      
      // Dados resumidos para admin
      const kvData: Record<string, string> = {
        name: `${inscricaoCompleta.nomeAcampante}`,
        phone: inscricaoCompleta.celularResponsavelLegal || '',
        age: inscricaoCompleta.idadeAcampante || '',
        city: inscricaoCompleta.cidadeResponsavel || '',
        church: '', // Não coletado no formulário atual
        wantsShirt: inscricaoCompleta.queroCamisa ? 'true' : 'false',
        shirtSize: inscricaoCompleta.tamanhoCamisa || '',
        paymentStatus: 'pending',
        receiptUrl: '',
        createdAt: inscricaoCompleta.dataInscricao,
      }
      
      // Salvar dados resumidos no KV (para admin)
      await kv.hset(`${REG_PREFIX}${inscricaoCompleta.id}`, kvData)
      
      // Salvar dados completos no KV (para recuperação na página de pagamento)
      const fullDataKey = `camp:full:${inscricaoCompleta.id}`
      await kv.set(fullDataKey, JSON.stringify(inscricaoCompleta), { ex: 60 * 60 * 24 * 365 }) // Expira em 1 ano
      
      // Adicionar ao índice (ZSET com timestamp)
      const timestamp = new Date(inscricaoCompleta.dataInscricao).getTime()
      await kv.zadd(REGS_INDEX_KEY, { score: timestamp, member: inscricaoCompleta.id })
      
      kvSaved = true
      console.log('✅ Inscrição salva no KV:', inscricaoCompleta.id)
    } catch (kvError: any) {
      console.error('❌ Erro ao salvar no KV:', {
        message: kvError?.message,
        name: kvError?.name,
        error: String(kvError)
      })
      // Se falhar o KV, tenta salvar no JSON como fallback
    }
    
    // Tentar salvar no JSON (fallback ou backup local)
    // Na Vercel, o filesystem é read-only, então isso sempre falhará
    // Mas não é um problema se o KV já salvou
    let jsonSaved = false
    try {
      const dataDir = path.join(process.cwd(), 'data')
      if (!existsSync(dataDir)) {
        await mkdir(dataDir, { recursive: true })
      }
      
      const filePath = path.join(dataDir, 'inscricoes.json')
      let inscricoes: InscricaoData[] = []
      
      if (existsSync(filePath)) {
        const fileContent = await readFile(filePath, 'utf-8')
        inscricoes = JSON.parse(fileContent)
      }
      
      inscricoes.push(inscricaoCompleta)
      await writeFile(filePath, JSON.stringify(inscricoes, null, 2), 'utf-8')
      jsonSaved = true
      console.log('✅ Inscrição salva no JSON:', inscricaoCompleta.id)
    } catch (jsonError: any) {
      // Na Vercel, isso sempre falha (read-only filesystem)
      // Mas não é problema se o KV salvou
      console.log('⚠️ JSON falhou (normal na Vercel):', jsonError?.message)
    }
    
    // Se nenhum dos dois salvou, retorna erro
    if (!kvSaved && !jsonSaved) {
      console.error('❌ Falha ao salvar em ambos KV e JSON')
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erro ao salvar inscrição. Por favor, verifique a configuração do servidor e tente novamente.' 
        },
        { status: 500 }
      )
    }
    
    // Se pelo menos um salvou, retorna sucesso
    return NextResponse.json(
      { 
        success: true, 
        message: 'Inscrição salva com sucesso!',
        id: inscricaoCompleta.id
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('❌ Erro geral ao salvar inscrição:', {
      message: error?.message,
      stack: error?.stack,
      error: String(error)
    })
    
    return NextResponse.json(
      { 
        success: false, 
        message: error?.message || 'Erro ao processar inscrição. Por favor, tente novamente.',
        id: inscricaoCompleta?.id || null
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    // Tentar buscar no KV primeiro (fonte principal na Vercel)
    if (id && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { kv } = await import('@vercel/kv')
        const fullDataKey = `camp:full:${id}`
        
        console.log('🔍 Buscando dados completos no KV:', fullDataKey)
        
        // Buscar dados completos no KV primeiro
        const fullData = await kv.get<string>(fullDataKey)
        if (fullData) {
          console.log('✅ Dados completos encontrados no KV')
          const inscricao = JSON.parse(fullData)
          console.log('📦 Dados retornados:', {
            id: inscricao.id,
            nomeAcampante: inscricao.nomeAcampante,
            valorTotal: inscricao.valorTotal,
            dataInscricao: inscricao.dataInscricao
          })
          return NextResponse.json({ inscricao }, { status: 200 })
        }
        
        console.log('⚠️ Dados completos não encontrados, buscando dados resumidos...')
        
        // Se não encontrou dados completos, tenta buscar dados resumidos
        const { getRegistration } = await import('@/lib/kv')
        const registration = await getRegistration(id)
        if (registration) {
          console.log('⚠️ Retornando apenas dados resumidos (incompletos)')
          // Retornar dados básicos (melhor que nada)
          return NextResponse.json({ 
            inscricao: {
              id: registration.id,
              nomeAcampante: registration.name,
              celularResponsavelLegal: registration.phone,
              idadeAcampante: registration.age,
              cidadeResponsavel: registration.city,
              queroCamisa: registration.wantsShirt === 'true',
              tamanhoCamisa: registration.shirtSize,
              valorInscricao: 0,
              valorCamisa: registration.wantsShirt === 'true' ? 250 : 0,
              valorTotal: 0,
            }
          }, { status: 200 })
        }
        
        console.log('❌ Nenhum dado encontrado no KV')
      } catch (kvError: any) {
        console.error('❌ Erro ao buscar no KV:', {
          message: kvError?.message,
          stack: kvError?.stack
        })
        // Continua para tentar buscar no JSON
      }
    } else if (!id && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      // Buscar todas as inscrições no KV
      try {
        const { getAllRegistrations } = await import('@/lib/kv')
        const registrations = await getAllRegistrations()
        return NextResponse.json({ inscricoes: registrations }, { status: 200 })
      } catch (kvError: any) {
        console.error('Erro ao buscar todas as inscrições no KV:', kvError?.message)
        // Continua para tentar buscar no JSON
      }
    }
    
    // Fallback: buscar no JSON (apenas em desenvolvimento local)
    const filePath = path.join(process.cwd(), 'data', 'inscricoes.json')
    
    if (!existsSync(filePath)) {
      if (id) {
        return NextResponse.json({ inscricao: null }, { status: 404 })
      }
      return NextResponse.json({ inscricoes: [] }, { status: 200 })
    }
    
    const fileContent = await readFile(filePath, 'utf-8')
    const inscricoes = JSON.parse(fileContent)
    
    if (id) {
      // Buscar inscrição específica por ID
      const inscricao = inscricoes.find((ins: any) => ins.id === id)
      if (inscricao) {
        return NextResponse.json({ inscricao }, { status: 200 })
      }
      return NextResponse.json({ inscricao: null }, { status: 404 })
    }
    
    // Retornar todas as inscrições
    return NextResponse.json({ inscricoes }, { status: 200 })
  } catch (error: any) {
    console.error('Erro ao ler inscrições:', error)
    return NextResponse.json(
      { success: false, message: 'Erro ao ler inscrições' },
      { status: 500 }
    )
  }
}

