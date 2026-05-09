import { createClient } from '@/app/lib/supabase/server'
import { cookies } from 'next/headers'
import MovimentacaoClient, { Movimentacao } from './MovimentacaoClient'

export default async function MovimentacaoPage() {
  const supabase = await createClient()

  const cookieStore = await cookies()
  const fazendaId = cookieStore.get('fazenda_id')?.value

  let lotes: { id: string; nome: string }[] = []
  let piquetes: { id: string; nome: string }[] = []
  let registros: Movimentacao[] = []
  let historico: { lote_id: string; piquete_id: string; tipo_operacao: string; data: string; created_at: string }[] = []
  let error = null

  if (fazendaId) {
    const [resLotes, resPiquetes, resRegistros, resHistorico] = await Promise.all([
      supabase
        .from('lote')
        .select('id, nome')
        .eq('ativo', true)
        .eq('fazenda_id', fazendaId)
        .order('nome'),
      supabase
        .from('piquete')
        .select('id, nome')
        .eq('ativo', true)
        .eq('fazenda_id', fazendaId)
        .order('nome'),
      supabase
        .from('movimentacao_gado')
        .select('id, data, tipo_operacao, quantidade, qualidade, media_altura, altura1, altura2, altura3, altura4, altura5, observacao, lote_id, piquete_id, lote(nome), piquete(nome)')
        .eq('fazenda_id', fazendaId)
        .order('data', { ascending: false })
        .limit(50),
      supabase
        .from('movimentacao_gado')
        .select('lote_id, piquete_id, tipo_operacao, data, created_at')
        .eq('fazenda_id', fazendaId)
        .order('data', { ascending: false })
        .order('created_at', { ascending: false }),
    ])
    lotes = resLotes.data || []
    piquetes = resPiquetes.data || []
    registros = resRegistros.data || []
    historico = resHistorico.data || []
    error = resRegistros.error
  }

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
          {!fazendaId ? 'Selecione uma fazenda para continuar.' : `Últimos ${lista.length} registros`}
        </p>
      </div>

      <MovimentacaoClient
        movimentacoes={lista}
        lotes={lotes}
        piquetes={piquetes}
        piqueteAtualPorLote={piqueteAtualPorLote}
        piquetesOcupados={Array.from(piquetesOcupados)}
      />
    </div>
  )
}
