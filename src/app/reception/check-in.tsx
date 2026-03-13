
'use client'

import { useState } from 'react'
import { searchStudent } from './actions'
import { Search, AlertTriangle, CheckCircle, Smartphone } from 'lucide-react'

// I will need to create ./actions.ts for reception search

export default function CheckIn() {
    const [query, setQuery] = useState('')
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const data = await searchStudent(query)
        setResult(data)
        setLoading(false)
    }

    return (
        <div className="mb-8 p-6 bg-white rounded-xl shadow border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-gray-500" />
                Check-in / Busca Rápida
            </h2>
            <form onSubmit={handleSearch} className="flex gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Digite o Nome ou ID Evo..."
                    className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? '...' : <Search className="w-5 h-5" />}
                </button>
            </form>

            {result && (
                <div className={`mt-6 p-6 rounded-xl border animate-in fade-in slide-in-from-top-4 ${result.band === 'Red' ? 'bg-red-50 border-red-200' :
                        result.band === 'Yellow' ? 'bg-yellow-50 border-yellow-200' :
                            'bg-green-50 border-green-200'
                    }`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-2xl font-bold mb-1">{result.name}</h3>
                            <p className="text-sm opacity-80">ID: {result.evoId} • Unidade: {result.unit}</p>
                        </div>
                        <div className={`px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide ${result.band === 'Red' ? 'bg-red-200 text-red-800' :
                                result.band === 'Yellow' ? 'bg-yellow-200 text-yellow-800' :
                                    'bg-green-200 text-green-800'
                            }`}>
                            Faixa {result.band === 'Red' ? 'Vermelha' : result.band === 'Yellow' ? 'Amarela' : 'Verde'}
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="bg-white/50 p-3 rounded-lg">
                            <p className="text-xs uppercase tracking-wider opacity-60">Frequência</p>
                            <p className="text-xl font-semibold">{result.frequency} treinos</p>
                        </div>
                        <div className="bg-white/50 p-3 rounded-lg">
                            <p className="text-xs uppercase tracking-wider opacity-60">Consistência</p>
                            <p className="text-xl font-semibold">{result.consistency} semanas</p>
                        </div>
                    </div>

                    {result.band === 'Red' && (
                        <div className="mt-6 p-4 bg-red-100 rounded-lg flex gap-3 text-red-900">
                            <AlertTriangle className="w-6 h-6 shrink-0" />
                            <div>
                                <p className="font-bold">Atenção: Aluno em Risco de Evasão</p>
                                <p className="text-sm mt-1">Acione o Professor de Referência imediatamente. Aplique protocolo de acolhimento.</p>
                                <button className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition">
                                    Notificar Professor Agora (Simular)
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
