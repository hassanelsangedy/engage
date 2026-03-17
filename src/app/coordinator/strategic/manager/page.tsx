
'use client'

import { useEffect, useState } from 'react'
import {
    Settings2,
    ToggleLeft,
    ToggleRight,
    Zap,
    MessageSquare,
    Clock,
    Calendar,
    Target,
    Activity,
    Plus,
    Loader2,
    Send,
    CheckSquare,
    Square,
    ChevronLeft,
    Save,
    Edit3
} from 'lucide-react'
import Link from 'next/link'
import { getCampaigns, getStratification, sendManualBlast, getLogs, updateCampaign } from '../actions';
import { toast } from 'sonner'

export default function ManagerOperationsPage() {
    const [campaigns, setCampaigns] = useState<any[]>([])
    const [stratification, setStratification] = useState<any>(null)
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isSaving, setIsSaving] = useState<string | null>(null)

    // Manual Blast State
    const [selectedBand, setSelectedBand] = useState('red')
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [blastTemplate, setBlastTemplate] = useState('Olá {{nome}}! Notamos que não treinou hoje. Houve algum imprevisto?')
    const [isSending, setIsSending] = useState(false)

    // Editing State
    const [editingCampaign, setEditingCampaign] = useState<string | null>(null)
    const [editValue, setEditValue] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        try {
            const [cData, sData, lData] = await Promise.all([
                getCampaigns(),
                getStratification(),
                getLogs()
            ])
            setCampaigns(cData)
            setStratification(sData)
            setLogs(lData)
        } catch (error) {
            console.error('Data Load Error:', error)
            toast.error('Erro ao carregar dados operacionais')
        }
        setLoading(false)
    }

    const currentList = stratification ? stratification[selectedBand] : []

    async function handleToggleCampaign(id: string, currentStatus: string) {
        setIsSaving(id)
        const newStatus = currentStatus === 'Sim' ? 'Não' : 'Sim'
        const res = await updateCampaign(id, { Ativo: newStatus })
        if (res.success) {
            setCampaigns(prev => prev.map(c => c.ID_Campanha === id ? { ...c, Ativo: newStatus } : c))
            toast.success(`Campanha ${newStatus === 'Sim' ? 'ativada' : 'pausada'}`)
        }
        setIsSaving(null)
    }

    async function handleSaveTemplate(id: string) {
        setIsSaving(id)
        const res = await updateCampaign(id, { Mensagem_Template: editValue })
        if (res.success) {
            setCampaigns(prev => prev.map(c => c.ID_Campanha === id ? { ...c, Mensagem_Template: editValue } : c))
            setEditingCampaign(null)
            toast.success('Template atualizado com sucesso')
        }
        setIsSaving(null)
    }

    async function handleSendBlast() {
        if (selectedIds.length === 0) return toast.error('Selecione alunos primeiro')
        setIsSending(true)
        const res = await sendManualBlast(selectedIds, blastTemplate)
        if (res.success) {
            toast.success(`${res.sent} mensagens encaminhadas para fila de disparo!`)
            setSelectedIds([])
        }
        setIsSending(false)
    }

    return (
        <main className="min-h-screen bg-[#0f172a] text-slate-100 p-8 lg:p-12 font-sans">
            <div className="max-w-7xl mx-auto space-y-12">
                <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <Link
                            href="/coordinator/strategic"
                            className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" /> Voltar para o Dashboard de Risco
                        </Link>
                        <div className="flex items-center gap-2 text-emerald-400">
                            <Settings2 className="w-6 h-6" />
                            <span className="text-xs font-black uppercase tracking-widest">Controle Operacional</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight">Gestor de Operações: Campanhas e Gatilhos</h1>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Left: Campaigns & Triggers */}
                    <div className="space-y-8">
                        <div className="bg-slate-900/40 border border-white/5 rounded-[40px] p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black flex items-center gap-3">
                                    <Zap className="text-emerald-400 w-6 h-6" /> Gatilhos e Scripts
                                </h2>
                                <span className="text-[10px] font-black text-slate-500 uppercase">
                                    {campaigns.filter(c => c.Ativo === 'Sim').length} Ativos
                                </span>
                            </div>

                            <div className="space-y-4">
                                {loading ? (
                                    <div className="py-10 text-center text-slate-500"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Carregando estratégia...</div>
                                ) : campaigns.length === 0 ? (
                                    <div className="py-10 text-center text-slate-600 italic border border-dashed border-white/10 rounded-3xl">Nenhuma campanha configurada na planilha.</div>
                                ) : campaigns.map((camp, i) => (
                                    <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4 transition-all hover:bg-white/[0.07]">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-black text-base tracking-tight text-white mb-1">{camp.Gatilho}</div>
                                                <div className="flex items-center gap-3 text-[9px] font-black uppercase text-slate-500">
                                                    <span><Clock className="w-3 h-3 inline mr-1" /> {camp.Hora_Envio}</span>
                                                    <span><Calendar className="w-3 h-3 inline mr-1" /> {camp.Dias_Semana}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleToggleCampaign(camp.ID_Campanha, camp.Ativo)}
                                                disabled={isSaving === camp.ID_Campanha}
                                                className="transition-transform active:scale-95 disabled:opacity-50"
                                            >
                                                {camp.Ativo === 'Sim' ? (
                                                    <ToggleRight className="w-12 h-12 text-emerald-500" />
                                                ) : (
                                                    <ToggleLeft className="w-12 h-12 text-slate-700" />
                                                )}
                                            </button>
                                        </div>

                                        {editingCampaign === camp.ID_Campanha ? (
                                            <div className="space-y-3">
                                                <textarea
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className="w-full h-24 bg-slate-800/50 border border-emerald-500/30 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-slate-200"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleSaveTemplate(camp.ID_Campanha)}
                                                        className="flex-1 py-2 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2"
                                                    >
                                                        <Save className="w-3 h-3" /> Salvar Script
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingCampaign(null)}
                                                        className="px-4 py-2 bg-slate-800 text-slate-400 rounded-xl font-black text-[10px] uppercase underline"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="group/script relative p-4 bg-black/20 rounded-2xl border border-white/5">
                                                <div className="text-xs text-slate-400 italic leading-relaxed">"{camp.Mensagem_Template}"</div>
                                                <button
                                                    onClick={() => { setEditingCampaign(camp.ID_Campanha); setEditValue(camp.Mensagem_Template); }}
                                                    className="absolute top-2 right-2 opacity-0 group-hover/script:opacity-100 p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500 transition-all hover:text-white"
                                                >
                                                    <Edit3 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-[9px] font-black uppercase text-indigo-400">
                                                <Target className="w-3 h-3" /> Pilar TAD: {camp.Pilar_TAD}
                                            </div>
                                            <span className="text-[8px] font-black text-slate-600">ID: {camp.ID_Campanha}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Logs section remain same but with better styling */}
                        <div className="bg-slate-900/40 border border-white/5 rounded-[40px] p-8 space-y-6">
                            <h2 className="text-xl font-black flex items-center gap-3">
                                <MessageSquare className="text-indigo-400 w-6 h-6" /> Log de Disparos
                            </h2>
                            <div className="space-y-3 max-h-80 overflow-y-auto no-scrollbar">
                                {loading ? (
                                    <div className="py-10 text-center text-slate-500 italic">Sincronizando registros...</div>
                                ) : logs.length === 0 ? (
                                    <div className="py-10 text-center text-slate-600 italic">Sem registros recentes.</div>
                                ) : logs.map((log, i) => (
                                    <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-indigo-400">Aluno: {log.ID_Aluno}</span>
                                            <span className="text-[9px] font-bold text-slate-500">
                                                {new Date(log.Data_Hora).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-slate-300 font-medium italic">"{log.Mensagem}"</div>
                                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${log.Tipo === 'Envio' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-green-500/20 text-green-400'}`}>
                                                {log.Tipo}
                                            </span>
                                            <span className="text-[8px] font-bold text-slate-600 italic">{log.Status_Entrega}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Manual Blast Center (unchanged) */}
                    <div className="space-y-8">
                        <div className="bg-slate-900/40 border border-white/5 rounded-[40px] p-8 space-y-8 sticky top-8">
                            <div className="space-y-2">
                                <h2 className="text-xl font-black flex items-center gap-3">
                                    <Send className="text-purple-400 w-6 h-6" /> Disparo Manual (Blast Base)
                                </h2>
                                <p className="text-xs text-slate-400">Ideal para comunicados críticos ou campanhas sazonais.</p>
                            </div>

                            <div className="flex gap-2">
                                {['red', 'yellow', 'blue'].map((band) => (
                                    <button
                                        key={band}
                                        onClick={() => { setSelectedBand(band); setSelectedIds([]); }}
                                        className={`flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 border ${selectedBand === band
                                            ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                                            : 'bg-slate-800 border-white/5 text-slate-500 hover:bg-slate-700'
                                            }`}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full ${band === 'red' ? 'bg-red-500' : band === 'yellow' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                                        {band === 'red' ? 'Vermelha' : band === 'yellow' ? 'Amarela' : 'Azul'}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-white/5 rounded-3xl border border-white/5 overflow-hidden">
                                <div className="p-4 bg-white/5 flex items-center justify-between border-b border-white/5">
                                    <button
                                        onClick={() => {
                                            if (selectedIds.length === currentList.length) setSelectedIds([])
                                            else setSelectedIds(currentList.map((s: any) => s.id))
                                        }}
                                        className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-white transition-colors"
                                    >
                                        {selectedIds.length === currentList.length && currentList.length > 0 ? <CheckSquare className="w-4 h-4 text-purple-400" /> : <Square className="w-4 h-4" />}
                                        Selecionar Todos
                                    </button>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{currentList.length} Alunos</span>
                                </div>
                                <div className="max-h-64 overflow-y-auto no-scrollbar divide-y divide-white/5">
                                    {loading ? (
                                        <div className="p-10 text-center text-slate-500 animate-pulse">Carregando base...</div>
                                    ) : currentList.length === 0 ? (
                                        <div className="p-10 text-center text-slate-600 text-[10px] font-black uppercase">Nenhum aluno identificado</div>
                                    ) : currentList.map((s: any) => (
                                        <div
                                            key={s.id}
                                            onClick={() => {
                                                setSelectedIds(prev => prev.includes(s.id) ? prev.filter(tid => tid !== s.id) : [...prev, s.id])
                                            }}
                                            className="p-4 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                {selectedIds.includes(s.id) ? <CheckSquare className="w-4 h-4 text-purple-400" /> : <Square className="w-4 h-4 text-slate-700 group-hover:text-slate-500" />}
                                                <div>
                                                    <div className="text-sm font-bold tracking-tight text-white">{s.name}</div>
                                                    <div className="text-[9px] text-slate-500">{s.phone}</div>
                                                </div>
                                            </div>
                                            <div className="text-[9px] font-black bg-slate-800 px-2 py-0.5 rounded text-slate-500">Score {s.score}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Script Customizado</label>
                                    <span className="text-[8px] font-bold text-purple-400">Personalize com {"{{nome}}"}</span>
                                </div>
                                <textarea
                                    value={blastTemplate}
                                    onChange={(e) => setBlastTemplate(e.target.value)}
                                    className="w-full h-32 bg-slate-800/50 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none leading-relaxed text-slate-200"
                                    placeholder="Olá {{nome}}..."
                                />
                                <button
                                    onClick={handleSendBlast}
                                    disabled={isSending || selectedIds.length === 0}
                                    className="w-full py-5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-[24px] font-black shadow-xl shadow-purple-500/20 transition-all flex items-center justify-center gap-3 active:scale-95"
                                >
                                    {isSending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6 text-white/50" />}
                                    Disparar WhatsApp Agora
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="text-center pt-8 border-t border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-700 italic">Hospitalidade Integrada Evoque • 2024</p>
                </footer>
            </div>
        </main>
    )
}
