import { createClient } from '@/app/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { nome, email, senha } = await request.json()

    if (!nome?.trim() || !email?.trim() || !senha) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    if (senha.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    // Verifica se é gestor
    const { data: perfil } = await supabase
      .from('perfil')
      .select('perfil')
      .eq('id', user.id)
      .single()

    if (perfil?.perfil !== 'gestor') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Chama a Edge Function criar-usuario
    const { data: resultado, error } = await supabase.functions.invoke('criar-usuario', {
      body: { nome: nome.trim(), email: email.trim(), senha },
    })

    if (error) {
      console.error('Edge Function error:', error)
      return NextResponse.json(
        { error: 'Erro ao criar usuário. Verifique se o email já está em uso.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: resultado }, { status: 201 })
  } catch (err) {
    console.error('POST /api/usuarios error:', err)
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}
