import { JWT } from 'google-auth-library';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function main() {
    console.log('Fixing Pontuacao_Risco values...');
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n').replace(/"/g, '');
    
    const client = new JWT({
        email,
        key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    
    // Fetch all values
    const urlGet = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Base_Alunos!A1:Z1000`;
    const resGet = await client.request({ url: urlGet });
    const values = (resGet.data as any).values;
    
    if (!values || values.length <= 1) return;

    const headers = values[0];
    const scoreIdx = headers.indexOf('Pontuacao_Risco');
    const statusIdx = headers.indexOf('Status_Adesao');
    
    if (scoreIdx === -1 || statusIdx === -1) {
        console.log('Could not find required columns.');
        return;
    }

    let modified = false;

    // Loop through rows and modify Pontuacao_Risco if it looks like a phone number
    for (let i = 1; i < values.length; i++) {
        const row = values[i];
        while (row.length <= scoreIdx) row.push('');
        while (row.length <= statusIdx) row.push('');

        const scoreStr = row[scoreIdx];
        const statusStr = row[statusIdx];
        
        // If it starts with 55 or is longer than 5 chars, it's definitely a phone number
        if (scoreStr && scoreStr.length > 5) {
            modified = true;
            // set reasonable score based on status
            if (statusStr === 'Risco Crítico') row[scoreIdx] = '2';
            else if (statusStr === 'Alerta') row[scoreIdx] = '4';
            else if (statusStr === 'Ideal') row[scoreIdx] = '6';
            else if (statusStr === 'Super Ativo') row[scoreIdx] = '8';
            else row[scoreIdx] = '2'; // Default to critical risk to bring attention
        }
    }
    
    if (modified) {
        const urlUpdate = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Base_Alunos!A1:Z${values.length}?valueInputOption=USER_ENTERED`;
        await client.request({
            url: urlUpdate,
            method: 'PUT',
            data: {
                values: values
            }
        });
        console.log('Successfully fixed Pontuacao_Risco values.');
    } else {
        console.log('No incorrect Pontuacao_Risco values found.');
    }
}
main().catch(console.error);
