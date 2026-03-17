
'use client'

import { useState, useEffect } from 'react'
import { getJourneyConfig, updateJourneyConfig } from '../actions'
import {
    Settings,
    MessageSquare,
    Clock,
    Power,
    Edit2,
    Check,
    X,
    Zap,
    Brain,
    Heart,
    Target,
    ChevronLeft,
    ShieldCheck,
    Save
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function JourneyManager() {
    const [journey, setJourney] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState<any>({})

    useEffect(() => {
        loadJourney()
    }, [])

    async function loadJourney() {
        setLoading(true)
        const data = await getJourneyConfig()
        setJourney(data)
        setLoading(false)
    }

    async function handleToggle(id: string, currentStatus: boolean) {
        const res = await updateJourneyConfig(id, { ativo: !currentStatus })
        if (res.success) loadJourney()
    }

    async function handleSave(id: string) {
        const res = await updateJourneyConfig(id, editForm)
        if (res.success) {
            setEditingId(null)
            loadJourney()
        }
    }

    const startEditing = (item: any) => {
        setEditingId(item.id)
        setEditForm({
            mensagem: item.mensagem,
            hora: item.hora,
            tad: item.tad
        })
    }

    const getTADIcon = (tad: string) => {
        switch (tad) {
            case 'Autonomia': return <Target className="w-4 h-4 text-orange-500" />
            case 'Competência': return <Brain className="w-4 h-4 text-blue-500" />
            case 'Relacionamento': return <Heart className="w-4 h-4 text-pink-500" />
            default: return <ShieldCheck className="w-4 h-4 text-slate-400" />
        }
    }

    return (
        <main className="min-h-screen bg-slate-50 pb-32">
            <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-indigo-600" />
                                Jornada de Reengajamento
                            </h1>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Metodologia Evoque</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="grid grid-cols-1 gap-6">
                    {loading ? (
                        Array(5).fill(0).map((_, i) => (
                            <div key={i} className="h-40 bg-white rounded-3xl animate-pulse" />
                        ))
                    ) : journey.length > 0 ? (
                        journey.map((item) => (
                            <div
                                key={item.id}
                                className={cn(
                                    "group relative bg-white border rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-100",
                                    !item.ativo && "opacity-60 bg-slate-50"
                                )}
                            >
                                <div className="flex flex-col lg:flex-row gap-6">
                                    {/* Left: Info & Tag */}
                                    <div className="lg:w-1/4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg">
                                                {item.id}
                                            </span>
                                            <button
                                                onClick={() => handleToggle(item.id, item.ativo)}
                                                className={cn(
                                                    "w-12 h-6 rounded-full relative transition-colors duration-300",
                                                    item.ativo ? "bg-green-500" : "bg-slate-300"
                                                )}
                                            >
                                                <div className={cn(
                                                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm",
                                                    item.ativo ? "left-7" : "left-1"
                                                )} />
                                            </button>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 leading-tight">{item.gatilho}</h3>
                                            <p className="text-xs text-slate-400 mt-1 font-medium">{item.regra}</p>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                                            {getTADIcon(item.tad)}
                                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{item.tad} (TAD)</span>
                                        </div>
                                    </div>

                                    {/* Center: Message Content */}
                                    <div className="flex-grow">
                                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 relative group-hover:bg-white transition-colors duration-300">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MessageSquare className="w-4 h-4 text-indigo-500" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Script de Mensagem</span>
                                            </div>

                                            {editingId === item.id ? (
                                                <textarea
                                                    className="w-full bg-white border-2 border-indigo-200 rounded-xl p-3 text-sm font-medium focus:ring-4 focus:ring-indigo-100 outline-none min-h-[100px]"
                                                    value={editForm.mensagem}
                                                    onChange={(e) => setEditForm({ ...editForm, mensagem: e.target.value })}
                                                />
                                            ) : (
                                                <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
                                                    "{item.mensagem}"
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Controls & Schedule */}
                                    <div className="lg:w-1/5 flex flex-col justify-between items-end gap-4">
                                        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            {editingId === item.id ? (
                                                <input
                                                    type="time"
                                                    className="text-sm font-bold bg-transparent outline-none border-b-2 border-indigo-200"
                                                    value={editForm.hora}
                                                    onChange={(e) => setEditForm({ ...editForm, hora: e.target.value })}
                                                />
                                            ) : (
                                                <span className="text-sm font-bold text-slate-900">{item.hora}</span>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            {editingId === item.id ? (
                                                <>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleSave(item.id)}
                                                        className="px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 font-bold text-sm"
                                                    >
                                                        <Save className="w-4 h-4" /> SALVAR
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => startEditing(item)}
                                                    className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2 font-bold text-sm"
                                                >
                                                    <Edit2 className="w-4 h-4" /> EDITAR
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-20 text-center bg-white border-2 border-dashed rounded-[3rem]">
                            <Target className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold">Nenhum gatilho de jornada configurado.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
