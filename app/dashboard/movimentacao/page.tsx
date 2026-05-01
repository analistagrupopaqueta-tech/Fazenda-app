import { createClient } from '@/app/lib/supabase/server'
import MovimentacaoClient, { Movimentacao } from './MovimentacaoClient'

export default async function MovimentacaoPage() {
  const supabase = await createClient()

  const [{ data: lotes }, { data: piquetes }, { data: registros, error }, { data: historico }] =
    await Promise.all([
      supabase
        .from('lote')
        .select('id, nome')
        .eq('ativo', true)
        .order('nome'),
      supabase
        .from('piquete')
        .select('id, nome')
        .eq('ativo', true)
        .order('nome'),
      supabase
        .from('movimentacao_gado')
        .select('id, data, tipo_operacao, quantidade, media_altura, altura1, altura2, altura3, altura4, altura5, observacao, lote_id, piquete_id, lote(nome), piquete(nome)')
        .order('data', { ascending: false })
        .limit(50),
      supabase
        .from('movimentacao_gado')
        .select('lote_id, piquete_id, tipo_operacao, data, created_at')
        .order('data', { ascending: false })
        .order('created_at', { ascending: false }),
    ])

  if (error) console.error('Erro ao buscar movimentações:', error)

  const lista = (registros ?? []) as unknown as Movimentacao[]

  const piqueteAtualPorLote: Record<string, string> = {}
  const processedLotes = new Set<string>()
  const piquetesOcupados = new Set<string>()

  for (const mov of historico ?? []) {
    if (!processedLotes.has(mov.lote_id)) {
      processedLotes.add(mov.lote_id)
      piqueteAtualPorLote[mov.lote_id] = mov.piquete_id
      if (mov.tipo_operacao === 'Entrada') {
        piquetesOcupados.add(mov.piquete_id)
      }
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--primary)] font-merriweather">
          🐄 Movimentação de Gado
        </h1>
        <p className="text-sm text-gray-500 font-poppins mt-1">
          Últimos {lista.length} registros
        </p>
      </div>

      <MovimentacaoClient
        movimentacoes={lista}
        lotes={lotes ?? []}
        piquetes={piquetes ?? []}
        piqueteAtualPorLote={piqueteAtualPorLote}
        piquetesOcupados={Array.from(piquetesOcupados)}
      />
    </div>
  )
}
