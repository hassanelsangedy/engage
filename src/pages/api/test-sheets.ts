import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const results: any = {
        step: 'init',
        envCheck: {
            GOOGLE_SERVICE_ACCOUNT_EMAIL: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            GOOGLE_PRIVATE_KEY_LENGTH: process.env.GOOGLE_PRIVATE_KEY?.length || 0,
            GOOGLE_PRIVATE_KEY_STARTS: process.env.GOOGLE_PRIVATE_KEY?.substring(0, 30) || 'MISSING',
            GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID || 'MISSING',
        },
    };

    try {
        const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        const rawKey = process.env.GOOGLE_PRIVATE_KEY || '';

        // Try multiple replacement strategies for the private key
        let key = rawKey;
        if (rawKey.includes('\\n')) {
            key = rawKey.replace(/\\n/g, '\n');
            results.keyStrategy = 'replaced literal \\n';
        } else if (rawKey.includes('\n')) {
            results.keyStrategy = 'key already has real newlines';
        } else {
            results.keyStrategy = 'no newlines found - key may be malformed';
        }

        results.keyHasBeginMarker = key.includes('-----BEGIN');
        results.keyHasEndMarker = key.includes('-----END');
        results.keyNewlineCount = (key.match(/\n/g) || []).length;

        if (!email || !key) {
            results.error = 'Missing credentials';
            return res.status(400).json(results);
        }

        results.step = 'auth';
        const auth = new JWT({
            email: email,
            key: key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        results.step = 'loadDoc';
        const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || '1wb_CVBbFbasy9cvZFVyhZOLwZkcpUyrsvFP6a_OlbNo';
        const doc = new GoogleSpreadsheet(SPREADSHEET_ID, auth);
        await doc.loadInfo();

        results.step = 'docLoaded';
        results.docTitle = doc.title;
        results.sheets = doc.sheetsByIndex.map(s => s.title);

        // Try to write a test row to Logs_Interacoes
        results.step = 'writeTest';
        const sheet = doc.sheetsByTitle['Logs_Interacoes'];
        if (sheet) {
            const testRow = await sheet.addRow({
                Data_Hora: new Date().toISOString(),
                ID_Aluno: 'TEST',
                Telefone: '0000000000',
                Tipo: 'Diagnostico',
                Mensagem: 'Teste de conexão automática - pode apagar esta linha',
                Status_Entrega: 'OK',
                Classificacao: 'N/A',
                Role: 'Sistema',
            });
            results.step = 'writeSuccess';
            results.testRowNumber = testRow.rowNumber;
        } else {
            results.error = 'Sheet Logs_Interacoes not found';
        }

        results.status = 'SUCCESS';
        return res.status(200).json(results);
    } catch (error: any) {
        results.error = error.message;
        results.stack = error.stack?.split('\n').slice(0, 5);
        return res.status(500).json(results);
    }
}
