import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import LoginForm from '@/app/components/LoginForm'

export const metadata = {
  title: 'Login - Fazenda Viçosa',
  description: 'Faça login na sua conta Fazenda Viçosa',
}

export default async function LoginPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getSession()

  if (data?.session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex">
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-[var(--primary)] via-[var(--primary-light)] to-[var(--accent)]">
        <div className="text-center text-white px-8">
          <div className="text-6xl mb-4">🌾</div>
          <h1 className="text-4xl font-bold font-merriweather mb-4">
            Fazenda Viçosa
          </h1>
          <p className="text-lg font-poppins opacity-90">
            Gerenciar sua propriedade rural nunca foi tão fácil
          </p>
          <div className="mt-12 space-y-4 text-left max-w-sm mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                ✓
              </div>
              <p className="font-poppins">Controle de plantações</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                ✓
              </div>
              <p className="font-poppins">Gestão de recursos</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                ✓
              </div>
              <p className="font-poppins">Relatórios em tempo real</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[var(--bg)]">
        <LoginForm />
      </div>
    </div>
  )
}
