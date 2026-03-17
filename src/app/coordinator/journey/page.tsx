
'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, MessageSquare, TrendingUp, User, ChevronRight, Zap } from 'lucide-react'
import { getPriorityJourneyStudents, markMethodologicalAdjustment } from '../actions'
import { toast } from 'sonner'

export default function JourneyPage() {
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        try {
            const data = await getPriorityJourneyStudents()
            setStudents(data)
        } catch (error) {
            console.error('Error loading journey:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleAjuste(studentId: string) {
        try {
            await markMethodologicalAdjustment(studentId)
            toast.success('Ajuste Metodológico registrado com sucesso!')
            loadData() // Refresh list
        } catch (error) {
            toast.error('Erro ao registrar ajuste')
        }
    }

    return (
        <main className="min-h-screen bg-background text-foreground p-6 pb-32 font-sans">
            <div className="max-w-4xl mx-auto space-y-8 mt-4">
                <header className="flex flex-col space-y-2">
                    <div className="flex items-center gap-2 text-indigo-500">
                        <Zap className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Evoque Hospitalidade</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">Jornada do Cliente</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium font-bold">Central de Respostas e Gestão de Risco</p>
                </header>

                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-bold shadow-lg shadow-indigo-500/20 flex-shrink-0">
                        Prioridade Alta
                    </button>
                    <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-sm font-bold flex-shrink-0 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        Histórico
                    </button>
                    <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-sm font-bold flex-shrink-0 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        Métricas
                    </button>
                </div>

                <div className="space-y-4">
                    <h2 className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Risco Alto - Faixa Vermelha</h2>

                    {loading ? (
                        <div className="py-20 text-center animate-pulse text-slate-400">
                            Carregando jornada prioritária...
                        </div>
                    ) : students.length === 0 ? (
                        <div className="py-20 text-center text-slate-500 bg-slate-50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
                            Nenhum aluno aguardando ajuste no momento. ✅
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {students.map((student) => (
                                <div key={student.id} className={`group relative p-6 rounded-3xl border transition-all duration-300 ${student.latestResponse?.barrierType === 'BI'
                                    ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                                    : 'bg-card border-border hover:border-indigo-500/30'
                                    }`}>

                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-border">
                                                <User className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-lg text-foreground">{student.name}</h3>
                                                    {student.latestResponse?.barrierType === 'BI' && (
                                                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-500 text-[10px] font-black uppercase rounded-md flex items-center gap-1 animate-pulse">
                                                            <AlertCircle className="w-3 h-3" /> BI
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs">
                                                    <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-bold">
                                                        <AlertCircle className="w-3 h-3" /> Risco: {student.score} pts
                                                    </span>
                                                    <span className="text-slate-400 dark:text-slate-500">•</span>
                                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Crítico</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleAjuste(student.id)}
                                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            Ajuste Realizado
                                        </button>
                                    </div>

                                    <div className="mt-6 p-4 bg-slate-50 dark:bg-black/40 rounded-2xl border border-border">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-indigo-500 dark:text-indigo-400 mb-2">
                                            <MessageSquare className="w-3 h-3" /> Último WhatsApp
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed font-bold">
                                            "{student.latestResponse?.content || 'Sem resposta recente.'}"
                                        </p>
                                    </div>

                                    {student.latestResponse?.barrierType === 'BI' && (
                                        <div className="mt-4 flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-400/5 p-3 rounded-xl border border-red-200 dark:border-red-400/10">
                                            <TrendingUp className="w-4 h-4" />
                                            <span className="text-[11px] font-bold uppercase tracking-tight">Próxima Visita: Contato Intencional (30-60s)</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <footer className="pt-12 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">Evoque Hospitalidade de Prontidão</p>
                </footer>
            </div>
        </main>
    )
}
