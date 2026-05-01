import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import LotesClient from './LotesClient'

export default async function LotesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfil')
    .select('perfil')
    .eq('id', user.id)
    .single()

  if (perfil?.perfil !== 'gestor') redirect('/dashboard')

  const [{ data: lotes }, { data: piquetes }] = await Promise.all([
    supabase
      .from('lote')
      .select('id, nome, descricao, num_animais, peso_medio_kg, ativo')
      .order('nome'),
    supabase
      .from('piquete')
      .select('id, nome, area_ha, ativo')
      .order('nome'),
  ])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--primary)] font-merriweather">
          📋 Lotes e Piquetes
        </h1>
        <p className="text-sm text-gray-500 font-poppins mt-1">
          {lotes?.length ?? 0} lotes · {piquetes?.length ?? 0} piquetes cadastrados
        </p>
      </div>

      <LotesClient lotes={lotes ?? []} piquetes={piquetes ?? []} />
    </div>
  )
}
