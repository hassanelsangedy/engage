
'use client'

import { useState, useEffect } from 'react'
import { Clock, Calendar, Repeat, ArrowRight, Save, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SmartSchedulingProps {
    onSave: (rrule: string, daysList: string) => void
    isSaving?: boolean
}

type Frequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'

const DAYS = [
    { label: 'D', value: 'SU' },
    { label: 'S', value: 'MO' },
    { label: 'T', value: 'TU' },
    { label: 'Q', value: 'WE' },
    { label: 'Q', value: 'TH' },
    { label: 'S', value: 'FR' },
    { label: 'S', value: 'SA' },
]

export default function SmartScheduling({ onSave, isSaving }: SmartSchedulingProps) {
    const [time, setTime] = useState('09:00')
    const [selectedDays, setSelectedDays] = useState<string[]>(['MO', 'TU', 'WE', 'TH', 'FR'])
    const [frequency, setFrequency] = useState<Frequency>('WEEKLY')
    const [rrule, setRrule] = useState('')
    const [friendlyDays, setFriendlyDays] = useState('')

    useEffect(() => {
        const [hour, minute] = time.split(':')
        let freqPart = 'WEEKLY'
        let intervalPart = ';INTERVAL=1'

        if (frequency === 'BIWEEKLY') {
            intervalPart = ';INTERVAL=2'
        } else if (frequency === 'MONTHLY') {
            freqPart = 'MONTHLY'
            intervalPart = ''
        }

        const daysPart = selectedDays.length > 0 ? `;BYDAY=${selectedDays.join(',')}` : ''
        const timePart = `;BYHOUR=${parseInt(hour)};BYMINUTE=${parseInt(minute)}`

        const generatedRrule = `FREQ=${freqPart}${intervalPart}${daysPart}${timePart}`
        setRrule(generatedRrule)

        // Generate friendly list for Sheet: ['Seg', 'Qua']
        const dayMap: any = { 'MO': 'Seg', 'TU': 'Ter', 'WE': 'Qua', 'TH': 'Qui', 'FR': 'Sex', 'SA': 'Sab', 'SU': 'Dom' }
        const daysList = `[${selectedDays.map(d => `'${dayMap[d]}'`).sort().join(', ')}]`
        setFriendlyDays(daysList)

        onSave(generatedRrule, daysList)
    }, [time, selectedDays, frequency, onSave])

    const toggleDay = (day: string) => {
        setSelectedDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        )
    }

    return (
        <div className="bg-white/5 backdrop-blur-3xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                        <Calendar className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white">Módulo de Agendamento</h3>
                        <p className="text-xs font-bold text-indigo-300/50 uppercase tracking-widest">Configuração de Disparo Recorrente</p>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Time Selection */}
                    <div className="group">
                        <label className="block text-[10px] font-black uppercase text-indigo-300/60 mb-3 tracking-widest px-1 flex items-center gap-2">
                            <Clock className="w-3 h-3" /> Hora do Disparo
                        </label>
                        <div className="relative max-w-[160px]">
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-black text-xl outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400/50">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    {/* Frequency Selection */}
                    <div>
                        <label className="block text-[10px] font-black uppercase text-indigo-300/60 mb-3 tracking-widest px-1 flex items-center gap-2">
                            <Repeat className="w-3 h-3" /> Frequência
                        </label>
                        <div className="grid grid-cols-3 gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
                            {(['WEEKLY', 'BIWEEKLY', 'MONTHLY'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFrequency(f)}
                                    className={cn(
                                        "py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all",
                                        frequency === f
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                            : "text-white/40 hover:text-white/70 hover:bg-white/5"
                                    )}
                                >
                                    {f === 'WEEKLY' ? 'Semanal' : f === 'BIWEEKLY' ? 'Quinzenal' : 'Mensal'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Weekly Recurrence (Days of Week) */}
                    <div className="animate-in fade-in duration-500">
                        <label className="block text-[10px] font-black uppercase text-indigo-300/60 mb-4 tracking-widest px-1">
                            Dias da Semana
                        </label>
                        <div className="flex justify-between items-center gap-2">
                            {DAYS.map((day) => {
                                const active = selectedDays.includes(day.value)
                                return (
                                    <button
                                        key={day.value}
                                        onClick={() => toggleDay(day.value)}
                                        className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300",
                                            active
                                                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/40 scale-110"
                                                : "bg-white/5 text-white/30 hover:bg-white/10 border border-white/5"
                                        )}
                                    >
                                        {day.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Summary / RRULE Preview */}
                    <div className="space-y-2">
                        <div className="p-3 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                            <div className="flex items-center gap-2 mb-1">
                                <Info className="w-3 h-3 text-indigo-400" />
                                <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest">Lista de Dias (Planilha)</span>
                            </div>
                            <span className="text-[10px] font-bold text-white/60">{friendlyDays}</span>
                        </div>
                        <div className="p-3 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                            <div className="flex items-center gap-2 mb-1">
                                <Info className="w-3 h-3 text-indigo-400" />
                                <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest">Lógica RRULE</span>
                            </div>
                            <code className="text-[9px] font-mono text-indigo-200/40 break-all">{rrule}</code>
                        </div>
                    </div>

                    <button
                        onClick={() => onSave(rrule, friendlyDays)}
                        disabled={isSaving || selectedDays.length === 0}
                        className="w-full bg-white text-slate-900 font-black py-4 rounded-2xl shadow-xl hover:bg-indigo-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                        <Save className="w-5 h-5 group-hover:animate-bounce" />
                        {isSaving ? 'Agendando...' : 'Confirmar Agendamento'}
                    </button>
                </div>
            </div>
        </div>
    )
}
