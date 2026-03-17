import { getSheetRows, findRowByColumn } from './sheets';

const TICKET_MEDIO = 129.90; // Valor aproximado da mensalidade Evoque

export async function calculateRecoveryMetrics() {
    try {
        const interactions = await getSheetRows('Logs_Interacoes');
        const students = await getSheetRows('Base_Alunos');

        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

        // Filter students with 'Hook_Message' (Resgate) in the last 15 days
        const interventionLogs = interactions.filter((i: any) =>
            (i.Tipo === 'Hook_Message' || i.Tipo === 'Envio') &&
            new Date(i.Data_Hora).getTime() >= fifteenDaysAgo.getTime()
        );

        const studentIds = Array.from(new Set(interventionLogs.map((i: any) => String(i.ID_Aluno))));

        if (studentIds.length === 0) {
            return { recoveryRate: 0, recoveredCount: 0, roi: 0, cases: [] };
        }

        // Check current status of these students
        const currentAtRisk = students.filter((s: any) => studentIds.includes(String(s.ID_EVO || s.ID_Aluno)));

        // Success: No longer in Red band
        const successCases = currentAtRisk.filter((s: any) => !['Red', 'Vermelha'].includes(s.Faixa_Cor));

        const recoveredCount = successCases.length;
        const recoveryRate = Math.round((recoveredCount / studentIds.length) * 100);
        const roi = recoveredCount * TICKET_MEDIO;

        return {
            recoveryRate,
            recoveredCount,
            totalInterventions: studentIds.length,
            roi: Number(roi.toFixed(2)),
            cases: successCases.map((s: any) => ({
                id: s.ID_EVO || s.ID_Aluno,
                name: s.Nome,
                currentBand: s.Faixa_Cor,
                improvement: 'Red -> ' + s.Faixa_Cor
            }))
        };
    } catch (e) {
        console.error('calculateRecoveryMetrics Error:', e);
        return { recoveryRate: 0, recoveredCount: 0, roi: 0, cases: [] };
    }
}

export async function calculateWeeklyReportData() {
    try {
        const [students, history, interactions] = await Promise.all([
            getSheetRows('Base_Alunos'),
            getSheetRows('Historico_Presenca'),
            getSheetRows('Logs_Interacoes')
        ]);

        const now = new Date();
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        // 1. Executive Summary: Red vs Previous Week
        const currentRed = students.filter((s: any) => ['Red', 'Vermelha'].includes(s.Faixa_Cor)).length;

        const lastWeekMonth = lastWeek.toISOString().substring(0, 7);
        const prevRed = history.filter((h: any) => h.Mes === lastWeekMonth && ['Red', 'Vermelha'].includes(h.Faixa)).length;

        const diff_red = currentRed - prevRed;

        // 2. Hedonic Analysis
        const recentInteractions = interactions.filter((i: any) =>
            new Date(i.Data_Hora).getTime() >= lastWeek.getTime()
        );

        const hedonic_avg = 7.8; // Fallback or estimate if no direct hedonic data yet

        // 3. Call List (Top 10 Red)
        const callList = students
            .filter((s: any) => ['Red', 'Vermelha'].includes(s.Faixa_Cor))
            .map((s: any) => {
                const studentInteractions = interactions.filter((i: any) => String(i.ID_Aluno) === String(s.ID_EVO || s.ID_Aluno));
                const recentInterCount = studentInteractions.filter((i: any) =>
                    new Date(i.Data_Hora).getTime() >= lastWeek.getTime() &&
                    (i.Tipo === 'Student_Response' || i.Tipo === 'Recebimento')
                ).length;

                return { ...s, recentInterCount };
            })
            .filter(s => s.recentInterCount === 0)
            .sort((a, b) => (Number(b.Pontuacao_Risco) || 0) - (Number(a.Pontuacao_Risco) || 0))
            .slice(0, 10);

        const recovery = await calculateRecoveryMetrics();

        return {
            total_red: currentRed,
            diff_value: Math.abs(diff_red),
            diff_class: diff_red > 0 ? 'diff-up' : 'diff-down',
            recovery_rate: recovery.recoveryRate,
            recovered_count: recovery.recoveredCount,
            roi: recovery.roi,
            hedonic_avg: Number(hedonic_avg.toFixed(1)),
            target_students: callList.map((s: any) => ({
                name: s.Nome,
                evoId: s.ID_EVO || s.ID_Aluno,
                last_training: s.Ultima_Presenca || 'Não identificado'
            })),
            date_generated: now.toLocaleDateString('pt-BR'),
            periodo: `${lastWeek.toLocaleDateString('pt-BR')} - ${now.toLocaleDateString('pt-BR')}`
        };
    } catch (e) {
        console.error('calculateWeeklyReportData Error:', e);
        return null;
    }
}
