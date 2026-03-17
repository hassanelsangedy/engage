
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
    Target,
    ShieldCheck,
    Zap,
    ChevronRight,
    CheckCircle2,
    Circle,
    Brain,
    Users,
    MessageSquare,
    TrendingUp,
    LayoutDashboard,
    ArrowRightCircle,
    HelpCircle,
    Info,
    Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import BackgroundDecoration from '@/components/ui/background-decoration'
import Link from 'next/link'

export default function OnboardingPage() {
    const { data: session } = useSession()
    const userRole = (session?.user as any)?.role || 'RECEPTION'

    const [completedSteps, setCompletedSteps] = useState<string[]>([])
    const [activeSection, setActiveSection] = useState('welcome')

    const sections = [
        { id: 'welcome', title: 'Visão Geral' },
        { id: 'methodology', title: 'Metodologia' },
        { id: 'role', title: 'O Teu Papel' },
        { id: 'next', title: 'Próximos Passos' }
    ]

    const toggleStep = (stepId: string) => {
        setCompletedSteps(prev =>
            prev.includes(stepId) ? prev.filter(s => s !== stepId) : [...prev, stepId]
        )
    }

    const progress = (completedSteps.length / 8) * 100 // 8 steps total

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 pb-20 relative overflow-hidden">
            <BackgroundDecoration />

            {/* Header Banner */}
            <div className="relative z-10 bg-slate-900 text-white overflow-hidden border-b border-indigo-500/20">
                <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-96 h-96 bg-indigo-500 rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-600 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-7xl mx-auto px-8 py-16 md:py-24 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-300 text-[10px] font-black tracking-widest uppercase mb-6">
                        <Sparkles className="w-3 h-3" />
                        Central de Boas-Vindas Dinâmica
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[0.9]">
                        Projeto Evoque<span className="text-indigo-500">.</span><br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40 italic">A Ciência da Permanência</span>
                    </h1>
                    <p className="max-w-2xl text-slate-400 text-lg font-medium leading-relaxed">
                        Bem-vindo ao motor de inteligência por trás da maior hospitalidade fitness do Brasil. Transformamos dados em conexões humanas reais.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 -mt-10 relative z-20">
                {/* Progress Bar Area */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 p-8 mb-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">O Teu Treino de Integração</h2>
                            <p className="text-sm text-slate-400 font-medium tracking-tight">Completa todos os pontos para desbloquear a tua interface completa.</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progresso de Aprendizagem</span>
                            <div className="w-48 h-3 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-600 transition-all duration-1000 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-xs font-black text-indigo-600">{Math.round(progress)}% Concluído</span>
                        </div>
                    </div>

                    {/* Quick Access Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-[2rem] group hover:bg-white transition-all">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                <Target className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-black text-slate-800 uppercase mb-2">🟢 O Objetivo</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                                Reduzir a evasão focando no prazer e na autonomia, não apenas no suor. Queremos alunos que AMAM estar aqui.
                            </p>
                        </div>

                        <div className="p-6 bg-amber-50 border border-amber-100 rounded-[2rem] group hover:bg-white transition-all">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-black text-slate-800 uppercase mb-2">🟡 As Faixas</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                                <strong>Azul:</strong> Engajado. <strong>Amarelo:</strong> Alerta (Risco de saída). <strong>Vermelho:</strong> Risco Crítico. Olhamos para as cores para saber quem precisa de carinho hoje.
                            </p>
                        </div>

                        <div className="p-6 bg-red-50 border border-red-100 rounded-[2rem] group hover:bg-white transition-all">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-black text-slate-800 uppercase mb-2">🔴 A Jornada</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                                WhatsApp identifica barreira (BI/BE) ➔ Receção acolhe ➔ Professor ajusta ➔ Coordenador lidera ➔ Administrador escala.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content Body */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Role Specific Guidance (Interactive) */}
                    <div className="lg:col-span-8 space-y-12">

                        {/* Section 1: Role Guidance */}
                        <section className="bg-white rounded-[3rem] p-10 md:p-14 border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-14 h-14 bg-slate-900 rounded-[1.2rem] flex items-center justify-center text-white">
                                    <Brain className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">Orientação Especializada</h3>
                                    <p className="text-sm text-slate-400 font-medium">Conteúdo adaptado para o perfil <span className="text-indigo-600 font-black uppercase">{userRole}</span></p>
                                </div>
                            </div>

                            {userRole === 'RECEPTION' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100">
                                        <h4 className="text-xl font-black text-indigo-900 mb-4 flex items-center gap-3">
                                            <MessageSquare className="w-6 h-6" /> Roteiro de Acolhimento Premium
                                        </h4>
                                        <p className="text-indigo-800 font-medium leading-relaxed mb-6">
                                            A recepção é o coração do acolhimento. Siga este roteiro para garantir que o aluno se sinta importante:
                                        </p>
                                        <ul className="space-y-4">
                                            {[
                                                { id: 'r1', text: 'Identificação Empática: Use o nome do aluno assim que ele chegar à recepção.' },
                                                { id: 'r2', text: 'Validação da Dor: "Vi no seu WhatsApp que você está com dificuldade de [Logística/Tempo/Desânimo]. Vamos resolver?"' },
                                                { id: 'r3', text: 'Ponte Segura: "Vou avisar o Professor [Nome] agora mesmo para ele te dar uma atenção especial hoje."' },
                                                { id: 'r4', text: 'Check-in de Estímulo: Registre a presença dele no sistema para que o dashboard atualize em tempo real.' }
                                            ].map(item => (
                                                <li
                                                    key={item.id}
                                                    onClick={() => toggleStep(item.id)}
                                                    className="flex items-start gap-3 cursor-pointer group"
                                                >
                                                    {completedSteps.includes(item.id) ? (
                                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                                    ) : (
                                                        <Circle className="w-5 h-5 text-indigo-200 shrink-0 group-hover:text-indigo-400 transition-colors" />
                                                    )}
                                                    <span className={cn("text-sm font-bold transition-all", completedSteps.includes(item.id) ? "text-slate-400 line-through" : "text-indigo-900")}>
                                                        {item.text}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-slate-950 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100">
                                        <p className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em] mb-2">Padrão de Ouro Evoque</p>
                                        <p className="text-2xl font-black leading-tight">"A recepção não apenas abre a catraca, ela abre o caminho para a retenção."</p>
                                    </div>
                                </div>
                            )}

                            {userRole === 'PROFESSOR' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100">
                                        <h4 className="text-xl font-black text-emerald-900 mb-4 flex items-center gap-3">
                                            <TrendingUp className="w-6 h-6" /> Script de Ajuste Metodológico
                                        </h4>
                                        <p className="text-emerald-800 font-medium leading-relaxed mb-6">
                                            Sua missão é ajustar o treino ao estado emocional do aluno hoje:
                                        </p>
                                        <ul className="space-y-4">
                                            {[
                                                { id: 'p1', text: 'Abordagem de Pista: "Notei que você voltou hoje! Que bom. Vamos fazer um treino mais leve e prazeroso?"' },
                                                { id: 'p2', text: 'Regra dos 50%: Se o aluno estiver desanimado, reduza o volume e foque no bem-estar.' },
                                                { id: 'p3', text: 'Feedback Imediato: Pergunte após a primeira série como ele está se sentindo.' },
                                                { id: 'p4', text: 'Marcação de Sucesso: Sinalize no sistema quando o aluno completar o treino adaptativo.' }
                                            ].map(item => (
                                                <li
                                                    key={item.id}
                                                    onClick={() => toggleStep(item.id)}
                                                    className="flex items-start gap-3 cursor-pointer group"
                                                >
                                                    {completedSteps.includes(item.id) ? (
                                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                                    ) : (
                                                        <Circle className="w-5 h-5 text-emerald-200 shrink-0 group-hover:text-emerald-400 transition-colors" />
                                                    )}
                                                    <span className={cn("text-sm font-bold transition-all", completedSteps.includes(item.id) ? "text-slate-400 line-through" : "text-emerald-900")}>
                                                        {item.text}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-slate-950 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-100">
                                        <p className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.2em] mb-2">Mindset Profissional</p>
                                        <p className="text-2xl font-black leading-tight">"Mais vale um treino de 15 minutos felizes do que um de 1 hora que o faz desistir."</p>
                                    </div>
                                </div>
                            )}

                            {userRole === 'COORDINATOR' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100">
                                        <h4 className="text-xl font-black text-indigo-900 mb-4 flex items-center gap-3">
                                            <LayoutDashboard className="w-6 h-6" /> Liderança e Governança
                                        </h4>
                                        <ul className="space-y-4">
                                            {[
                                                { id: 'c1', text: 'Análise de Fluxo: Verifique se a recepção está encaminhando os alunos corretamente.' },
                                                { id: 'c2', text: 'Auditoria de Aula: Observe se os professores estão aplicando os ajustes hedônicos.' },
                                                { id: 'c3', text: 'Feedback Ativo: Use o Dashboard Estratégico para nortear as reuniões semanais.' },
                                                { id: 'c4', text: 'Validação de Recuperação: Monitore quantos alunos saíram da Faixa Vermelha.' }
                                            ].map(item => (
                                                <li
                                                    key={item.id}
                                                    onClick={() => toggleStep(item.id)}
                                                    className="flex items-start gap-3 cursor-pointer group"
                                                >
                                                    {completedSteps.includes(item.id) ? (
                                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                                    ) : (
                                                        <Circle className="w-5 h-5 text-indigo-200 shrink-0 group-hover:text-indigo-400 transition-colors" />
                                                    )}
                                                    <span className={cn("text-sm font-bold transition-all", completedSteps.includes(item.id) ? "text-slate-400 line-through" : "text-indigo-900")}>
                                                        {item.text}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-slate-950 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100">
                                        <p className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em] mb-2">Liderança</p>
                                        <p className="text-2xl font-black leading-tight">"Sua unidade é o reflexo da sua atenção aos detalhes dos dados."</p>
                                    </div>
                                </div>
                            )}

                            {userRole === 'ADMIN' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 text-white">
                                        <h4 className="text-xl font-black text-indigo-400 mb-4 flex items-center gap-3">
                                            <HelpCircle className="w-6 h-6" /> Visão Executiva e Escalabilidade
                                        </h4>
                                        <ul className="space-y-4">
                                            {[
                                                { id: 'a1', text: 'Métricas Macro: Acompanhe o ROI das intervenções de retenção em todas as unidades.' },
                                                { id: 'a2', text: 'Saúde do Ecossistema: Audite a integração entre EVO API e Google Sheets.' },
                                                { id: 'a3', text: 'Gestão de Talentos: Identifique quais professores e recepcionistas mais recuperam alunos.' },
                                                { id: 'a4', text: 'Evolução IA: Analise a eficácia das classificações de barreira automática.' }
                                            ].map(item => (
                                                <li
                                                    key={item.id}
                                                    onClick={() => toggleStep(item.id)}
                                                    className="flex items-start gap-3 cursor-pointer group"
                                                >
                                                    {completedSteps.includes(item.id) ? (
                                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                                    ) : (
                                                        <Circle className="w-5 h-5 text-slate-700 shrink-0 group-hover:text-indigo-400 transition-colors" />
                                                    )}
                                                    <span className={cn("text-sm font-bold transition-all", completedSteps.includes(item.id) ? "text-slate-400 line-through" : "text-white")}>
                                                        {item.text}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200">
                                        <p className="text-[10px] font-black uppercase text-indigo-200 tracking-[0.2em] mb-2">Estratégia</p>
                                        <p className="text-2xl font-black leading-tight">"A tecnologia serve ao humano para tornar o negócio imbatível."</p>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Sidebar: Navigation & Support */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm sticky top-8">
                            <h4 className="text-lg font-black text-slate-900 mb-6">Próximos Passos</h4>
                            <div className="space-y-4 mb-8">
                                <Link
                                    href={
                                        userRole === 'ADMIN' || userRole === 'COORDINATOR' ? '/admin' :
                                            userRole === 'RECEPTION' ? '/reception' :
                                                '/coordinator/professor'
                                    }
                                    className={cn(
                                        "w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg",
                                        progress >= 25 ? "bg-slate-900 text-white shadow-slate-200" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                    )}
                                >
                                    Ir para o Painel <ArrowRightCircle className="w-4 h-4" />
                                </Link>
                                <button className="w-full py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all">
                                    <Info className="w-4 h-4" /> Material PDF
                                </button>
                            </div>

                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Suporte Técnico</p>
                                <p className="text-xs font-bold text-slate-600 leading-relaxed mb-4">Dúvidas sobre o funcionamento das faixas ou triggers?</p>
                                <button className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                                    Falar com o TI <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    )
}
