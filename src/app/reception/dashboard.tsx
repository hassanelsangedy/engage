
'use client'

import { useState } from 'react'
import { AlertCircle, X, MessageCircle, CheckCircle } from 'lucide-react'
import { registerInteraction } from '@/app/actions/interaction'
import CheckIn from './check-in'
import BackgroundDecoration from '@/components/ui/background-decoration'

import { Student } from '@/lib/types'

export default function ReceptionDashboard({ initialStudents, unit }: { initialStudents: Student[], unit?: string }) {
    const [students] = useState(initialStudents)
    // ...
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
    const [interactionResult, setInteractionResult] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const handleOpenModal = (student: Student) => {
        setSelectedStudent(student)
        setInteractionResult('')
        setSuccessMessage(null)
    }

    const handleCloseModal = () => {
        setSelectedStudent(null)
    }

    const handleSubmit = async (outcome: string) => {
        if (!selectedStudent) return
        setIsSubmitting(true)

        const res = await registerInteraction({
            studentId: selectedStudent.id,
            type: 'Reception_Alert', // Assuming immediate hospitality trigger
            content: `Script de Gancho aplicado para ${selectedStudent.band}`, // Simplified content
            outcome: outcome,
            staffRole: 'Recepcionista'
        })

        setIsSubmitting(false)
        if (res.success) {
            setSuccessMessage('Interação registrada com sucesso!')
            setTimeout(() => {
                handleCloseModal()
                // Here we could update optimistic UI or rely on revalidation
            }, 1500)
        } else {
            alert('Erro ao registrar interação. Tente novamente.')
        }
    }

    // Hook Script varies by Band
    const getScript = (student: Student) => {
        if (student.band === 'Red') {
            return `Olá ${student.name.split(' ')[0]}, notamos que sua frequência diminuiu um pouco este mês.\n\n"Há algo que possamos fazer hoje para tornar seu treino mais agradável?"`
        }
        return `Olá ${student.name.split(' ')[0]}, parabéns por manter o ritmo! Como está se sentindo hoje?`
    }

    return (
        <div className="p-8 max-w-5xl mx-auto relative min-h-screen">
            <BackgroundDecoration />
            <div className="relative z-10">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">Hospitalidade de Prontidão</h1>
                    {unit && (
                        <div className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-md inline-block">
                            Unidade: {unit.toUpperCase()}
                        </div>
                    )}
                </header>
            </div>

            {/* CheckIn component handles independent search, could be integrated better but kept separate for now */}
            <CheckIn />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-in fade-in duration-500 mt-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-700">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    Fila de Atenção (Faixa Vermelha/Amarela)
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                <th className="pb-3 px-4">Aluno</th>
                                <th className="pb-3 px-4">ID Evo</th>
                                <th className="pb-3 px-4">Faixa</th>
                                <th className="pb-3 px-4">Métricas (Freq/Cons)</th>
                                <th className="pb-3 px-4 text-right">Ação Recomendada</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {students.map((student) => (
                                <tr
                                    key={student.id}
                                    className={`group transition-all duration-300 ${student.band === 'Red'
                                        ? 'bg-red-50/50 hover:bg-red-100/80 border-l-4 border-red-500'
                                        : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <td className="py-4 px-4 font-medium text-gray-900">
                                        {student.name}
                                        {student.band === 'Red' && (
                                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white animate-pulse">
                                                URGENTE
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-4 text-gray-500">{student.evoId}</td>
                                    <td className="py-4 px-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${student.band === 'Red'
                                            ? 'bg-red-100 text-red-800 shadow-sm border border-red-200'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${student.band === 'Red' ? 'bg-red-500 animate-ping' : 'bg-yellow-500'
                                                }`} />
                                            {student.band === 'Red' ? 'Crítica' : 'Atenção'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-gray-600">
                                        <span className="font-semibold">{student.frequency}</span> treinos / <span className="font-semibold">{student.consistency}</span> sem
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <button
                                            onClick={() => handleOpenModal(student)}
                                            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all border flex items-center gap-1 ml-auto ${student.band === 'Red'
                                                ? 'bg-red-600 text-white border-red-700 hover:bg-red-700 shadow-sm'
                                                : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'
                                                }`}
                                        >
                                            <MessageCircle className="w-3 h-3" />
                                            Acolher
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {students.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            <p>Nenhum aluno em risco identificado no momento.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Acolhimento */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-xl font-bold text-gray-900 mb-1">Acolhimento: {selectedStudent.name}</h3>
                        <p className="text-sm text-gray-500 mb-6">Unidade: {selectedStudent.unit || 'N/A'}</p>

                        <div className={`p-4 rounded-xl mb-6 border ${selectedStudent.band === 'Red' ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'
                            }`}>
                            <p className="text-xs font-bold uppercase tracking-wide mb-2 opacity-70">
                                Script Sugerido ({selectedStudent.band === 'Red' ? 'Gancho' : 'Acompanhamento'})
                            </p>
                            <p className="text-lg font-medium text-gray-800 italic">
                                "{getScript(selectedStudent)}"
                            </p>
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm font-medium text-gray-700">Resultado da Interação:</p>

                            {successMessage ? (
                                <div className="flex flex-col items-center justify-center py-4 text-green-600 bg-green-50 rounded-lg animate-in zoom-in">
                                    <CheckCircle className="w-8 h-8 mb-2" />
                                    <p className="font-medium">{successMessage}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-2">
                                    <button
                                        onClick={() => handleSubmit('Confirmou Treino')}
                                        disabled={isSubmitting}
                                        className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors text-left flex justify-between items-center group"
                                    >
                                        <span>Confirmou Treino e Agradeceu</span>
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">Registrar →</span>
                                    </button>

                                    <button
                                        onClick={() => handleSubmit('Relatou Dificuldade')}
                                        disabled={isSubmitting}
                                        className="w-full py-3 px-4 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-medium rounded-lg transition-colors text-left flex justify-between items-center group"
                                    >
                                        <span>Relatou Dificuldade (Dor/Tempo)</span>
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">Registrar →</span>
                                    </button>

                                    <button
                                        onClick={() => handleSubmit('Sem Resposta/Neutro')}
                                        disabled={isSubmitting}
                                        className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-left flex justify-between items-center group"
                                    >
                                        <span>Apenas Ouviu / Sem Resposta Clara</span>
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">Registrar →</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
