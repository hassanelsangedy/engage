
'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react'

export default function CoordinatorError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Coordinator Area Error:', error)
    }, [error])

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-10 h-10 text-amber-600" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900">Algo deu errado</h2>
                    <p className="text-slate-500">
                        Ocorreu um erro inesperado ao carregar esta seção.
                        Nossa equipe já foi notificada.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={reset}
                        className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-slate-200"
                    >
                        <RefreshCcw className="w-5 h-5" />
                        Tentar Novamente
                    </button>

                    <Link
                        href="/"
                        className="w-full py-4 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <Home className="w-5 h-5" />
                        Voltar para o Início
                    </Link>
                </div>

                {error.digest && (
                    <p className="text-[10px] text-slate-300 font-mono">
                        Error ID: {error.digest}
                    </p>
                )}
            </div>
        </div>
    )
}
