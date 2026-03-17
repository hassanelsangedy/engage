
import { supabase } from './supabase';
import { Student, Band } from './types';
import { getStatusFromScore } from './score';

export async function getAllAtRiskStudents(unit?: string): Promise<Student[]> {
    try {
        let query = supabase
            .from('alunos')
            .select('*')
            .in('faixa_cor', ['Red', 'Vermelha', 'Yellow', 'Amarela']);

        if (unit) {
            query = query.ilike('unidade', `%${unit.replace(/_/g, ' ')}%`);
        }

        const { data: rows, error } = await query;

        if (error) throw error;

        return rows.map((r: any) => {
            const score = Number(r.pontuacao_risco) || 0;
            const { status, band } = getStatusFromScore(score);
            
            return {
                id: r.id,
                evoId: r.id_evo,
                name: r.nome || 'Aluno sem Nome',
                unit: r.unidade || null,
                phone: r.telefone || null,
                score: score,
                statusAdesao: r.status_adesao || status,
                band: r.faixa_cor || band,
                barrier: r.barreira_relatada || null,
                barrierType: r.barreira || null,
                lastWorkoutDate: r.ultima_presenca ? new Date(r.ultima_presenca) : null,
                updatedAt: new Date(r.updated_at || Date.now()),
                frequency: 0, // Not originally in Supabase schema but in Student type
                consistency: 0,
            };
        });
    } catch (error) {
        console.error('Error fetching students from Supabase:', error);
        return [];
    }
}

export async function getStudentByEvoId(evoId: string, unit?: string): Promise<Student | null> {
    try {
        let query = supabase
            .from('alunos')
            .select('*')
            .eq('id_evo', evoId);

        if (unit) {
            query = query.ilike('unidade', `%${unit.replace(/_/g, ' ')}%`);
        }

        const { data: row, error } = await query.single();

        if (error || !row) return null;

        const score = Number(row.pontuacao_risco) || 0;
        const { status, band } = getStatusFromScore(score);

        return {
            id: row.id,
            evoId: row.id_evo,
            name: row.nome || 'Aluno sem Nome',
            unit: row.unidade || null,
            phone: row.telefone || null,
            score: score,
            statusAdesao: row.status_adesao || status,
            band: row.faixa_cor || band,
            barrier: row.barreira_relatada || null,
            barrierType: row.barreira || null,
            lastWorkoutDate: row.ultima_presenca ? new Date(row.ultima_presenca) : null,
            updatedAt: new Date(row.updated_at || Date.now()),
            frequency: 0,
            consistency: 0
        };
    } catch (error) {
        console.error('Error fetching student from Supabase:', error);
        return null;
    }
}

export async function registerReceptionLog(evoId: string, content: string) {
    // 1. Get internal UUID from id_evo
    const { data: student } = await supabase.from('alunos').select('id').eq('id_evo', evoId).single();
    if (!student) return;

    // 2. Log interaction
    await supabase.from('logs_interacoes').insert({
        aluno_id: student.id,
        tipo: 'Acolhimento',
        mensagem: content,
        status_entrega: 'OK'
    });

    // 3. Update student
    await supabase.from('alunos').update({
        updated_at: new Date().toISOString()
    }).eq('id', student.id);
}
