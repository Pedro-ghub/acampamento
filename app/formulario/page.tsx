import Header from '@/components/Header'
import FormularioInscricao from '@/components/FormularioInscricao'

export default function FormularioPage() {
  return (
    <main className="relative flex h-auto min-h-screen w-full flex-col bg-slate-50 overflow-x-hidden">
      <Header />
      <FormularioInscricao />
      
      {/* Footer */}
      <footer className="flex flex-col items-center gap-4 py-8 bg-slate-100">
        <div className="flex items-center gap-2 opacity-60">
          <span className="text-xs font-semibold text-slate-500">Igreja Presbiteriana do Brasil</span>
        </div>
        <p className="text-[10px] text-slate-300">© 2026 PRVI UMP & UPA . Todos os direitos reservados.</p>
      </footer>
    </main>
  )
}

