
'use client'

import { useState, useEffect, useTransition } from 'react'
import {
    ShieldAlert,
    TrendingUp,
    Users,
    ChevronRight,
    Search,
    Filter,
    FileText,
    ArrowUpRight,
    UserCircle2,
    CheckCircle2,
    X,
    MessageCircle,
    Award,
    Activity,
    Navigation
} from 'lucide-react'
import { 
    getCoordinatorControlCenterData, 
    updateStudentPR
} from './actions'
import BackgroundDecoration from '@/components/ui/background-decoration'

export default function ControlCenter() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [unitFilter, setUnitFilter] = useState('')
    const [periodFilter, setPeriodFilter] = useState('')
    const [selectedStudent, setSelectedStudent] = useState<any>(null)
    const [isReportModalOpen, setIsReportModalOpen] = useState(false)
    const [reportData, setReportData] = useState<any>(null)
    const [isPending, startTransition] = useTransition()

    const loadData = async () => {
        setLoading(true)
        const res = await getCoordinatorControlCenterData({ 
            unit: unitFilter, 
            period: periodFilter 
        })
        setData(res)
        setLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [unitFilter, periodFilter])

    const handleGenerateReport = async () => {
        // TODO: implement generateMonthlyCoordinatorReport in coordinator/actions.ts
        setReportData({
            date: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
            totalStudents: data?.stats?.total || 0,
            redRankPercentage: data?.stats?.redPercent || 0,
            biCount: data?.biStudents?.length || 0,
            success: true
        })
        setIsReportModalOpen(true)
    }

    const handleUpdatePR = async (studentId: string, profName: string) => {
        const res = await updateStudentPR(studentId, profName)
        if (res.success) {
            loadData()
            setSelectedStudent(null)
        }
    }

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    return (
        <div className="p-6 md:p-10 max-w-[1600px] mx-auto min-h-screen bg-slate-50 relative overflow-hidden">
            <BackgroundDecoration />
            
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 relative z-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Control Center <span className="text-indigo-600">v2.6</span></h1>
                    <p className="text-slate-500 font-medium mt-1">Gestão de Evasão e Barreiras Internas (BI)</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center bg-white rounded-2xl shadow-sm border border-slate-200 p-1">
                        <button 
                            onClick={() => setPeriodFilter('')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${periodFilter === '' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Tudo
                        </button>
                        <button 
                            onClick={() => setPeriodFilter('Manhã')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${periodFilter === 'Manhã' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Manhã
                        </button>
                        <button 
                            onClick={() => setPeriodFilter('Tarde')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${periodFilter === 'Tarde' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Tarde
                        </button>
                        <button 
                            onClick={() => setPeriodFilter('Noite')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${periodFilter === 'Noite' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Noite
                        </button>
                    </div>

                    <button 
                        onClick={handleGenerateReport}
                        className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl font-bold text-sm shadow-sm border border-slate-200 transition-all active:scale-95"
                    >
                        <FileText className="w-4 h-4 text-indigo-500" />
                        Relatório Mensal
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                
                {/* 1. Alerta Crítico (BI) - Span 8 columns */}
                <div className="lg:col-span-8 space-y-6">
                    <section className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-gradient-to-r from-red-50/50 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-red-100 rounded-2xl">
                                    <ShieldAlert className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Alerta Crítico: Barreiras Internas</h2>
                                    <p className="text-sm text-slate-500 font-medium">Prioridade Máxima de Intervenção</p>
                                </div>
                            </div>
                            <span className="px-4 py-1.5 bg-red-600 text-white rounded-full text-xs font-black shadow-lg shadow-red-200 animate-pulse">
                                {data?.biStudents?.length || 0} ALUNOS
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Aluno</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Barreira Detectada (IA)</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">P. de Referência</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {data?.biStudents?.length > 0 ? (
                                        data.biStudents.map((student: any) => (
                                            <tr key={student.evoId} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors capitalize font-bold">
                                                            {student.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900">{student.name}</div>
                                                            <div className="text-[10px] text-slate-400 font-bold uppercase">{student.unit} • {student.shift}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-medium border border-red-100/50 max-w-[250px]">
                                                        {student.barrierDescription}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <UserCircle2 className="w-4 h-4 text-slate-300" />
                                                        <span className="text-sm font-semibold text-slate-600">{student.professorReferencia}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <button 
                                                        onClick={() => setSelectedStudent(student)}
                                                        className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all active:scale-95"
                                                    >
                                                        <ChevronRight className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-medium">
                                                Nenhum aluno com barreira interna crítica no momento.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                {/* Right Sidebar - Span 4 columns */}
                <div className="lg:col-span-4 space-y-8">
                    
                    {/* 2. Painel de Eficácia de Retenção */}
                    <section className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-900/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Retention Efficacy</span>
                                <TrendingUp className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div className="flex items-end gap-4 mb-2">
                                <div className="text-6xl font-black text-white tracking-tight">{data?.retentionRate}%</div>
                                <div className="mb-2 flex items-center gap-1 text-green-400 font-bold text-sm">
                                    <ArrowUpRight className="w-4 h-4" />
                                    <span>Normalizado</span>
                                </div>
                            </div>
                            <p className="text-slate-400 text-xs font-medium leading-relaxed">
                                Taxa de migração de alunos <span className="text-red-400 font-bold">BI</span> para <span className="text-yellow-400 font-bold">Faixa Amarela</span> nos últimos 30 dias.
                            </p>

                            <div className="mt-8 pt-8 border-t border-white/10 grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">Total BI</div>
                                    <div className="text-xl font-bold">{data?.stats?.totalBI}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-500 uppercase mb-1">Resgatados</div>
                                    <div className="text-xl font-bold text-indigo-400">{data?.stats?.migrated}</div>
                                </div>
                            </div>
                        </div>
                        {/* Static decorative graph elements could go here */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-600/20 blur-[80px] rounded-full"></div>
                    </section>

                    {/* 3. Ranking de Soft Skills */}
                    <section className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                                    <Award className="w-5 h-5" />
                                </div>
                                <h2 className="font-bold text-slate-900">Perfil Professor</h2>
                            </div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">v2.6 Dashboard</span>
                        </div>

                        <div className="space-y-4">
                            {data?.professors?.map((prof: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:shadow-md transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm font-black text-indigo-600 text-xs">
                                            {prof.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-900">{prof.name}</div>
                                            <div className="text-[10px] text-slate-400 font-semibold">{prof.softSkills}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        {prof.pr && <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-[9px] font-black uppercase">PR</span>}
                                        {prof.per && <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-[9px] font-black uppercase">PER</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {/* Student Detail Modal (BI Protocol) */}
            {selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="relative">
                            <div className="h-32 bg-slate-900"></div>
                            <button 
                                onClick={() => setSelectedStudent(null)}
                                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="absolute -bottom-10 left-10">
                                <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center p-1">
                                    <div className="w-full h-full bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black">
                                        {selectedStudent.name[0]}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-16 px-10 pb-10">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900">{selectedStudent.name}</h2>
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1 flex items-center gap-2">
                                        <Activity className="w-3 h-3 text-red-500" />
                                        Protocolo de Contato Intencional (SDT)
                                    </p>
                                </div>
                                <div className="bg-red-50 text-red-600 px-4 py-2 rounded-2xl border border-red-100 text-xs font-bold">
                                    Barreira Interna Detectada
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6 text-slate-600">
                                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Protocolo Sugerido (Teoria da Autodeterminação)</h3>
                                    
                                    <div className="space-y-4">
                                        <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="p-2 bg-indigo-50 rounded-xl h-fit">
                                                <Navigation className="w-4 h-4 text-indigo-600" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 text-sm">Autonomia</div>
                                                <p className="text-xs mt-1 leading-relaxed">Ofereça opções de ajuste no treino. Deixe que o aluno sinta que ele tem o controle sobre a solução.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="p-2 bg-indigo-50 rounded-xl h-fit">
                                                <Award className="w-4 h-4 text-indigo-600" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 text-sm">Competência</div>
                                                <p className="text-xs mt-1 leading-relaxed">Destaque o progresso anterior. Mostre que ele é capaz de superar essa barreira técnica.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="p-2 bg-indigo-50 rounded-xl h-fit">
                                                <Users className="w-4 h-4 text-indigo-600" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 text-sm">Relacionamento</div>
                                                <p className="text-xs mt-1 leading-relaxed">Inicie com escuta ativa. Valide a dor dele antes de sugerir qualquer mudança.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Gestão Manual</h3>
                                    
                                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Professor de Referência atual</label>
                                        <p className="font-bold text-slate-900 mb-4">{selectedStudent.professorReferencia}</p>
                                        
                                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Alterar Responsável</label>
                                        <select 
                                            onChange={(e) => handleUpdatePR(selectedStudent.evoId, e.target.value)}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                                            defaultValue={selectedStudent.professorReferencia}
                                        >
                                            <option value="" disabled>Selecione um Professor</option>
                                            {data?.professors?.map((prof: any) => (
                                                <option key={prof.name} value={prof.name}>{prof.name}</option>
                                            ))}
                                        </select>

                                        <p className="text-[10px] text-slate-400 mt-4 leading-normal italic">
                                            Mudar o Professor de Referência atualizará automaticamente a Base_Alunos e notificará o novo responsável.
                                        </p>
                                    </div>

                                    <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-lg shadow-indigo-200">
                                        <h4 className="font-black mb-2 text-sm uppercase">Próximo Passo</h4>
                                        <p className="text-xs text-indigo-100 leading-relaxed mb-4">
                                            Realize o contato intencional hoje. Se a barreira não for resolvida, marque como "Recaída Implante" para intervenção do PER.
                                        </p>
                                        <button 
                                            onClick={() => setSelectedStudent(null)}
                                            className="w-full py-3 bg-white text-indigo-600 rounded-xl font-black text-xs hover:bg-slate-50 transition-all active:scale-95"
                                        >
                                            Finalizar Visualização
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Monthly Report Modal */}
            {isReportModalOpen && reportData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg p-10 relative animate-in zoom-in-95">
                        <button 
                            onClick={() => setIsReportModalOpen(false)}
                            className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        
                        <div className="text-center mb-10">
                            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900">Relatório Executivo</h2>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Consolidado Mensal • {reportData.date}</p>
                        </div>

                        <div className="space-y-4 mb-10">
                            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                                <span className="text-sm font-bold text-slate-500">Total de Alunos</span>
                                <span className="font-black text-slate-900">{reportData.totalStudents}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                                <span className="text-sm font-bold text-slate-500">Taxa de Risco Vermelho</span>
                                <span className="font-black text-red-600">{reportData.redRankPercentage}%</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                                <span className="text-sm font-bold text-slate-500">Pendências BI</span>
                                <span className="font-black text-amber-600">{reportData.biCount} casos</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => setIsReportModalOpen(false)}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                        >
                            Fechar e Download PDF
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
