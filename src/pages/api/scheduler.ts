import type { NextApiRequest, NextApiResponse } from 'next';
import { checkAndSendMessages } from '@/lib/scheduler';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Vercel Cron Auth (optional but recommended)
    // const authHeader = req.headers.authorization;
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) return res.status(401).end();

    console.log('--- Motor de Agendamento Vercel Iniciado (Next.js API) ---');

    try {
        await checkAndSendMessages();
        return res.status(200).json({
            status: 'success',
            message: 'Motor de disparo processado com sucesso'
        });
    } catch (error: any) {
        console.error('Erro no motor de disparo:', error);
        return res.status(500).json({ status: 'error', error: error.message });
    }
}
