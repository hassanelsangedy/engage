import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function main() {
    console.log('Adding Barreira_Relatada column...');
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let key = process.env.GOOGLE_PRIVATE_KEY;
    if (key && key.includes('\\n')) key = key.replace(/\\n/g, '\n');
    if (key && key.startsWith('"') && key.endsWith('"')) key = key.substring(1, key.length - 1);

    const serviceAccountAuth = new JWT({
        email: email,
        key: key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID as string, serviceAccountAuth);
    await doc.loadInfo();
    
    const sheet = doc.sheetsByTitle['Base_Alunos'];
    await sheet.loadHeaderRow();
    
    const headers = [...sheet.headerValues];
    if (!headers.includes('Barreira_Relatada')) {
        const barreiraIndex = headers.indexOf('Barreira');
        if (barreiraIndex !== -1) {
            headers.splice(barreiraIndex + 1, 0, 'Barreira_Relatada');
        } else {
            headers.push('Barreira_Relatada');
        }
        await sheet.resize({ rowCount: sheet.rowCount, columnCount: Math.max(sheet.columnCount, headers.length) });
        await sheet.setHeaderRow(headers);
        console.log('Added Barreira_Relatada to headers:', headers);
    } else {
        console.log('Barreira_Relatada already exists.');
    }
}

main().catch(console.error);
