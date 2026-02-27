
# Guia de Deploy Contínuo e Segurança (Engage.Evoque)

Este guia detalha como manter o sistema seguro e em produção utilizando a stack configurada.

## 1. Segurança (Clerk)
A autenticação do Clerk foi implementada para proteger todos os dashboards.
- **Middleware:** Configurado em `src/middleware.ts` para bloquear acessos não autenticados.
- **Layout:** O `ClerkProvider` envolve toda a aplicação.
- **Configuração:** Certifique-se de que as variáveis `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` e `CLERK_SECRET_KEY` estejam configuradas no seu painel da Vercel.

## 2. Deploy Contínuo (GitHub + Vercel)
O projeto está pronto para deploy automático:
1. Conecte este repositório no seu dashboard da [Vercel](https://vercel.com).
2. Configure as seguintes variáveis de ambiente no projeto da Vercel:
   - `DATABASE_URL`: URL do seu banco de dados (recomenda-se Neon DB para PostgreSQL).
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`

3. O comando de build automático (`prisma generate && next build`) garantirá que o cliente do banco de dados esteja sempre sincronizado.

## 3. Scripts de Manutenção (Limpeza e Automação)
Para garantir a escalabilidade:
- **Refatoração:** Tipos centralizados em `src/lib/types.ts`.
- **Sync de Dados:** Execute `npx tsx scripts/sync-evo.ts` periodicamente (pode ser via GitHub Action ou Vercel Cron).
- **Follow-ups:** Execute `npx tsx scripts/send-followup.ts` para processar as mensagens automáticas de 24h.

## 4. Auditoria de Código (Clean Code)
O sistema utiliza arquitetura de **Server Actions** para lógica de negócio, separando claramente as preocupações de UI (Página/Dashboard) e Persistência (Actions).
