
'use client'

import { useState } from 'react'
import { AlertCircle, X, MessageCircle, CheckCircle, Info, ClipboardCheck, Loader2 } from 'lucide-react'
import { finalizeAccomodation, updateMessageStatus, sendAutomaticMessage } from './actions'
import { cn } from '@/lib/utils'
import CheckIn from './check-in'
import BackgroundDecoration from '@/components/ui/background-decoration'
import { toast } from 'sonner'

import { Student } from '@/lib/types'

export default function ReceptionDashboard({ initialStudents, allBaseStudents, unit }: { initialStudents: Student[], allBaseStudents: Student[], unit?: string }) {
    const [students] = useState(initialStudents)
    const [allBase] = useState(allBaseStudents)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeSearch, setActiveSearch] = useState('')
    const [searchResult, setSearchResult] = useState<Student | null>(null)
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedActions, setSelectedActions] = useState<string[]>([])
    const [showFinalInstruction, setShowFinalInstruction] = useState(false)
    const [sendingMessageIds, setSendingMessageIds] = useState<Set<string>>(new Set())
    const [sentMessageIds, setSentMessageIds] = useState<Set<string>>(new Set())

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
        student.evoId.toString().includes(activeSearch)
    )

    const handleLocalSearch = () => {
        setActiveSearch(searchQuery)
        if (!searchQuery) {
            setSearchResult(null)
            return
        }

        const found = allBase.find(s =>
            s.evoId === searchQuery ||
            s.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setSearchResult(found || null)
    }

    const handleOpenModal = (student: Student) => {
        setSelectedStudent(student)
        setSuccessMessage(null)
        setSelectedActions([])
        setShowFinalInstruction(false)
    }

    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const handleCloseModal = () => {
        setSelectedStudent(null)
    }

    const handleFinalize = async () => {
        if (!selectedStudent || selectedActions.length === 0) return
        setIsSubmitting(true)

        const res = await finalizeAccomodation(selectedStudent.id, selectedActions)

        setIsSubmitting(false)
        if (res.success) {
            setSuccessMessage('Acolhimento registrado com sucesso!')
            setShowFinalInstruction(true)
        } else {
            alert(`Erro ao registrar acolhimento: ${res.error || 'Tente novamente.'}`)
        }
    }

    const toggleAction = (action: string) => {
        setSelectedActions(prev =>
            prev.includes(action) ? prev.filter(a => a !== action) : [...prev, action]
        )
    }

    const handleSendMessage = async (student: Student) => {
        if (!student.phone) {
            alert('Telefone do aluno não disponível.');
            return;
        }

        const id = student.evoId || student.id;
        
        setSendingMessageIds(prev => new Set(prev).add(id));
        
        // Cleanup phone and default to Brazil country code 55 if not present
        const cleanPhone = student.phone.replace(/\D/g, '');
        const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
        
        try {
            // rawMessage is ignored — backend always sends the 'mensagem_1' Meta template
            const res = await sendAutomaticMessage(id, phoneWithCountry, '');
            if (res.success) {
                setSentMessageIds(prev => new Set(prev).add(id));
                toast.success('Mensagem enviada com sucesso!');
            } else {
                console.error('Meta API Error:', res.error);
                toast.error(`Erro da API: ${typeof res.error === 'object' ? JSON.stringify(res.error) : res.error}`);
            }
        } catch (error) {
            console.error('Send message error:', error);
            toast.error('Ocorreu um erro interno ao tentar enviar a mensagem.');
        } finally {
            setSendingMessageIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    }

    // Hook Script varies by Band
    const getScript = (student: Student) => {
        return (
            <div className="space-y-4 text-sm">
                <div className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">1</span>
                    <p><strong>Ação 1:</strong> Apresente-se cordialmente.</p>
                </div>
                <div className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">2</span>
                    <p><strong>Ação 2:</strong> Pergunte e confirme o nome do aluno <em>(Ex: "Olá, me confirma seu nome?")</em>.</p>
                </div>
                <div className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">3</span>
                    <p><strong>Ação 3:</strong> Localize o registro e use o nome dele durante toda a conversa: <strong>"{student.name.split(' ')[0]}, que bom te ver hoje!"</strong></p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-5xl mx-auto relative min-h-screen">
            <BackgroundDecoration />
            <div className="relative z-10">
                <header className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">Atendimento Especializado</h1>
                    {unit && (
                        <div className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-md inline-block">
                            Unidade: {unit.toUpperCase()}
                        </div>
                    )}
                </header>
            </div>

            <CheckIn
                externalQuery={searchQuery}
                setExternalQuery={setSearchQuery}
                onSearchTrigger={handleLocalSearch}
                localResult={searchResult}
                handleOpenModal={handleOpenModal}
            />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-in fade-in duration-500 mt-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-700">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    Fila de Atenção (Risco Crítico / Alerta)
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                <th className="pb-3 px-4">Aluno</th>
                                <th className="pb-3 px-4">Telefone</th>
                                <th className="pb-3 px-4">Status / Score</th>
                                <th className="pb-3 px-4">Estado do Contato</th>
                                <th className="pb-3 px-4">Barreira</th>
                                <th className="pb-3 px-4 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {filteredStudents.map((student) => (
                                <tr
                                    key={student.id}
                                    className={`group transition-all duration-300 ${student.band === 'Red'
                                        ? 'bg-red-50/50 hover:bg-red-100/80 border-l-4 border-red-500'
                                        : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <td className="py-4 px-4 font-medium text-gray-900 cursor-pointer" onClick={() => handleOpenModal(student)}>
                                        <div className="flex flex-col">
                                            <span>{student.name}</span>
                                            <span className="text-[10px] text-gray-400 font-mono">{student.evoId}</span>
                                            {student.barrier && student.barrier !== 'Sem relato' && student.barrier !== 'Aguardando diagnóstico via WhatsApp...' && (
                                                <span className="mt-1 text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md inline-block max-w-[160px] truncate" title={student.barrier}>
                                                    Motivo: {student.barrier}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-gray-500 font-mono text-xs">
                                        {student.phone || 'N/A'}
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex flex-col gap-1">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${student.band === 'Red'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {student.band === 'Red' ? '🔴' : '🟡'} {student.statusAdesao}
                                            </span>
                                            <span className="text-[10px] text-gray-400 px-1">Score: {student.score}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-gray-500 text-xs">
                                        <div className="flex flex-col">
                                            <span>{student.lastMessageDate ? new Date(student.lastMessageDate).toLocaleDateString() : 'N/A'}</span>
                                            {student.messageSentStatus === 'enviado' || student.messageSentStatus === 'Mensagem Enviada' || sentMessageIds.has(student.evoId || student.id) ? (
                                                <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5 uppercase">
                                                    <CheckCircle className="w-2.5 h-2.5" /> Mensagem Enviada
                                                    {student.lastButtonClick && !sentMessageIds.has(student.evoId || student.id) && (
                                                        <span className="text-gray-400 font-normal normal-case">({new Date(student.lastButtonClick).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                                                    )}
                                                </span>
                                            ) : null}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={cn(
                                            "px-1.5 py-0.5 rounded text-[9px] font-black uppercase inline-block",
                                            student.barrierType === 'BI' ? "bg-red-600 text-white" : 
                                            student.barrierType === 'BE' ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                                        )} title={student.barrier || 'Sem relato'}>
                                            {student.barrierType === 'BI' ? 'Interna' : student.barrierType === 'BE' ? 'Externa' : 'N/A'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleSendMessage(student)}
                                                disabled={student.messageSentStatus === 'Mensagem Enviada' || student.messageSentStatus === 'enviado' || sendingMessageIds.has(student.evoId || student.id) || sentMessageIds.has(student.evoId || student.id)}
                                                className={cn(
                                                    "p-2 rounded-lg transition-colors border flex items-center justify-center",
                                                    (sentMessageIds.has(student.evoId || student.id) || student.messageSentStatus === 'Mensagem Enviada' || student.messageSentStatus === 'enviado')
                                                        ? "text-gray-400 bg-gray-50 border-gray-100 cursor-not-allowed" 
                                                        : "text-emerald-600 hover:bg-emerald-50 border-emerald-100 disabled:opacity-50"
                                                )}
                                                title={(sentMessageIds.has(student.evoId || student.id) || student.messageSentStatus === 'Mensagem Enviada' || student.messageSentStatus === 'enviado') ? "Enviado" : "Enviar WhatsApp Automático"}
                                            >
                                                {sendingMessageIds.has(student.evoId || student.id) ? (
                                                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                                                ) : (sentMessageIds.has(student.evoId || student.id) || student.messageSentStatus === 'Mensagem Enviada' || student.messageSentStatus === 'enviado') ? (
                                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                ) : (
                                                    <MessageCircle className="w-4 h-4" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleOpenModal(student)}
                                                className={`text-xs font-bold px-3 py-1.5 rounded-md transition-all border flex items-center gap-1 ${student.band === 'Red'
                                                    ? 'bg-red-600 text-white border-red-700 hover:bg-red-700'
                                                    : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'
                                                    }`}
                                            >
                                                Acolher
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredStudents.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            {activeSearch ? (
                                <p className="font-medium text-red-400">Aluno não encontrado na lista de monitoramento atual.</p>
                            ) : (
                                <p>Nenhum aluno em risco identificado no momento.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {selectedStudent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col max-h-[82vh] relative overflow-hidden ring-1 ring-black/5 animate-in zoom-in-95 duration-300">
                        <div className="p-5 pb-3 shrink-0 border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-20">
                            <button
                                onClick={handleCloseModal}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-30"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h3 className="text-lg font-black text-slate-900 mb-0.5 tracking-tight">Acolhimento: {selectedStudent.name}</h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{selectedStudent.evoId} • {selectedStudent.unit || 'Matriz'}</p>
                        </div>

                        <div className="p-5 overflow-y-auto flex-1 space-y-6 custom-scrollbar bg-slate-50/30">
                            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                    <MessageCircle className="w-12 h-12" />
                                </div>
                                <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest mb-1.5 flex items-center gap-1.5">
                                    <Info className="w-3.5 h-3.5" /> Barreira Identificada (Digital)
                                </p>
                                {selectedStudent.barrierType && (selectedStudent.barrierType === 'BI' || selectedStudent.barrierType === 'BE') && (
                                    <div className="flex gap-2 mb-2">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded text-[9px] font-black uppercase",
                                            selectedStudent.barrierType === 'BI' ? "bg-red-600 text-white" : "bg-blue-600 text-white"
                                        )}>
                                            {selectedStudent.barrierType === 'BI' ? 'Interna' : 'Externa'}
                                        </span>
                                    </div>
                                )}
                                <p className="text-sm font-medium text-slate-700 italic leading-relaxed">
                                    "{selectedStudent.barrier || 'Aguardando diagnóstico via WhatsApp...'}"
                                </p>
                            </div>

                            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Roteiro de Abordagem Sugerido</p>
                                <div className="text-gray-800 leading-relaxed italic border-l-2 border-indigo-500 pl-4 py-1">
                                    {getScript(selectedStudent)}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                    <ClipboardCheck className="w-4 h-4 text-indigo-600" /> Ações Realizadas (Seleção Múltipla)
                                </p>

                                {showFinalInstruction ? (
                                    <div className="space-y-4 animate-in zoom-in">
                                        <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl flex items-center gap-4 text-emerald-800">
                                            <CheckCircle className="w-8 h-8 shrink-0" />
                                            <div>
                                                <p className="font-black text-lg">Acolhimento Concluído!</p>
                                                <p className="text-sm font-medium">Os dados foram sincronizados com o professor.</p>
                                            </div>
                                        </div>
                                        <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl shadow-indigo-200">
                                            <p className="text-xs font-black uppercase tracking-[0.2em] mb-2 opacity-80">Instrução Crítica</p>
                                            <p className="text-xl font-black leading-tight">Chame o professor de referência agora para continuidade do atendimento.</p>
                                        </div>
                                        <button
                                            onClick={handleCloseModal}
                                            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-all"
                                        >
                                            Fechar Painel
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2">
                                        {[
                                            { label: 'Validar Barreira Relatada', desc: 'Conversar sobre a dificuldade interna/externa apresentada no campo acima.' },
                                            { label: 'Área de Alongamento', desc: 'Encaminhar o aluno para iniciar com mobilidade.' },
                                            { label: 'Aquecimento Sugerido', desc: 'Orientar início na esteira, bicicleta ou elíptico.' },
                                            { label: 'Aguardar na Recepção', desc: 'Caso o fluxo de professores esteja alto.' }
                                        ].map(item => (
                                            <button
                                                key={item.label}
                                                onClick={() => toggleAction(item.label)}
                                                className={cn(
                                                    "w-full p-4 rounded-xl border text-left flex items-start justify-between transition-all",
                                                    selectedActions.includes(item.label)
                                                        ? "bg-indigo-50 border-indigo-300 shadow-sm"
                                                        : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                                                )}
                                            >
                                                <div className="flex-1">
                                                    <p className={cn("text-sm font-bold", selectedActions.includes(item.label) ? "text-indigo-900" : "text-gray-700")}>
                                                        {item.label}
                                                    </p>
                                                    <p className="text-[11px] opacity-70 mt-0.5 leading-tight">
                                                        {item.desc}
                                                    </p>
                                                </div>
                                                <div className={cn(
                                                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all mt-1",
                                                    selectedActions.includes(item.label) ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-100"
                                                )}>
                                                    {selectedActions.includes(item.label) && <CheckCircle className="w-4 h-4" />}
                                                </div>
                                            </button>
                                        ))}

                                        <button
                                            onClick={handleFinalize}
                                            disabled={isSubmitting || selectedActions.length === 0}
                                            className="mt-4 w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-[24px] font-black uppercase tracking-widest text-sm shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-3"
                                        >
                                            {isSubmitting ? 'Registrando...' : (
                                                <>
                                                    <CheckCircle className="w-5 h-5" />
                                                    Confirmar Acolhimento
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
