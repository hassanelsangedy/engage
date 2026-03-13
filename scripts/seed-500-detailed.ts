
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(process.cwd(), '.env.local') });

async function seedMassiveData() {
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

    const units = ['Ribeirão Pires', 'Pereira Barreto (Santo André)', 'Guilhermina', 'Guaianazes', 'Pimentas (Guarulhos)'];
    const bands = ['Red', 'Yellow', 'Blue', 'Green'];
    const names = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes'];
    const firstNames = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elena', 'Fabio', 'Gisele', 'Hugo', 'Iara', 'João'];
    const barriers = ['Monotonia / Baixa Autoeficácia', 'Falta de Tempo / Sobrecarga', 'Perda de Sentido / Social', 'Desconhecida'];
    const iaClassifications = ['BI', 'BE', 'N/A'];
    const subcategories = ['Professor', 'Ambiente', 'Saúde/Físico', 'Psicológico', 'Viagem', 'Tempo', 'Saúde'];

    console.log('Seeding 500 Students in Base_Alunos...');
    const baseSheet = doc.sheetsByTitle['Base_Alunos'];
    const studentIds: string[] = [];
    if (baseSheet) {
        const students = [];
        for (let i = 0; i < 500; i++) {
            const id = `EVO-${3000 + i}`;
            studentIds.push(id);
            students.push({
                ID_Aluno: id,
                Nome: `${firstNames[i % 10]} ${names[Math.floor(i / 10) % 10]} ${i}`,
                Telefone: `55119${Math.floor(10000000 + Math.random() * 90000000)}`,
                Faixa_Cor: bands[i % 4],
                Pontuacao_Risco: Math.floor(Math.random() * 10),
                Status_Adesao: 'Ativo',
                Ultima_Presenca: new Date().toISOString().split('T')[0],
                Professor_Referencia: `Prof. ${names[i % 10]}`,
                Unidade: units[i % 4]
            });
        }
        // Group in batches of 100
        for (let i = 0; i < students.length; i += 100) {
            await baseSheet.addRows(students.slice(i, i + 100));
            console.log(`Added ${i + 100} students...`);
        }
    }

    console.log('Seeding 500 records in Diagnostico_Barreiras...');
    const diagBarSheet = doc.sheetsByTitle['Diagnostico_Barreiras'];
    if (diagBarSheet) {
        const rows = [];
        for (let i = 0; i < 500; i++) {
            rows.push({
                ID_Aluno: studentIds[i],
                Data_Diagnostico: new Date().toISOString().split('T')[0],
                Barreira_Principal: barriers[i % 4],
                Grau_Severidade: Math.floor(Math.random() * 5) + 1,
                Status_Adesao: 'Em Risco'
            });
        }
        for (let i = 0; i < rows.length; i += 100) {
            await diagBarSheet.addRows(rows.slice(i, i + 100));
        }
    }

    console.log('Seeding 500 records in Monitoramento_Hedonico...');
    const hedonicoSheet = doc.sheetsByTitle['Monitoramento_Hedonico'];
    if (hedonicoSheet) {
        const rows = [];
        for (let i = 0; i < 500; i++) {
            rows.push({
                Data: new Date().toISOString().split('T')[0],
                ID_Aluno: studentIds[i],
                Prazer_0_10: Math.floor(Math.random() * 11),
                'Esforço_0_10': Math.floor(Math.random() * 11),
                Sinal_Alerta: Math.random() > 0.7 ? 'Vermelho' : 'Verde',
                Acao_Tomada: 'Monitoramento Automático Test'
            });
        }
        for (let i = 0; i < rows.length; i += 100) {
            await hedonicoSheet.addRows(rows.slice(i, i + 100));
        }
    }

    console.log('Seeding 500 records in Diagnostico_Respostas...');
    const respSheet = doc.sheetsByTitle['Diagnostico_Respostas'];
    if (respSheet) {
        const rows = [];
        for (let i = 0; i < 500; i++) {
            rows.push({
                Data: new Date().toISOString().split('T')[0],
                ID_Aluno: studentIds[i],
                Resposta_Original: 'Treino estava ok mas um pouco cansativo.',
                Classificacao_IA: iaClassifications[i % 3],
                Subcategoria: subcategories[i % 7],
                Status_Intervencao: 'Pendente'
            });
        }
        for (let i = 0; i < rows.length; i += 100) {
            await respSheet.addRows(rows.slice(i, i + 100));
        }
    }

    console.log('Massive Seeding Complete! 🚀');
}

seedMassiveData().catch(console.error);
