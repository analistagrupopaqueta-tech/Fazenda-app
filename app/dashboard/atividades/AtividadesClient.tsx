'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export type Atividade = {
  id: string
  data: string
  tipo: 'Adubação' | 'Herbicida' | 'Roçagem'
  modalidade: string
  produto: string | null
  volume: number | null
  unidade: string | null
  observacao: string | null
}

type Modo = { tipo: 'criar' } | { tipo: 'editar'; atividade: Atividade }

type TipoAtividade = 'Adubação' | 'Herbicida' | 'Roçagem'

const MODALIDADES: Record<TipoAtividade, string[]> = {
  Adubação: ['Manual', 'Trator'],
  Herbicida: ['Costal', 'Stihl', 'Trator'],
  Roçagem: ['Foice', 'Roçadeira', 'Enxada'],
}

const UNIDADES: Record<string, string[]> = {
  Adubação: ['Sacos', 'Kg'],
  Herbicida: ['Baldes', 'Jatão'],
}

const VOLUME_OPCOES: Record<string, number[]> = {
  'Herbicida-Baldes': [5, 10, 15, 20],
  'Herbicida-Jatão': [100, 150, 200, 250, 300, 350, 400],
  'Adubação-Sacos': [25, 30, 40, 50],
  'Adubação-Kg': Array.from({ length: 20 }, (_, i) => (i + 1) * 5),
}

const PRODUTOS = ['Ureia', 'Super simples', 'Calcário', 'Tiririca', 'Amargosa', 'Capim']
const TIPOS: TipoAtividade[] = ['Adubação', 'Herbicida', 'Roçagem']

const TIPO_ICONS: Record<TipoAtividade, string> = {
  Adubação: '🌱',
  Herbicida: '🧴',
  Roçagem: '🌿',
}

const TIPO_CORES: Record<string, string> = {
  Adubação: 'bg-green-100 text-green-700',
  Herbicida: 'bg-blue-100 text-blue-700',
  Roçagem: 'bg-yellow-100 text-yellow-700',
}

function formatarData(dataISO: string) {
  const [ano, mes, dia] = dataISO.split('-')
  return `${dia}/${mes}/${ano}`
}

type FormPayload = {
  data: string
  tipo: TipoAtividade
  modalidade: string
  produto: string | null
  volume: number | null
  unidade: string | null
  observacao: string | null
}

