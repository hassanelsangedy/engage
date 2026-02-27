
import { useState } from 'react'
import { searchStudent, registerCheckIn } from './actions'
import { Search, AlertTriangle, CheckCircle, Smartphone, BellRing } from 'lucide-react'

export default function CheckIn() {
    const [query, setQuery] = useState('')
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [notified, setNotified] = useState(false)

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const data = await searchStudent(query)
        setResult(data)
        setLoading(false)
        setNotified(false)

        if (data) {
            // Simulate turnstile event - in reality this would be triggered by an external hardware event
            await registerCheckIn(data.evoId);
        }
    }

    const handleNotifyProfessor = () => {
        setNotified(true)
        // In a real app, this would send a push notification or update a shared state (Pusher/Real-time)
        console.log(`[ALERT] Professor notified for student: ${result.name}`);
        setTimeout(() => setNotified(false), 3000)
    }

    return (
        <div className="mb-8 p-6 bg-white rounded-xl shadow border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-gray-500" />
                Simular Entrada (Catraca)
            </h2>
            <form onSubmit={handleSearch} className="flex gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Digite o Nome ou ID Evo (Simula Catraca)"
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
                            <CheckCircle className="w-5 h-5" />
                            <span>Entrada</span>
                        </>
                    )}
                </button>
            </form>

            {result && (
                <div className={`mt-6 p-6 rounded-xl border-2 animate-in slide-in-from-top-4 duration-500 ${result.band === 'Red' ? 'bg-red-50 border-red-500 shadow-lg shadow-red-100' :
                    result.band === 'Yellow' ? 'bg-yellow-50 border-yellow-400' :
                        'bg-green-50 border-green-400'
                    }`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-2xl font-bold uppercase tracking-tight">{result.name}</h3>
                                {result.band === 'Red' && (
                                    <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded animate-pulse">ALERTA CRÍTICO</span>
                                )}
                            </div>
                            <p className="text-sm font-medium opacity-60">ID: {result.evoId} • Unidade: {result.unit || 'Matriz'}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest border-b-4 ${result.band === 'Red' ? 'bg-red-600 text-white border-red-800' :
                            result.band === 'Yellow' ? 'bg-yellow-400 text-yellow-900 border-yellow-600' :
                                'bg-green-500 text-white border-green-700'
                            }`}>
                            Faixa {result.band === 'Red' ? 'Vermelha' : result.band === 'Yellow' ? 'Amarela' : 'Verde'}
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="bg-white/80 p-4 rounded-xl border border-white">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Frequência/Mês</p>
                            <p className="text-2xl font-black text-slate-800">{result.frequency} <span className="text-sm font-medium text-gray-400">treinos</span></p>
                        </div>
                        <div className="bg-white/80 p-4 rounded-xl border border-white">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Consistência</p>
                            <p className="text-2xl font-black text-slate-800">{result.consistency} <span className="text-sm font-medium text-gray-400">semanas</span></p>
                        </div>
                    </div>

                    {result.band === 'Red' && (
                        <div className="mt-8 p-5 bg-white rounded-2xl border border-red-100 shadow-sm flex flex-col md:flex-row gap-5 items-center justify-between">
                            <div className="flex gap-4 items-center">
                                <div className="bg-red-100 p-3 rounded-full text-red-600">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-black text-red-900 leading-tight uppercase tracking-tight">Risco Iminente de Evasão</p>
                                    <p className="text-sm text-red-700 mt-1">Ação Requerida: Hospitalidade Ativa + Notificação de Salão.</p>
                                </div>
                            </div>

                            <button
                                onClick={handleNotifyProfessor}
                                className={`whitespace-nowrap flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 ${notified
                                        ? 'bg-green-500 text-white'
                                        : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-red-200'
                                    }`}
                            >
                                {notified ? (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Professor Notificado!
                                    </>
                                ) : (
                                    <>
                                        <BellRing className="w-5 h-5 animate-bounce" />
                                        Notificar Professor Agora
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
