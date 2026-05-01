import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import { createAdminClient } from '@/app/lib/supabase/admin'
import UsuariosClient, { type Usuario } from './UsuariosClient'

export default async function UsuariosPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: meuPerfil } = await supabase
    .from('perfil')
    .select('perfil')
    .eq('id', user.id)
    .single()

  if (meuPerfil?.perfil !== 'gestor') redirect('/dashboard')

  const admin = createAdminClient()

  const [{ data: perfis }, { data: authUsers }] = await Promise.all([
    admin.from('perfil').select('id, nome, perfil').order('nome'),
    admin.auth.admin.listUsers(),
  ])

  // Combina perfil + email do auth
  const emailPorId: Record<string, string> = {}
  for (const u of authUsers?.users ?? []) {
    emailPorId[u.id] = u.email ?? ''
  }

  const usuarios: Usuario[] = (perfis ?? []).map((p) => ({
    id: p.id,
    nome: p.nome,
    perfil: p.perfil,
    email: emailPorId[p.id] ?? '',
  }))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--primary)] font-merriweather">
          👥 Usuários
        </h1>
        <p className="text-sm text-gray-500 font-poppins mt-1">
          {usuarios.length} usuário{usuarios.length !== 1 ? 's' : ''} cadastrado{usuarios.length !== 1 ? 's' : ''}
        </p>
      </div>

      <UsuariosClient usuarios={usuarios} />
    </div>
  )
}
