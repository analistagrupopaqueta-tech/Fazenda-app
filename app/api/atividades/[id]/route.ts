import { createClient } from '@/app/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const MODALIDADES: Record<string, string[]> = {
  Adubação: ['Manual', 'Trator'],
  Herbicida: ['Costal', 'Stihl', 'Trator'],
  Roçagem: ['Foice', 'Roçadeira', 'Enxada'],
}

const UNIDADES: Record<string, string[]> = {
  Adubação: ['Sacos', 'Kg'],
  Herbicida: ['Baldes', 'Jatão'],
}

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, tipo, modalidade, produto_id, piquete_id, volume, unidade, quantidade_unidade, observacao } =
      await request.json()

    if (!data || !tipo || !modalidade || !piquete_id) {
      return NextResponse.json(
        { error: 'Data, tipo, modalidade e piquete são obrigatórios' },
        { status: 400 }
      )
    }

    if (!Object.keys(MODALIDADES).includes(tipo)) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }

    if (!MODALIDADES[tipo].includes(modalidade)) {
      return NextResponse.json({ error: `Modalidade inválida para ${tipo}` }, { status: 400 })
    }

    if (tipo === 'Herbicida' && !produto_id) {
      return NextResponse.json({ error: 'Produto é obrigatório para Herbicida' }, { status: 400 })
    }

    if (UNIDADES[tipo]) {
      if (!unidade || !UNIDADES[tipo].includes(unidade)) {
        return NextResponse.json({ error: `Unidade inválida para ${tipo}` }, { status: 400 })
      }
      if (volume == null || volume === '') {
        return NextResponse.json({ error: 'Volume é obrigatório para este tipo' }, { status: 400 })
      }
      if ((unidade === 'Sacos' || unidade === 'Baldes') && (quantidade_unidade == null || quantidade_unidade === '')) {
        return NextResponse.json({ error: 'A quantidade de sacos/baldes é obrigatória' }, { status: 400 })
      }
    }

    const cookieStore = await cookies()
    const fazenda_id = cookieStore.get('fazenda_id')?.value
    if (!fazenda_id) {
      return NextResponse.json({ error: 'Fazenda não selecionada' }, { status: 400 })
    }

    const user = await getAuthenticatedUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const supabase = await createClient()
    const { error } = await supabase
      .from('atividade')
      .update({
        data,
        tipo,
        modalidade,
        produto_id: produto_id || null,
        piquete_id,
        volume: volume != null && volume !== '' ? Number(volume) : null,
        unidade: unidade || null,
        quantidade_unidade: quantidade_unidade != null && quantidade_unidade !== '' ? Number(quantidade_unidade) : null,
        observacao: observacao?.trim() || null,
      })
      .eq('id', id)
      .eq('fazenda_id', fazenda_id)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Erro ao atualizar atividade' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PUT /api/atividades/[id] error:', err)
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const cookieStore = await cookies()
    const fazenda_id = cookieStore.get('fazenda_id')?.value
    if (!fazenda_id) {
      return NextResponse.json({ error: 'Fazenda não selecionada' }, { status: 400 })
    }

    const user = await getAuthenticatedUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const supabase = await createClient()
    const { error } = await supabase.from('atividade').delete().eq('id', id).eq('fazenda_id', fazenda_id)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Erro ao excluir atividade' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/atividades/[id] error:', err)
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}
