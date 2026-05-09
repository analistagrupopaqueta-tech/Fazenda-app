import { createClient } from '@/app/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { lote_id, data, kg, observacao } = await request.json()

    if (!lote_id || !data || kg == null || kg === '') {
      return NextResponse.json(
        { error: 'Lote, data e quantidade (kg) são obrigatórios' },
        { status: 400 }
      )
    }

    const kgNum = Number(kg)
    if (isNaN(kgNum) || kgNum < 0) {
      return NextResponse.json(
        { error: 'Quantidade deve ser um número positivo' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const fazenda_id = cookieStore.get('fazenda_id')?.value
    if (!fazenda_id) {
      return NextResponse.json({ error: 'Fazenda não selecionada' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { error } = await supabase.from('cocho').insert({
      lote_id,
      data,
      kg: kgNum,
      observacao: observacao?.trim() || null,
      fazenda_id,
    })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Erro ao salvar registro' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('POST /api/cocho error:', err)
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}
