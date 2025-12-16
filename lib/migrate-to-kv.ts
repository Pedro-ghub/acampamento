/**
 * Script de migração: JSON para Vercel KV
 * 
 * Execute este script uma vez para migrar dados do JSON para o KV
 * 
 * Uso: npx tsx lib/migrate-to-kv.ts
 */

import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { kv } from '@vercel/kv'

interface InscricaoData {
  id: string
  dataInscricao: string
  nomeAcampante: string
  idadeAcampante: string
  nomeResponsavelLegal: string
  celularResponsavelLegal: string
  cidadeResponsavel?: string
  queroCamisa: boolean
  tamanhoCamisa?: string
  comprovantePath?: string
  comprovanteEnviado?: boolean
}

async function migrate() {
  const filePath = path.join(process.cwd(), 'data', 'inscricoes.json')
  
  if (!existsSync(filePath)) {
    console.log('Arquivo de inscrições não encontrado.')
    return
  }

  const fileContent = await readFile(filePath, 'utf-8')
  const inscricoes: InscricaoData[] = JSON.parse(fileContent)

  console.log(`Migrando ${inscricoes.length} inscrições para KV...`)

  const REGS_INDEX_KEY = 'camp:regs'
  const REG_PREFIX = 'camp:reg:'

  for (const inscricao of inscricoes) {
    try {
      // Mapear campos do JSON para o formato KV
      const kvData: Record<string, string> = {
        name: inscricao.nomeAcampante || '',
        phone: inscricao.celularResponsavelLegal || '',
        age: inscricao.idadeAcampante || '',
        city: inscricao.cidadeResponsavel || '',
        church: '', // Não disponível no JSON atual
        wantsShirt: inscricao.queroCamisa ? 'true' : 'false',
        shirtSize: inscricao.tamanhoCamisa || '',
        paymentStatus: 'pending', // Padrão
        receiptUrl: inscricao.comprovantePath || '',
        createdAt: inscricao.dataInscricao || new Date().toISOString(),
      }

      // Salvar no KV
      await kv.hset(`${REG_PREFIX}${inscricao.id}`, kvData)

      // Adicionar ID ao índice (usando ZSET com timestamp como score)
      const timestamp = new Date(inscricao.dataInscricao).getTime()
      await kv.zadd(REGS_INDEX_KEY, { score: timestamp, member: inscricao.id })

      console.log(`✓ Migrado: ${inscricao.id}`)
    } catch (error) {
      console.error(`✗ Erro ao migrar ${inscricao.id}:`, error)
    }
  }

  console.log('Migração concluída!')
}

migrate().catch(console.error)

