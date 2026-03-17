
'use server';

import { supabase } from '@/lib/supabase'
import { Student } from '@/lib/types'

export async function getFinishedStudents(unit?: string) {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // Filter adjustments from today via join
        const { data: adjustments, error } = await supabase
            .from('logs_interacoes')
            .select(`
                *,
                alunos(*)
            `)
            .eq('tipo', 'Professor_Adjustment')
            .gte('data_hora', startOfDay.toISOString());

        if (error) throw error;

        const finishedStudents = (adjustments || [])
            .filter((i: any) => i.alunos && (!unit || (i.alunos.unidade && i.alunos.unidade.toLowerCase().includes(unit.toLowerCase()))));

        return finishedStudents.map((i: any) => ({
            id: i.alunos.id,
            evoId: i.alunos.id_evo,
            name: i.alunos.nome || 'Aluno',
            unit: i.alunos.unidade || null,
            band: i.alunos.faixa_cor || 'N/A'
        }));
    } catch (error) {
        console.error('getFinishedStudents Error:', error);
        return [];
    }
}

export async function getPriorityJourneyStudents() {
    try {
        // 1. Get students in Red Band
        const { data: redStudents, error: redError } = await supabase
            .from('alunos')
            .select('*')
            .in('faixa_cor', ['Red', 'Vermelha']);

        if (redError) throw redError;

        // 2. Fetch interactions for these students
        const studentIds = (redStudents || []).map(s => s.id);
        const { data: interactions, error: intError } = await supabase
            .from('logs_interacoes')
            .select('*')
            .in('aluno_id', studentIds)
            .order('data_hora', { ascending: false });

        if (intError) throw intError;

        // 3. Identify those with recent responses but no adjustment yet
        const journeyList = (redStudents || []).map(student => {
            const studentInteractions = (interactions || [])
                .filter((i: any) => i.aluno_id === student.id);

            const latestResponse = studentInteractions.find((i: any) =>
                ['Student_Response', 'Reception_Alert', 'Recebimento'].includes(i.tipo)
            );

            const hasAjuste = studentInteractions.some((i: any) => i.tipo === 'Professor_Adjustment');

            return {
                id: student.id,
                evoId: student.id_evo,
                name: student.nome,
                unit: student.unidade,
                score: student.pontuacao_risco,
                band: 'Red',
                barrierType: student.barreira || 'N/A',
                latestResponse,
                hasAjuste
            };
        })
            .filter(s => s.latestResponse && !s.hasAjuste)
            .sort((a, b) => {
                if (a.barrierType === 'BI' && b.barrierType !== 'BI') return -1;
                if (a.barrierType !== 'BI' && b.barrierType === 'BI') return 1;
                return (a.score || 0) - (b.score || 0);
            });

        return journeyList;
    } catch (error) {
        console.error('getPriorityJourneyStudents Error:', error);
        return [];
    }
}

export async function getRetentionMetrics() {
    try {
        const [
            { data: diagnostic },
            { data: hedonic },
            { data: alunos },
            { data: interactions }
        ] = await Promise.all([
            supabase.from('diagnostico_respostas').select('*').limit(10).order('data', { ascending: false }),
            supabase.from('monitoramento_hedonico').select('*'),
            supabase.from('alunos').select('*'),
            supabase.from('logs_interacoes').select('*').in('tipo', ['Coordinator_Review', 'Professor_Adjustment'])
        ]);

        // 1. Average Pleasure
        let avgPleasure = 0;
        if (hedonic && hedonic.length > 0) {
            const sum = hedonic.reduce((acc: number, row: any) => acc + (parseFloat(row.feedback_afeto) || 0), 0);
            avgPleasure = sum / hedonic.length;
        }

        // 2. Conversion
        const totalRed = (alunos || []).filter((r: any) => ['Red', 'Vermelha'].includes(r.faixa_cor)).length;
        const totalYellow = (alunos || []).filter((r: any) => ['Yellow', 'Amarela'].includes(r.faixa_cor)).length;
        const totalGreen = (alunos || []).filter((r: any) => ['Green', 'Verde'].includes(r.faixa_cor)).length;

        const savedCount = (interactions || []).length;

        return {
            avgPleasure: avgPleasure.toFixed(1),
            recentResponses: diagnostic || [],
            conversion: {
                red: totalRed,
                yellow: totalYellow,
                green: totalGreen,
                saved: savedCount
            }
        };
    } catch (error) {
        console.error('Metrics Error:', error);
        return {
            avgPleasure: '0.0',
            recentResponses: [],
            conversion: { red: 0, yellow: 0, green: 0, saved: 0 }
        };
    }
}

