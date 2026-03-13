
import { Heart, Target, Zap, Gift, Dumbbell } from 'lucide-react'
import Link from 'next/link'

export default function PatientPortal() {
    return (
        <main className="min-h-screen bg-slate-900 text-white p-6 pb-32">
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <header className="py-8">
                    <h1 className="text-3xl font-black tracking-tight">Portal do Aluno</h1>
                    <p className="text-slate-400 font-medium">Bem-vindo à sua jornada de saúde na Evoque.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/patient/health" className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all group">
                        <Heart className="w-8 h-8 text-pink-500 mb-4 group-hover:scale-110 transition-transform" />
                        <h2 className="text-xl font-bold">Saúde 360</h2>
                        <p className="text-sm text-slate-400 mt-2">Monitore seu progresso e engajamento nos treinos.</p>
                    </Link>

                    <Link href="/patient/training" className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all group">
                        <Dumbbell className="w-8 h-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                        <h2 className="text-xl font-bold">Meu Treino</h2>
                        <p className="text-sm text-slate-400 mt-2">Veja sua ficha de treino e exercícios atuais.</p>
                    </Link>

                    <Link href="/patient/rewards" className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all group">
                        <Gift className="w-8 h-8 text-purple-500 mb-4 group-hover:scale-110 transition-transform" />
                        <h2 className="text-xl font-bold">Rewards</h2>
                        <p className="text-sm text-slate-400 mt-2">Consulte seus pontos e resgate benefícios.</p>
                    </Link>

                    <Link href="/patient/profile" className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all group">
                        <Zap className="w-8 h-8 text-orange-500 mb-4 group-hover:scale-110 transition-transform" />
                        <h2 className="text-xl font-bold">Perfil</h2>
                        <p className="text-sm text-slate-400 mt-2">Mantenha seus dados e objetivos atualizados.</p>
                    </Link>
                </div>

                <footer className="pt-12 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Evoque Hospitalidade de Prontidão</p>
                </footer>
            </div>
        </main>
    )
}
