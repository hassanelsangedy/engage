'use server';

import { revalidatePath } from 'next/cache'
import { calculateScore } from '@/lib/score'
import { appendToSheet, getSheetRows, updateRowById, findRowByColumn } from '@/lib/sheets'
import { createCalendarEvent } from '@/lib/calendar'
import { calculateRecoveryMetrics, calculateWeeklyReportData } from '@/lib/analytics'

// Import logic
export async function importStudents(data: { name: string; evoId: string; unit: string; frequency: number; consistency: number }[]) {
    let count = 0;
    const processDate = new Date();
    const currentMonth = processDate.toISOString().substring(0, 7); // e.g., "2026-02"

    for (const row of data) {
        const { total, band } = calculateScore(row.frequency, row.consistency);

        // Map band for sheets (Portuguese display)
        const faixaCor = band === 'Red' ? 'Vermelha' :
            band === 'Yellow' ? 'Amarela' :
                band === 'Blue' ? 'Azul' : 'Verde';

        // Upsert Student in Sheets
        const existing = await findRowByColumn('Base_Alunos', 'ID_EVO', String(row.evoId));

        if (existing) {
            await updateRowById('Base_Alunos', 'ID_EVO', String(row.evoId), {
                Frequencia_Mensal: row.frequency,
                Consistencia_Semanal: row.consistency,
                Pontuacao_Risco: total,
                Faixa_Cor: faixaCor,
                Unidade: row.unit,
                Ultima_Interacao: new Date().toISOString()
            });
        } else {
            await appendToSheet('Base_Alunos', {
                ID_EVO: String(row.evoId),
                Nome: row.name,
                Unidade: row.unit,
                Frequencia_Mensal: row.frequency,
                Consistencia_Semanal: row.consistency,
                Pontuacao_Risco: total,
                Faixa_Cor: faixaCor,
                Ultima_Interacao: new Date().toISOString()
            });
        }

        // Create History record in Sheets
        await appendToSheet('Historico_Presenca', {
            ID_Aluno: String(row.evoId),
            Mes: currentMonth,
            Frequencia: row.frequency,
            Consistencia: row.consistency,
            Pontuacao: total,
            Faixa: faixaCor,
            Data_Processamento: new Date().toISOString()
        });

        count++;
    }

    revalidatePath('/admin');
    revalidatePath('/reception');
    revalidatePath('/professor');
    revalidatePath('/coordinator');

    return { success: true, count };
}

export async function getStats(unit?: string) {
    try {
        const rows = await getSheetRows('Base_Alunos');
        const unitRows = unit ? rows.filter((r: any) => r.Unidade?.toLowerCase().includes(unit.toLowerCase())) : rows;

        const interactions = await getSheetRows('Logs_Interacoes');
        const countInteractions = unit ? interactions.filter((i: any) => {
            const s = unitRows.find((r: any) => String(r.ID_EVO || r.ID_Aluno) === String(i.ID_Aluno));
            return !!s;
        }).length : interactions.length;

        // Fetch Weekly Report Data for Trend Tracking
        const weeklyData = await calculateWeeklyReportData();

        return {
            red: unitRows.filter((r: any) => ['Vermelha', 'Red'].includes(r.Faixa_Cor)).length,
            yellow: unitRows.filter((r: any) => ['Amarela', 'Yellow'].includes(r.Faixa_Cor)).length,
            green: unitRows.filter((r: any) => ['Verde', 'Green'].includes(r.Faixa_Cor)).length,
            blue: unitRows.filter((r: any) => ['Azul', 'Blue'].includes(r.Faixa_Cor)).length,
            total: unitRows.length,
            interactions: countInteractions,
            trend: weeklyData ? {
                redDiff: weeklyData.diff_value,
                redClass: weeklyData.diff_class,
                recoveryRate: weeklyData.recovery_rate
            } : null
        };
    } catch (error) {
        console.error('getStats Sheets Error:', error);
        return { red: 0, yellow: 0, green: 0, blue: 0, total: 0, interactions: 0, trend: null };
    }
}

export async function getPendingUsers() {
    try {
        const rows = await getSheetRows('Usuarios');
        return rows
            .filter((r: any) => String(r.Status || r.status || '').trim().toLowerCase() === 'pendente')
            .map((r: any) => ({
                id: r.id || r.Email || r.email,
                name: r.name || r.Name || String(r.Email || r.email || '').split('@')[0],
                email: r.Email || r.email,
                role: r.Role || r.role,
                createdAt: r.CreatedAt || r.createdAt || new Date().toISOString()
            }));
    } catch (e) {
        return [];
    }
}

