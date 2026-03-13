
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(process.cwd(), '.env.local') });

async function seedSheet() {
    const spreadsheetId = '1wb_CVBbFbasy9cvZFVyhZOLwZkcpUyrsvFP6a_OlbNo';
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let key = process.env.GOOGLE_PRIVATE_KEY;

    if (key && key.includes('\\n')) {
        key = key.replace(/\\n/g, '\n');
    }
    if (key && key.startsWith('"') && key.endsWith('"')) {
        key = key.substring(1, key.length - 1);
    }

    if (!email || !key) {
        console.error('Credentials missing');
        return;
    }

    const auth = new JWT({
        email,
        key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(spreadsheetId, auth);
    await doc.loadInfo();

    const sheet = doc.sheetsByTitle['Base_Alunos'];
    if (!sheet) {
        console.error('Sheet Base_Alunos not found');
        return;
    }

    console.log('Clearing existing rows...');
    // sheet.clear() is risky, better to just append after

    const units = ['Centro', 'Norte', 'Sul', 'Leste'];
    const bands = ['Vermelha', 'Amarela', 'Azul', 'Verde'];
    const names = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes'];
    const firstNames = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elena', 'Fabio', 'Gisele', 'Hugo', 'Iara', 'João'];

    console.log('Generating 500 students...');
    const rows = [];
    for (let i = 1; i <= 500; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = names[Math.floor(Math.random() * names.length)];
        const unit = units[Math.floor(Math.random() * units.length)];
        const band = bands[Math.floor(Math.random() * bands.length)];
        const risk = Math.floor(Math.random() * 10);

        rows.push({
            ID_Aluno: `EVO-${1000 + i}`,
            Nome: `${firstName} ${lastName} ${i}`,
            Telefone: `55119${Math.floor(10000000 + Math.random() * 90000000)}`,
            Faixa_Cor: band,
            Pontuacao_Risco: risk,
            Status_Adesao: risk > 7 ? 'Sinal Vermelho' : 'Ativo',
            Ultima_Presenca: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            Professor_Referencia: `Prof. ${names[Math.floor(Math.random() * names.length)]}`,
            Unidade: unit
        });

        if (i % 50 === 0) {
            console.log(`Prepared ${i} rows...`);
        }
    }

    // Add in chunks
    const chunkSize = 100;
    for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        await sheet.addRows(chunk);
        console.log(`Uploaded rows ${i + 1} to ${i + chunk.length}`);
    }

    console.log('Seeding complete!');
}

seedSheet().catch(console.error);
