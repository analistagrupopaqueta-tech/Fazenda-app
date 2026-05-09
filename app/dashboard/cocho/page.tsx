import { createClient } from '@/app/lib/supabase/server'
import { cookies } from 'next/headers'
import CochoClient, { type RegistroCocho } from './CochoClient'

export default async function CochoPage() {
  const supabase = await createClient()

  const cookieStore = await cookies()
  const fazendaId = cookieStore.get('fazenda_id')?.value

  let lotes: { id: string; nome: string }[] = []
  let registros: RegistroCocho[] = []
  let error = null

  if (fazendaId) {
    const [resLotes, resRegistros] = await Promise.all([
      supabase.from('lote').select('id, nome').eq('ativo', true).eq('fazenda_id', fazendaId).order('nome'),
      supabase
        .from('cocho')
        .select('id, data, kg, observacao, lote_id, lote(nome)')
        .eq('fazenda_id', fazendaId)
        .order('data', { ascending: false })
        .limit(50),
    ])
    lotes = resLotes.data || []
    registros = resRegistros.data || []
    error = resRegistros.error
  }

  if (error) console.error('Erro ao buscar cocho:', error)

  const lista = (registros ?? []) as unknown as RegistroCocho[]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--primary)] font-merriweather">
          🌾 Cocho
        </h1>
        <p className="text-sm text-gray-500 font-poppins mt-1">
          {!fazendaId ? 'Selecione uma fazenda para continuar.' : `Últimos ${lista.length} registros`}
        </p>
      </div>

      <CochoClient registros={lista} lotes={lotes ?? []} />
    </div>
  )
}
