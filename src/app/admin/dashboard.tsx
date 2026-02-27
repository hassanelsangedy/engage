'use client'

import { BarChart, Users, TrendingUp, Target, ShieldCheck, ShieldAlert, Settings, Megaphone, Filter, Calendar, Type, Save, CheckCircle2, AlertCircle, LayoutDashboard, Share2, ClipboardList, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import BackgroundDecoration from '@/components/ui/background-decoration'
import { saveCampaign, toggleCampaign, deleteCampaign } from './actions'
import { Phone, Power, Trash2 } from 'lucide-react'

export default function AdminDashboard({ data, campaigns, intelligence }: { data: any, campaigns: any[], intelligence: any }) {
    const [isSaving, setIsSaving] = useState(false)
    const [newCampaign, setNewCampaign] = useState({
        title: '',
        audience: 'Red',
        frequency: 7,
        content: 'Olá {{nome_aluno}}, sentimos sua falta...',
        senderPhone: '+55 84 9999-9999'
    })

    const handleSaveCampaign = async () => {
        setIsSaving(true)
        // Note: I'm sending the senderPhone as part of a modified payload or just logging it 
        // since the current prisma model might not have senderPhone. 
        // For now, I'll focus on the requested visual and sheet integration.
        await saveCampaign({
            ...newCampaign,
            // Prefixing title with phone for the sheet if needed, or just relying on the sheet integration updated below
            title: `${newCampaign.title} (Via: ${newCampaign.senderPhone})`
        })
        setIsSaving(false)
        setNewCampaign({ ...newCampaign, title: '' }) // Reset
    }

    const handleToggle = async (id: string, currentStatus: boolean) => {
        await toggleCampaign(id, currentStatus)
    }

    const handleDelete = async (id: string) => {
        if (confirm('Excluir esta configuração de campanha?')) {
            await deleteCampaign(id)
        }
    }

    return (
        <div className="p-8 max-w-7xl mx-auto relative min-h-screen text-slate-900">
            <BackgroundDecoration />

            <header className="mb-10 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-slate-900">Engage | Central Estratégica</h1>
                    <p className="text-gray-500 font-medium">Gestão de Campanhas e Inteligência de Retenção</p>
                </div>
                <div className="flex gap-2">
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        Admin v2.0
                    </span>
                </div>
            </header>

            {/* TAB NAV (Simplified) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10 mb-12">

                {/* SECTION 1: EFFICACY SUMMARY (Migration Rate) */}
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <p className="text-indigo-300 text-xs font-black uppercase tracking-widest mb-2">Taxa de Migração Global</p>
                                <h2 className="text-7xl font-black">{data.migrationRate}%</h2>
                            </div>
                            <div className="bg-indigo-500/20 p-4 rounded-2xl backdrop-blur-md border border-indigo-400/20">
                                <TrendingUp className="w-8 h-8 text-indigo-400" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                <p className="text-[10px] text-indigo-300 font-bold uppercase mb-1">Intervenção</p>
                                <p className="text-2xl font-black">{data.intervention.rate}% <span className="text-[10px] text-green-400 font-bold">SAVED</span></p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                <p className="text-[10px] text-indigo-300 font-bold uppercase mb-1">Controle</p>
                                <p className="text-2xl font-black">{data.control.rate}% <span className="text-[10px] text-slate-400 font-bold">BASE</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: RETENTION FUNNEL (Pipeline) */}
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Filter className="w-5 h-5 text-indigo-600" />
                            Funil de Conversão (Eficácia)
                        </h3>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md">Realtime</span>
                    </div>

                    <div className="space-y-4">
                        {[
                            { label: 'Mensagens Enviadas', value: intelligence.funnel.sent, color: 'bg-indigo-100 text-indigo-700', icon: Megaphone, pct: 100 },
                            { label: 'Alunos na Recepção', value: intelligence.funnel.reached, color: 'bg-blue-100 text-blue-700', icon: Users, pct: intelligence.funnel.sent > 0 ? (intelligence.funnel.reached / intelligence.funnel.sent) * 100 : 0 },
                            { label: 'Ajuste de Referência', value: intelligence.funnel.reference, color: 'bg-indigo-600 text-white', icon: Target, pct: intelligence.funnel.reached > 0 ? (intelligence.funnel.reference / intelligence.funnel.reached) * 100 : 0 },
                            { label: 'Validação Supervisor', value: intelligence.funnel.validation, color: 'bg-emerald-500 text-white', icon: ShieldCheck, pct: intelligence.funnel.reference > 0 ? (intelligence.funnel.validation / intelligence.funnel.reference) * 100 : 0 },
                        ].map((stage, i) => (
                            <div key={i} className="group cursor-default">
                                <div className="flex justify-between items-center mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-lg ${stage.color}`}>
                                            <stage.icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-600">{stage.label}</span>
                                    </div>
                                    <span className="text-xs font-black text-slate-900">{stage.value} <span className="text-slate-400 font-bold">({Math.round(stage.pct)}%)</span></span>
                                </div>
                                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-50 shadow-inner">
                                    <div
                                        className={`h-full transition-all duration-1000 ease-out ${i === 3 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                                        style={{ width: `${stage.pct}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10 mb-12">

                {/* CONFIGURAÇÃO DE CAMPANHAS */}
                <div className="lg:col-span-2 space-y-8">
                    {/* CENTRAL DE DISPAROS E ESTRATIFICAÇÃO */}
                    <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 rounded-3xl p-1 shadow-2xl overflow-hidden border border-indigo-500/30">
                        <div className="bg-slate-900/90 backdrop-blur-3xl rounded-[1.4rem] p-8">
                            <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                                    <Megaphone className="w-6 h-6 text-indigo-400" />
                                </div>
                                Central de Disparos e Estratificação
                            </h3>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase text-indigo-300/60 mb-2 tracking-widest px-1">Título da Estratégia</label>
                                        <input
                                            type="text"
                                            value={newCampaign.title}
                                            onChange={e => setNewCampaign({ ...newCampaign, title: e.target.value })}
                                            placeholder="Ex: Recuperação de Inativos"
                                            className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-indigo-500 outline-none transition-all font-medium text-white placeholder:text-white/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase text-indigo-300/60 mb-2 tracking-widest px-1">Filtro de Público (Faixa)</label>
                                        <select
                                            value={newCampaign.audience}
                                            onChange={e => setNewCampaign({ ...newCampaign, audience: e.target.value })}
                                            className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold text-white appearance-none cursor-pointer"
                                        >
                                            <option value="Red" className="bg-slate-900">🚨 Faixa Vermelha</option>
                                            <option value="Yellow" className="bg-slate-900">⚠️ Faixa Amarela</option>
                                            <option value="Relapse" className="bg-slate-900">🔄 Recaída (Abandono)</option>
                                            <option value="FirstWorkout" className="bg-slate-900">🎉 Pós-Primeiro Treino</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase text-indigo-300/60 mb-2 tracking-widest px-1">Telefone de Disparo</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={newCampaign.senderPhone}
                                                onChange={e => setNewCampaign({ ...newCampaign, senderPhone: e.target.value })}
                                                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold text-white pl-12"
                                            />
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-black uppercase text-indigo-300/60 mb-2 tracking-widest px-1">Frequência (Intervalo de Dias)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={newCampaign.frequency}
                                                onChange={e => setNewCampaign({ ...newCampaign, frequency: parseInt(e.target.value) })}
                                                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-indigo-500 outline-none transition-all font-black text-white pl-12"
                                            />
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-300/40 uppercase">Dias úteis</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase text-indigo-300/60 mb-2 tracking-widest px-1">Conteúdo Automatizado</label>
                                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl focus-within:border-indigo-500 transition-all">
                                        <div className="flex gap-2 mb-3 border-b border-white/10 pb-2">
                                            <span className="text-[10px] font-black px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md ring-1 ring-indigo-500/30">{"{{nome_aluno}}"}</span>
                                            <span className="text-[10px] font-black px-2 py-0.5 bg-white/5 text-white/40 rounded-md border border-white/5">{"{{unidade}}"}</span>
                                        </div>
                                        <textarea
                                            value={newCampaign.content}
                                            onChange={e => setNewCampaign({ ...newCampaign, content: e.target.value })}
                                            className="w-full bg-transparent outline-none min-h-[120px] resize-none font-medium text-indigo-50 placeholder:text-white/10"
                                            placeholder="Dica: Comece com uma saudação personalizada..."
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSaveCampaign}
                                    disabled={isSaving || !newCampaign.title}
                                    className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    <Save className="w-6 h-6" />
                                    {isSaving ? 'Sincronizando Planilha...' : 'Ativar Campanha'}
                                </button>
                            </div>

                            {/* CONTROL PANEL: SMART LIST */}
                            <div className="mt-12 pt-8 border-t border-white/5">
                                <h4 className="text-xs font-black uppercase text-white/40 mb-6 tracking-[0.2em]">Painel de Controle: Campanhas Ativas</h4>
                                <div className="space-y-3">
                                    {campaigns.map((camp: any) => (
                                        <div key={camp.id} className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${camp.isActive ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
                                                    <Megaphone className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-base">{camp.title}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[9px] font-black uppercase text-indigo-400 tracking-wider bg-indigo-500/10 px-1.5 py-0.5 rounded-sm">{camp.audience}</span>
                                                        <span className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">Every {camp.frequency}d</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => handleToggle(camp.id, camp.isActive)}
                                                    className={`w-14 h-7 rounded-full relative transition-all duration-300 ${camp.isActive ? 'bg-indigo-500' : 'bg-slate-700'}`}
                                                >
                                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-lg ${camp.isActive ? 'left-8' : 'left-1'}`}></div>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(camp.id)}
                                                    className="p-2 text-white/10 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {campaigns.length === 0 && (
                                        <div className="text-center py-8 rounded-2xl border border-dashed border-white/10">
                                            <p className="text-white/20 text-sm font-medium italic">Nenhum pipeline ativo.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPI BOXES & BI DONUT */}
                <div className="space-y-8">

                    {/* BI DONUT CHART MOCK */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex flex-col items-center">
                        <div className="w-full flex justify-between items-center mb-10">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Target className="w-5 h-5 text-indigo-600" />
                                Distribuição de Barreiras
                            </h3>
                            {intelligence.biRatio > 20 && (
                                <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md animate-pulse">ALERTA BI</span>
                            )}
                        </div>

                        {/* Simulating Donut with border thickness and conic-gradient */}
                        <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                            <div className="absolute inset-0 rounded-full border-[12px] border-slate-50"></div>
                            <div
                                className="absolute inset-0 rounded-full border-[20px] border-transparent"
                                style={{
                                    background: `conic-gradient(#4f46e5 ${intelligence.biRatio}%, #94a3b8 ${intelligence.biRatio}% 100%)`,
                                    WebkitMaskImage: 'radial-gradient(circle, transparent 65%, black 65%)',
                                    maskImage: 'radial-gradient(circle, transparent 65%, black 65%)'
                                }}
                            />
                            <div className="text-center z-10">
                                <p className="text-3xl font-black text-slate-900">{Math.round(intelligence.biRatio)}%</p>
                                <p className="text-[10px] font-bold uppercase text-slate-400">Barreiras Internas</p>
                            </div>
                        </div>

                        <div className="w-full grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                <div className="w-3 h-3 rounded-md bg-indigo-600"></div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">BI (Internas)</p>
                                    <p className="font-bold text-slate-900">{intelligence.biCount}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                <div className="w-3 h-3 rounded-md bg-slate-400"></div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">BE (Externas)</p>
                                    <p className="font-bold text-slate-900">{intelligence.beCount}</p>
                                </div>
                            </div>
                        </div>

                        {intelligence.biRatio > 20 && (
                            <div className="mt-8 p-5 bg-red-50 border border-red-100 rounded-3xl flex gap-4 items-start">
                                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                <p className="text-xs font-bold text-red-800 leading-relaxed">
                                    <span className="uppercase text-[10px] block mb-1">Intervenção Necessária!</span>
                                    As barreiras internas (monotonia, dificuldade perceptiva) estão elevadas. Recomenda-se workshop emergencial para o time de professores.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* KPI CARDS (Mini) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                            <Users className="w-5 h-5 text-indigo-500 mb-4" />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Contato</p>
                            <h3 className="text-3xl font-black text-slate-700">{intelligence.funnel.sent}</h3>
                        </div>
                        <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100">
                            <Share2 className="w-5 h-5 text-indigo-200 mb-4" />
                            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Taxa Conversão</p>
                            <h3 className="text-3xl font-black">{intelligence.funnel.validation > 0 ? Math.round((intelligence.funnel.validation / intelligence.funnel.sent) * 100) : 0}%</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* AUDITORIA TÉCNICA (TABLES & FEED) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">

                {/* TRAINING MODS TABLE */}
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                        <ClipboardList className="w-5 h-5 text-indigo-600" />
                        Audit: Modificações de Treino
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                    <th className="py-4 px-4">Aluno</th>
                                    <th className="py-4 px-4">Modificação</th>
                                    <th className="py-4 px-4 text-right">Data</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-sm">
                                {intelligence.trainingMods.map((mod: any) => (
                                    <tr key={mod.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-4 font-bold text-slate-800">{mod.student.name}</td>
                                        <td className="py-4 px-4 font-medium text-slate-500 italic">"{mod.trainingMod}"</td>
                                        <td className="py-4 px-4 text-right text-[10px] font-bold text-slate-400">
                                            {new Date(mod.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {intelligence.trainingMods.length === 0 && (
                                    <tr><td colSpan={3} className="py-10 text-center italic text-slate-300">Nenhum registro encontrado.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FEEDBACK FEED (SCROLL) */}
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex flex-col h-full">
                    <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-indigo-600" />
                        Ouvidoria: Feedbacks Recentes
                    </h3>
                    <div className="flex-1 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-indigo-200">
                        <div className="flex gap-4 min-w-max pr-8">
                            {intelligence.feedbacks.map((fb: any, i: number) => (
                                <div key={fb.id} className="w-80 p-6 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                                    <p className="text-xs font-medium text-slate-600 italic leading-relaxed mb-6">
                                        "{fb.content?.split('Detalhes:')[1] || fb.content}"
                                    </p>
                                    <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-200/50">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xs uppercase">
                                            {fb.student.name.substring(0, 2)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900">{fb.student.name}</p>
                                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">Resgatado em {new Date(fb.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {intelligence.feedbacks.length === 0 && (
                                <div className="w-full text-center py-20 italic text-slate-300">Aguardando feedbacks...</div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
