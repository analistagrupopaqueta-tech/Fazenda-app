import { createClient } from '@/app/lib/supabase/server'
import { createAdminClient } from '@/app/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { nome, localizacao } = await request.json()

    if (!nome?.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Apenas gestor pode criar fazenda
    const { data: perfil } = await supabase
      .from('perfil')
      .select('perfil')
      .eq('id', user.id)
      .single()

    if (perfil?.perfil !== 'gestor') {
      return NextResponse.json({ error: 'Acesso negado. Apenas gestores podem criar fazendas.' }, { status: 403 })
    }

    // Inserir a fazenda usando o admin client para bypassar o RLS (problema de ovo e galinha)
    const adminClient = createAdminClient()
    const { data: novaFazenda, error: insertError } = await adminClient
      .from('fazenda')
      .insert({
        nome: nome.trim(),
        localizacao: localizacao?.trim() || null,
        criado_por: user.id
      })
      .select()
      .single()

    if (insertError) {
      console.error('Erro ao criar fazenda:', insertError)
      return NextResponse.json({ error: 'Erro ao salvar a fazenda' }, { status: 500 })
    }

    // Inserir na tabela fazenda_usuario com o admin client também
    const { error: linkError } = await adminClient
      .from('fazenda_usuario')
      .insert({
        fazenda_id: novaFazenda.id,
        usuario_id: user.id
      })
    
    if (linkError) {
      console.warn('Nota: vínculo fazenda_usuario não inserido (pode já existir via trigger):', linkError.message)
    }

    return NextResponse.json({ success: true, fazenda: novaFazenda }, { status: 201 })
  } catch (err) {
    console.error('POST /api/fazendas error:', err)
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, nome, localizacao, ativo } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'ID da fazenda é obrigatório' }, { status: 400 })
    }
    if (!nome?.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Apenas gestor pode editar fazenda
    const { data: perfil } = await supabase
      .from('perfil')
      .select('perfil')
      .eq('id', user.id)
      .single()

    if (perfil?.perfil !== 'gestor') {
      return NextResponse.json({ error: 'Acesso negado. Apenas gestores podem editar fazendas.' }, { status: 403 })
    }

    // Atualizar a fazenda
    const updateData: any = {
      nome: nome.trim(),
      localizacao: localizacao?.trim() || null
    }

    if (ativo !== undefined) {
      updateData.ativo = ativo
    }

    const { error: updateError } = await supabase
      .from('fazenda')
      .update(updateData)
      .eq('id', id)

    if (updateError) {
      console.error('Erro ao editar fazenda:', updateError)
      return NextResponse.json({ error: 'Erro ao atualizar a fazenda' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('PUT /api/fazendas error:', err)
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}

