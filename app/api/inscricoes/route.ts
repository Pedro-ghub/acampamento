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
  try {
    const data: InscricaoData = await request.json()
    
    // Adicionar metadados
    const inscricaoCompleta: InscricaoData = {
      ...data,
      dataInscricao: new Date().toISOString(),
      id: `INS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }
    
    // Salvar no KV (fonte principal na Vercel)
    // Na Vercel, o sistema de arquivos é read-only, então usamos apenas KV
    try {
      const { kv } = await import('@vercel/kv')
      const REGS_INDEX_KEY = 'camp:regs'
      const REG_PREFIX = 'camp:reg:'
      
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
      
      // Salvar no KV
      await kv.hset(`${REG_PREFIX}${inscricaoCompleta.id}`, kvData)
      
      // Adicionar ao índice (ZSET com timestamp)
      const timestamp = new Date(inscricaoCompleta.dataInscricao).getTime()
      await kv.zadd(REGS_INDEX_KEY, { score: timestamp, member: inscricaoCompleta.id })
    } catch (kvError: any) {
      // Se falhar o KV, retorna erro
      console.error('Erro ao salvar no KV:', kvError?.message || kvError)
      throw new Error('Erro ao salvar inscrição no banco de dados')
    }
    
    // Tentar salvar também no JSON (apenas em desenvolvimento local)
    // Na Vercel isso falhará silenciosamente, mas não é problema
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
    } catch (jsonError: any) {
      // Ignora erro de JSON (normal na Vercel onde o filesystem é read-only)
      console.log('Não foi possível salvar backup JSON (normal na Vercel):', jsonError?.message)
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Inscrição salva com sucesso!',
        id: inscricaoCompleta.id
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao salvar inscrição:', error)
    return NextResponse.json(
      { success: false, message: 'Erro ao salvar inscrição' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
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
  } catch (error) {
    console.error('Erro ao ler inscrições:', error)
    return NextResponse.json(
      { success: false, message: 'Erro ao ler inscrições' },
      { status: 500 }
    )
  }
}

