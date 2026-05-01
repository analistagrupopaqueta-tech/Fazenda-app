import { createClient } from '@/app/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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
    const { data, tipo, modalidade, produto, volume, unidade, observacao } =
      await request.json()

    if (!data || !tipo || !modalidade) {
      return NextResponse.json(
        { error: 'Data, tipo e modalidade são obrigatórios' },
        { status: 400 }
      )
    }

    if (!Object.keys(MODALIDADES).includes(tipo)) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }

    if (!MODALIDADES[tipo].includes(modalidade)) {
      return NextResponse.json({ error: `Modalidade inválida para ${tipo}` }, { status: 400 })
    }

    if (tipo === 'Herbicida' && !produto) {
      return NextResponse.json({ error: 'Produto é obrigatório para Herbicida' }, { status: 400 })
    }

    if (UNIDADES[tipo]) {
      if (!unidade || !UNIDADES[tipo].includes(unidade)) {
        return NextResponse.json({ error: `Unidade inválida para ${tipo}` }, { status: 400 })
      }
      if (volume == null || volume === '') {
        return NextResponse.json({ error: 'Volume é obrigatório para este tipo' }, { status: 400 })
      }
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
        produto: produto || null,
        volume: volume != null && volume !== '' ? Number(volume) : null,
        unidade: unidade || null,
        observacao: observacao?.trim() || null,
      })
      .eq('id', id)

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

    const user = await getAuthenticatedUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const supabase = await createClient()
    const { error } = await supabase.from('atividade').delete().eq('id', id)

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
