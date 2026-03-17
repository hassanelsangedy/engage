
'use client'

import { useEffect, useState } from 'react'
import {
    LayoutDashboard,
    TrendingDown,
    TrendingUp,
    AlertCircle,
    MessageSquare,
    ChevronRight,
    Activity,
    ShieldAlert,
    BarChart3,
    ArrowUpRight,
    Users
} from 'lucide-react'
import { getRetentionMetrics } from '../actions'

export default function RetentionMonitorPage() {
    const [metrics, setMetrics] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadMetrics()
        const interval = setInterval(loadMetrics, 30000) // Auto refresh every 30s
        return () => clearInterval(interval)
    }, [])

    async function loadMetrics() {
        const data = await getRetentionMetrics()
        setMetrics(data)
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-indigo-400">
                <div className="flex flex-col items-center gap-4">
                    <Activity className="w-12 h-12 animate-pulse" />
                    <span className="text-sm font-black uppercase tracking-widest">Sincronizando Dados Evoque...</span>
                </div>
            </div>
        )
    }

    const avgPleasure = parseFloat(metrics?.avgPleasure || '0')
    const lowPleasure = avgPleasure < 6

    return (
        <main className="min-h-screen bg-[#0f172a] text-slate-100 flex font-sans">
            {/* Sidebar Mockup */}
            <aside className="w-64 bg-slate-900/50 border-r border-white/5 p-6 space-y-8 hidden lg:block">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black">E</div>
                    <span className="font-black text-lg tracking-tight">Evoque.Engage</span>
                </div>

                <nav className="space-y-4">
                    <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Dashboards</div>
                    <div className="space-y-1">
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-600/10 text-indigo-400 rounded-xl font-bold text-sm border border-indigo-500/20">
                            <BarChart3 className="w-4 h-4" /> Monitor de Retenção
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-white transition-colors rounded-xl font-bold text-sm">
                            <Users className="w-4 h-4" /> Jornada do Cliente
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <section className="flex-1 p-8 lg:p-12 overflow-y-auto">
                <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight mb-2">Monitor de Retenção Evoque</h1>
                        <p className="text-slate-400 font-medium">Gestão Comportamental e Performance de Retenção</p>
                    </div>

                    {/* Pleasure KPI Card */}
                    <div className={`p-6 rounded-3xl border transition-all duration-500 min-w-[240px] flex flex-col justify-between ${lowPleasure ? 'bg-red-500/10 border-red-500/20 shadow-2xl shadow-red-500/10 animate-pulse' : 'bg-slate-900 border-white/5'
                        }`}>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Métrica de Prazer</span>
                            <div className={`p-2 rounded-lg ${lowPleasure ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white'}`}>
                                <Activity className="w-4 h-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-5xl font-black mb-1">{metrics?.avgPleasure}</div>
                            <div className={`text-xs font-bold ${lowPleasure ? 'text-red-400' : 'text-slate-500'}`}>
                                {lowPleasure ? 'ALERTA: ABAIXO DE 6.0' : 'Média Estável (Meta: >6)'}
                            </div>
                        </div>
                        {lowPleasure && (
                            <div className="mt-4 flex items-center gap-2 text-red-500 text-[10px] font-black uppercase">
                                <ShieldAlert className="w-4 h-4" /> Intervenção Necessária
                            </div>
                        )}
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Conversion Chart Area */}
                    <div className="bg-slate-900/50 border border-white/5 rounded-[40px] p-8 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black flex items-center gap-3">
                                <TrendingUp className="text-indigo-400 w-6 h-6" /> Conversão de Faixa
                            </h2>
                            <span className="text-xs bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full font-black uppercase">Mensal</span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 h-48 items-end">
                            <div className="space-y-4 text-center group">
                                <div className="text-xs font-black text-red-500">{metrics?.conversion?.red}</div>
                                <div className="bg-red-500/20 w-full rounded-2xl border border-red-500/20" style={{ height: '60%' }}></div>
                                <div className="text-[10px] font-black text-slate-500 uppercase">Vermelha</div>
                            </div>
                            <div className="space-y-4 text-center">
                                <div className="text-xs font-black text-yellow-500">{metrics?.conversion?.yellow}</div>
                                <div className="bg-yellow-500/20 w-full rounded-2xl border border-yellow-500/20" style={{ height: '40%' }}></div>
                                <div className="text-[10px] font-black text-slate-500 uppercase">Amarela</div>
                            </div>
                            <div className="space-y-4 text-center">
                                <div className="text-xs font-black text-green-500">{metrics?.conversion?.green}</div>
                                <div className="bg-green-500/20 w-full rounded-2xl border border-green-500/20" style={{ height: '80%' }}></div>
                                <div className="text-[10px] font-black text-slate-500 uppercase">Verde</div>
                            </div>
                        </div>

                        <div className="p-6 bg-indigo-600/10 rounded-3xl border border-indigo-500/10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30">
                                    <ArrowUpRight className="text-white w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-2xl font-black">{metrics?.conversion?.saved}</div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase">Alunos Resgatados no Ciclo</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-black text-indigo-400">+{Math.round((metrics?.conversion?.saved / (metrics?.conversion?.red + 1)) * 100)}%</div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase">Eficiência</div>
                            </div>
                        </div>
                    </div>

                    {/* Active Feedback Panel */}
                    <div className="bg-slate-900/50 border border-white/5 rounded-[40px] p-8 space-y-6 flex flex-col">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black flex items-center gap-3">
                                <MessageSquare className="text-indigo-400 w-6 h-6" /> Ouvidoria Ativa
                            </h2>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                                <span className="text-[10px] font-black uppercase text-slate-500">Tempo Real</span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto pr-2 max-h-[500px] no-scrollbar">
                            {metrics?.recentResponses.map((res: any, i: number) => (
                                <div key={i} className={`p-5 rounded-3xl border transition-all duration-300 ${res.Classificacao_IA === 'BI'
                                        ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40 animate-pulse-slow'
                                        : 'bg-white/5 border-white/10'
                                    }`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black border border-white/5">
                                                ID
                                            </div>
                                            <div className="text-sm font-bold text-white uppercase">{res.ID_Aluno}</div>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${res.Classificacao_IA === 'BI' ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'
                                            }`}>
                                            {res.Classificacao_IA}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-400 font-medium italic leading-relaxed">
                                        "{res.Resposta_Original || res.Conteudo_Mensagem}"
                                    </p>
                                    <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/5">
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">
                                            {res.Subcategoria || 'Geral'}
                                        </span>
                                        <button className="text-indigo-400 text-[10px] font-black uppercase flex items-center gap-1 hover:text-indigo-300">
                                            Resolver <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <footer className="mt-12 text-center py-8 border-t border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Evoque Hospitalidade - Behavioral Data Systems</p>
                </footer>
            </section>
        </main>
    )
}
