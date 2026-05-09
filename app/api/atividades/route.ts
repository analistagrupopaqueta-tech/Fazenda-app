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

export async function POST(request: NextRequest) {
  try {
    const { data, tipo, modalidade, produto_id, volume, unidade, quantidade_unidade, observacao } =
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
    if (tipo === 'Herbicida' && !produto_id) {
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
      if ((unidade === 'Sacos' || unidade === 'Baldes') && (quantidade_unidade == null || quantidade_unidade === '')) {
        return NextResponse.json(
          { error: 'A quantidade de sacos/baldes é obrigatória' },
          { status: 400 }
        )
      }
    }

    const cookieStore = await cookies()
    const fazenda_id = cookieStore.get('fazenda_id')?.value
    if (!fazenda_id) {
      return NextResponse.json({ error: 'Fazenda não selecionada' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { error } = await supabase.from('atividade').insert({
      data,
      tipo,
      modalidade,
      produto_id: produto_id || null,
      volume: volume != null && volume !== '' ? Number(volume) : null,
      unidade: unidade || null,
      quantidade_unidade: quantidade_unidade != null && quantidade_unidade !== '' ? Number(quantidade_unidade) : null,
      observacao: observacao?.trim() || null,
      fazenda_id,
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
