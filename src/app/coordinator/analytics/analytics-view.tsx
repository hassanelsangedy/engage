
'use client'

import { useState, useMemo } from 'react'
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
    LineChart, Line, CartesianGrid
} from 'recharts'
import {
    Users,
    TrendingUp,
    Target,
    Activity,
    ChevronRight,
    Search,
    Filter,
    MessageSquare,
    CheckCircle,
    X,
    User,
    BrainCircuit,
    ClipboardList,
    AlertCircle,
    Send
} from 'lucide-react'
import { saveCoordinatorFeedback } from './actions'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AnalyticsView({ initialData }: { initialData: any[] }) {
    const [selectedBand, setSelectedBand] = useState<string>('All')
    const [selectedProfessor, setSelectedProfessor] = useState<string | null>(null)
    const [feedbackMessage, setFeedbackMessage] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    // Filtering
    const filteredData = useMemo(() => {
        if (selectedBand === 'All') return initialData
        return initialData.filter(d => d.band?.toLowerCase().includes(selectedBand.toLowerCase()))
    }, [initialData, selectedBand])

    // Charts Data
    const choiceProfile = useMemo(() => {
        const counts: Record<string, number> = { 'Variedade': 0, 'Rotina': 0 }
        filteredData.forEach(d => {
            if (d.Variedade_Rotina === 'Variedade') counts['Variedade']++
            else if (d.Variedade_Rotina === 'Rotina') counts['Rotina']++
        })
        return Object.entries(counts).map(([name, value]) => ({ name, value }))
    }, [filteredData])

    const motivationData = useMemo(() => {
        const counts: Record<string, number> = {}
        filteredData.forEach(d => {
            if (d.Objetivo_Sessao) {
                counts[d.Objetivo_Sessao] = (counts[d.Objetivo_Sessao] || 0) + 1
            }
        })
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
    }, [filteredData])

    const affectEvolution = useMemo(() => {
        const daily: Record<string, { sum: number, count: number }> = {}
        filteredData.forEach(d => {
            const date = d.Data || d.Data_Hora?.split('T')[0]
            if (date) {
                if (!daily[date]) daily[date] = { sum: 0, count: 0 }
                daily[date].sum += d.satisfaction
                daily[date].count++
            }
        })
        return Object.entries(daily)
            .map(([date, stats]) => ({
                date,
                satisfaction: parseFloat((stats.sum / stats.count).toFixed(1))
            }))
            .sort((a, b) => a.date.localeCompare(b.date))
    }, [filteredData])

    const professorMetrics = useMemo(() => {
        const profs: Record<string, {
            name: string,
            totalIMC: number,
            totalSatisfaction: number,
            redSignalCount: number,
            count: number
        }> = {}

        filteredData.forEach(d => {
            const name = d.Professor || 'Desconhecido'
            if (!profs[name]) profs[name] = { name, totalIMC: 0, totalSatisfaction: 0, redSignalCount: 0, count: 0 }
            profs[name].totalIMC += d.imc
            profs[name].totalSatisfaction += d.satisfaction
            if (d.Feedback_Afeto === 'Detestei') profs[name].redSignalCount++
            profs[name].count++
        })

        return Object.values(profs).map(p => ({
            ...p,
            avgIMC: (p.totalIMC / p.count).toFixed(1),
            avgSatisfaction: (p.totalSatisfaction / p.count).toFixed(1),
            redPercentage: ((p.redSignalCount / p.count) * 100).toFixed(0)
        }))
    }, [filteredData])

    const handleSendFeedback = async () => {
        if (!selectedProfessor || !feedbackMessage) return
        setIsSaving(true)
        const res = await saveCoordinatorFeedback({ professorName: selectedProfessor, message: feedbackMessage })
        setIsSaving(false)
        if (res.success) {
            toast.success('Direcionamento enviado com sucesso!')
            setSelectedProfessor(null)
            setFeedbackMessage('')
        } else {
            toast.error('Erro ao enviar direcionamento.')
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-8 space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-indigo-600">
                        <TrendingUp className="w-8 h-8" />
                        <span className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Governança & Performance</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 italic uppercase">Formação Continuada & Padrões</h1>
                    <p className="text-lg text-slate-500 font-medium max-w-2xl leading-relaxed">
                        Análise de escolhas hedonicas, afetividade e diagnóstico educativo por profissional.
                    </p>
                </div>

                <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
                    {['All', 'Red', 'Yellow', 'Blue'].map((band) => (
                        <button
                            key={band}
                            onClick={() => setSelectedBand(band)}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                selectedBand === band
                                    ? "bg-slate-900 text-white shadow-lg"
                                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            {band === 'All' ? 'Geral' : `Faixa ${band}`}
                        </button>
                    ))}
                </div>
            </header>

            {/* Pattern Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Perfil de Escolha */}
                <div className="bg-white rounded-[32px] p-8 border border-white shadow-sm hover:shadow-md transition-all flex flex-col">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                        <Target className="w-4 h-4 text-indigo-500" /> Perfil de Escolha
                    </h3>
                    <div className="flex-1 min-h-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={choiceProfile}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {choiceProfile.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-[10px] text-slate-400 text-center mt-4 italic font-medium">
                        Preferência por Variedade vs Domínio de Rotina Fixa
                    </p>
                </div>

                {/* Motivação Dominante */}
                <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-white shadow-sm hover:shadow-md transition-all">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500" /> O que faz valer a pena (Motivação)
                    </h3>
                    <div className="min-h-[250px]">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={motivationData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={100}
                                    axisLine={false}
                                    tickLine={false}
                                    style={{ fontSize: '10px', fontWeight: 'bold' }}
                                />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="value" fill="#10b981" radius={[0, 10, 10, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Termometro de Afeto */}
                <div className="lg:col-span-3 bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="relative z-10 space-y-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-indigo-300 mb-1">Termômetro de Afeto (PACES)</h3>
                                <p className="text-slate-400 text-xs font-medium">Evolução do engajamento emocional pós-ajuste</p>
                            </div>
                            <div className="bg-white/10 p-3 rounded-2xl">
                                <Activity className="w-6 h-6 text-indigo-400 transition-transform group-hover:scale-125 duration-500" />
                            </div>
                        </div>

                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={affectEvolution}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#ffffff30"
                                        tick={{ fill: '#ffffff50', fontSize: 10 }}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#ffffff30"
                                        tick={{ fill: '#ffffff50', fontSize: 10 }}
                                        axisLine={false}
                                        domain={[0, 10]}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                                        itemStyle={{ color: '#818cf8' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="satisfaction"
                                        stroke="#818cf8"
                                        strokeWidth={4}
                                        dot={{ fill: '#4f46e5', r: 4 }}
                                        activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Diagnostic Table */}
            <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm overflow-hidden relative">
                <div className="flex items-center justify-between mb-10">
                    <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        <ClipboardList className="w-8 h-8 text-indigo-600" />
                        Diagnóstico por Profissional
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                <th className="pb-6 pl-4 font-black">Professor/Referência</th>
                                <th className="pb-6 px-4 font-black">Alcance (Alunos)</th>
                                <th className="pb-6 px-4 font-black">Média IMC</th>
                                <th className="pb-6 px-4 font-black">Satisfação (0-10)</th>
                                <th className="pb-6 px-4 font-black">Sinal Vermelho</th>
                                <th className="pb-6 pr-4 text-right">Ação Educativa</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {professorMetrics.map((p, i) => (
                                <tr key={i} className="group hover:bg-slate-50/80 transition-colors">
                                    <td className="py-6 pl-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                                                {p.name.substring(0, 2)}
                                            </div>
                                            <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{p.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-4 text-sm font-medium text-slate-600">{p.count} atendimentos</td>
                                    <td className="py-6 px-4 text-sm font-medium text-slate-600">{p.avgIMC}</td>
                                    <td className="py-6 px-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500 rounded-full"
                                                    style={{ width: `${parseFloat(p.avgSatisfaction) * 10}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-black text-slate-900">{p.avgSatisfaction}</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-4">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[10px] font-black uppercase",
                                            parseInt(p.redPercentage) > 20 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
                                        )}>
                                            {p.redPercentage}% Deteste
                                        </span>
                                    </td>
                                    <td className="py-6 pr-4 text-right">
                                        <button
                                            onClick={() => setSelectedProfessor(p.name)}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-indigo-100 opacity-0 group-hover:opacity-100 transition-all active:scale-95 bg-gradient-to-r from-indigo-600 to-violet-600 border-none inline-flex items-center gap-2"
                                        >
                                            <Send className="w-3.5 h-3.5" /> Direcionar Formação
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Feedback Modal */}
            {selectedProfessor && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[40px] shadow-2xl max-w-lg w-full p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                        <button onClick={() => setSelectedProfessor(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-full transition-colors z-10">
                            <X className="w-6 h-6" />
                        </button>

                        <div className="mb-8 space-y-4">
                            <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mb-6">
                                <BrainCircuit className="w-8 h-8" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 italic uppercase">Direcionar Formação</h3>
                            <p className="text-slate-500 font-medium">Orientação educativa para o Professor <span className="text-indigo-600 font-bold">{selectedProfessor}</span>.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Dica de Melhoria / Feedback Construtivo</label>
                                <textarea
                                    value={feedbackMessage}
                                    onChange={(e) => setFeedbackMessage(e.target.value)}
                                    placeholder="Ex: Notei que houve um alto percentual de deteste hoje. Vamos reforçar a progressão gradual de cargas no próximo turno..."
                                    className="w-full h-40 p-5 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-2 focus:ring-indigo-600 outline-none resize-none text-slate-700 font-medium leading-relaxed shadow-inner"
                                />
                            </div>

                            <button
                                onClick={handleSendFeedback}
                                disabled={isSaving || !feedbackMessage}
                                className="w-full py-5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-[24px] font-black shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 group"
                            >
                                {isSaving ? <Activity className="w-6 h-6 animate-spin" /> : <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                                Enviar Feedback Educativo
                            </button>

                            <p className="text-[10px] text-slate-400 text-center uppercase font-black tracking-widest">Este feedback aparecerá no painel do professor no próximo acesso.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
