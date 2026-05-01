'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

type NavItem = {
  href: string
  label: string
  icon: string
  gestorOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Início', icon: '🏠' },
  { href: '/dashboard/chuva', label: 'Chuva', icon: '🌧️' },
  { href: '/dashboard/movimentacao', label: 'Gado', icon: '🐄' },
  { href: '/dashboard/cocho', label: 'Cocho', icon: '🌾' },
  { href: '/dashboard/atividades', label: 'Atividades', icon: '🚜' },
  { href: '/dashboard/lotes', label: 'Lotes', icon: '📋', gestorOnly: true },
  { href: '/dashboard/usuarios', label: 'Usuários', icon: '👥', gestorOnly: true },
]

type Props = {
  isGestor: boolean
  nome: string
}

export default function DashboardNav({ isGestor, nome }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const visibleItems = NAV_ITEMS.filter((item) => !item.gestorOnly || isGestor)

  const handleLogout = async () => {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  return (
    <>
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-[var(--primary)] text-white shadow-xl z-40">
        <div className="px-6 py-6 border-b border-white/10">
          <h1 className="text-xl font-bold font-merriweather">🌾 Fazenda Viçosa</h1>
          <p className="text-sm text-white/70 font-poppins mt-1 truncate">{nome}</p>
          {isGestor && (
            <span className="inline-block mt-1 text-xs bg-[var(--accent)] text-white px-2 py-0.5 rounded-full font-poppins">
              Gestor
            </span>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-poppins text-sm transition-colors ${
                isActive(item.href)
                  ? 'bg-white/20 text-white font-semibold'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white font-poppins text-sm transition-colors disabled:opacity-50"
          >
            <span className="text-lg">🚪</span>
            {loggingOut ? 'Saindo...' : 'Sair'}
          </button>
        </div>
      </aside>

      {/* Bottom nav — mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--primary)] z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.15)]">
        <div className="flex items-center justify-around px-1 py-2">
          {visibleItems.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-[56px] ${
                isActive(item.href) ? 'text-white' : 'text-white/60'
              }`}
            >
              <span className={`text-xl leading-none ${isActive(item.href) ? 'scale-110' : ''} transition-transform`}>
                {item.icon}
              </span>
              <span className="text-[10px] font-poppins leading-none">{item.label}</span>
            </Link>
          ))}

          {isGestor && (
            <Link
              href="/dashboard/lotes"
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-[56px] ${
                isActive('/dashboard/lotes') ? 'text-white' : 'text-white/60'
              }`}
            >
              <span className="text-xl leading-none">📋</span>
              <span className="text-[10px] font-poppins leading-none">Lotes</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  )
}
