import { createClient } from '@/app/lib/supabase/server'
import CochoClient, { type RegistroCocho } from './CochoClient'

export default async function CochoPage() {
  const supabase = await createClient()

  const [{ data: lotes }, { data: registros, error }] = await Promise.all([
    supabase.from('lote').select('id, nome').eq('ativo', true).order('nome'),
    supabase
      .from('cocho')
      .select('id, data, kg, observacao, lote_id, lote(nome)')
      .order('data', { ascending: false })
      .limit(50),
  ])

  if (error) console.error('Erro ao buscar cocho:', error)

  const lista = (registros ?? []) as unknown as RegistroCocho[]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--primary)] font-merriweather">
          🌾 Cocho
        </h1>
        <p className="text-sm text-gray-500 font-poppins mt-1">
          Últimos {lista.length} registros
        </p>
      </div>

      <CochoClient registros={lista} lotes={lotes ?? []} />
    </div>
  )
}