export async function getEfficacyReport() {
    try {
        const historyRows = await getSheetRows('Historico_Presenca');
        const students = await getSheetRows('Base_Alunos');
        const interactions = await getSheetRows('Logs_Interacoes');

        // 1. Get unique IDs who were RED
        const atRiskIds = Array.from(new Set(
            historyRows
                .filter((h: any) => ['Vermelha', 'Red'].includes(h.Faixa))
                .map((h: any) => String(h.ID_Aluno))
        ));

        if (atRiskIds.length === 0) {
            return {
                migrationRate: 0,
                intervention: { rate: 0, count: 0 },
                control: { rate: 0, count: 0 }
            };
        }

        // 2. Filter current status
        const studentsAtRisk = students.filter((s: any) => atRiskIds.includes(String(s.ID_EVO || s.ID_Aluno)));

        // Groups
        const interventionGroup = studentsAtRisk.filter(s => {
            return interactions.some((i: any) => String(i.ID_Aluno) === String(s.ID_EVO || s.ID_Aluno));
        });
        const controlGroup = studentsAtRisk.filter(s => {
            return !interactions.some((i: any) => String(i.ID_Aluno) === String(s.ID_EVO || s.ID_Aluno));
        });

        const calculateMigration = (group: any[]) => {
            if (group.length === 0) return 0;
            const migrated = group.filter(s => !['Vermelha', 'Red'].includes(s.Faixa_Cor)).length;
            return Math.round((migrated / group.length) * 100);
        };

        const globalMigration = calculateMigration(studentsAtRisk);
        const interventionRate = calculateMigration(interventionGroup);
        const controlRate = calculateMigration(controlGroup);

        return {
            migrationRate: globalMigration,
            totalAtRisk: studentsAtRisk.length,
            intervention: {
                rate: interventionRate,
                count: interventionGroup.length,
                migrated: interventionGroup.filter(s => !['Vermelha', 'Red'].includes(s.Faixa_Cor)).length
            },
            control: {
                rate: controlRate,
                count: controlGroup.length,
                migrated: controlGroup.filter(s => !['Vermelha', 'Red'].includes(s.Faixa_Cor)).length
            }
        };
    } catch (err) {
        console.error('getEfficacyReport Fallback:', err);
        return {
            migrationRate: 0,
            totalAtRisk: 0,
            intervention: { rate: 0, count: 0, migrated: 0 },
            control: { rate: 0, count: 0, migrated: 0 }
        };
    }
}

export async function saveCampaign(data: {
    id?: string,
    title: string,
    audience: string,
    frequency: number,
    content: string,
    cron?: string,
    hora?: string,
    diasSemana?: string,
    frequencyLabel?: string
}) {
    const campaignId = data.id || Math.random().toString(36).substring(2, 9);

    try {
        const campaignData = {
            ID_Campanha: campaignId,
            Data: new Date().toISOString(),
            Campanha: data.title,
            Publico: data.audience,
            Hora: data.hora || 'N/A',
            Dias_Semana: data.diasSemana || 'N/A',
            Frequencia_Label: data.frequencyLabel || 'N/A',
            Cronograma: data.cron || 'N/A',
            Conteudo: data.content,
            Status: 'Ativo'
        };

        if (data.id) {
            await updateRowById('Config_Campanhas', 'ID_Campanha', data.id, campaignData);
        } else {
            await appendToSheet('Config_Campanhas', campaignData);
        }

        if (data.cron) {
            await createCalendarEvent(data.title, data.cron).catch(console.error);
        }

        revalidatePath('/admin');
        return { success: true, campaign: campaignData };
    } catch (e) {
        console.error('Failed to sync campaign to Google Sheets:', e);
        return { success: false, error: String(e) };
    }
}

export async function getJourneyConfig() {
    try {
        const rows = await getSheetRows('Config_Campanhas');
        return rows.map((row: any) => ({
            id: row.ID_Gatilho || row.ID_Campanha,
            ativo: row.Ativo === 'Sim' || row.Status === 'Ativo',
            gatilho: row.Gatilho || row.Campanha,
            regra: row.Regra_Envio || 'Automático',
            publico: row.Publico_Alvo || row.Publico,
            mensagem: row.Mensagem_Template || row.Conteudo,
            hora: row.Hora_Envio || row.Hora,
            tad: row.TAD_Eixo || 'N/A',
            ultimoEnvio: row.Ultimo_Envio || 'Nunca'
        }));
    } catch (e) {
        console.error('Failed to fetch journey config:', e);
        return [];
    }
}

export async function updateJourneyConfig(id: string, updates: any) {
    try {
        const updateData: any = {};
        if (updates.ativo !== undefined) updateData.Ativo = updates.ativo ? 'Sim' : 'Não';
        if (updates.mensagem !== undefined) updateData.Mensagem_Template = updates.mensagem;
        if (updates.hora !== undefined) updateData.Hora_Envio = updates.hora;
        if (updates.tad !== undefined) updateData.TAD_Eixo = updates.tad;

        const success = await updateRowById('Config_Campanhas', 'ID_Gatilho', id, updateData);

        if (success) {
            revalidatePath('/admin/journey');
            return { success: true };
        }
        return { success: false, error: 'Trigger ID not found' };
    } catch (e) {
        console.error('Failed to update journey config:', e);
        return { success: false, error: String(e) };
    }
}

