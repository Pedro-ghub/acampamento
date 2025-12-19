import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Acampamento de Carnaval 2026 - Vazio',
  description: 'Um acampamento para ensinar jovens e adolescentes a viverem como filhos do Rei, com fé, amor e obediência.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  )
}

