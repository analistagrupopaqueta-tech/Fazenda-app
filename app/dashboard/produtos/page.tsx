import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import { cookies } from 'next/headers'
import ProdutosClient, { type Produto } from './ProdutosClient'

export default async function ProdutosPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfil')
    .select('perfil')
    .eq('id', user.id)
    .single()

  if (perfil?.perfil !== 'gestor') redirect('/dashboard')

  const cookieStore = await cookies()
  const fazendaId = cookieStore.get('fazenda_id')?.value

  let produtos = []

  if (fazendaId) {
    const { data } = await supabase
      .from('produto')
      .select('id, nome, categoria, ativo')
      .eq('fazenda_id', fazendaId)
      .order('categoria')
      .order('nome')
    produtos = data || []
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--primary)] font-merriweather">
          🧪 Produtos
        </h1>
        <p className="text-sm text-gray-500 font-poppins mt-1">
          {!fazendaId ? 'Selecione uma fazenda para continuar.' : `${produtos.length} produtos cadastrados`}
        </p>
      </div>

      <ProdutosClient produtos={produtos} />
    </div>
  )
}
