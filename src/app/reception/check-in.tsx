
import { useState } from 'react'
import { registerCheckIn } from './actions'
import { Search, AlertTriangle, Smartphone, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CheckIn({
    externalQuery = '',
    setExternalQuery = () => { },
    onSearchTrigger = () => { },
    localResult = null,
    handleOpenModal = () => { }
}: {
    externalQuery?: string,
    setExternalQuery?: (val: string) => void,
    onSearchTrigger?: () => void,
    localResult?: any,
    handleOpenModal?: (s: any) => void
}) {
    const [loading, setLoading] = useState(false)

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        onSearchTrigger() // Trigger parent local filtering
        setTimeout(() => setLoading(false), 300)

        if (localResult) {
            // Log access to Sheets
            await registerCheckIn(localResult.evoId);
        }
    }

    return (
        <div className="mb-8 p-6 bg-white rounded-xl shadow border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-gray-500" />
                Buscar aluno
            </h2>
            <form onSubmit={handleSearch} className="flex gap-2">
                <input
                    type="text"
                    value={externalQuery}
                    onChange={(e) => setExternalQuery(e.target.value)}
                    placeholder="Digite o nome do aluno"
                    className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    autoFocus
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? '...' : (
                        <>
                            <Search className="w-5 h-5" />
                            <span>Buscar</span>
                        </>
                    )}
                </button>
            </form>

            {localResult && (
                <div
                    onClick={() => localResult && (localResult.band === 'Red' || localResult.band === 'Yellow') && handleOpenModal(localResult)}
                    className={`mt-6 p-6 rounded-xl border-2 animate-in slide-in-from-top-4 duration-500 cursor-pointer ${localResult.band === 'Red' ? 'bg-red-50 border-red-500 shadow-lg shadow-red-100' :
                        localResult.band === 'Yellow' ? 'bg-yellow-50 border-yellow-400' :
                            'bg-green-50 border-green-400'
                        }`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-2xl font-bold uppercase tracking-tight">{localResult.name}</h3>
                                {localResult.band === 'Red' && (
                                    <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded animate-pulse">ALERTA CRÍTICO</span>
                                )}
                            </div>
                            <p className="text-sm font-medium opacity-60">ID: {localResult.evoId} • Unidade: {localResult.unit || 'Matriz'}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest border-b-4 ${localResult.band === 'Red' ? 'bg-red-600 text-white border-red-800' :
                            localResult.band === 'Yellow' ? 'bg-yellow-400 text-yellow-900 border-yellow-600' :
                                'bg-green-500 text-white border-green-700'
                            }`}>
                            Faixa {localResult.band === 'Red' ? 'Vermelha' : localResult.band === 'Yellow' ? 'Amarela' : 'Verde'}
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="bg-white/80 p-4 rounded-xl border border-white">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Frequência/Mês</p>
                            <p className="text-2xl font-black text-slate-800">{localResult.frequency} <span className="text-sm font-medium text-gray-400">treinos</span></p>
                        </div>
                        <div className="bg-white/80 p-4 rounded-xl border border-white">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Consistência</p>
                            <p className="text-2xl font-black text-slate-800">{localResult.consistency} <span className="text-sm font-medium text-gray-400">semanas</span></p>
                        </div>
                    </div>

                    {(localResult.band === 'Red' || localResult.band === 'Yellow') && (
                        <div className="mt-8 p-5 bg-white rounded-2xl border border-red-100 shadow-sm flex flex-col md:flex-row gap-5 items-center justify-between">
                            <div className="flex gap-4 items-center">
                                <div className={cn("p-3 rounded-full", localResult.band === 'Red' ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600")}>
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-black text-slate-900 leading-tight uppercase tracking-tight">Risco Identificado</p>
                                    <p className="text-sm text-slate-500 mt-1">Acione o protocolo de acolhimento para este aluno.</p>
                                </div>
                            </div>

                            <button
                                onClick={() => handleOpenModal(localResult)}
                                className="whitespace-nowrap flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 hover:bg-indigo-700"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Iniciar Acolhimento
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
