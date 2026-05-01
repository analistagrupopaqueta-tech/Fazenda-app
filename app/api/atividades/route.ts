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

export async function POST(request: NextRequest) {
  try {
    const { data, tipo, modalidade, produto, volume, unidade, observacao } =
      await request.json()

    if (!data || !tipo || !modalidade) {
      return NextResponse.json(
        { error: 'Data, tipo e modalidade são obrigatórios' },
        { status: 400 }
      )
    }

    // Valida tipo
    if (!Object.keys(MODALIDADES).includes(tipo)) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }

    // Valida modalidade para o tipo
    if (!MODALIDADES[tipo].includes(modalidade)) {
      return NextResponse.json(
        { error: `Modalidade inválida para ${tipo}` },
        { status: 400 }
      )
    }

    // Herbicida exige produto
    if (tipo === 'Herbicida' && !produto) {
      return NextResponse.json(
        { error: 'Produto é obrigatório para Herbicida' },
        { status: 400 }
      )
    }

    // Adubação e Herbicida exigem unidade e volume
    if (UNIDADES[tipo]) {
      if (!unidade || !UNIDADES[tipo].includes(unidade)) {
        return NextResponse.json(
          { error: `Unidade inválida para ${tipo}` },
          { status: 400 }
        )
      }
      if (volume == null || volume === '') {
        return NextResponse.json(
          { error: 'Volume é obrigatório para este tipo' },
          { status: 400 }
        )
      }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { error } = await supabase.from('atividade').insert({
      data,
      tipo,
      modalidade,
      produto: produto || null,
      volume: volume != null && volume !== '' ? Number(volume) : null,
      unidade: unidade || null,
      observacao: observacao?.trim() || null,
    })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Erro ao salvar atividade' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('POST /api/atividades error:', err)
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}
