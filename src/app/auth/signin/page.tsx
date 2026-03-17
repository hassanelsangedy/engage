
'use client'

import { useState, Suspense, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ShieldCheck, Loader2, ChevronRight, Mail, Lock } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import Link from 'next/link'

function SignInContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams?.get('callbackUrl') || '/'
    const registered = searchParams?.get('registered')

    useEffect(() => {
        if (registered) {
            toast.success('Conta criada! Aguarde a ativação pelo administrador')
        }
    }, [registered])

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await signIn('credentials', {
                email,
                password,
                redirect: false,
                callbackUrl
            })

            if (res?.error) {
                toast.error('Email ou senha inválidos')
            } else {
                toast.success('Login realizado com sucesso!')

                // Fetch the session to get the user's role
                const sessionRes = await fetch('/api/auth/session')
                const session = await sessionRes.json()
                const role = session?.user?.role

                let redirectPath = '/'

                router.push(redirectPath)
                router.refresh()
            }
        } catch (error) {
            toast.error('Ocorreu um erro ao tentar fazer login')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50" />
                <div className="absolute top-40 -left-20 w-72 h-72 bg-purple-100 rounded-full blur-3xl opacity-50" />
            </div>

            <div className="max-w-md w-full z-10">
                <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 p-8 md:p-12 overflow-hidden relative">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-blue-600 text-[10px] font-black tracking-widest uppercase mb-6">
                            <ShieldCheck className="w-3 h-3" />
                            Acesso Restrito
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
                            Engage<span className="text-blue-600">.</span>Evoque
                        </h1>
                        <p className="text-slate-400 text-sm font-medium">Portal Corporativo de Gestão</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">E-mail Corporativo</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300 font-medium"
                                    placeholder="nome@evoque.com.br"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Senha de Acesso</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300 font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-slate-200 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Entrar no Ecossistema
                                    <ChevronRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-50 text-center space-y-4">
                        <Link
                            href="/auth/signup"
                            className="text-sm text-blue-600 font-bold hover:underline transition-all block"
                        >
                            Não tem conta? Registe-se
                        </Link>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">
                            Hospitalidade de Prontidão &bull; v2.5
                        </p>
                    </div>
                </div>

                <p className="mt-8 text-center text-[10px] text-slate-300 font-medium uppercase tracking-[0.2em]">
                    &copy; 2026 Antigravity System
                </p>
            </div>
        </main>
    )
}

export default function SignInPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        }>
            <SignInContent />
        </Suspense>
    )
}
