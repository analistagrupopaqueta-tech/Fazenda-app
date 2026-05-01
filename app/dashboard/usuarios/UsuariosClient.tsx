'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export type Usuario = {
  id: string
  nome: string
  perfil: 'gestor' | 'operador'
  email?: string
}

type Modo = { tipo: 'criar' } | { tipo: 'editar'; usuario: Usuario }

function UsuarioForm({
  modo,
  onSalvar,
  onExcluir,
  onCancelar,
}: {
  modo: Modo
  onSalvar: (dados: { nome: string; email: string; senha: string }) => Promise<void>
  onExcluir?: () => Promise<void>
  onCancelar: () => void
}) {
  const editando = modo.tipo === 'editar'
  const isGestor = editando && modo.usuario.perfil === 'gestor'

  const [nome, setNome] = useState(editando ? modo.usuario.nome : '')
  const [email, setEmail] = useState(editando ? (modo.usuario.email ?? '') : '')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const [confirmarExclusao, setConfirmarExclusao] = useState(false)
  const [erro, setErro] = useState('')

  const senhaValida = editando ? senha === '' || senha.length >= 6 : senha.length >= 6
  const isValido = nome.trim() !== '' && email.trim() !== '' && senhaValida

  const handleSalvar = async () => {
    if (!isValido) return
    setLoading(true)
    setErro('')
    try {
      await onSalvar({ nome, email, senha })
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  const handleExcluir = async () => {
    if (!onExcluir) return
    setExcluindo(true)
    setErro('')
    try {
      await onExcluir()
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao excluir')
      setConfirmarExclusao(false)
    } finally {
      setExcluindo(false)
    }
  }

  return (
    <div className="bg-white border-2 border-[var(--primary)] rounded-xl p-5 shadow-sm mb-4">
      <h2 className="text-base font-semibold text-[var(--primary)] font-poppins mb-4">
        {editando ? `Editar — ${modo.usuario.nome}` : 'Novo Operador'}
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-1 font-poppins">
            Nome completo <span className="text-[var(--error)]">*</span>
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: João Silva"
            disabled={loading || excluindo}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-poppins text-sm focus:outline-none focus:border-[var(--primary)] disabled:bg-gray-100 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-1 font-poppins">
            Email <span className="text-[var(--error)]">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="operador@email.com"
            disabled={loading || excluindo}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-poppins text-sm focus:outline-none focus:border-[var(--primary)] disabled:bg-gray-100 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-1 font-poppins">
            Senha{' '}
            {editando
              ? <span className="text-gray-400 font-normal">(deixe em branco para manter)</span>
              : <span className="text-[var(--error)]">*</span>
            }
          </label>
          <div className="relative">
            <input
              type={mostrarSenha ? 'text' : 'password'}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder={editando ? '••••••••' : 'Mínimo 6 caracteres'}
              disabled={loading || excluindo}
              className="w-full px-3 py-2 pr-10 border-2 border-gray-200 rounded-lg font-poppins text-sm focus:outline-none focus:border-[var(--primary)] disabled:bg-gray-100 transition"
            />
            <button
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {mostrarSenha ? '🙈' : '👁️'}
            </button>
          </div>
          {senha.length > 0 && senha.length < 6 && (
            <p className="text-xs text-[var(--error)] font-poppins mt-1">
              Mínimo 6 caracteres
            </p>
          )}
        </div>
      </div>

      {erro && (
        <div className="mt-3 p-3 bg-red-50 border border-[var(--error)] rounded-lg text-[var(--error)] text-sm font-poppins">
          {erro}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex gap-3">
          <button
            onClick={handleSalvar}
            disabled={!isValido || loading || excluindo}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-[var(--primary)] text-white rounded-lg font-poppins font-semibold text-sm hover:bg-[#1a3009] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Salvando...' : editando ? 'Salvar alterações' : 'Criar Operador'}
          </button>
          <button
            onClick={onCancelar}
            disabled={loading || excluindo}
            className="flex-1 sm:flex-none px-6 py-2.5 border-2 border-gray-300 text-gray-600 rounded-lg font-poppins font-semibold text-sm hover:border-gray-400 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
        </div>

        {/* Exclusão — só para operadores, não para gestor */}
        {editando && onExcluir && !isGestor && (
          <div className="border-t border-gray-100 pt-3">
            {!confirmarExclusao ? (
              <button
                onClick={() => setConfirmarExclusao(true)}
                disabled={loading || excluindo}
                className="text-sm text-[var(--error)] font-poppins hover:underline disabled:opacity-50"
              >
                Excluir usuário
              </button>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-sm text-[var(--error)] font-poppins font-medium">
                  Confirmar exclusão de {modo.usuario.nome}?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleExcluir}
                    disabled={excluindo}
                    className="px-4 py-1.5 bg-[var(--error)] text-white rounded-lg font-poppins font-semibold text-sm hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {excluindo ? 'Excluindo...' : 'Sim, excluir'}
                  </button>
                  <button
                    onClick={() => setConfirmarExclusao(false)}
                    disabled={excluindo}
                    className="px-4 py-1.5 border-2 border-gray-300 text-gray-600 rounded-lg font-poppins font-semibold text-sm hover:border-gray-400 disabled:opacity-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function UsuariosClient({ usuarios }: { usuarios: Usuario[] }) {
  const router = useRouter()
  const [modo, setModo] = useState<Modo | null>(null)
  const [sucesso, setSucesso] = useState('')

  const mostrarSucesso = (msg: string) => {
    setSucesso(msg)
    setTimeout(() => setSucesso(''), 3000)
  }

  const handleCriar = async (dados: { nome: string; email: string; senha: string }) => {
    const res = await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error)
    setModo(null)
    mostrarSucesso('Operador criado com sucesso!')
    router.refresh()
  }

  const handleEditar = async (
    id: string,
    dados: { nome: string; email: string; senha: string }
  ) => {
    const res = await fetch(`/api/usuarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error)
    setModo(null)
    mostrarSucesso('Usuário atualizado com sucesso!')
    router.refresh()
  }

  const handleExcluir = async (id: string) => {
    const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error)
    setModo(null)
    mostrarSucesso('Usuário excluído com sucesso!')
    router.refresh()
  }

  return (
    <div>
      {sucesso && (
        <div className="mb-4 p-3 bg-green-50 border border-green-300 rounded-lg text-green-700 text-sm font-poppins">
          ✅ {sucesso}
        </div>
      )}

      {modo === null && (
        <button
          onClick={() => setModo({ tipo: 'criar' })}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-white rounded-lg font-poppins font-semibold hover:bg-[#1a3009] transition-colors mb-6"
        >
          + Novo Operador
        </button>
      )}

      {modo?.tipo === 'criar' && (
        <UsuarioForm
          modo={modo}
          onSalvar={handleCriar}
          onCancelar={() => setModo(null)}
        />
      )}

      {usuarios.length === 0 ? (
        <div className="text-center py-16 text-gray-400 font-poppins">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-base">Nenhum usuário cadastrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {usuarios.map((u) => (
            <div key={u.id}>
              {modo?.tipo === 'editar' && modo.usuario.id === u.id ? (
                <UsuarioForm
                  modo={modo}
                  onSalvar={(dados) => handleEditar(u.id, dados)}
                  onExcluir={() => handleExcluir(u.id)}
                  onCancelar={() => setModo(null)}
                />
              ) : (
                <button
                  onClick={() => setModo({ tipo: 'editar', usuario: u })}
                  className="w-full text-left bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 hover:border-[var(--primary)] hover:shadow-md transition-all duration-200 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--text)] font-poppins">
                      {u.nome}
                    </p>
                    {u.email && (
                      <p className="text-xs text-gray-500 font-poppins mt-0.5">{u.email}</p>
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full font-poppins shrink-0 ${
                      u.perfil === 'gestor'
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {u.perfil === 'gestor' ? 'Gestor' : 'Operador'}
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
