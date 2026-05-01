import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import DashboardNav from '@/app/components/DashboardNav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfil')
    .select('nome, perfil')
    .eq('id', user.id)
    .single()

  const isGestor = perfil?.perfil === 'gestor'
  const nome = perfil?.nome ?? user.email ?? 'Usuário'

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col lg:flex-row">
      <DashboardNav isGestor={isGestor} nome={nome} />
      <main className="flex-1 pb-20 lg:pb-0 lg:ml-64">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
