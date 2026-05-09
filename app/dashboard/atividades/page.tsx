import { createClient } from '@/app/lib/supabase/server'
import { cookies } from 'next/headers'
import AtividadesClient, { type Atividade } from './AtividadesClient'

export default async function AtividadesPage() {
  const supabase = await createClient()

  const cookieStore = await cookies()
  const fazendaId = cookieStore.get('fazenda_id')?.value

  let atividades = []
  let produtos = []
  let piquetes = []

  if (fazendaId) {
    const [resAtiv, resProd, resPiq] = await Promise.all([
      supabase
        .from('atividade')
        .select('id, data, tipo, modalidade, volume, unidade, quantidade_unidade, observacao, produto_id, produto(nome), piquete_id, piquete(nome)')
        .eq('fazenda_id', fazendaId)
        .order('data', { ascending: false })
        .limit(50),
      supabase
        .from('produto')
        .select('id, nome, categoria')
        .eq('ativo', true)
        .eq('fazenda_id', fazendaId)
        .order('nome'),
      supabase
        .from('piquete')
        .select('id, nome')
        .eq('ativo', true)
        .eq('fazenda_id', fazendaId)
        .order('nome')
    ])
    
    atividades = resAtiv.data || []
    produtos = resProd.data || []
    piquetes = resPiq.data || []
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--primary)] font-merriweather">
          🚜 Atividades no Campo
        </h1>
        <p className="text-sm text-gray-500 font-poppins mt-1">
          {!fazendaId ? 'Selecione uma fazenda para continuar.' : `Últimos ${atividades.length} registros`}
        </p>
      </div>

      <AtividadesClient 
        atividades={atividades} 
        produtosDisponiveis={produtos} 
        piquetesDisponiveis={piquetes} 
      />
    </div>
  )
}
