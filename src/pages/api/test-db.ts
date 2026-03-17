
import { NextApiRequest, NextApiResponse } from 'next';
import { getSheetRows } from '@/lib/sheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        console.log('[TestDB] Testing Google Sheets Connection...');

        // 1. Try to fetch sheets metadata or any row from 'Usuarios'
        const rows = await getSheetRows('Usuarios');

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                error: 'No rows found in "Usuarios" sheet.',
                tips: 'Check if the sheet title "Usuarios" is correct and if the service account has access.'
            });
        }

        // 2. Return column names to verify headers
        const headers = Object.keys(rows[0]);
        const sampleEmail = rows[0].Email || rows[0].email;

        return res.status(200).json({
            status: 'success',
            rowCount: rows.length,
            detectedHeaders: headers,
            sampleFound: !!sampleEmail,
            credentialsCheck: {
                hasEmailEnv: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                hasKeyEnv: !!process.env.GOOGLE_PRIVATE_KEY,
                hasSheetIdEnv: !!process.env.GOOGLE_SHEET_ID
            }
        });
    } catch (error: any) {
        console.error('[TestDB] Critical Error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
