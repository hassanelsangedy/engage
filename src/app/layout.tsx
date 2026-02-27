
import type { Metadata } from 'next'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}>
          {/* Global Header for basic auth controls (optional, but good for navigation) */}
          <header className="flex justify-between items-center p-4 h-16 absolute top-0 right-0 z-50 w-full pointer-events-none">
            <div /> {/* Spacer */}
            <div className="pointer-events-auto">
              <SignedOut>
                {/* Sign in is handled by page.tsx hero button mostly, but keeping this as backup */}
              </SignedOut>
              <SignedIn>
                {/* UserButton is also in page.tsx, but having it global is safer for protected routes */}
                <div className="bg-white/80 backdrop-blur rounded-full p-1 shadow-sm border border-gray-200">
                  <UserButton />
                </div>
              </SignedIn>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
