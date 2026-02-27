
'use client'

import { useState } from 'react'
import { BrainCircuit, Dumbbell, ClipboardList, CheckCircle, X } from 'lucide-react'
import { registerInteraction } from '@/app/actions/interaction'
import BackgroundDecoration from '@/components/ui/background-decoration'

import { Student } from '@/lib/types'

const BARRIER_ORIENTATIONS: Record<string, { diagnostics: string, prescriptions: string[] }> = {
    "Monotonia / Baixa Autoeficácia": {
        diagnostics: "Risco de Monotonia / Baixa Autoeficácia",
        prescriptions: ["Oferecer micro-escolhas (ex: ordem dos exercícios).", "Validar técnica com elogio descritivo."]
    },
    "Falta de Tempo / Sobrecarga": {
        diagnostics: "Barreira: Excesso de Volume / Falta de Tempo",
        prescriptions: ["Sugerir treino alternativo de 20 min.", "Priorizar grandes grupamentos hoje."]
    },
    "Perda de Sentido / Social": {
        diagnostics: "Barreira: Baixo Pertencimento / Desmotivado",
        prescriptions: ["Apresentar 1 novo aluno hoje.", "Convidar para o evento da semana."]
    },
    "Desconhecida": {
        diagnostics: "Diagnóstico Preventivo",
        prescriptions: ["Fazer pergunta aberta: 'O que mais gosta aqui?'", "Check-in de bem-estar."]
    }
}

export default function ProfessorDashboard({ initialStudents, unit }: { initialStudents: Student[], unit?: string }) {
    // ... rest of component
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
    const [notes, setNotes] = useState('')
    const [barrierType, setBarrierType] = useState<'BI' | 'BE'>('BI')
    const [trainingMod, setTrainingMod] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleOpenModal = (student: Student) => {
        setSelectedStudent(student)
        setNotes('')
        setBarrierType('BI')
        setTrainingMod('')
        setSuccess(false)
    }

    const handleClose = () => {
        setSelectedStudent(null)
    }

    const handleSubmit = async () => {
        if (!selectedStudent) return

        setIsSubmitting(true)
        const res = await registerInteraction({
            studentId: selectedStudent.id,
            type: 'Professor_Adjustment',
            content: notes || 'Ajuste hedônico aplicado.',
            outcome: 'Completed',
            staffRole: 'Professor',
            barrierType: barrierType,
            trainingMod: trainingMod
        })
        setIsSubmitting(false)

        if (res.success) {
            setSuccess(true)
            setTimeout(handleClose, 1500)
        } else {
            alert('Erro ao salvar ajuste.')
        }
    }

    return (
        <div className="p-8 max-w-7xl mx-auto relative min-h-screen">
            <BackgroundDecoration />
            <div className="relative z-10">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Painel do Professor</h1>
                    <p className="text-gray-500">Foco: Ajuste Hedônico e Aumento de Competência Percebida</p>
                    {unit && (
                        <div className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-md inline-block mt-2">
                            Unidade: {unit.toUpperCase()}
                        </div>
                    )}
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {initialStudents.map(student => {
                        const orientation = BARRIER_ORIENTATIONS[student.barrier || "Desconhecida"] || BARRIER_ORIENTATIONS["Desconhecida"];

                        return (
                            <div key={student.id} className={`bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition-all group relative ${student.band === 'Red' ? 'border-red-200 bg-red-50/10 shadow-red-50' : 'border-gray-100'
                                }`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{student.name}</h3>
                                        <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${student.band === 'Red' ? 'bg-red-600 text-white animate-pulse' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            Faixa {student.band === 'Red' ? 'Vermelha' : 'Amarela'} ({student.score} pts)
                                        </span>
                                    </div>
                                    <div className={`p-2.5 rounded-xl ${student.band === 'Red' ? 'bg-red-600 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                                        <BrainCircuit className="w-6 h-6" />
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center justify-between text-sm p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-500">Consistência</span>
                                        <span className="font-semibold text-gray-900">{student.consistency} semanas</span>
                                    </div>

                                    <div>
                                        <span className="text-xs font-bold uppercase text-gray-400">Diagnóstico Automático</span>
                                        <div className="mt-1 text-sm font-medium text-orange-700 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                                            {orientation.diagnostics}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-5">
                                    <h4 className="text-xs font-bold uppercase text-indigo-900 mb-3">Prescrição Comportamental</h4>
                                    <ul className="text-sm text-gray-600 space-y-2 mb-6 list-disc pl-4">
                                        {orientation.prescriptions.map((p, idx) => (
                                            <li key={idx}><strong>{p.split('(')[0]}</strong>{p.includes('(') ? `(${p.split('(')[1]}` : ''}</li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => handleOpenModal(student)}
                                        className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition shadow-sm hover:shadow"
                                    >
                                        <Dumbbell className="w-4 h-4" />
                                        Registrar Ajuste
                                    </button>
                                </div>
                            </div>
                        )
                    })}

                    {initialStudents.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-400">
                            <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="text-lg">Nenhum aluno na lista de risco hoje. Bom trabalho!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Ajuste */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative">
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-xl font-bold text-gray-900 mb-4">Ajuste Hedônico: {selectedStudent.name}</h3>

                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
                            <h4 className="text-sm font-bold text-blue-800 mb-2">Protocolo de Autonomia (Escolha 1):</h4>
                            <ul className="space-y-2 text-sm text-blue-700">
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                    "Você prefere começar pelo Leg Press ou Cadeira Extensora hoje?"
                                </li>
                            </ul>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-400 mb-2">Classificação</label>
                                <div className="flex bg-gray-100 p-1 rounded-xl">
                                    <button
                                        onClick={() => setBarrierType('BI')}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${barrierType === 'BI' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Interna (BI)
                                    </button>
                                    <button
                                        onClick={() => setBarrierType('BE')}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${barrierType === 'BE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Externa (BE)
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-400 mb-2">Modificação Técnica</label>
                                <input
                                    type="text"
                                    value={trainingMod}
                                    onChange={e => setTrainingMod(e.target.value)}
                                    placeholder="Ex: Leg Press p/ Extensora"
                                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-black uppercase text-gray-400 mb-2">
                                Observações do Ajuste
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Anotações gerais..."
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-20 resize-none text-sm"
                            />
                        </div>

                        {success ? (
                            <div className="flex items-center justify-center py-3 text-green-600 bg-green-50 rounded-lg animate-in zoom-in">
                                <CheckCircle className="w-6 h-6 mr-2" />
                                <span>Ajuste salvo com sucesso!</span>
                            </div>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-70"
                            >
                                {isSubmitting ? 'Salvando...' : 'Confirmar Ajuste'}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
