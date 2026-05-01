'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UsuarioForm() {
  const router = useRouter()

  const [aberto, setAberto] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const isValido = nome.trim() !== '' && email.trim() !== '' && senha.length >= 6

  const resetForm = () => {
    setNome('')
    setEmail('')
    setSenha('')
    setMostrarSenha(false)
    setErro('')
  }

  const handleSalvar = async () => {
    if (!isValido) return
    setLoading(true)
    setErro('')
    setSucesso(false)

    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome.trim(), email: email.trim(), senha }),
      })

      const json = await res.json()
      if (!res.ok) {
        setErro(json.error || 'Erro ao criar usuário')
        return
      }

      setSucesso(true)
      resetForm()
      setAberto(false)
      router.refresh()
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-2">
      {sucesso && (
        <div className="mb-4 p-3 bg-green-50 border border-green-300 rounded-lg text-green-700 text-sm font-poppins">
          ✅ Operador criado com sucesso!
        </div>
      )}

      {!aberto ? (
        <button
          onClick={() => { setSucesso(false); setAberto(true) }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-white rounded-lg font-poppins font-semibold hover:bg-[#1a3009] transition-colors"
        >
          + Novo Operador
        </button>
      ) : (
        <div className="bg-white border-2 border-[var(--primary)] rounded-xl p-5 shadow-sm">
          <h2 className="text-base font-semibold text-[var(--primary)] font-poppins mb-4">
            Criar Operador
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
                disabled={loading}
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
                disabled={loading}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-poppins text-sm focus:outline-none focus:border-[var(--primary)] disabled:bg-gray-100 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1 font-poppins">
                Senha <span className="text-[var(--error)]">*</span>
              </label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  disabled={loading}
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

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleSalvar}
              disabled={!isValido || loading}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-[var(--primary)] text-white rounded-lg font-poppins font-semibold text-sm hover:bg-[#1a3009] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Criando...' : 'Criar Operador'}
            </button>
            <button
              onClick={() => { resetForm(); setAberto(false) }}
              disabled={loading}
              className="flex-1 sm:flex-none px-6 py-2.5 border-2 border-gray-300 text-gray-600 rounded-lg font-poppins font-semibold text-sm hover:border-gray-400 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
