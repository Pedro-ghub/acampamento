# Acampamento de Carnaval 2026 - Vazio

Site do acampamento gospel para jovens e adolescentes.

## 🚀 Tecnologias

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- React 18
- Vercel KV (para área administrativa)

## 📦 Instalação

```bash
npm install
```

## 🛠️ Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🏗️ Build para Produção

```bash
npm run build
npm start
```

## 📋 Deploy na Vercel

1. Conecte seu repositório à Vercel
2. A Vercel detectará automaticamente o Next.js
3. Configure as variáveis de ambiente:
   - `ADMIN_KEY` - Chave secreta para área administrativa
   - Variáveis do KV são configuradas automaticamente
4. O deploy será feito automaticamente a cada push

Ou use a CLI:

```bash
npm i -g vercel
vercel
```

## 📁 Estrutura do Projeto

```
├── app/
│   ├── layout.tsx      # Layout principal
│   ├── page.tsx        # Página inicial
│   ├── formulario/     # Página de formulário
│   ├── pagamento/      # Página de pagamento PIX
│   ├── comprovante/    # Página de envio de comprovante
│   ├── __adm_acampamento_carnaval_2026__/  # Área administrativa
│   └── api/            # API routes
├── components/          # Componentes React
├── lib/                 # Utilitários (KV, migração)
└── public/              # Arquivos estáticos
```

## ✨ Funcionalidades

- ✅ Homepage com design moderno
- ✅ Timer de contagem regressiva funcional
- ✅ Player de música YouTube integrado
- ✅ Formulário de inscrição completo
- ✅ Página de pagamento PIX com QR Code
- ✅ Upload de comprovante de pagamento
- ✅ Área administrativa secreta
- ✅ Design responsivo (mobile-first)
- ✅ Integração com Vercel KV

## 📅 Data do Evento

O timer está configurado para: **14 de fevereiro de 2026 às 10h**

## 🔐 Área Administrativa

Consulte o arquivo `ADMIN_README.md` para informações sobre a área administrativa.

## 📝 Variáveis de Ambiente

Crie um arquivo `.env.local` com:

```env
ADMIN_KEY=sua_chave_secreta_aqui
```

As variáveis do Vercel KV são configuradas automaticamente na Vercel.
