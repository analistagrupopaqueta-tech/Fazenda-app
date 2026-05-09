import { createClient } from '@/app/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data, volume_mm, observacao } = body

    if (!data || volume_mm == null) {
      return NextResponse.json(
        { error: 'Data e volume são obrigatórios' },
        { status: 400 }
      )
    }

    const volumeNum = Number(volume_mm)
    if (isNaN(volumeNum) || volumeNum < 0) {
      return NextResponse.json(
        { error: 'Volume deve ser um número positivo' },
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

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { error } = await supabase.from('chuva').insert({
      data,
      volume_mm: volumeNum,
      observacao: observacao?.trim() || null,
      fazenda_id,
    })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Erro ao salvar registro' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('POST /api/chuva error:', err)
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}