function AtividadeForm({
  modo,
  onSalvar,
  onExcluir,
  onCancelar,
}: {
  modo: Modo
  onSalvar: (dados: FormPayload) => Promise<void>
  onExcluir?: () => Promise<void>
  onCancelar: () => void
}) {
  const editando = modo.tipo === 'editar'
  const inicial = editando ? modo.atividade : null
  const hoje = new Date().toISOString().split('T')[0]

  const [data, setData] = useState(inicial?.data ?? hoje)
  const [tipo, setTipo] = useState<TipoAtividade | ''>(inicial?.tipo ?? '')
  const [modalidade, setModalidade] = useState(inicial?.modalidade ?? '')
  const [produto, setProduto] = useState(inicial?.produto ?? '')
  const [volume, setVolume] = useState(inicial?.volume?.toString() ?? '')
  const [unidade, setUnidade] = useState(inicial?.unidade ?? '')
  const [observacao, setObservacao] = useState(inicial?.observacao ?? '')

  const [loading, setLoading] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const [confirmarExclusao, setConfirmarExclusao] = useState(false)
  const [erro, setErro] = useState('')

  const volumeOpcoes = tipo && unidade ? (VOLUME_OPCOES[`${tipo}-${unidade}`] ?? null) : null

  const temProduto = tipo === 'Herbicida' || tipo === 'Roçagem'
  const produtoObrigatorio = tipo === 'Herbicida'
  const temUnidade = tipo === 'Adubação' || tipo === 'Herbicida'

  const isValido =
    data !== '' &&
    tipo !== '' &&
    modalidade !== '' &&
    (!produtoObrigatorio || produto !== '') &&
    (!temUnidade || (unidade !== '' && volume !== ''))

  const handleTipo = (t: TipoAtividade) => {
    setTipo(t)
    setModalidade('')
    setProduto('')
    setVolume('')
    setUnidade('')
  }

  const handleSalvar = async () => {
    if (!isValido || !tipo) return
    setLoading(true)
    setErro('')
    try {
      await onSalvar({
        data,
        tipo,
        modalidade,
        produto: temProduto && produto ? produto : null,
        volume: temUnidade && volume ? Number(volume) : null,
        unidade: temUnidade && unidade ? unidade : null,
        observacao: observacao.trim() || null,
      })
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
        {editando ? 'Editar Atividade' : 'Nova Atividade no Campo'}
      </h2>

      <div className="space-y-4">
        {/* Data */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-1 font-poppins">
            Data <span className="text-[var(--error)]">*</span>
          </label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            max={hoje}
            disabled={loading || excluindo}
            className="w-full sm:w-48 px-3 py-2 border-2 border-gray-200 rounded-lg font-poppins text-sm focus:outline-none focus:border-[var(--primary)] disabled:bg-gray-100 transition"
          />
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-[var(--text)] mb-2 font-poppins">
            Tipo <span className="text-[var(--error)]">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {TIPOS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTipo(t)}
                disabled={loading || excluindo}
                className={`py-2.5 px-2 rounded-lg font-poppins font-semibold text-sm border-2 transition-colors flex flex-col items-center gap-1 ${
                  tipo === t
                    ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <span className="text-xl">{TIPO_ICONS[t]}</span>
                <span className="text-xs leading-tight text-center">{t}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Modalidade */}
        {tipo !== '' && (
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2 font-poppins">
              Modalidade <span className="text-[var(--error)]">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {MODALIDADES[tipo].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModalidade(m)}
                  disabled={loading || excluindo}
                  className={`px-4 py-2 rounded-lg font-poppins text-sm border-2 transition-colors ${
                    modalidade === m
                      ? 'bg-[var(--primary-light)] border-[var(--primary-light)] text-white font-semibold'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Produto */}
        {temProduto && (
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1 font-poppins">
              Produto{' '}
              {produtoObrigatorio
                ? <span className="text-[var(--error)]">*</span>
                : <span className="text-gray-400 font-normal">(opcional)</span>
              }
            </label>
            <select
              value={produto}
              onChange={(e) => setProduto(e.target.value)}
              disabled={loading || excluindo}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-poppins text-sm focus:outline-none focus:border-[var(--primary)] disabled:bg-gray-100 transition bg-white"
            >
              <option value="">Selecione...</option>
              {PRODUTOS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        )}

        {/* Unidade + Volume */}
        {temUnidade && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2 font-poppins">
                Unidade <span className="text-[var(--error)]">*</span>
              </label>
              <div className="flex gap-2">
                {UNIDADES[tipo].map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => { setUnidade(u); setVolume('') }}
                    disabled={loading || excluindo}
                    className={`flex-1 px-3 py-2 rounded-lg font-poppins text-sm border-2 transition-colors ${
                      unidade === u
                        ? 'bg-[var(--accent)] border-[var(--accent)] text-white font-semibold'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1 font-poppins">
                Volume <span className="text-[var(--error)]">*</span>
              </label>
              {volumeOpcoes ? (
                <select
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  disabled={loading || excluindo}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-poppins text-sm focus:outline-none focus:border-[var(--primary)] disabled:bg-gray-100 transition bg-white"
                >
                  <option value="">Selecione...</option>
                  {volumeOpcoes.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  placeholder="Qtd."
                  min="0"
                  step="0.1"
                  disabled={loading || excluindo}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-poppins text-sm focus:outline-none focus:border-[var(--primary)] disabled:bg-gray-100 transition"
                />
              )}
            </div>
          </div>
        )}

        {/* Observação */}
        {tipo !== '' && (
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1 font-poppins">
              Observação
            </label>
            <input
              type="text"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Opcional"
              disabled={loading || excluindo}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-poppins text-sm focus:outline-none focus:border-[var(--primary)] disabled:bg-gray-100 transition"
            />
          </div>
        )}
      </div>

      {erro && (
        <div className="mt-3 p-3 bg-red-50 border border-[var(--error)] rounded-lg text-[var(--error)] text-sm font-poppins">
          {erro}
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3">
        <div className="flex gap-3">
          <button
            onClick={handleSalvar}
            disabled={!isValido || loading || excluindo}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-[var(--primary)] text-white rounded-lg font-poppins font-semibold text-sm hover:bg-[#1a3009] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Salvando...' : editando ? 'Salvar alterações' : 'Salvar'}
          </button>
          <button
            onClick={onCancelar}
            disabled={loading || excluindo}
            className="flex-1 sm:flex-none px-6 py-2.5 border-2 border-gray-300 text-gray-600 rounded-lg font-poppins font-semibold text-sm hover:border-gray-400 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
        </div>

        {editando && onExcluir && (
          <div className="border-t border-gray-100 pt-3">
            {!confirmarExclusao ? (
              <button
                onClick={() => setConfirmarExclusao(true)}
                disabled={loading || excluindo}
                className="text-sm text-[var(--error)] font-poppins hover:underline disabled:opacity-50"
              >
                Excluir atividade
              </button>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-sm text-[var(--error)] font-poppins font-medium">
                  Confirmar exclusão?
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

export default function AtividadesClient({ atividades }: { atividades: Atividade[] }) {
  const router = useRouter()
  const [modo, setModo] = useState<Modo | null>(null)
  const [sucesso, setSucesso] = useState('')

  const mostrarSucesso = (msg: string) => {
    setSucesso(msg)
    setTimeout(() => setSucesso(''), 3000)
  }

  const handleCriar = async (dados: FormPayload) => {
    const res = await fetch('/api/atividades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error)
    setModo(null)
    mostrarSucesso('Atividade registrada com sucesso!')
    router.refresh()
  }

  const handleEditar = async (id: string, dados: FormPayload) => {
    const res = await fetch(`/api/atividades/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error)
    setModo(null)
    mostrarSucesso('Atividade atualizada com sucesso!')
    router.refresh()
  }

  const handleExcluir = async (id: string) => {
    const res = await fetch(`/api/atividades/${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error)
    setModo(null)
    mostrarSucesso('Atividade excluída com sucesso!')
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
          + Registrar Atividade
        </button>
      )}

      {modo?.tipo === 'criar' && (
        <AtividadeForm
          modo={modo}
          onSalvar={handleCriar}
          onCancelar={() => setModo(null)}
        />
      )}

      {atividades.length === 0 && modo === null ? (
        <div className="text-center py-16 text-gray-400 font-poppins">
          <p className="text-4xl mb-3">🚜</p>
          <p className="text-base">Nenhuma atividade registrada.</p>
          <p className="text-sm mt-1">Clique em "Registrar Atividade" para começar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {atividades.map((a) => (
            <div key={a.id}>
              {modo?.tipo === 'editar' && modo.atividade.id === a.id ? (
                <AtividadeForm
                  modo={modo}
                  onSalvar={(dados) => handleEditar(a.id, dados)}
                  onExcluir={() => handleExcluir(a.id)}
                  onCancelar={() => setModo(null)}
                />
              ) : (
                <button
                  onClick={() => setModo({ tipo: 'editar', atividade: a })}
                  className="w-full text-left bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 hover:border-[var(--primary)] hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full font-poppins ${TIPO_CORES[a.tipo]}`}>
                          {TIPO_ICONS[a.tipo as TipoAtividade]} {a.tipo}
                        </span>
                        <span className="text-sm font-semibold text-[var(--text)] font-poppins">
                          {a.modalidade}
                        </span>
                      </div>
                      <div className="flex gap-3 mt-1.5 flex-wrap">
                        <span className="text-xs text-gray-500 font-poppins">
                          📅 {formatarData(a.data)}
                        </span>
                        {a.produto && (
                          <span className="text-xs text-gray-500 font-poppins">
                            🧪 {a.produto}
                          </span>
                        )}
                        {a.volume != null && a.unidade && (
                          <span className="text-xs text-gray-500 font-poppins">
                            📦 {a.volume} {a.unidade}
                          </span>
                        )}
                      </div>
                      {a.observacao && (
                        <p className="text-xs text-gray-400 font-poppins mt-1">{a.observacao}</p>
                      )}
                    </div>
                  </div>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