export async function getCampaigns() {
    try {
        const rows = await getSheetRows('Config_Campanhas');
        return rows.map((r: any) => ({
            id: r.ID_Campanha || r.ID_Gatilho,
            title: r.Campanha || r.Gatilho,
            audience: r.Publico || r.Publico_Alvo,
            frequency: 7,
            messageContent: r.Conteudo || r.Mensagem_Template,
            isActive: r.Status === 'Ativo' || r.Ativo === 'Sim',
            createdAt: new Date(r.Data || Date.now())
        }));
    } catch (e) {
        return [];
    }
}

export async function getRetentionIntelligence() {
    try {
        const sheetInteractions = await getSheetRows('Logs_Interacoes');
        const sheetFeedbacks = await getSheetRows('Feedbacks');
        const sheetDiagnostico = await getSheetRows('Diagnostico_Respostas');
        const students = await getSheetRows('Base_Alunos');

        const funnel = {
            sent: sheetInteractions.filter((i: any) => i.Tipo === 'Hook_Message' || i.Tipo === 'Envio').length,
            responses: sheetInteractions.filter((i: any) => i.Tipo === 'Student_Response' || i.Tipo === 'Recebimento').length,
            reception: sheetInteractions.filter((i: any) => i.Tipo === 'Reception_Alert' || i.Tipo === 'Acolhimento').length,
            adjustment: sheetInteractions.filter((i: any) => i.Tipo === 'Professor_Adjustment').length,
            validation: sheetInteractions.filter((i: any) => i.Tipo === 'Coordinator_Review').length
        };

        const bis = sheetDiagnostico.filter((r: any) => r.Classificacao_IA === 'BI').length;
        const bes = sheetDiagnostico.filter((r: any) => r.Classificacao_IA === 'BE').length;
        const biRatio = (bis + bes) > 0 ? (bis / (bis + bes)) * 100 : 50;

        const trainingMods = sheetInteractions
            .filter((i: any) => i.Tipo === 'Professor_Adjustment')
            .map((row: any, i) => ({
                id: `sheet-i-${i}`,
                student: { name: row.Nome || 'Aluno' },
                trainingMod: row.Mensagem || 'Ajuste Geral',
                unit: 'Matriz',
                status: 'OK'
            })).slice(0, 10);

        const feedbacks = sheetFeedbacks.map((row: any, i) => ({
            id: `sheet-f-${i}`,
            student: { name: row.Aluno || 'Aluno' },
            content: row.Feedback || 'Sem comentário',
            sentiment: row.Sentiment || 'Verde',
            createdAt: row.Data || new Date().toISOString()
        })).slice(0, 10);

        const bandDistribution = { Red: 0, Yellow: 0, Green: 0, Blue: 0 };
        students.forEach((r: any) => {
            const f = r.Faixa_Cor || '';
            const b = (f === 'Vermelha' || f === 'Red') ? 'Red' :
                (f === 'Amarela' || f === 'Yellow') ? 'Yellow' :
                    (f === 'Azul' || f === 'Blue') ? 'Blue' : 'Green';
            bandDistribution[b as keyof typeof bandDistribution]++;
        });

        const recovery = await calculateRecoveryMetrics().catch(() => ({ recoveryRate: 0, recoveredCount: 0, roi: 0, cases: [] }));

        return {
            funnel,
            biRatio,
            biCount: bis,
            beCount: bes,
            trainingMods,
            feedbacks,
            messagesPerBand: { Red: 0, Yellow: 0, Green: 0, Blue: 0 },
            bandDistribution,
            recoveryRate: recovery.recoveryRate,
            recoveredCount: recovery.recoveredCount,
            roi: recovery.roi,
            recoveryCases: recovery.cases
        };
    } catch (err) {
        console.error('getRetentionIntelligence Fallback:', err);
        return {
            funnel: { sent: 0, responses: 0, reception: 0, adjustment: 0, validation: 0 },
            biRatio: 0, biCount: 0, beCount: 0, trainingMods: [], feedbacks: [],
            messagesPerBand: { Red: 0, Yellow: 0, Green: 0, Blue: 0 },
            bandDistribution: { Red: 0, Yellow: 0, Green: 0, Blue: 0 },
            recoveryRate: 0, recoveredCount: 0, roi: 0, recoveryCases: []
        };
    }
}

export async function toggleCampaign(id: string, currentStatus: boolean) {
    try {
        await updateRowById('Config_Campanhas', 'ID_Campanha', id, { Status: !currentStatus ? 'Ativo' : 'Inativo' });
        revalidatePath('/admin');
        return { success: true };
    } catch (e) {
        return { success: false, error: String(e) };
    }
}

export async function deleteCampaign(id: string) {
    // DeleteRow requires implementation in sheets.ts, for now we just log as not active
    console.warn('Delete campaign called for ID:', id);
    return { success: false, error: 'Remoção via Sheets requer implementação manual.' };
}

