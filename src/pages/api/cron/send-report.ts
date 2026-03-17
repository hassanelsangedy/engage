
import type { NextApiRequest, NextApiResponse } from 'next';
import { calculateWeeklyReportData } from '@/lib/analytics';
import { generateWeeklyReportPDF } from '@/lib/pdf-generator';
import { sendWeeklyReport } from '@/lib/mailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Vercel Cron Secret Check (Optional but recommended)
    // if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return res.status(401).json({ error: 'Unauthorized' });
    // }

    console.log('[Cron] Weekly Report Generation Started...');

    try {
        // 1. Fetch Analytics Data
        const reportData = await calculateWeeklyReportData();

        if (!reportData) {
            throw new Error('Failed to generate report data from analytics engine');
        }

        // 2. Generate PDF
        const pdfBufferBuffer = await generateWeeklyReportPDF(reportData);
        // Cast arraybuffer to Buffer for nodemailer
        const pdfBuffer = Buffer.from(pdfBufferBuffer);

        // 3. Send Email
        const managers = process.env.MANAGER_EMAILS || 'gestao@evoqueacademia.com.br';
        const result = await sendWeeklyReport(pdfBuffer, managers);

        console.log(`[Cron] Weekly Report Sent to ${managers}`);

        return res.status(200).json({
            status: 'success',
            recipient: managers,
            recoveryRate: reportData.recovery_rate
        });

    } catch (error: any) {
        console.error('[Cron] Error sending weekly report:', error);
        return res.status(500).json({ status: 'error', message: error.message });
    }
}
