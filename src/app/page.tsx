
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs'
import { Users, UserCog, BarChart3, UploadCloud, ChevronRight, Lock, MapPin } from 'lucide-react'

// Gym Units (Can be dynamic later)
const UNITS = [
  { id: 'centro', name: 'Unidade Centro', color: 'bg-blue-600', hover: 'hover:bg-blue-700' },
  { id: 'norte', name: 'Unidade Norte', color: 'bg-green-600', hover: 'hover:bg-green-700' },
  { id: 'sul', name: 'Unidade Sul', color: 'bg-orange-600', hover: 'hover:bg-orange-700' },
  { id: 'leste', name: 'Unidade Leste', color: 'bg-purple-600', hover: 'hover:bg-purple-700' },
]

export default function LoginPortal() {
  const { user } = useUser();
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

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

          <SignedOut>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium mb-8">
              Faça login com sua conta corporativa para acessar o sistema.
            </p>
            <SignInButton mode="modal">
              <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-lg flex items-center gap-2 mx-auto">
                Entrar no Sistema <ChevronRight className="w-5 h-5" />
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <div className="flex flex-col items-center justify-center gap-4 mb-8 animate-in fade-in zoom-in duration-500">
              <div className="bg-white p-2 pr-6 rounded-full shadow-sm border border-gray-200 flex items-center gap-3">
                <UserButton afterSignOutUrl="/" />
                <div className="text-left">
                  <p className="text-xs text-gray-500 font-bold uppercase">Bem-vindo(a)</p>
                  <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                </div>
              </div>
            </div>

            {!selectedUnit ? (
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Em qual unidade você está agora?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  {UNITS.map((unit) => (
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
                    onClick={() => setSelectedUnit(null)}
                    className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm font-bold text-slate-700 hover:bg-gray-50 flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3 text-blue-500" />
                    {UNITS.find(u => u.id === selectedUnit)?.name}
                    <span className="text-xs text-gray-400 ml-1">(Alterar)</span>
                  </button>
                </div>

                <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium mb-12">
                  Selecione seu perfil de função:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Role Cards (Reused from previous step) */}
                  <Link href={`/reception?unit=${selectedUnit}`} className="group relative bg-white p-8 rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 overflow-hidden text-left">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Users className="w-32 h-32 -mr-10 -mt-10" />
                    </div>
                    <div className="relative z-10 h-full flex flex-col">
                      <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                        <Users className="w-7 h-7" />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">Recepção</h2>
                      <p className="text-sm text-slate-500 mb-8 flex-grow">Identifique risco.</p>
                      <div className="flex items-center text-blue-600 font-bold text-sm group-hover:translate-x-2 transition-transform">
                        Acessar <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </Link>

                  <Link href={`/professor?unit=${selectedUnit}`} className="group relative bg-white p-8 rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 overflow-hidden text-left">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <UserCog className="w-32 h-32 -mr-10 -mt-10" />
                    </div>
                    <div className="relative z-10 h-full flex flex-col">
                      <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-green-200 group-hover:scale-110 transition-transform">
                        <UserCog className="w-7 h-7" />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-2">Professor</h2>
                      <p className="text-sm text-slate-500 mb-8 flex-grow">Ajuste técnico.</p>
                      <div className="flex items-center text-green-600 font-bold text-sm group-hover:translate-x-2 transition-transform">
                        Acessar <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </Link>

                  <Link href={`/coordinator?unit=${selectedUnit}`} className="group relative bg-white p-8 rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 overflow-hidden text-left">
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

                  <Link href="/admin" className="group relative bg-slate-900 p-8 rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-800 overflow-hidden text-left">
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
                </div>
              </div>
            )}
          </SignedIn>
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-slate-400">
            &copy; 2026 Antigravity &bull; Engage System v1.1 &bull; Powered by Clerk
          </p>
        </div>
      </div>
    </main>
  )
}