export async function getCoordinatorControlCenterData(filters?: { unit?: string, period?: string }) {
    try {
        let queryAlunos = supabase.from('alunos').select('*');
        if (filters?.unit) queryAlunos = queryAlunos.ilike('unidade', `%${filters.unit}%`);
        
        const [
            { data: baseAlunos },
            { data: perfilProfessores },
            { data: interactions }
        ] = await Promise.all([
            queryAlunos,
            supabase.from('perfil_professores').select('*'),
            supabase.from('logs_interacoes').select('*, alunos(id_evo)')
        ]);

        // 1. BI Alerts
        const biStudents = (baseAlunos || [])
            .filter((s: any) => 
                (String(s.barreira).includes('BI') || String(s.barreira_relatada).includes('BI'))
            )
            .map((s: any) => ({
                id: s.id,
                evoId: s.id_evo,
                name: s.nome || 'Aluno',
                barrierDescription: s.barreira_relatada || 'Barreira detectada via IA',
                professorReferencia: s.professor_referencia || 'Não atribuído',
                unit: s.unidade || 'N/A',
                shift: 'N/A', // Shift mapping could be added to schema if needed
                band: s.faixa_cor || 'Red'
            }));

        // 2. Retention Retention Efficacy
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const biHistoricallyInteractions = (interactions || []).filter((i: any) => 
            (String(i.classificacao).includes('BI') || String(i.tipo).includes('BI')) &&
            new Date(i.data_hora) >= thirtyDaysAgo
        );
        
        const uniqueBIIds = Array.from(new Set(biHistoricallyInteractions.map((i: any) => i.alunos?.id_evo)));
        const currentStatesOfBI = (baseAlunos || []).filter((s: any) => uniqueBIIds.includes(s.id_evo));
        
        const migratedCount = currentStatesOfBI.filter((s: any) => ['Yellow', 'Amarela', 'Green', 'Verde', 'Blue', 'Azul'].includes(s.faixa_cor)).length;
        const totalBICount = currentStatesOfBI.length || 1;
        const retentionRate = Math.round((migratedCount / totalBICount) * 100);

        // 3. Prof Ranking
        const professors = (perfilProfessores || []).map((p: any) => ({
            name: p.nome || 'Professor',
            specialty: p.especialidade || 'N/A',
            pr: !!p.pr,
            per: !!p.per,
            softSkills: p.soft_skills || 'N/A'
        }));

        return {
            biStudents,
            retentionRate,
            professors,
            stats: {
                totalBI: totalBICount,
                migrated: migratedCount
            }
        };
    } catch (error) {
        console.error('getCoordinatorControlCenterData Error:', error);
        return {
            biStudents: [],
            retentionRate: 0,
            professors: [],
            stats: { totalBI: 0, migrated: 0 }
        };
    }
}

export async function updateStudentPR(studentId: string, professorName: string) {
    try {
        await supabase.from('alunos').update({ 
            professor_referencia: professorName 
        }).eq('id_evo', studentId);

        // Get internal ID
        const { data: st } = await supabase.from('alunos').select('id').eq('id_evo', studentId).single();

        await supabase.from('logs_interacoes').insert({
            data_hora: new Date().toISOString(),
            aluno_id: st?.id || null,
            tipo: 'Coordinator_Review',
            mensagem: `Professor de Referência alterado para: ${professorName}`,
            status_entrega: 'OK',
            role: 'Coordenador'
        });

        return { success: true };
    } catch (error) {
        console.error('updateStudentPR Error:', error);
        return { success: false, error: String(error) };
    }
}
