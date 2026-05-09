import { createClient } from '@/app/lib/supabase/server'
import { cookies } from 'next/headers'
import ChuvaClient, { type RegistroChuva } from './ChuvaClient'

export default async function ChuvaPage() {
  const supabase = await createClient()

  const cookieStore = await cookies()
  const fazendaId = cookieStore.get('fazenda_id')?.value

  let registros = []
  let error = null

  if (fazendaId) {
    const res = await supabase
      .from('chuva')
      .select('id, data, volume_mm, observacao')
      .eq('fazenda_id', fazendaId)
      .order('data', { ascending: false })
      .limit(50)
    registros = res.data || []
    error = res.error
  }

  if (error) console.error('Erro ao buscar chuva:', error)

  const lista: RegistroChuva[] = registros ?? []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--primary)] font-merriweather">
          🌧️ Registro de Chuva
        </h1>
        <p className="text-sm text-gray-500 font-poppins mt-1">
          {!fazendaId ? 'Selecione uma fazenda para continuar.' : `Últimos ${lista.length} registros`}
        </p>
      </div>

      <ChuvaClient registros={lista} />
    </div>
  )
}
