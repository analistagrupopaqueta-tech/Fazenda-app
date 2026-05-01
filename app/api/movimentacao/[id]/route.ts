import { createClient } from '@/app/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const {
      data, lote_id, piquete_id, tipo_operacao,
      quantidade, observacao,
      altura1, altura2, altura3, altura4, altura5,
    } = await request.json()

    if (!data || !lote_id || !piquete_id || !tipo_operacao) {
      return NextResponse.json(
        { error: 'Data, lote, piquete e tipo são obrigatórios' },
        { status: 400 }
      )
    }

    if (!['Entrada', 'Saída'].includes(tipo_operacao)) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }

    if (tipo_operacao === 'Entrada' && (quantidade == null || quantidade === '')) {
      return NextResponse.json(
        { error: 'Quantidade é obrigatória para Entrada' },
        { status: 400 }
      )
    }

    const alturas = [altura1, altura2, altura3, altura4, altura5]
    if (alturas.filter((a) => a != null && a !== '').length < 5) {
      return NextResponse.json(
        { error: 'As 5 medições de altura do pasto são obrigatórias' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { error } = await supabase
      .from('movimentacao_gado')
      .update({
        data,
        lote_id,
        piquete_id,
        tipo_operacao,
        quantidade: quantidade ? Number(quantidade) : null,
        observacao: observacao?.trim() || null,
        altura1: Number(altura1),
        altura2: Number(altura2),
        altura3: Number(altura3),
        altura4: Number(altura4),
        altura5: Number(altura5),
      })
      .eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Erro ao atualizar movimentação' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PUT /api/movimentacao/[id] error:', err)
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { error } = await supabase.from('movimentacao_gado').delete().eq('id', id)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Erro ao excluir movimentação' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/movimentacao/[id] error:', err)
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}
