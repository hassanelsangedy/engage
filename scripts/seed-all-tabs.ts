
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(process.cwd(), '.env.local') });

async function seedAllTabs() {
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

    // 1. Base_Alunos (Already has some, but let's ensure 100 fresh ones for links)
    const baseSheet = doc.sheetsByTitle['Base_Alunos'];
    if (baseSheet) {
        console.log('Seeding Base_Alunos sample...');
        const students = [];
        for (let i = 0; i < 50; i++) {
            students.push({
                ID_Aluno: `EVO-${2000 + i}`,
                Nome: `${firstNames[i % 10]} ${names[i % 10]} Sample`,
                Telefone: `551198888${String(i).padStart(4, '0')}`,
                Faixa_Cor: bands[i % 4],
                Pontuacao_Risco: Math.floor(Math.random() * 10),
                Status_Adesao: 'Ativo',
                Ultima_Presenca: new Date().toISOString().split('T')[0],
                Professor_Referencia: `Prof. ${names[i % 5]}`,
                Unidade: units[i % 4]
            });
        }
        await baseSheet.addRows(students);
    }

    // 2. Config_Campanhas
    const configSheet = doc.sheetsByTitle['Config_Campanhas'];
    if (configSheet) {
        console.log('Seeding Config_Campanhas...');
        await configSheet.addRows([
            { ID_Campanha: 'CAMP-001', Ativo: 'Sim', Gatilho: 'Boas-vindas', Publico_Alvo: 'Blue', Hora_Envio: '09:00', Dias_Semana: "['Seg', 'Qua', 'Sex']", Mensagem_Template: 'Olá {{nome}}, seja bem-vindo à Evoque!', Pilar_TAD: 'Acolhimento' },
            { ID_Campanha: 'CAMP-002', Ativo: 'Sim', Gatilho: 'Recuperação Rápida', Publico_Alvo: 'Red', Hora_Envio: '14:00', Dias_Semana: "['Seg', 'Ter', 'Wed', 'Qui', 'Sex']", Mensagem_Template: 'Oi {{nome}}, sentimos sua falta hoje. Tudo bem?', Pilar_TAD: 'Gancho' },
            { ID_Campanha: 'CAMP-003', Ativo: 'Sim', Gatilho: 'Monitoramento Semanal', Publico_Alvo: 'Yellow', Hora_Envio: '10:00', Dias_Semana: "['Sex']", Mensagem_Template: 'Como foi sua semana de treinos, {{nome}}?', Pilar_TAD: 'Retenção' }
        ]);
    }

    // 3. Logs_Interacoes
    const logsSheet = doc.sheetsByTitle['Logs_Interacoes'];
    if (logsSheet) {
        console.log('Seeding Logs_Interacoes...');
        const logs = [];
        for (let i = 0; i < 20; i++) {
            logs.push({
                Data_Hora: new Date(Date.now() - i * 3600000).toISOString(),
                ID_Aluno: `EVO-${2000 + (i % 50)}`,
                Tipo: i % 2 === 0 ? 'Envio' : 'Recebimento',
                Mensagem: i % 2 === 0 ? 'Mensagem automática de acompanhamento' : 'Tudo certo, amanhã eu vou!',
                Status_Entrega: 'Entregue'
            });
        }
        await logsSheet.addRows(logs);
    }

    // 4. Diagnostico_Respostas
    const diagSheet = doc.sheetsByTitle['Diagnostico_Respostas'];
    if (diagSheet) {
        console.log('Seeding Diagnostico_Respostas...');
        await diagSheet.addRows([
            { Data_Hora: new Date().toISOString(), ID_Aluno: 'EVO-2001', Resposta_Original: 'Não vou poder ir porque estou muito cansado do trabalho.', Classificacao_IA: 'BI', Detalhe_Barreira: 'Barreira Interna: Cansaço/Fadiga', Sugestao_Acao: 'Mudar treino para intensidade leve.' },
            { Data_Hora: new Date().toISOString(), ID_Aluno: 'EVO-2002', Resposta_Original: 'Meu carro quebrou, volto semana que vem.', Classificacao_IA: 'BE', Detalhe_Barreira: 'Barreira Externa: Logística', Sugestao_Acao: 'Enviar motivação para retorno.' },
            { Data_Hora: new Date().toISOString(), ID_Aluno: 'EVO-2003', Resposta_Original: 'O professor novo não me explicou os exercícios direito.', Classificacao_IA: 'BI', Detalhe_Barreira: 'Barreira Interna: Social/Atendimento', Sugestao_Acao: 'Aproximar professor de referência.' }
        ]);
    }

    // 5. Feedbacks
    const feedbackSheet = doc.sheetsByTitle['Feedbacks'];
    if (feedbackSheet) {
        console.log('Seeding Feedbacks...');
        await feedbackSheet.addRows([
            { Data: new Date().toLocaleDateString(), Aluno: 'Ana Silva Sample', Feedback: 'Estou adorando as novas aulas de HIIT!', Sentiment: 'Verde' },
            { Data: new Date().toLocaleDateString(), Aluno: 'Bruno Oliveira Sample', Feedback: 'A academia está ficando muito cheia às 18h.', Sentiment: 'Amarela' },
            { Data: new Date().toLocaleDateString(), Aluno: 'Carla Souza Sample', Feedback: 'O ar condicionado da sala de bike não está gelando.', Sentiment: 'Amarela' }
        ]);
    }

    // 6. Monitoramento_Hedonico
    const hedonicoSheet = doc.sheetsByTitle['Monitoramento_Hedonico'];
    if (hedonicoSheet) {
        console.log('Seeding Monitoramento_Hedonico...');
        const hedonicoData = [];
        for (let i = 0; i < 30; i++) {
            hedonicoData.push({
                Data: new Date(Date.now() - i * 86400000).toLocaleDateString(),
                ID_Aluno: `EVO-${2000 + (i % 10)}`,
                Valor_Prazer: 5 + Math.floor(Math.random() * 6), // 5 to 10
                Contexto: 'Pós-treino musculação'
            });
        }
        // Add a low score to test alerts
        hedonicoData.push({
            Data: new Date().toLocaleDateString(),
            ID_Aluno: 'EVO-2005',
            Valor_Prazer: 3,
            Contexto: 'Treino de perna intenso'
        });
        await hedonicoSheet.addRows(hedonicoData);
    }

    console.log('Full Seeding Complete! 🚀');
}

seedAllTabs().catch(console.error);
