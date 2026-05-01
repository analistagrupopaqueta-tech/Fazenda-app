import { createClient } from '@/app/lib/supabase/server'
import ChuvaClient, { type RegistroChuva } from './ChuvaClient'

export default async function ChuvaPage() {
  const supabase = await createClient()

  const { data: registros, error } = await supabase
    .from('chuva')
    .select('id, data, volume_mm, observacao')
    .order('data', { ascending: false })
    .limit(50)

  if (error) console.error('Erro ao buscar chuva:', error)

  const lista: RegistroChuva[] = registros ?? []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--primary)] font-merriweather">
          🌧️ Registro de Chuva
        </h1>
        <p className="text-sm text-gray-500 font-poppins mt-1">
          Últimos {lista.length} registros
        </p>
      </div>

      <ChuvaClient registros={lista} />
    </div>
  )
}
