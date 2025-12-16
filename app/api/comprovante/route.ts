import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { kv } from '@vercel/kv'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const comprovante = formData.get('comprovante') as File
    const inscricaoId = formData.get('inscricaoId') as string

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

    // Criar diretório se não existir
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'comprovantes')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Gerar nome único para o arquivo
    const extensao = comprovante.name.split('.').pop()
    const nomeArquivo = `${inscricaoId}-${Date.now()}.${extensao}`
    const filePath = path.join(uploadsDir, nomeArquivo)

    // Converter File para Buffer e salvar
    const bytes = await comprovante.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    const receiptUrl = `/uploads/comprovantes/${nomeArquivo}`
    
    // Atualizar inscrição com informação do comprovante (JSON - backup)
    const dataDir = path.join(process.cwd(), 'data')
    const inscricoesPath = path.join(dataDir, 'inscricoes.json')
    
    if (existsSync(inscricoesPath)) {
      const fileContent = await readFile(inscricoesPath, 'utf-8')
      const inscricoes = JSON.parse(fileContent)
      
      const inscricaoIndex = inscricoes.findIndex((ins: any) => ins.id === inscricaoId)
      if (inscricaoIndex !== -1) {
        inscricoes[inscricaoIndex] = {
          ...inscricoes[inscricaoIndex],
          comprovanteEnviado: true,
          comprovantePath: receiptUrl,
          dataEnvioComprovante: new Date().toISOString(),
        }
        
        await writeFile(inscricoesPath, JSON.stringify(inscricoes, null, 2), 'utf-8')
      }
    }
    
    // Atualizar também no KV
    try {
      const { kv } = await import('@vercel/kv')
      const REG_PREFIX = 'camp:reg:'
      await kv.hset(`${REG_PREFIX}${inscricaoId}`, { receiptUrl })
    } catch (kvError) {
      console.error('Erro ao atualizar comprovante no KV:', kvError)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Comprovante enviado com sucesso!',
        arquivo: nomeArquivo,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao salvar comprovante:', error)
    return NextResponse.json(
      { success: false, message: 'Erro ao salvar comprovante' },
      { status: 500 }
    )
  }
}


