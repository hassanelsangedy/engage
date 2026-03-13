
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function setupSheets() {
    console.log('🚀 Finalizando configuração da planilha Evoque (Headers Estritos)...');

    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let key = process.env.GOOGLE_PRIVATE_KEY;

    if (key && key.includes('\\n')) key = key.replace(/\\n/g, '\n');
    if (key && key.startsWith('"') && key.endsWith('"')) key = key.substring(1, key.length - 1);

    const spreadsheetId = '1wb_CVBbFbasy9cvZFVyhZOLwZkcpUyrsvFP6a_OlbNo';

    if (!email || !key) {
        console.error('❌ Erro: Credenciais do Google não encontradas no .env.local');
        return;
    }

    const auth = new JWT({
        email,
        key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    try {
        const doc = new GoogleSpreadsheet(spreadsheetId, auth);
        await doc.loadInfo();
        console.log(`✅ Conectado à: ${doc.title}`);

        // Aba 1: Base_Alunos
        const b1Headers = ['ID_Aluno', 'Nome', 'Telefone', 'Faixa_Cor', 'Pontuacao_Risco', 'Status_Adesao', 'Ultima_Presenca', 'Professor_Referencia'];
        await ensureSheet(doc, 'Base_Alunos', b1Headers);

        // Aba 2: Config_Campanhas
        const b2Headers = ['ID_Campanha', 'Ativo', 'Gatilho', 'Publico_Alvo', 'Hora_Envio', 'Dias_Semana', 'Mensagem_Template', 'Pilar_TAD'];
        await ensureSheet(doc, 'Config_Campanhas', b2Headers);

        // Aba 3: Logs_Interacoes
        const b3Headers = ['Data_Hora', 'ID_Aluno', 'Tipo', 'Mensagem', 'Status_Entrega'];
        await ensureSheet(doc, 'Logs_Interacoes', b3Headers);

        // Aba 4: Diagnostico_Respostas
        const b4Headers = ['Data', 'ID_Aluno', 'Resposta_Original', 'Classificacao_IA', 'Subcategoria', 'Status_Intervencao'];
        await ensureSheet(doc, 'Diagnostico_Respostas', b4Headers);

        // Aba 5: Monitoramento_Hedonico
        const b5Headers = ['Data', 'ID_Aluno', 'Prazer_0_10', 'Esforço_0_10', 'Sinal_Alerta', 'Acao_Tomada'];
        await ensureSheet(doc, 'Monitoramento_Hedonico', b5Headers);

        console.log('✨ Configuração Concluída com Sucesso!');
    } catch (error) {
        console.error('❌ Erro no setup:', error);
    }
}

async function ensureSheet(doc: any, title: string, headers: string[]) {
    let sheet = doc.sheetsByTitle[title];
    if (!sheet) {
        console.log(`➕ Criando aba "${title}"...`);
        sheet = await doc.addSheet({ title, headerValues: headers });
    } else {
        console.log(`🛠️ Verificando headers de "${title}"...`);
        await sheet.setHeaderRow(headers);
    }
}

setupSheets();
