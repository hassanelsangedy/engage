
'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function registerInteraction(data: {
    studentId: string
    type: 'Reception_Alert' | 'Professor_Adjustment' | 'Coordinator_Review' | 'Hook_Message' | 'FollowUp_24h' | 'Student_Response'
    content?: string
    outcome?: string
    staffRole: string
    barrierType?: string
    trainingMod?: string
}) {
    try {
        // Find internal ID
        const identifier = isNaN(Number(data.studentId)) ? { id: data.studentId } : { id_evo: data.studentId };
        const { data: student } = await supabase.from('alunos').select('id, id_evo').match(identifier).single();
        if (!student) throw new Error('Student not found');

        // 1. Log interaction
        await supabase.from('logs_interacoes').insert({
            data_hora: new Date().toISOString(),
            aluno_id: student.id,
            tipo: data.type,
            mensagem: data.content || 'Sem conteúdo',
            status_entrega: 'OK',
            classificacao: data.barrierType || 'N/A',
            role: data.staffRole
        });

        // 2. Update Student
        if (data.type === 'Professor_Adjustment') {
            await supabase.from('alunos').update({
                barreira: data.barrierType || 'N/A',
                updated_at: new Date().toISOString()
            }).eq('id', student.id);
        }

        revalidatePath('/reception')
        revalidatePath('/professor')
        revalidatePath('/coordinator')

        return { success: true }
    } catch (error) {
        console.error('Failed to register interaction (Supabase):', error)
        return { success: false, error: 'Failed to register interaction' }
    }
}

export async function registerHedonicEvaluation(data: {
    studentId: string,
    weight?: string | number,
    height?: string | number,
    imc?: string | number,
    rhythmPref?: string,
    tolerance?: string,
    intensityAgreement?: number,
    funFeedback?: string,
    anticipatedFeel?: string,
    likes?: string,
    dislikes?: string,
    varietyVsRoutine?: string,
    trainingTime?: string,
    objective?: string,
    trainingMod?: string,
    notes?: string,
    barrierType?: string,
    professorName: string
}) {
    try {
        const identifier = isNaN(Number(data.studentId)) ? { id: data.studentId } : { id_evo: data.studentId };
        const { data: student } = await supabase.from('alunos').select('id, id_evo').match(identifier).single();
        if (!student) throw new Error('Student not found');

        const timestamp = new Date().toISOString();

        // 1. Log to Monitoramento_Hedonico
        await supabase.from('monitoramento_hedonico').insert({
            data_hora: timestamp,
            aluno_id: student.id,
            peso: parseFloat(String(data.weight || '0')),
            estatura: parseFloat(String(data.height || '0')),
            imc: parseFloat(String(data.imc || '0.0')),
            preferencia_ritmo: data.rhythmPref || 'N/A',
            tolerancia_queimacao: data.tolerance || 'N/A',
            acordo_intensidade: data.intensityAgreement ?? 5,
            feedback_afeto: data.funFeedback || 'N/A',
            sentimento_antecipado: data.anticipatedFeel || 'N/A',
            gosta: data.likes || 'N/A',
            detesta: data.dislikes || 'N/A',
            variedade_rotina: data.varietyVsRoutine || 'N/A',
            tempo_treino: data.trainingTime || 'N/A',
            objetivo_sessao: data.objective || 'N/A',
            modificacao_tecnica: data.trainingMod || 'N/A',
            observacoes: data.notes || 'N/A',
            professor: data.professorName || 'Professor',
            acao_tomada: 'Ajuste Hedônico - Professor'
        });

        // 2. Also log a general interaction for history
        await supabase.from('logs_interacoes').insert({
            data_hora: timestamp,
            aluno_id: student.id,
            tipo: 'Professor_Adjustment',
            mensagem: `Ajuste Hedônico: ${data.trainingMod || 'Geral'}. ${data.notes || ''}`,
            status_entrega: 'OK',
            classificacao: data.barrierType || 'N/A',
            role: 'Professor'
        });

        // 3. Update student
        await supabase.from('alunos').update({
            barreira: data.barrierType || 'N/A',
            updated_at: timestamp
        }).eq('id', student.id);

        revalidatePath('/reception')
        revalidatePath('/professor')
        revalidatePath('/coordinator')

        return { success: true };
    } catch (error) {
        console.error('Failed to register hedonic evaluation:', error);
        return { success: false, error: 'Failed to save evaluation' };
    }
}
