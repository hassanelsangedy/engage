import { JWT } from 'google-auth-library';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function main() {
    console.log('Renaming duplicate Telefone to Pontuacao_Risco...');
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n').replace(/"/g, '');
    
    const client = new JWT({
        email,
        key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    
    // First let's get the A1:Z1 row to find the exact index of the duplicate
    const urlGet = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Base_Alunos!A1:Z1`;
    const resGet = await client.request({ url: urlGet });
    const headers = (resGet.data as any).values[0];
    
    let firstTelefoneIdx = -1;
    let duplicateIdx = -1;
    
    for (let i = 0; i < headers.length; i++) {
        if (headers[i] === 'Telefone') {
            if (firstTelefoneIdx === -1) {
                firstTelefoneIdx = i;
            } else {
                duplicateIdx = i;
                break;
            }
        }
    }
    
    if (duplicateIdx !== -1) {
        headers[duplicateIdx] = 'Pontuacao_Risco';
        const urlUpdate = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Base_Alunos!A1:Z1?valueInputOption=USER_ENTERED`;
        await client.request({
            url: urlUpdate,
            method: 'PUT',
            data: {
                values: [headers]
            }
        });
        console.log(`Successfully renamed duplicate 'Telefone' at index ${duplicateIdx} to 'Pontuacao_Risco'.`);
    } else {
        console.log('No duplicate Telefone header found.');
    }
}
main().catch(console.error);
