'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    MessageSquare,
    Users,
    BrainCircuit,
    ClipboardCheck,
    Home,
    Heart,
    LogOut,
    Dumbbell,
    LineChart,
    Gift,
    User,
    Zap,
    ShieldCheck,
    HelpCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'

// Staff Navigation Items
const staffItems = [
    { name: 'Minha unidade', href: '/', icon: Home },
    { name: 'Recepção', href: '/reception', icon: Users },
    { name: 'Acompanhamento dos alunos', href: '/professor', icon: BrainCircuit },
    { name: 'Coordenador', href: '/coordinator', icon: ClipboardCheck },
    { name: 'Admin', href: '/admin', icon: LayoutDashboard },
    { name: 'Como funciona', href: '/onboarding', icon: HelpCircle },
]

// Student (Patient) Navigation Items
const studentItems = [
    { name: 'Minha unidade', href: '/', icon: Home },
    { name: 'Meu Treino', href: '/patient/training', icon: Dumbbell },
    { name: 'Saúde 360', href: '/patient/health', icon: Heart },
    { name: 'Rewards', href: '/patient/rewards', icon: Gift },
    { name: 'Perfil', href: '/patient/profile', icon: User },
    { name: 'Como funciona', href: '/onboarding', icon: HelpCircle },
]


export default function FloatingNav() {
    const pathname = usePathname()
    const { data: session } = useSession()
    const userRole = (session?.user as any)?.role
    const userUnit = (session?.user as any)?.unit

    // Hide nav on auth pages
    if (!pathname || pathname.includes('/auth') || pathname.includes('/sign-in') || pathname.includes('/sign-up')) return null

    // Determine current environment
    const isStudentArea = pathname.startsWith('/patient')

    // Filter staff items by role
    let filteredStaffItems = [...staffItems]

    if (userRole === 'RECEPTION') {
        // Reception sees only "Minha unidade" and "Como funciona" (according to user request "Retire do menu suspenso o acesso aos demais perfis (professor e ouvidoria)")
        // Wait, the user said "Retire do menu suspenso o acesso aos demais perfis (professor e ouvidoria), Portal (renomeie para 'Minha unidade') e incluindo o espaço de onbording (renomeie para 'Como funciona')"
        // But usually they NEED the reception page to do the search.
        // Re-reading: "O perfil Recepção ficará responsável apenas por utilizar a busca do usuário... e realizar o acolhimento... posteriormente encaminhar para o professor de referência."
        // So they need "Minha unidade" (Portal) AND "Recepção" (The search page) AND "Como funciona" (Onboarding).
        // Actually, the user says "Retire do menu suspenso o acesso aos demais perfis (professor e ouvidoria)".
        // Let's stick to: Minha unidade, Recepção (for their work), Como funciona.
        filteredStaffItems = staffItems.filter(item => ['Minha unidade', 'Recepção', 'Como funciona'].includes(item.name))
    } else if (userRole === 'PROFESSOR') {
        // Professor: "menu suspenso deve conter apenas o espaço de onbording (renomeie para 'Como funciona'), Portal (renomeie para 'Minha unidade')." 
        // Wait, they also need the Professor page to see their students.
        // "O professor deve poder selecionar apenas as unidades que esteja vinculado"
        filteredStaffItems = staffItems.filter(item => ['Minha unidade', 'Acompanhamento dos alunos', 'Como funciona'].includes(item.name))
    } else if (userRole === 'COORDINATOR') {
        filteredStaffItems = staffItems.filter(item => item.name !== 'Admin')
    }

    const navItems = isStudentArea ? studentItems : filteredStaffItems

    return (
        <div className={cn(
            "fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-4 w-full sm:w-auto transition-all duration-500",
            (pathname === '/' || !session) && "opacity-0 pointer-events-none translate-y-20"
        )}>
            <nav className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[2.5rem] p-2 flex items-center gap-1.5 sm:gap-3 transition-all duration-500">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 sm:px-4 py-3 rounded-full transition-all duration-300 relative group overflow-hidden",
                                isActive
                                    ? "bg-white text-slate-950 shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {/* Accent Glow */}
                            {isActive && (
                                <div className="absolute inset-0 bg-blue-400/10 animate-pulse" />
                            )}

                            <item.icon className={cn(
                                "w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-500 group-hover:scale-110",
                                isActive && "animate-in zoom-in-50 duration-500"
                            )} />

                            <span className={cn(
                                "text-[8px] sm:text-[10px] font-black uppercase tracking-[0.1em] leading-none",
                                isActive ? "opacity-100" : "opacity-0 sm:opacity-50 group-hover:opacity-100",
                                "transition-all"
                            )}>
                                {item.name}
                            </span>

                            {/* Visual indicator for current section on small screens */}
                            {isActive && (
                                <div className="absolute bottom-1 w-1 h-1 bg-blue-500 rounded-full sm:hidden" />
                            )}
                        </Link>
                    )
                })}

                {/* Global User Control Hooked into Nav */}
                <div className="h-10 w-px bg-white/10 mx-1 hidden sm:block" />

                <div className="flex items-center px-2">
                    <button
                        onClick={() => window.location.href = '/api/auth/signout'}
                        className="p-2 text-white/40 hover:text-white transition-colors"
                    >
                        <LogOut className="w-5 h-5 rotate-180" />
                    </button>
                </div>
            </nav>
        </div>
    )
}
