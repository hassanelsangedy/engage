'use server';

import { getSheetRows, appendToSheet, updateRowById, findRowByColumn } from '@/lib/sheets'

/**
 * Aba 1: Base_Alunos
 * Cabeçalhos: ID_Aluno, Nome, Telefone, Faixa_Cor, Pontuacao_Risco, Status_Adesao, Ultima_Presenca, Professor_Referencia.
 */
export async function getStratification() {
    try {
        const rows = await getSheetRows('Base_Alunos');

        // Return 500 rows limit as requested
        const students = rows.slice(0, 500);

        return {
            red: students.filter((s: any) => s.Faixa_Cor === 'Vermelha' || s.Faixa_Cor === 'Red'),
            redHighEngagement: students.filter((s: any) => {
                const isRed = s.Faixa_Cor === 'Vermelha' || s.Faixa_Cor === 'Red';
                const hasFreq = Number(s.Frequencia_Mensal || 0) >= 10;
                const hasCons = Number(s.Consistencia_Semanal || 0) >= 0.7;
                return isRed && hasFreq && hasCons;
            }),
            yellow: students.filter((s: any) => s.Faixa_Cor === 'Amarela' || s.Faixa_Cor === 'Yellow'),
            blue: students.filter((s: any) => s.Faixa_Cor === 'Azul' || s.Faixa_Cor === 'Blue'),
            total: students.length
        };
    } catch (error) {
        console.error('Stratification Error:', error);
        return { red: [], yellow: [], blue: [], total: 0 };
    }
}

/**
 * Aba 2: Config_Campanhas
 * Cabeçalhos: ID_Campanha, Ativo, Gatilho, Publico_Alvo, Hora_Envio, Dias_Semana, Mensagem_Template, Pilar_TAD.
 */
export async function getCampaigns() {
    try {
        return await getSheetRows('Config_Campanhas');
    } catch (error) {
        console.error('Campaigns Error:', error);
        return [];
    }
}

/**
 * sendManualBlast: Integrar com a API da Meta para disparar as mensagens pendentes.
 */
export async function sendManualBlast(studentIds: string[], template: string) {
    const TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

    let successCount = 0;

    for (const id of studentIds) {
        let student: any = null;
        try {
            // Find student by ID or EVO ID in Sheets
            const rows = await getSheetRows('Base_Alunos');
            student = rows.find((r: any) => String(r.ID_Geral) === id || String(r.ID_EVO) === id || String(r.ID_Aluno) === id);
        } catch (err) {
            console.error('Sheet Error in blast lookup:', err);
        }

        if (student) {
            const studentName = student.Nome || student.name || 'Aluno';
            const evoId = student.ID_EVO || student.ID_Aluno || id;
            const messageText = template.replace(/\{\{nome\}\}/g, studentName);

            await appendToSheet('Logs_Interacoes', {
                Data_Hora: new Date().toISOString(),
                ID_Aluno: evoId,
                Tipo: 'Envio',
                Mensagem: messageText,
                Status_Entrega: TOKEN ? 'Pendente_Meta' : 'Simulado'
            });

            // Also log as a Coordinator action in logs
            await appendToSheet('Logs_Interacoes', {
                Data_Hora: new Date().toISOString(),
                ID_Aluno: evoId,
                Tipo: 'Coordinator_Review',
                Mensagem: `[Manual Blast] ${messageText}`,
                Status_Entrega: 'OK'
            });

            successCount++;
        }
    }

    return { success: true, sent: successCount };
}

/**
 * Aba 3: Logs_Interacoes
 * Cabeçalhos: Data_Hora, ID_Aluno, Tipo, Mensagem, Status_Entrega.
 */
export async function getLogs() {
    try {
        const logs = await getSheetRows('Logs_Interacoes');
        return logs.slice(-50).reverse(); // Return last 50 logs reversed
    } catch (error) {
        console.error('Logs Error:', error);
        return [];
    }
}

/**
 * updateCampaign: Atualiza o template ou status de uma campanha na Aba 2: Config_Campanhas
 */
export async function updateCampaign(id: string, updates: any) {
    try {
        await updateRowById('Config_Campanhas', 'ID_Campanha', id, updates);
        return { success: true };
    } catch (error) {
        console.error('Update Campaign Error:', error);
        return { success: false, error: 'Falha ao atualizar campanha' };
    }
}

export async function saveCampaign(data: any) {
    try {
        if (data.id && !data.id.startsWith('new-')) {
            // Update
            await updateRowById('Config_Campanhas', 'ID_Campanha', data.id, {
                Gatilho: data.title,
                Publico_Alvo: data.audience,
                Hora_Envio: data.hora,
                Dias_Semana: data.diasSemana,
                Mensagem_Template: data.content,
                Ativo: 'Sim'
            });
        } else {
            // Create
            await appendToSheet('Config_Campanhas', {
                ID_Campanha: `CAMP-${Date.now()}`,
                Ativo: 'Sim',
                Gatilho: data.title,
                Publico_Alvo: data.audience,
                Hora_Envio: data.hora,
                Dias_Semana: data.diasSemana,
                Mensagem_Template: data.content,
                Pilar_TAD: 'Retenção'
            });
        }
        return { success: true };
    } catch (error) {
        console.error('Save Campaign Error:', error);
        return { success: false, error: 'Falha ao salvar campanha' };
    }
}

export async function deleteCampaign(id: string) {
    try {
        await updateRowById('Config_Campanhas', 'ID_Campanha', id, { Ativo: 'Excluido' });
        return { success: true };
    } catch (e) {
        return { success: false };
    }
}
