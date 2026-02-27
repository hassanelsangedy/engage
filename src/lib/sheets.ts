
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SPREADSHEET_ID = '1wb_CVBbFbasy9cvZFVyhZOLwZkcpUyrsvFP6a_OlbNo';

export async function appendToSheet(sheetTitle: string, data: any) {
    try {
        const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (!email || !key) {
            console.error('Google credentials missing in process.env');
            return;
        }

        const serviceAccountAuth = new JWT({
            email: email,
            key: key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
        await doc.loadInfo();

        const sheet = doc.sheetsByTitle[sheetTitle];
        if (!sheet) {
            console.error(`Sheet with title "${sheetTitle}" not found`);
            return;
        }

        await sheet.addRow(data);
        console.log(`[Google Sheets] Row appended to ${sheetTitle}`);
    } catch (error) {
        console.error('[Google Sheets] Error appending row:', error);
    }
}
