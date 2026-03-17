
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import FloatingNav from '@/components/ui/floating-nav'
import { Providers } from '@/components/providers'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Link from 'next/link'
import { LogOut, User } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Engage.Evoque - Sistema de Gestão de Retenção',
  description: 'Hospitalidade de Prontidão e Psicologia Comportamental',
}

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (e) {
    // Silently proceed with null session if headers are unavailable during build
    session = null;
  }

  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 pb-24`}>
        <Providers>
          <header className="flex justify-between items-center p-4 h-16 absolute top-0 right-0 z-50 w-full pointer-events-none">
            <div />
            <div className="pointer-events-auto flex items-center gap-3">
              <ThemeToggle />
              {session?.user ? (
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-full p-1.5 pr-4 shadow-sm border border-gray-200 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-700 flex items-center justify-center text-white">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-left leading-none">
                    <p className="text-[10px] text-gray-400 dark:text-slate-400 font-bold uppercase">{session.user.name || 'User'}</p>
                    <p className="text-[8px] text-gray-500 dark:text-slate-500 font-bold uppercase">{(session.user as any).role || 'STAFF'}</p>
                  </div>
                </div>
              ) : (
                <Link href="/auth/signin" className="bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-full px-4 py-2 shadow-sm border border-gray-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-900 dark:text-white">
                  Login
                </Link>
              )}
            </div>
          </header>
          {children}
          <FloatingNav />
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
