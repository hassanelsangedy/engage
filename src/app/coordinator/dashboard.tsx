
'use client'

import { useState } from 'react'
import {
    ClipboardList,
    MessageSquare,
    Send,
    CheckCircle,
    X,
    TrendingUp,
    AlertTriangle,
    Smile,
    Meh,
    Frown
} from 'lucide-react'
import { registerInteraction } from '@/app/actions/interaction'
import BackgroundDecoration from '@/components/ui/background-decoration'

import { Student } from '@/lib/types'

export default function CoordinatorDashboard({
    initialStudents,
    stats,
    unit
}: {
    initialStudents: Student[],
    stats: any,
    unit?: string
}) {
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
    const [sentiment, setSentiment] = useState<'Positive' | 'Neutral' | 'Negative'>('Neutral')
    const [category, setCategory] = useState('Geral')
    const [details, setDetails] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmitFeedback = async () => {
        if (!selectedStudent || !details) return

        setIsSubmitting(true)
        const res = await registerInteraction({
            studentId: selectedStudent.id,
            type: 'Coordinator_Review',
            content: `[Ouvidoria Ativa - ${category}] Sentiment: ${sentiment}. Detalhes: ${details}`,
            outcome: 'Resolved',
            staffRole: 'Coordenador'
        })
        setIsSubmitting(false)

        if (res.success) {
            setSuccess(true)
            setTimeout(() => {
                setSuccess(false)
                setSelectedStudent(null)
                setDetails('')
            }, 2000)
        }
    }

    return (
        <div className="p-8 max-w-7xl mx-auto relative min-h-screen">
            <BackgroundDecoration />

            <header className="mb-10 relative z-10">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2 text-slate-900">Validar Ajuste (Pós-Treino)</h1>
                <p className="text-gray-500">Gestão de Qualidade e Ouvidoria Ativa</p>
                {unit && (
                    <div className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-md inline-block mt-2">
                        Unidade: {unit.toUpperCase()}
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                {/* At Risk List */}
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                        <h2 className="font-bold text-gray-700 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Finalizaram Treino Hoje
                        </h2>
                        <span className="text-xs font-bold text-gray-400">{initialStudents.length}</span>
                    </div>
                    <div className="overflow-y-auto max-h-[600px] divide-y divide-gray-50">
                        {initialStudents.map(student => (
                            <button
                                key={student.id}
                                onClick={() => setSelectedStudent(student)}
                                className={`w-full text-left p-4 hover:bg-blue-50 transition-colors flex items-center justify-between group ${selectedStudent?.id === student.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                                    }`}
                            >
                                <div>
                                    <p className="font-bold text-gray-900 group-hover:text-blue-700">{student.name}</p>
                                    <p className="text-xs text-gray-500">ID: {student.evoId}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${student.band === 'Red' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {student.band === 'Red' ? 'Crítico' : 'Atenção'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Feedback Form */}
                <div className="lg:col-span-2 space-y-6">
                    {selectedStudent ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Registrar Ouvidoria Ativa</h2>
                                    <p className="text-blue-600 font-medium">{selectedStudent.name}</p>
                                </div>
                                <button onClick={() => setSelectedStudent(null)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Sentiment Selector */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Percepção do Aluno</label>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setSentiment('Negative')}
                                            className={`flex-1 py-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${sentiment === 'Negative' ? 'border-red-500 bg-red-50 text-red-700 shadow-md' : 'border-gray-100 text-gray-400 hover:border-red-200'
                                                }`}
                                        >
                                            <Frown className="w-8 h-8" />
                                            <span className="text-xs font-bold">Insuportável / Crítico</span>
                                        </button>
                                        <button
                                            onClick={() => setSentiment('Neutral')}
                                            className={`flex-1 py-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${sentiment === 'Neutral' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' : 'border-gray-100 text-gray-400 hover:border-blue-200'
                                                }`}
                                        >
                                            <Meh className="w-8 h-8" />
                                            <span className="text-xs font-bold">Neutro / Indiferente</span>
                                        </button>
                                        <button
                                            onClick={() => setSentiment('Positive')}
                                            className={`flex-1 py-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${sentiment === 'Positive' ? 'border-green-500 bg-green-50 text-green-700 shadow-md' : 'border-gray-100 text-gray-400 hover:border-green-200'
                                                }`}
                                        >
                                            <Smile className="w-8 h-8" />
                                            <span className="text-xs font-bold">Satisfeito / Resgatado</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Category */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Categoria</label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option>Atenção do Professor</option>
                                            <option>Limpeza/Infra</option>
                                            <option>Equipamentos</option>
                                            <option>Clima/Ambiente</option>
                                            <option>Pessoal/Falta de Tempo</option>
                                            <option>Outros</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Ação Recomendada</label>
                                        <div className="p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 text-sm">
                                            {selectedStudent.band === 'Red' ? 'Ligação direta + Isenção de taxa' : 'Mensagem de incentivo do Gestor'}
                                        </div>
                                    </div>
                                </div>

                                {/* Details */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Notas Detalhadas</label>
                                    <textarea
                                        value={details}
                                        onChange={(e) => setDetails(e.target.value)}
                                        placeholder="Descreva o que o aluno relatou e qual foi o acordo de resgate..."
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl min-h-[150px] outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {success ? (
                                    <div className="bg-green-600 text-white p-4 rounded-xl flex items-center justify-center gap-3 animate-in zoom-in duration-300">
                                        <CheckCircle className="w-6 h-6" />
                                        <span className="font-bold tracking-wide text-lg">Feedback Registrado com Sucesso!</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleSubmitFeedback}
                                        disabled={isSubmitting || !details}
                                        className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <Send className="w-5 h-5" />
                                        {isSubmitting ? 'Processando...' : 'Finalizar Registro de Ouvidoria'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-300 p-12 flex flex-col items-center justify-center text-center">
                            <div className="bg-gray-50 p-6 rounded-full mb-6">
                                <ClipboardList className="w-12 h-12 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Selecione um aluno para iniciar</h3>
                            <p className="text-gray-500 max-w-xs">A ouvidoria ativa é focada nos alunos que estão na fila de abandono iminente.</p>
                        </div>
                    )}

                    {/* KPIs Mini-Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl text-white shadow-lg">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold uppercase opacity-80 tracking-widest">Conversão</span>
                                <TrendingUp className="w-4 h-4 opacity-80" />
                            </div>
                            <div className="text-3xl font-black">{stats.yellow > 0 ? Math.round((stats.yellow / stats.total) * 100) : 0}%</div>
                            <p className="text-xs opacity-70 mt-1">Status Vermelho → Amarelo</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold uppercase text-gray-400 tracking-widest">Interações</span>
                                <MessageSquare className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="text-3xl font-black text-slate-900">{stats.interactions}</div>
                            <p className="text-xs text-gray-400 mt-1">Este mês (Métrica Real)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
