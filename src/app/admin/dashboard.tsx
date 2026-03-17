'use client'

import { useState } from 'react'
import { BarChart, Users, User, UserPlus, TrendingUp, Target, ShieldCheck, ShieldAlert, Shield, Settings, Filter, Type, Save, CheckCircle2, AlertCircle, LayoutDashboard, Share2, ClipboardList, MessageSquare, Info, Zap, Clock, MessageCircle, Heart, Brain, LineChart, ArrowUpRight, ChevronRight } from 'lucide-react'
import BackgroundDecoration from '@/components/ui/background-decoration'
import { updateJourneyConfig } from './actions'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function AdminDashboard({ data, intelligence, journey, stats, stratification, pendingUsers = [] }: { data: any, intelligence: any, journey: any[], stats: any, stratification: any, pendingUsers?: any[] }) {
    const router = useRouter()
    const { data: session } = useSession()
    const userRole = (session?.user as any)?.role

    const [editingJourneyId, setEditingJourneyId] = useState<string | null>(null)

    const totalStudents: number = Number(Object.values(intelligence.bandDistribution || {}).reduce((a: any, b: any) => (Number(a) || 0) + (Number(b) || 0), 0)) || 1
    const pBlue: number = (Number(intelligence.bandDistribution?.Blue || 0) / totalStudents) * 100
    const pGreen: number = (Number(intelligence.bandDistribution?.Green || 0) / totalStudents) * 100
    const pYellow: number = (Number(intelligence.bandDistribution?.Yellow || 0) / totalStudents) * 100
    const pRed: number = (Number(intelligence.bandDistribution?.Red || 0) / totalStudents) * 100

    // Recovery metrics from Strategic logic
    const recoveryRate = intelligence.recoveryRate || stats.trend?.recoveryRate || 0

    return (
        <div className="p-8 max-w-7xl mx-auto relative min-h-screen text-slate-900">
            <BackgroundDecoration />

            <header className="mb-10 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-slate-900">Engage | Central Estratégica</h1>
                    <p className="text-gray-500 font-medium">Consolidado de Inteligência e Ações Evoque</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                        <Settings className="w-3.5 h-3.5" />
                        Admin v2.5
                    </span>
                </div>
            </header>

            {/* SECTION: DASHBOARD EXECUTIVO (Migrated from Strategic) */}
            <div className="relative z-10 mb-12">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-600 rounded-lg text-white">
                        <LineChart className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Dashboard Executivo | Performance</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Band Counts */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                            { title: 'Faixa Vermelha', count: stats.red, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', icon: ShieldAlert, trend: stats.trend?.redDiff, trendClass: stats.trend?.redClass },
                            { title: 'Faixa Amarela', count: stats.yellow, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: AlertCircle },
                            { title: 'Faixa Azul', count: stats.blue, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', icon: ShieldCheck },
                            { title: 'Base Total', count: stats.total, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', icon: Users },
                        ].map((stat, i) => (
                            <div key={i} className={cn("p-6 rounded-[32px] border bg-white shadow-sm hover:shadow-md transition-all group", stat.border)}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.title}</span>
                                        {stat.trend !== undefined && (
                                            <span className={cn(
                                                "text-[9px] font-bold px-1.5 py-0.5 rounded-full w-fit",
                                                stat.trendClass === 'diff-down' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                            )}>
                                                {stat.trendClass === 'diff-up' ? '+' : '-'}{stat.trend} vs período anterior
                                            </span>
                                        )}
                                    </div>
                                    <stat.icon className={cn("w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity", stat.color)} />
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className={cn("text-3xl font-black", stat.color)}>{stat.count}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Alunos</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right: Recovery Rate KPI (The 72.6% style card) */}
                    <div className="p-8 bg-indigo-600 rounded-[40px] flex flex-col justify-between shadow-2xl shadow-indigo-500/20 group relative overflow-hidden h-full">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
                        <div className="flex items-center justify-between relative z-10">
                            <div className="p-3 bg-white/10 rounded-2xl">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                        </div>
                        <div className="space-y-2 relative z-10">
                            <div className="text-[11px] font-black uppercase text-indigo-200 tracking-[0.2em]">Taxa de Recuperação</div>
                            <div className="text-7xl font-black text-white">{recoveryRate}%</div>
                            <p className="text-xs font-medium text-white/70 leading-relaxed pt-2">
                                Baseado no resgate de alunos que saíram do risco crítico (Faixa Vermelha).
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Access Links below icons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <Link
                        href="/coordinator/journey"
                        className="group p-6 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-[32px] flex items-center justify-between hover:bg-white transition-all hover:shadow-lg"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800">Jornada do Cliente</h3>
                                <p className="text-xs text-slate-400 font-medium">Respondentes Real-time.</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                        href="/coordinator/analytics"
                        className="group p-6 bg-indigo-50 border border-indigo-100 rounded-[32px] flex items-center justify-between hover:bg-white transition-all hover:shadow-lg"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-800">Governança</h3>
                                <p className="text-xs text-slate-400 font-medium">Análise de Padrões.</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-indigo-300 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    {userRole === 'ADMIN' && (
                        <Link
                            href="/admin/users"
                            className="group p-6 bg-slate-900 border border-slate-800 rounded-[32px] flex items-center justify-between hover:bg-slate-800 transition-all hover:shadow-lg shadow-xl shadow-slate-200"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div className="">
                                    <h3 className="text-lg font-black text-white leading-tight">Gestão Equipa</h3>
                                    <p className="text-xs text-slate-400 font-medium">Controlo RBAC.</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    )}
                </div>
            </div>

            {/* ALERT: PENDING USERS (Simplified Interface for Approval) */}
            {userRole === 'ADMIN' && pendingUsers.length > 0 && (
                <div className="relative z-10 mb-12 animate-in slide-in-from-top duration-700">
                    <div className="bg-amber-50 border border-amber-100 rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-amber-100/20">
                        <div className="flex items-center gap-6 text-center md:text-left">
                            <div className="w-16 h-16 bg-amber-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-amber-200 animate-pulse">
                                <UserPlus className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-amber-900">Acessos Pendentes ({pendingUsers.length})</h2>
                                <p className="text-sm text-amber-700 font-medium tracking-tight">Novos colaboradores aguardam a sua aprovação para aceder ao ecossistema.</p>
                                <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
                                    {pendingUsers.slice(0, 3).map(u => (
                                        <span key={u.id} className="px-2 py-1 bg-white border border-amber-200 rounded-lg text-[9px] font-black text-amber-900 uppercase">
                                            {u.name} • {u.role}
                                        </span>
                                    ))}
                                    {pendingUsers.length > 3 && <span className="text-[10px] font-bold text-amber-600 self-center">+{pendingUsers.length - 3} outros</span>}
                                </div>
                            </div>
                        </div>
                        <Link
                            href="/admin/users"
                            className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-amber-200 transition-all flex items-center gap-2 active:scale-95 shrink-0"
                        >
                            Gerir Acessos <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            )}

            {/* SECTION: PERFORMANCE E INTELIGÊNCIA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 mb-12">
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-5 group hover:shadow-lg transition-all duration-500">
                    <div className="bg-indigo-100 p-4 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Contatados</p>
                        <h3 className="text-3xl font-black text-slate-900">{intelligence.funnel.sent}</h3>
                    </div>
                </div>

                <div className={`rounded-3xl p-6 border shadow-sm flex items-center gap-5 transition-all duration-500 group ${intelligence.biRatio > 20 ? 'bg-red-600 border-red-500 text-white shadow-red-200' : 'bg-white border-gray-100 text-slate-900 overflow-hidden relative'}`}>
                    <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 ${intelligence.biRatio > 20 ? 'bg-white/20 text-white' : 'bg-red-50 text-red-600'}`}>
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div className="relative z-10">
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${intelligence.biRatio > 20 ? 'text-red-100' : 'text-slate-400'}`}>Barreiras Internas (BI)</p>
                        <h3 className="text-3xl font-black">{Math.round(intelligence.biRatio)}%</h3>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-5 group hover:shadow-lg transition-all duration-500">
                    <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                        <Share2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Barreiras Externas (BE)</p>
                        <h3 className="text-3xl font-black">{100 - Math.round(intelligence.biRatio)}%</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10 mb-12">
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-3">Taxa de Migração Global de Faixas</p>
                                <h2 className="text-7xl font-black tracking-tighter">{data.migrationRate}%</h2>
                                <div className="mt-4 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Performance Acima da Meta</span>
                                </div>
                            </div>
                            <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/10">
                                <TrendingUp className="w-10 h-10 text-indigo-400" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            {userRole === 'ADMIN' && (
                                <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                                    <p className="text-[10px] text-indigo-300 font-bold uppercase mb-2">ROI Retenção Estimado</p>
                                    <p className="text-2xl font-black text-emerald-400">R$ {Number(intelligence.roi || 0).toLocaleString('pt-BR')}</p>
                                </div>
                            )}
                            <div className={cn("bg-white/5 p-5 rounded-3xl border border-white/5", userRole !== 'ADMIN' && "col-span-2")}>
                                <p className="text-[10px] text-indigo-300 font-bold uppercase mb-2">Alunos Recuperados</p>
                                <p className="text-2xl font-black">{intelligence.recoveredCount || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-sm flex flex-col items-center justify-center">
                    <div className="w-full flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                            <Target className="w-6 h-6 text-indigo-600" />
                            Distribuição Global
                        </h3>
                    </div>

                    <div className="relative w-56 h-56 flex items-center justify-center mb-8">
                        <div className="absolute inset-0 rounded-full border-[15px] border-slate-50"></div>
                        <div
                            className="absolute inset-0 rounded-full border-[25px] border-transparent"
                            style={{
                                background: `conic-gradient(#3b82f6 0% ${pBlue}%, #10b981 ${pBlue}% ${pBlue + pGreen}%, #f59e0b ${pBlue + pGreen}% ${pBlue + pGreen + pYellow}%, #ef4444 ${pBlue + pGreen + pYellow}% 100%)`,
                                WebkitMaskImage: 'radial-gradient(circle, transparent 65%, black 65%)',
                                maskImage: 'radial-gradient(circle, transparent 65%, black 65%)'
                            }}
                        />
                        <div className="text-center z-10">
                            <p className="text-4xl font-black text-slate-900">{Math.round(pRed)}%</p>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Crítico (Red)</p>
                        </div>
                    </div>

                    <div className="w-full grid grid-cols-4 gap-4">
                        {[
                            { label: 'Azul', val: intelligence.bandDistribution.Blue, color: 'bg-blue-500' },
                            { label: 'Verde', val: intelligence.bandDistribution.Green, color: 'bg-emerald-500' },
                            { label: 'Amarela', val: intelligence.bandDistribution.Yellow, color: 'bg-amber-500' },
                            { label: 'Vermelha', val: intelligence.bandDistribution.Red, color: 'bg-red-500' },
                        ].map(b => (
                            <div key={b.label} className="text-center">
                                <div className={cn("w-full h-1.5 rounded-full mb-2 opacity-20", b.color)} />
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{b.label}</p>
                                <p className="text-sm font-black text-slate-800">{b.val}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* NEW SECTION: JORNADA DO CLIENTE EVOQUE (Migrated from Journey Manager) */}
            <div className="relative z-10 mb-12">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-lg text-white">
                            <Zap className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Jornada do Cliente Evoque</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {journey.map((item) => (
                        <div key={item.id} className={cn(
                            "group bg-white border rounded-[32px] p-6 transition-all hover:shadow-xl hover:border-indigo-100 relative overflow-hidden",
                            !item.ativo && "opacity-60 grayscale-[0.5]"
                        )}>
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-black rounded uppercase">{item.id}</span>
                                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{item.tad}</span>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800 leading-tight">{item.gatilho}</h3>
                                </div>
                                <div className={cn("w-3 h-3 rounded-full shadow-sm", item.ativo ? "bg-emerald-500" : "bg-slate-300")} />
                            </div>

                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6 group-hover:bg-white transition-colors">
                                <p className="text-xs text-slate-600 font-medium italic leading-relaxed">
                                    "{item.mensagem.length > 120 ? item.mensagem.substring(0, 120) + '...' : item.mensagem}"
                                </p>
                            </div>

                            <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5" /> {item.hora}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-3.5 h-3.5" /> {item.publico}
                                </div>
                            </div>
                        </div>
                    ))}
                    {journey.length === 0 && (
                        <div className="col-span-full py-20 bg-slate-50 border-2 border-dashed rounded-[40px] text-center">
                            <Info className="w-8 h-8 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Carregando Config_Campanhas...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* FEEDS: INTERVENÇÕES E FEEDBACKS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                <div className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                            <ClipboardList className="w-6 h-6 text-indigo-600" />
                            Ações de Campo
                        </h3>
                    </div>
                    <div className="space-y-6">
                        {intelligence.trainingMods.map((mod: any) => (
                            <div key={mod.id} className="flex gap-4 items-start p-4 rounded-3xl hover:bg-slate-50 transition-colors group">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-black text-slate-800">{mod.student?.name}</p>
                                        <span className="text-[8px] font-black text-indigo-400 uppercase bg-indigo-50 px-1.5 py-0.5 rounded tracking-tighter">Professor</span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium italic leading-relaxed">"{mod.trainingMod}"</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-sm flex flex-col h-full">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                            <MessageSquare className="w-6 h-6 text-indigo-600" />
                            Ouvidoria Ativa
                        </h3>
                    </div>
                    <div className="flex-1 space-y-6">
                        {intelligence.feedbacks.map((fb: any) => (
                            <div key={fb.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-all">
                                <p className="text-xs font-medium text-slate-600 italic mb-4">"{fb.content}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-600">
                                        {fb.student?.name?.substring(0, 2) || 'AL'}
                                    </div>
                                    <p className="text-[10px] font-black text-slate-800 uppercase">{fb.student?.name}</p>
                                    <div className={cn("ml-auto px-2 py-0.5 rounded text-[8px] font-black uppercase", fb.sentiment === 'Verde' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600")}>
                                        {fb.sentiment}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
