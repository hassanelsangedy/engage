
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Users, UserCog, BarChart3, UploadCloud, ChevronRight, Lock, MapPin, LogOut, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// Gym Units (Can be dynamic later)
const UNITS = [
  { id: 'ribeirao_pires', name: 'Ribeirão Pires', color: 'bg-blue-600', hover: 'hover:bg-blue-700' },
  { id: 'pereira_barreto', name: 'Pereira Barreto (Santo André)', color: 'bg-green-600', hover: 'hover:bg-green-700' },
  { id: 'guilhermina', name: 'Guilhermina', color: 'bg-orange-600', hover: 'hover:bg-orange-700' },
  { id: 'guaianazes', name: 'Guaianazes', color: 'bg-purple-600', hover: 'hover:bg-purple-700' },
  { id: 'pimentas', name: 'Pimentas (Guarulhos)', color: 'bg-rose-600', hover: 'hover:bg-rose-700' },
]

export default function LoginPortal() {
  const { data: session, status } = useSession()
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  const userRole = (session?.user as any)?.role
  const userUnitRaw = (session?.user as any)?.unit || ''

  // Normalize unit from spreadsheet to ID
  const normalizeUnit = (raw: string) => {
    const val = raw.toLowerCase()
    if (val.includes('ribeir')) return 'ribeirao_pires'
    if (val.includes('pereira')) return 'pereira_barreto'
    if (val.includes('guilhermina')) return 'guilhermina'
    if (val.includes('guaianazes')) return 'guaianazes'
    if (val.includes('pimentas')) return 'pimentas'
    return null
  }

  const assignedUnitId = normalizeUnit(userUnitRaw)

  // Auto-select unit if user has one assigned and is not ADMIN
  if (session && userRole !== 'ADMIN' && assignedUnitId && !selectedUnit) {
    setSelectedUnit(assignedUnitId)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black uppercase text-xs tracking-widest text-slate-400">
        Carregando_Ecossistema...
      </div>
    )
  }

  // Filter units for selection (if not ADMIN and has assigned unit, only show that one)
  const availableUnits = (userRole === 'ADMIN' || !assignedUnitId)
    ? UNITS
    : UNITS.filter(u => u.id === assignedUnitId)

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-40 -left-20 w-72 h-72 bg-purple-100 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="max-w-5xl w-full z-10">
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-blue-600 text-xs font-bold tracking-wide mb-6 uppercase">
            Sistema de Gestão de Retenção
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            Engage<span className="text-blue-600">.</span>Evoque
          </h1>

          {!session ? (
            <>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium mb-8">
                Faça login com sua conta corporativa para acessar o sistema.
              </p>
              <Link href="/auth/signin">
                <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-lg flex items-center gap-2 mx-auto">
                  Entrar no Sistema <ChevronRight className="w-5 h-5" />
                </button>
              </Link>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center gap-4 mb-8 animate-in fade-in zoom-in duration-500">
                <div className="bg-white p-2 pr-6 rounded-full shadow-sm border border-gray-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {session.user?.name?.substring(0, 1) || 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-500 font-bold uppercase">Bem-vindo(a)</p>
                    <p className="text-sm font-semibold text-gray-900">{session.user?.name}</p>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="ml-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {!selectedUnit ? (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">Em qual unidade você está agora?</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    {availableUnits.map((unit) => (
                      <button
                        key={unit.id}
                        onClick={() => setSelectedUnit(unit.id)}
                        className="group relative bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all border border-slate-100 text-left overflow-hidden"
                      >
                        <div className={`absolute top-0 right-0 w-20 h-20 ${unit.color} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-opacity group-hover:opacity-20`} />
                        <div className={`w-12 h-12 ${unit.color} text-white rounded-xl flex items-center justify-center mb-4 shadow-md`}>
                          <MapPin className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{unit.name}</h3>
                        <p className="text-xs text-slate-400 mt-1">Selecionar Local &rarr;</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="animate-in slide-in-from-right-8 duration-500">
                  <div className="flex items-center justify-center gap-2 mb-8">
                    <span className="text-slate-500">Unidade Selecionada:</span>
                    <button
                      onClick={() => userRole === 'ADMIN' ? setSelectedUnit(null) : null}
                      disabled={userRole !== 'ADMIN'}
                      className={cn(
                        "px-3 py-1 bg-white border border-gray-200 rounded-full text-sm font-bold text-slate-700 flex items-center gap-1",
                        userRole === 'ADMIN' && "hover:bg-gray-50"
                      )}
                    >
                      <MapPin className="w-3 h-3 text-blue-500" />
                      {UNITS.find(u => u.id === selectedUnit)?.name}
                      {userRole === 'ADMIN' && <span className="text-xs text-gray-400 ml-1">(Alterar)</span>}
                    </button>
                  </div>

                  <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium mb-12">
                    Selecione seu perfil de função:
                  </p>

                  <div className="flex flex-wrap justify-center gap-6">
                    {(userRole === 'ADMIN' || userRole === 'COORDINATOR' || userRole === 'RECEPTION') && (
                      <Link href={`/reception?unit=${selectedUnit}`} className="group relative bg-white p-8 rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 overflow-hidden text-left w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(25%-1.5rem)] min-w-[300px]">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <Users className="w-32 h-32 -mr-10 -mt-10" />
                        </div>
                        <div className="relative z-10 h-full flex flex-col">
                          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                            <Users className="w-7 h-7" />
                          </div>
                          <h2 className="text-2xl font-bold text-slate-900 mb-2">Recepção</h2>
                          <p className="text-sm text-slate-500 mb-8 flex-grow">Acolhimento e Busca.</p>
                          <div className="flex items-center text-blue-600 font-bold text-sm group-hover:translate-x-2 transition-transform">
                            Acessar <ChevronRight className="w-4 h-4 ml-1" />
                          </div>
                        </div>
                      </Link>
                    )}

                    {(userRole === 'ADMIN' || userRole === 'COORDINATOR' || userRole === 'PROFESSOR') && (
                      <Link href={`/professor?unit=${selectedUnit}`} className="group relative bg-white p-8 rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 overflow-hidden text-left w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(25%-1.5rem)] min-w-[300px]">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <UserCog className="w-32 h-32 -mr-10 -mt-10" />
                        </div>
                        <div className="relative z-10 h-full flex flex-col">
                          <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-green-200 group-hover:scale-110 transition-transform">
                            <UserCog className="w-7 h-7" />
                          </div>
                          <h2 className="text-2xl font-bold text-slate-900 mb-2">Acompanhamento dos alunos</h2>
                          <p className="text-sm text-slate-500 mb-8 flex-grow">Ajuste técnico.</p>
                          <div className="flex items-center text-green-600 font-bold text-sm group-hover:translate-x-2 transition-transform">
                            Acessar <ChevronRight className="w-4 h-4 ml-1" />
                          </div>
                        </div>
                      </Link>
                    )}

                    {(userRole === 'ADMIN' || userRole === 'COORDINATOR') && (
                      <Link href={`/coordinator?unit=${selectedUnit}`} className="group relative bg-white p-8 rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 overflow-hidden text-left w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(25%-1.5rem)] min-w-[300px]">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <BarChart3 className="w-32 h-32 -mr-10 -mt-10" />
                        </div>
                        <div className="relative z-10 h-full flex flex-col">
                          <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform">
                            <BarChart3 className="w-7 h-7" />
                          </div>
                          <h2 className="text-2xl font-bold text-slate-900 mb-2">Coordenação</h2>
                          <p className="text-sm text-slate-500 mb-8 flex-grow">Gestão e Validação.</p>
                          <div className="flex items-center text-purple-600 font-bold text-sm group-hover:translate-x-2 transition-transform">
                            Acessar <ChevronRight className="w-4 h-4 ml-1" />
                          </div>
                        </div>
                      </Link>
                    )}

                    {userRole === 'ADMIN' && (
                      <Link href="/admin" className="group relative bg-slate-900 p-8 rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-800 overflow-hidden text-left w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(25%-1.5rem)] min-w-[300px]">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-white">
                          <UploadCloud className="w-32 h-32 -mr-10 -mt-10" />
                        </div>
                        <div className="relative z-10 h-full flex flex-col">
                          <div className="w-14 h-14 bg-slate-700 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-slate-900 group-hover:scale-110 transition-transform border border-slate-600">
                            <Lock className="w-6 h-6" />
                          </div>
                          <h2 className="text-2xl font-bold text-white mb-2">Admin</h2>
                          <p className="text-sm text-slate-400 mb-8 flex-grow">Configurações.</p>
                          <div className="flex items-center text-white font-bold text-sm group-hover:translate-x-2 transition-transform opacity-80 group-hover:opacity-100">
                            Acessar <ChevronRight className="w-4 h-4 ml-1" />
                          </div>
                        </div>
                      </Link>
                    )}

                    <Link href="/onboarding" className="group relative bg-blue-50 p-8 rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-blue-100 overflow-hidden text-left w-full md:w-[calc(50%-1.5rem)] lg:w-[calc(25%-1.5rem)] min-w-[300px]">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <HelpCircle className="w-32 h-32 -mr-10 -mt-10" />
                      </div>
                      <div className="relative z-10 h-full flex flex-col">
                        <div className="w-14 h-14 bg-blue-400 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                          <HelpCircle className="w-7 h-7" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Como funciona</h2>
                        <p className="text-sm text-slate-500 mb-8 flex-grow">Tutoriais e Guias.</p>
                        <div className="flex items-center text-blue-600 font-bold text-sm group-hover:translate-x-2 transition-transform">
                          Acessar <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-slate-400">
            &copy; 2026 Antigravity &bull; Engage System v2.5
          </p>
        </div>
      </div>
    </main>
  )
}
