# Área Administrativa - Acampamento de Carnaval 2026

## Configuração

### 1. Variáveis de Ambiente

Adicione no arquivo `.env.local` (ou nas variáveis de ambiente da Vercel):

```env
# Chave secreta para acesso à área administrativa
# Gere uma chave segura (ex: openssl rand -hex 32)
ADMIN_KEY=sua_chave_secreta_aqui

# Variáveis do Vercel KV (configuradas automaticamente na Vercel)
# Não precisa configurar manualmente se estiver usando Vercel KV
```

### 2. Configurar Vercel KV

1. Acesse o dashboard da Vercel
2. Vá em **Storage** → **Create Database** → **KV**
3. Crie o banco de dados
4. As variáveis `KV_REST_API_URL`, `KV_REST_API_TOKEN` e `KV_REST_API_READ_ONLY_TOKEN` serão configuradas automaticamente

## Acesso

A área administrativa está disponível em:

```
/__adm_acampamento_carnaval_2026__?k=SUA_CHAVE
```

**IMPORTANTE:** Sem a chave correta na URL, a página retorna 404 (não aparece mensagem de erro).

## Estrutura de Dados no KV

### Índice de IDs
- **Chave:** `camp:regs` (ZSET ou LIST)
- **Valor:** Lista de IDs das inscrições

### Dados de Inscrição
- **Chave:** `camp:reg:<id>`
- **Tipo:** HASH
- **Campos:**
  - `name` (string): Nome completo
  - `phone` (string): Celular/WhatsApp
  - `age` (string, opcional): Idade
  - `church` (string, opcional): Igreja
  - `city` (string, opcional): Cidade
  - `wantsShirt` (string): "true" ou "false"
  - `shirtSize` (string, opcional): PP/P/M/G/GG/XG
  - `paymentStatus` (string): "pending" | "approved" | "rejected"
  - `receiptUrl` (string, opcional): URL do comprovante
  - `createdAt` (string): Data ISO

## Migração de Dados Existentes

Se você já tem inscrições salvas em JSON, execute o script de migração:

```bash
npx tsx lib/migrate-to-kv.ts
```

**Nota:** O script lê de `data/inscricoes.json` e migra para o KV.

## Funcionalidades

### 1. Listagem de Inscrições
- Visualização em cards/tabela
- Ordenação por data (mais recentes primeiro)
- Busca por nome ou telefone
- Filtros por status de pagamento e camiseta

### 2. Gerenciamento de Status
- Marcar como Aprovado
- Marcar como Rejeitado
- Voltar para Pendente

### 3. Visualização de Comprovantes
- Miniatura do comprovante
- Modal para visualização em tamanho grande
- Download do arquivo

### 4. Exportação
- Botão "Exportar CSV (Excel)"
- Formato compatível com Excel
- Inclui BOM UTF-8 para acentos

## API Endpoints

### GET /api/admin/registrations?k=CHAVE
Retorna todas as inscrições ordenadas por data.

### PATCH /api/admin/registrations/[id]?k=CHAVE
Atualiza o status de pagamento.

**Body:**
```json
{
  "paymentStatus": "pending" | "approved" | "rejected"
}
```

### GET /api/admin/export.csv?k=CHAVE
Exporta todas as inscrições em formato CSV.

## Segurança

- Rota não indexada (noindex, nofollow)
- Validação de chave obrigatória
- Retorna 404 se chave inválida (não expõe que a rota existe)
- Sem links públicos para a área admin

## Notas

- As inscrições continuam sendo salvas em JSON como backup
- O KV é a fonte principal para a área administrativa
- Novas inscrições são automaticamente salvas em ambos (JSON + KV)

