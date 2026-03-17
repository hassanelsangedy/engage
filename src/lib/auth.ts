import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

// Use service role for auth (server-side only)
function getSupabaseAdmin() {
    return createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "/auth/signin",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    const typedEmail = credentials?.email?.toLowerCase().trim();
                    const password = credentials?.password?.trim();

                    if (!typedEmail || !password) return null;

                    console.error(`[Auth] --- TENTATIVA DE LOGIN: ${typedEmail} ---`);

                    const supabase = getSupabaseAdmin();

                    // 1. Buscar usuário no Supabase
                    const { data: user, error } = await supabase
                        .from('usuarios')
                        .select('*')
                        .eq('email', typedEmail)
                        .single();

                    if (error || !user) {
                        console.error(`[Auth] REJEITADO: Usuário "${typedEmail}" não encontrado no Supabase.`);
                        return null;
                    }

                    // 2. Verificar status da conta
                    const status = String(user.status || 'Ativo').trim().toLowerCase();
                    if (status === 'pendente') {
                        console.error(`[Auth] REJEITADO: Conta "${typedEmail}" aguarda ativação.`);
                        return null;
                    }

                    // 3. Verificar senha com BCrypt
                    const hashFromDB = String(user.senha_hash || '').trim();
                    if (!hashFromDB) {
                        console.error(`[Auth] ERRO: Sem hash de senha para ${typedEmail}`);
                        return null;
                    }

                    const isValid = await bcrypt.compare(password, hashFromDB);

                    if (!isValid) {
                        console.error(`[Auth] REJEITADO: Senha incorreta para ${typedEmail}.`);
                        return null;
                    }

                    console.error(`[Auth] SUCESSO: Login autorizado para ${typedEmail}.`);

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.nome || user.email.split('@')[0],
                        role: user.role || 'PROFESSOR',
                        unit: user.unidade || ''
                    };
                } catch (error: any) {
                    console.error("[Auth] EXCEPÇÃO CRÍTICA DURANTE LOGIN:", error.message);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role || 'PROFESSOR';
                token.unit = (user as any).unit || '';
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role || 'PROFESSOR';
                (session.user as any).id = token.sub || '';
                (session.user as any).unit = token.unit || '';
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
};
