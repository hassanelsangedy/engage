
'use client'

import { useState, useEffect } from 'react'
import { Plus, User, Mail, Shield, Trash2, Edit2, CheckCircle2, AlertCircle, X, MapPin } from 'lucide-react'
import { getUsers, createUser, updateUserRole, deleteUser, approveUser } from './actions'
import { toast } from 'sonner'
import BackgroundDecoration from '@/components/ui/background-decoration'
import { cn } from '@/lib/utils'
type Role = 'ADMIN' | 'COORDINATOR' | 'PROFESSOR' | 'RECEPTION'

export default function TeamManagementPage() {
    const [users, setUsers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'RECEPTION' as Role,
        unit: 'ribeirao_pires'
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        loadUsers()
    }, [])

    async function loadUsers() {
        setIsLoading(true)
        const data = await getUsers()
        setUsers(data)
        setIsLoading(false)
    }

    const handleApprove = async (email: string) => {
        const res = await approveUser(email)
        if (res.success) {
            toast.success('Utilizador aprovado com sucesso!')
            loadUsers()
        } else {
            toast.error(res.error || 'Erro ao aprovar utilizador')
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        const res = await createUser(formData)
        setIsSubmitting(false)

        if (res.success) {
            toast.success('Usuário criado com sucesso!')
            setShowForm(false)
            setFormData({ name: '', email: '', password: '', role: 'RECEPTION', unit: 'ribeirao_pires' })
            loadUsers()
        } else {
            toast.error(res.error || 'Erro ao criar usuário')
        }
    }

    const handleDelete = async (id: string, name?: string) => {
        if (!confirm(`Deseja realmente remover o acesso de ${name}?`)) return

        const res = await deleteUser(id)
        if (res.success) {
            toast.success('Acesso removido com sucesso.')
            loadUsers()
        } else {
            toast.error(res.error || 'Erro ao remover usuário')
        }
    }

    const ROLES_BADGES = {
        ADMIN: 'bg-slate-900 text-white',
        COORDINATOR: 'bg-indigo-100 text-indigo-700',
        PROFESSOR: 'bg-green-100 text-green-700',
        RECEPTION: 'bg-blue-100 text-blue-700'
    }

    return (
        <div className="p-8 max-w-7xl mx-auto relative min-h-screen text-slate-900">
            <BackgroundDecoration />

            <header className="mb-10 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-slate-900">Gestão de Equipa</h1>
                    <p className="text-gray-500 font-medium">Controlo de Acessos e Perfis Evoque</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold flex items-center gap-2 transform active:scale-95 transition-all shadow-lg shadow-slate-200"
                >
                    <Plus className="w-5 h-5" /> Adicionar Utilizador
                </button>
            </header>

            <div className="relative z-10">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest">Carregando_Equipe...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 border-b border-slate-50">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Nome / E-mail</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Perfil</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Unidade</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-8 py-5">
                                                <p className="font-bold text-slate-800">{u.name || '---'}</p>
                                                <p className="text-xs text-slate-400 font-medium">{u.email}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider ${ROLES_BADGES[u.role as keyof typeof ROLES_BADGES]}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-xs text-slate-500 font-bold uppercase tracking-tight">
                                                    {u.unit || 'Matriz'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                                                    u.status?.toLowerCase() === 'ativo' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700 animate-pulse"
                                                )}>
                                                    {u.status || 'Ativo'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right space-x-2">
                                                {u.status?.toLowerCase() === 'pendente' && (
                                                    <button
                                                        onClick={() => handleApprove(u.email)}
                                                        className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                                        title="Aprovar Acesso"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(u.id, u.name)}
                                                    className="p-2.5 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic">
                                                Nenhum utilizador encontrado na base.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setShowForm(false)}
                            className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-slate-900">Registar Equipa</h2>
                            <p className="text-sm text-slate-400 font-medium">Novo acesso ao ecossistema Engage</p>
                        </div>

                        <form onSubmit={handleCreate} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nome Completo</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                        <input
                                            type="text" required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                            placeholder="Nome do colaborador"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">E-mail de Trabalho</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                        <input
                                            type="email" required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                            placeholder="exemplo@evoque.com.br"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Senha Inicial</label>
                                        <div className="relative">
                                            <input
                                                type="text" required
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Perfil de Acesso</label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                                            className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm appearance-none"
                                        >
                                            <option value="RECEPTION">RECEPÇÃO</option>
                                            <option value="PROFESSOR">PROFESSOR</option>
                                            <option value="COORDINATOR">COORDENADOR</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Unidade Atribuída</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                        <input
                                            type="text"
                                            value={formData.unit}
                                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                            className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                            placeholder="Ex: ribeirao_pires"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-3xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-slate-200"
                            >
                                {isSubmitting ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : 'Criar Conta de Acesso'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
