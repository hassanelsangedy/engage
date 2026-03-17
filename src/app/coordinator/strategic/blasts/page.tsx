
'use client'

import { useEffect, useState } from 'react'
import {
    Zap,
    MessageSquare,
    Clock,
    Calendar as CalendarIcon,
    Target,
    Activity,
    Plus,
    Loader2,
    Send,
    CheckSquare,
    Square,
    ChevronLeft,
    Save,
    Edit3,
    Megaphone,
    Search,
    Filter,
    ArrowRight,
    Sparkles,
    Trash2,
    Power
} from 'lucide-react'
import Link from 'next/link'
import { getCampaigns, getStratification, sendManualBlast, getLogs, saveCampaign, updateCampaign, deleteCampaign } from '../actions'
import { toast } from 'sonner'
import SmartScheduling from '@/components/ui/smart-scheduling'
import { cn } from '@/lib/utils'
import BackgroundDecoration from '@/components/ui/background-decoration'

export default function BlastsPage() {
    const [campaigns, setCampaigns] = useState<any[]>([])
    const [stratification, setStratification] = useState<any>(null)
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    // Form State
    const [newCampaign, setNewCampaign] = useState({
        title: '',
        audience: 'Red',
        content: 'Olá {{nome}}! Notamos que não treinou hoje. Houve algum imprevisto?',
    })

    // Manual Blast State
    const [selectedBand, setSelectedBand] = useState('red')
    const [selectedIds, setSelectedIds] = useState<string[]>([])

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
            setCampaigns(cData.filter((c: any) => c.Ativo !== 'Excluido'))
            setStratification(sData)
            setLogs(lData)
        } catch (error) {
            console.error('Data Load Error:', error)
            toast.error('Erro ao carregar dados operacionais')
        }
        setLoading(false)
    }

    const currentList = stratification ? (stratification[selectedBand] || []) : []

    const handleSaveCampaign = async (rrule: string, friendlyDays: string) => {
        if (!newCampaign.title) return toast.error('Título é obrigatório')

        setIsSaving(true)
        const hourMatch = rrule.match(/BYHOUR=(\d+)/);
        const minuteMatch = rrule.match(/BYMINUTE=(\d+)/);
        const hora = hourMatch && minuteMatch ? `${hourMatch[1].padStart(2, '0')}:${minuteMatch[1].padStart(2, '0')}` : '09:00';

        const res = await saveCampaign({
            id: editingId || undefined,
            ...newCampaign,
            hora: hora,
            diasSemana: friendlyDays,
        })

        if (res.success) {
            toast.success('Campanha salva com sucesso!')
            setNewCampaign({ ...newCampaign, title: '' })
            setEditingId(null)
            loadData()
        } else {
            toast.error('Erro ao salvar campanha')
        }
        setIsSaving(false)
    }

    async function handleToggleCampaign(id: string, currentStatus: string) {
        const newStatus = currentStatus === 'Sim' ? 'Não' : 'Sim'
        const res = await updateCampaign(id, { Ativo: newStatus })
        if (res.success) {
            toast.success(`Campanha ${newStatus === 'Sim' ? 'ativada' : 'pausada'}`)
            loadData()
        }
    }

    async function handleDeleteCampaign(id: string) {
        if (confirm('Tem certeza que deseja excluir esta campanha?')) {
            const res = await deleteCampaign(id)
            if (res.success) {
                toast.success('Campanha excluída')
                loadData()
            }
        }
    }

    async function handleSendManual() {
        if (selectedIds.length === 0) return toast.error('Selecione alunos primeiro')
        setIsSending(true)
        const res = await sendManualBlast(selectedIds, newCampaign.content)
        if (res.success) {
            toast.success(`${res.sent} mensagens encaminhadas!`)
            setSelectedIds([])
            loadData()
        }
        setIsSending(false)
    }

    return (
        <main className="min-h-screen bg-background text-foreground p-8 lg:p-16 relative overflow-hidden font-sans">
            <BackgroundDecoration />

            <div className="max-w-7xl mx-auto space-y-12 relative z-10">
                <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-border pb-10">
                    <div className="space-y-6">
                        <Link
                            href="/coordinator/strategic"
                            className="group flex items-center gap-3 text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-all tracking-[0.3em]"
                        >
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span>Intelligence Dashboard</span>
                        </Link>
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-indigo-600 rounded-[28px] shadow-2xl shadow-indigo-500/10">
                                <Zap className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-5xl font-black tracking-tighter text-foreground">Central de Disparos</h1>
                                <p className="text-slate-500 dark:text-slate-400 font-medium font-bold">Automação de Retenção e Recorrência</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-card p-2 rounded-[32px] border border-border shadow-sm">
                        <div className="px-6 py-3">
                            <p className="text-[10px] font-black uppercase text-indigo-500 tracking-widest mb-0.5">Segmentação</p>
                            <p className="text-xl font-black text-foreground">Multicanal</p>
                        </div>
                        <div className="w-px h-10 bg-border"></div>
                        <div className="px-6 py-3">
                            <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-0.5">Status</p>
                            <p className="text-xl font-black text-foreground">Live</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">

                    {/* COLUNA ESQUERDA: CONFIGURAÇÃO DE CAMPANHAS */}
                    <div className="space-y-10">

                        {/* MÓDULO DE CRIAÇÃO */}
                        <section className="bg-card border border-border rounded-[40px] p-10 space-y-10 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                            <div className="relative z-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
                                        <Sparkles className="text-indigo-600 w-6 h-6" /> Nova Campanha Smart
                                    </h2>
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-indigo-100">
                                        Auto-Sync
                                    </span>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1 flex items-center gap-2">
                                                <Megaphone className="w-3 h-3" /> Título do Disparo
                                            </label>
                                            <input
                                                type="text"
                                                value={newCampaign.title}
                                                onChange={e => setNewCampaign({ ...newCampaign, title: e.target.value })}
                                                placeholder="Ex: Alinhamento de Expectativas"
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-border rounded-2xl p-4 text-foreground font-bold placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 transition-all font-sans"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1 flex items-center gap-2">
                                                <Filter className="w-3 h-3" /> Público-Alvo
                                            </label>
                                            <select
                                                value={newCampaign.audience}
                                                onChange={e => setNewCampaign({ ...newCampaign, audience: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-border rounded-2xl p-4 text-foreground font-bold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="Red" className="bg-white dark:bg-slate-900">🚨 Faixa Vermelha</option>
                                                <option value="Red_High" className="bg-white dark:bg-slate-900">💎 Vermelha (Engajados)</option>
                                                <option value="Yellow" className="bg-white dark:bg-slate-900">⚠️ Faixa Amarela</option>
                                                <option value="Blue" className="bg-white dark:bg-slate-900">🔵 Faixa Azul</option>
                                                <option value="Green" className="bg-white dark:bg-slate-900">🟢 Faixa Verde</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Template do Script</label>
                                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter" title="Use {{nome}} para personalizar">Personalização Variável</span>
                                        </div>
                                        <div className="relative">
                                            <textarea
                                                value={newCampaign.content}
                                                onChange={e => setNewCampaign({ ...newCampaign, content: e.target.value })}
                                                className="w-full h-32 bg-slate-50 dark:bg-slate-800/50 border border-border rounded-[32px] p-6 text-sm text-foreground font-medium leading-relaxed outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 transition-all resize-none"
                                            />
                                            <div className="absolute bottom-5 right-6 text-[10px] font-black text-gray-300 uppercase">
                                                WhatsApp Format
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <SmartScheduling onSave={handleSaveCampaign} isSaving={isSaving} />
                                </div>
                            </div>
                        </section>

                        {/* PAINEL DE CONTROLE: CAMPANHAS ATIVAS */}
                        <section className="bg-card border border-border rounded-[40px] p-10 space-y-10 shadow-sm relative overflow-hidden">
                            <div className="relative z-10 flex items-center justify-between">
                                <h2 className="text-2xl font-black text-foreground flex items-center gap-4">
                                    <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                                        <Activity className="text-emerald-600 w-6 h-6" />
                                    </div>
                                    Pipelines Ativos
                                </h2>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{campaigns.length} Configurações</span>
                            </div>

                            <div className="space-y-4">
                                {loading ? (
                                    <div className="py-12 text-center text-gray-400 italic">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-indigo-600" />
                                        Sincronizando com a Central...
                                    </div>
                                ) : campaigns.length === 0 ? (
                                    <div className="py-12 text-center text-gray-400 italic border border-dashed border-gray-200 rounded-[32px]">
                                        Nenhuma automação ativa no momento.
                                    </div>
                                ) : campaigns.map((camp, i) => (
                                    <div key={camp.ID_Campanha || i} className="group p-6 bg-gray-50 rounded-[32px] border border-gray-100 hover:bg-white hover:shadow-md transition-all duration-300">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                                    camp.Ativo === 'Sim' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-gray-200 text-gray-500"
                                                )}>
                                                    <Megaphone className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-gray-900 text-lg tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{camp.Gatilho}</h4>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">Público: {camp.Publico_Alvo}</span>
                                                        <span className="text-[9px] font-bold text-gray-400 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {camp.Hora_Envio}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setEditingId(camp.ID_Campanha)
                                                        setNewCampaign({
                                                            title: camp.Gatilho,
                                                            audience: camp.Publico_Alvo,
                                                            content: camp.Mensagem_Template
                                                        })
                                                        window.scrollTo({ top: 0, behavior: 'smooth' })
                                                    }}
                                                    className="p-2.5 bg-white text-gray-400 hover:text-gray-900 hover:shadow-sm rounded-xl border border-gray-200 transition-all"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCampaign(camp.ID_Campanha)}
                                                    className="p-2.5 bg-white text-gray-400 hover:text-red-600 hover:shadow-sm rounded-xl border border-gray-200 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white/50 rounded-2xl border border-gray-100 mb-4">
                                            <p className="text-[11px] text-gray-600 italic leading-relaxed line-clamp-2">"{camp.Mensagem_Template}"</p>
                                        </div>
                                        <div className="flex items-center justify-between pt-2">
                                            <div className="flex gap-2">
                                                {camp.Dias_Semana?.replace(/[\[\]']/g, '').split(',').map((d: string, i: number) => (
                                                    <span key={i} className="text-[8px] font-black uppercase text-gray-300">{d.trim()}</span>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => handleToggleCampaign(camp.ID_Campanha, camp.Ativo)}
                                                className={cn(
                                                    "px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-2 transition-all shadow-sm",
                                                    camp.Ativo === 'Sim'
                                                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-600 hover:text-white"
                                                        : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-indigo-600 hover:text-white"
                                                )}
                                            >
                                                {camp.Ativo === 'Sim' ? <Power className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                                                {camp.Ativo === 'Sim' ? 'Pausar' : 'Ativar'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-10">
                        <section className="bg-card border border-border rounded-[40px] p-10 space-y-10 sticky top-12 shadow-sm relative overflow-hidden">
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-50/10 rounded-full blur-3xl -ml-24 -mb-24"></div>
                            <div className="relative z-10 flex items-center justify-between">
                                <h2 className="text-2xl font-black text-foreground flex items-center gap-4">
                                    <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-2xl border border-purple-100 dark:border-purple-500/20">
                                        <Target className="text-purple-600 w-6 h-6" />
                                    </div>
                                    Disparo Manual (Blast)
                                </h2>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Ação Operacional</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { id: 'red', label: 'Vermelha', color: 'bg-red-600', count: stratification?.red?.length || 0 },
                                    { id: 'redHighEngagement', label: 'Engajados (V)', color: 'bg-indigo-600', count: stratification?.redHighEngagement?.length || 0 },
                                    { id: 'yellow', label: 'Amarela', color: 'bg-yellow-500', count: stratification?.yellow?.length || 0 },
                                    { id: 'blue', label: 'Azul', color: 'bg-blue-600', count: stratification?.blue?.length || 0 }
                                ].map((band) => (
                                    <button
                                        key={band.id}
                                        onClick={() => { setSelectedBand(band.id); setSelectedIds([]); }}
                                        className={cn(
                                            "p-6 rounded-[32px] flex flex-col items-center gap-4 border transition-all duration-300 relative overflow-hidden",
                                            selectedBand === band.id
                                                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                                                : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-white hover:border-gray-200"
                                        )}
                                    >
                                        <div className={cn("w-2 h-2 rounded-full", selectedBand === band.id ? "bg-white" : band.color)} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{band.label}</span>
                                        <span className="text-2xl font-black">{band.count}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="bg-gray-50 rounded-[32px] border border-gray-200 overflow-hidden flex flex-col max-h-[400px]">
                                <div className="p-5 bg-white flex items-center justify-between border-b border-gray-200">
                                    <button
                                        onClick={() => {
                                            if (selectedIds.length === currentList.length) setSelectedIds([])
                                            else setSelectedIds(currentList.map((s: any) => s.id || s.ID_Aluno))
                                        }}
                                        className="flex items-center gap-3 text-[10px] font-black uppercase text-gray-500 hover:text-indigo-600 transition-colors tracking-[0.2em]"
                                    >
                                        {selectedIds.length === currentList.length && currentList.length > 0 ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5" />}
                                        Selecionar Todos
                                    </button>
                                    <div className="flex items-center gap-3">
                                        <Search className="w-4 h-4 text-gray-300" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{currentList.length} Listados</span>
                                    </div>
                                </div>
                                <div className="overflow-y-auto p-4 space-y-2 no-scrollbar flex-1">
                                    {loading ? (
                                        <div className="p-12 text-center text-gray-400 font-bold animate-pulse text-[10px] uppercase">Acessando Banco de Dados...</div>
                                    ) : currentList.length === 0 ? (
                                        <div className="p-12 text-center text-gray-400 text-[10px] font-black uppercase">Nenhum aluno nesta faixa</div>
                                    ) : currentList.map((s: any, idx: number) => {
                                        const sid = s.id || s.ID_Aluno || `idx-${idx}`;
                                        const isActive = selectedIds.includes(sid);
                                        return (
                                            <div
                                                key={sid}
                                                onClick={() => {
                                                    setSelectedIds(prev => isActive ? prev.filter(tid => tid !== sid) : [...prev, sid])
                                                }}
                                                className={cn(
                                                    "p-5 rounded-2xl flex items-center justify-between transition-all cursor-pointer border group",
                                                    isActive ? "bg-indigo-50 border-indigo-200 shadow-sm" : "bg-white border-transparent hover:border-gray-100 hover:shadow-sm"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-lg flex items-center justify-center border transition-all",
                                                        isActive ? "bg-indigo-600 border-indigo-500 text-white" : "bg-gray-100 border-gray-200 text-transparent"
                                                    )}>
                                                        <Sparkles className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-gray-900 tracking-tight uppercase">{s.Nome || s.name}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold font-mono">{s.Telefone || s.phone}</p>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] font-black text-gray-400 bg-gray-100 px-3 py-1 rounded-full group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
                                                    #{s.Pontuacao_Risco || s.score || 0}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="space-y-4 pt-6">
                                <button
                                    onClick={handleSendManual}
                                    disabled={isSending || selectedIds.length === 0}
                                    className="w-full py-7 bg-gray-900 hover:bg-black disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-50 text-white rounded-[32px] font-black shadow-lg hover:translate-y-[-2px] transition-all flex items-center justify-center gap-4 active:scale-[0.98] group relative overflow-hidden"
                                >
                                    {isSending ? (
                                        <Loader2 className="w-8 h-8 animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="w-7 h-7 text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            <span className="text-xl tracking-tighter uppercase whitespace-nowrap">Executar Disparo em Massa ({selectedIds.length})</span>
                                        </>
                                    )}
                                </button>

                                <div className="p-5 bg-gray-50 rounded-[32px] border border-gray-200 space-y-4">
                                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Activity className="w-3 h-3 text-indigo-600" /> Histórico de Disparos Recentes
                                    </h5>
                                    <div className="space-y-3">
                                        {logs.slice(0, 3).map((log, i) => (
                                            <div key={i} className="flex items-center justify-between gap-3 text-[10px] border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                                <span className="text-gray-900 font-bold truncate max-w-[140px] uppercase">{log.ID_Aluno}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                    <span className="text-emerald-600 font-black uppercase tracking-tighter">Entregue</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                <footer className="pt-12 pb-8 border-t border-gray-200 flex flex-col items-center gap-6">
                    <div className="flex gap-8">
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Privacy-First</span>
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">GDPR Compliant</span>
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">WhatsApp API v2.0</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 italic flex items-center gap-2">
                        Evolution Engine <ArrowRight className="w-3 h-3 text-indigo-600" /> Central de Estratégia Evoque
                    </p>
                </footer>
            </div>
        </main>
    )
}
