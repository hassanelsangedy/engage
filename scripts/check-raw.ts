import { JWT } from 'google-auth-library';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function main() {
    console.log('Fetching raw google sheet data...');
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n').replace(/"/g, '');
    
    const client = new JWT({
        email,
        key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Base_Alunos!A1:Z1`;
    
    const res = await client.request({ url });
    console.log(JSON.stringify((res.data as any).values[0], null, 2));
}
main().catch(console.error);
