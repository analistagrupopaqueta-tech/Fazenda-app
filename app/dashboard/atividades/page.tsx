import { createClient } from '@/app/lib/supabase/server'
import AtividadesClient, { type Atividade } from './AtividadesClient'

export default async function AtividadesPage() {
  const supabase = await createClient()

  const { data: registros, error } = await supabase
    .from('atividade')
    .select('id, data, tipo, modalidade, produto, volume, unidade, observacao')
    .order('data', { ascending: false })
    .limit(50)

  if (error) console.error('Erro ao buscar atividades:', error)

  const atividades: Atividade[] = registros ?? []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--primary)] font-merriweather">
          🚜 Atividades no Campo
        </h1>
        <p className="text-sm text-gray-500 font-poppins mt-1">
          Últimos {atividades.length} registros
        </p>
      </div>

      <AtividadesClient atividades={atividades} />
    </div>
  )
}
