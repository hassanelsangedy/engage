
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const nextAuthSecret = process.env.NEXTAUTH_SECRET;

    // 1. Show env var presence (never show values)
    const envCheck = {
        SUPABASE_URL: !!url,
        SUPABASE_SERVICE_ROLE_KEY: !!serviceKey,
        SUPABASE_SERVICE_ROLE_KEY_prefix: serviceKey?.substring(0, 12) || 'MISSING',
        NEXTAUTH_SECRET: !!nextAuthSecret,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'MISSING',
    };

    if (!url || !serviceKey) {
        return res.status(500).json({ error: 'Missing Supabase env vars', envCheck });
    }

    try {
        const supabase = createClient(url, serviceKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        });

        // 2. Test: list users from usuarios table
        const { data: users, error } = await supabase
            .from('usuarios')
            .select('email, role, status')
            .limit(10);

        if (error) {
            return res.status(500).json({
                error: 'Supabase query failed',
                details: error.message,
                hint: error.hint,
                envCheck
            });
        }

        return res.status(200).json({
            status: 'SUCCESS ✅',
            userCount: users?.length || 0,
            users: users?.map(u => ({ email: u.email, role: u.role, status: u.status })),
            envCheck
        });
    } catch (err: any) {
        return res.status(500).json({
            error: 'Supabase connection exception',
            message: err.message,
            envCheck
        });
    }
}
