
'use client'

import { useState } from 'react'
import { BrainCircuit, Dumbbell, ClipboardList, CheckCircle, X, MessageSquare, Info } from 'lucide-react'
import { registerInteraction, registerHedonicEvaluation } from '@/app/actions/interaction'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'
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

import { checkNewAcolhimentos } from '@/app/reception/actions'
import { AlertCircle, Lightbulb } from 'lucide-react'

export default function ProfessorDashboard({ initialStudents, unit, professorName, feedbacks = [] }: { initialStudents: (Student & { awaitingProfessor?: boolean })[], unit?: string, professorName: string, feedbacks?: any[] }) {
    const router = useRouter()
    const [lastSeen, setLastSeen] = useState(new Date().toISOString())
    const [showFeedbacks, setShowFeedbacks] = useState(true)

    // Real-time Signal: Poll refresh every 30 seconds via light route
    useEffect(() => {
        const interval = setInterval(async () => {
            const res = await checkNewAcolhimentos(lastSeen)
            if (res.hasUpdates) {
                setLastSeen(res.latest)
                router.refresh()
            }
        }, 30000)
        return () => clearInterval(interval)
    }, [router, lastSeen])

    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
    const [notes, setNotes] = useState('')
    const [barrierType, setBarrierType] = useState<'BI' | 'BE'>('BI')
    const [trainingMod, setTrainingMod] = useState('')
    const [shiftFilter, setShiftFilter] = useState<'all' | 'manha' | 'tarde' | 'noite'>('all')

    // Filter students: awaitingProfessor first, then by band, then by shift
    const filteredStudents = initialStudents.filter(s => {
        if (shiftFilter === 'all') return true;
        return s.shift?.toLowerCase() === shiftFilter;
    }).sort((a, b) => {
        if (a.awaitingProfessor && !b.awaitingProfessor) return -1;
        if (!a.awaitingProfessor && b.awaitingProfessor) return 1;
        return 0;
    });

    // New States for Hedonic Evaluation
    const [weight, setWeight] = useState('')
    const [height, setHeight] = useState('')
    const [rhythmPref, setRhythmPref] = useState<'Sim' | 'Não' | ''>('')
    const [tolerance, setTolerance] = useState<'Sim' | 'Não' | ''>('')
    const [intensityAgreement, setIntensityAgreement] = useState(5)
    const [funFeedback, setFunFeedback] = useState<string>('')
    const [anticipatedFeel, setAnticipatedFeel] = useState('')
    const [likes, setLikes] = useState('')
    const [dislikes, setDislikes] = useState('')
    const [varietyVsRoutine, setVarietyVsRoutine] = useState<string>('')
    const [trainingTime, setTrainingTime] = useState('')
    const [objective, setObjective] = useState<string>('')

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)

    const imc = (weight && height)
        ? (Number(weight) / Math.pow(Number(height) / 100, 2)).toFixed(1)
        : '0.0'

    const handleOpenModal = (student: Student) => {
        setSelectedStudent(student)
        setNotes('')
        setBarrierType('BI')
        setTrainingMod('')
        setWeight('')
        setHeight('')
        setRhythmPref('')
        setTolerance('')
        setIntensityAgreement(5)
        setFunFeedback('')
        setAnticipatedFeel('')
        setLikes('')
        setDislikes('')
        setVarietyVsRoutine('')
        setTrainingTime('')
        setObjective('')
        setSuccess(false)
    }

    const handleClose = () => {
        setSelectedStudent(null)
    }

    const handleSubmit = async () => {
        if (!selectedStudent) return

        setIsSubmitting(true)
        const res = await registerHedonicEvaluation({
            studentId: (selectedStudent as any).evoId || selectedStudent.id,
            weight,
            height,
            imc,
            rhythmPref,
            tolerance,
            intensityAgreement,
            funFeedback,
            anticipatedFeel,
            likes,
            dislikes,
            varietyVsRoutine,
            trainingTime,
            objective,
            trainingMod,
            notes: notes || 'Ajuste hedônico aplicado.',
            barrierType: barrierType,
            professorName: professorName
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

            {/* Coordinator Feedback Alert */}
            {feedbacks.length > 0 && showFeedbacks && (
                <div className="mb-8 relative z-20 animate-in slide-in-from-top-4 duration-500">
                    <div className="bg-gradient-to-r from-indigo-600 to-violet-700 p-1 rounded-[24px] shadow-2xl shadow-indigo-500/20">
                        <div className="bg-white/5 backdrop-blur-xl rounded-[22px] p-6 text-white flex gap-6 items-start relative overflow-hidden group">

                            <div className="bg-white/20 p-4 rounded-2xl shrink-0 group-hover:scale-110 transition-transform">
                                <Lightbulb className="w-8 h-8 text-yellow-300 fill-yellow-300/20" />
                            </div>

                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Dica de Melhoria / Feedback Educativo</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                </div>
                                {feedbacks.map((f, i) => (
                                    <div key={i} className="space-y-1">
                                        <p className="text-xl font-black italic">"{f.Mensagem}"</p>
                                        <p className="text-[10px] font-bold text-indigo-200 uppercase">— {f.Coordenador} ({f.Data})</p>
                                    </div>
                                ))}
                                <div className="pt-2">
                                    <button
                                        onClick={() => setShowFeedbacks(false)}
                                        className="text-[10px] font-black uppercase text-white/50 hover:text-white underline transition-colors"
                                    >
                                        Entendi, obrigado!
                                    </button>
                                </div>
                            </div>

                            <button onClick={() => setShowFeedbacks(false)} className="text-white/30 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="relative z-10">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Painel do Professor</h1>
                    <p className="text-gray-500">Foco: Ajuste Hedônico e Aumento de Competência Percebida</p>
                </header>

                <div className="flex flex-wrap gap-4 mb-8 items-center">
                    <select
                        value={shiftFilter}
                        onChange={(e) => setShiftFilter(e.target.value as any)}
                        className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all border bg-white text-gray-600 border-gray-200 hover:border-gray-300 outline-none shadow-sm cursor-pointer"
                    >
                        <option value="all">Turno (Todos)</option>
                        <option value="manha">Turno Manhã</option>
                        <option value="tarde">Turno Tarde</option>
                        <option value="noite">Turno Noite</option>
                    </select>

                    <button
                        onClick={() => setShiftFilter('all')}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white border border-indigo-700 shadow-sm hover:bg-indigo-700 transition-all flex items-center gap-2"
                    >
                        <Dumbbell className="w-4 h-4" /> Alunos do Dia
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredStudents.map(student => {
                        const orientation = BARRIER_ORIENTATIONS[student.barrier || "Desconhecida"] || BARRIER_ORIENTATIONS["Desconhecida"];

                        return (
                            <div key={student.id} className={`bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition-all group relative ${student.band === 'Red' ? 'border-red-200 bg-red-50/10 shadow-red-50' : 'border-gray-100'
                                }`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{student.name}</h3>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${student.band === 'Red' ? 'bg-red-600 text-white' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {student.band === 'Red' ? '🔴' : '🟡'} Faixa {student.band === 'Red' ? 'Vermelha' : 'Amarela'} ({student.score} pts)
                                            </span>
                                            {student.shift && (
                                                <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                    {student.shift}
                                                </span>
                                            )}
                                            {student.awaitingProfessor && (
                                                <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg shadow-indigo-100 ring-2 ring-white animate-pulse">
                                                    <BrainCircuit className="w-3 h-3" />
                                                    Pendente
                                                </span>
                                            )}
                                        </div>
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

                                    <div className="space-y-3 p-3 bg-gray-50 rounded-xl border border-gray-100 relative overflow-hidden">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1.5">
                                                <Info className="w-3 h-3 text-indigo-500" /> Diagnóstico & Barreira
                                            </span>
                                            {student.barrierType !== 'N/A' && (
                                                <span className={cn(
                                                    "px-1.5 py-0.5 rounded-[4px] text-[8px] font-black uppercase",
                                                    student.barrierType === 'BI' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                                                )}>
                                                    {student.barrierType === 'BI' ? 'Interna' : 'Externa'}
                                                </span>
                                            )}
                                        </div>

                                        <div className="text-sm font-medium text-slate-700 leading-relaxed italic pr-2">
                                            "{student.barrier || 'Sem barreira registrada'}"
                                        </div>

                                        {student.awaitingProfessor && (
                                            <div className="pt-2 border-t border-gray-200 mt-2 flex items-center gap-2 text-[10px] font-bold text-indigo-600">
                                                <MessageSquare className="w-3 h-3" />
                                                Histórico: Acolhido na Recepção
                                            </div>
                                        )}
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

                    {filteredStudents.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-400">
                            <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="text-lg">Nenhum aluno na lista de risco para este turno hoje. Bom trabalho!</p>
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

                        <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-8">
                            {/* Seção 1: Dados Biométricos */}
                            <div className="border-b pb-6">
                                <h4 className="text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4" /> 1. Dados Biométricos e Calculadora
                                </h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Peso (kg)</label>
                                        <input
                                            type="number"
                                            value={weight}
                                            onChange={e => setWeight(e.target.value)}
                                            placeholder="Ex: 75.5"
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Estatura (cm)</label>
                                        <input
                                            type="number"
                                            value={height}
                                            onChange={e => setHeight(e.target.value)}
                                            placeholder="Ex: 175"
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
                                        />
                                    </div>
                                    <div className="bg-indigo-50/50 p-3 rounded-xl flex flex-col items-center justify-center">
                                        <span className="text-[10px] font-black uppercase text-indigo-400">IMC CALCULADO</span>
                                        <span className="text-lg font-black text-indigo-600">{imc}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Seção 2: Protocolo PRETIE-Q */}
                            <div className="border-b pb-6">
                                <h4 className="text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2">
                                    <BrainCircuit className="w-4 h-4" /> 2. Bloco de Preferência e Tolerância
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-700 block mb-2">Durante o exercício, prefiro atividade em ritmo mais lento e que não exijam muito esforço?</label>
                                        <div className="flex gap-2">
                                            {['Sim', 'Não'].map(v => (
                                                <button
                                                    key={v}
                                                    onClick={() => setRhythmPref(v as any)}
                                                    className={cn(
                                                        "flex-1 py-2 rounded-lg text-xs font-bold transition-all border",
                                                        rhythmPref === v ? "bg-indigo-600 text-white border-indigo-700 shadow-sm" : "bg-white text-gray-500 hover:bg-gray-50"
                                                    )}
                                                >
                                                    {v}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-700 block mb-2">Se meus músculos começarem a queimar ou a respiração ficar difícil, é hora de reduzir o ritmo?</label>
                                        <div className="flex gap-2">
                                            {['Sim', 'Não'].map(v => (
                                                <button
                                                    key={v}
                                                    onClick={() => setTolerance(v as any)}
                                                    className={cn(
                                                        "flex-1 py-2 rounded-lg text-xs font-bold transition-all border",
                                                        tolerance === v ? "bg-indigo-600 text-white border-indigo-700 shadow-sm" : "bg-white text-gray-500 hover:bg-gray-50"
                                                    )}
                                                >
                                                    {v}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-700 block mb-2">Intensidade está de acordo com sua preferência e tolerância? (Escala 0-10)</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="10"
                                            step="1"
                                            value={intensityAgreement}
                                            onChange={e => setIntensityAgreement(parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                        <div className="flex justify-between text-[10px] font-black text-gray-400 mt-1">
                                            <span>MUITO DISCORDANTE</span>
                                            <span className="text-indigo-600 text-xs">{intensityAgreement}</span>
                                            <span>MUITO ACORDADO</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Seção 3: Feedback de Diversão e Afeto */}
                            <div className="border-b pb-6">
                                <h4 className="text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2">
                                    <Info className="w-4 h-4" /> 3. Feedback de Diversão e Afeto (PACES/EVA)
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-700 block mb-2">Em relação à sua última sessão de exercício, você:</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['Gostei muito', 'Gostei', 'Neutro', 'Detestei'].map(v => (
                                                <button
                                                    key={v}
                                                    onClick={() => setFunFeedback(v)}
                                                    className={cn(
                                                        "py-2 rounded-lg text-[10px] font-bold transition-all border",
                                                        funFeedback === v ? "bg-green-600 text-white border-green-700 shadow-sm" : "bg-white text-gray-500 hover:bg-gray-50"
                                                    )}
                                                >
                                                    {v}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-700 block mb-2">Considerando o treino hoje, como vai se sentir?</label>
                                        <input
                                            type="text"
                                            value={anticipatedFeel}
                                            onChange={e => setAnticipatedFeel(e.target.value)}
                                            placeholder="Emoji ou palavra curta..."
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Seção 4: Questionário de Personalização */}
                            <div className="border-b pb-6">
                                <h4 className="text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" /> 4. Personalização do Programa
                                </h4>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">O que mais gosta?</label>
                                            <input
                                                type="text"
                                                value={likes}
                                                onChange={e => setLikes(e.target.value)}
                                                placeholder="Máquinas/Exercícios"
                                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-[10px]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">O que detesta/evita?</label>
                                            <input
                                                type="text"
                                                value={dislikes}
                                                onChange={e => setDislikes(e.target.value)}
                                                placeholder="..."
                                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-[10px]"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-700 block mb-2">Variedade vs Rotina</label>
                                        <div className="flex gap-2">
                                            {['Variedade', 'Rotina'].map(v => (
                                                <button
                                                    key={v}
                                                    onClick={() => setVarietyVsRoutine(v)}
                                                    className={cn(
                                                        "flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all border",
                                                        varietyVsRoutine === v ? "bg-indigo-600 text-white border-indigo-700" : "bg-white text-gray-500 hover:bg-gray-50"
                                                    )}
                                                >
                                                    {v === 'Variedade' ? 'MAIS VARIEDADE' : 'DOMINAR ROTINA'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-700 block mb-2">Tempo real disponível (minutos)?</label>
                                        <input
                                            type="text"
                                            value={trainingTime}
                                            onChange={e => setTrainingTime(e.target.value)}
                                            placeholder="Ex: 45 min"
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-700 block mb-2">O que faria este treino valer a pena?</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['Peso na balança', 'Mais carga', 'Relaxar a mente', 'Autocuidado'].map(v => (
                                                <button
                                                    key={v}
                                                    onClick={() => setObjective(v)}
                                                    className={cn(
                                                        "py-1.5 rounded-lg text-[9px] font-bold transition-all border",
                                                        objective === v ? "bg-indigo-600 text-white border-indigo-700" : "bg-white text-gray-500 hover:bg-gray-50"
                                                    )}
                                                >
                                                    {v.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Seção Final: Registro Técnico */}
                            <div className="pb-4">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Dumbbell className="w-4 h-4" /> 5. Modificação Técnica do Professor
                                </h4>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Classificação de Risco</label>
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
                                        <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">Modificação Técnica</label>
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
                                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">
                                        Observações do Ajuste
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Descreva o motivo do ajustehedônico..."
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-20 resize-none text-sm"
                                    />
                                </div>
                            </div>
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
