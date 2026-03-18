
'use server'

import { Student, Band } from '@/lib/types'
import { getAllAtRiskStudents, registerReceptionLog, getStudentByEvoId } from '@/lib/students'
import { sendWhatsAppMessage } from '@/lib/whatsapp'
import { supabase } from '@/lib/supabase'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getStatusFromScore } from '@/lib/score';
import { format } from 'date-fns';

export async function getAllBaseStudents(unit?: string) {
    try {
        let query = supabase.from('alunos').select('*');
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
                frequency: 0,
                consistency: 0,
            };
        });
    } catch (error) {
        console.error('Error fetching all base students from Supabase:', error);
        return [];
    }
}

export async function searchStudent(query: string, unit?: string) {
    if (!query) return null;
    try {
        const student = await getStudentByEvoId(query, unit);
        return student;
    } catch (error) {
        console.error('Search Student Error:', error);
        return null;
    }
}

export async function getRiskList(unit?: string) {
    try {
        // 1. Get students at risk (Red or Yellow)
        const residents = await getAllAtRiskStudents(unit);

        // 2. Fetch recent interactions from Supabase
        const { data: interactions } = await supabase
            .from('logs_interacoes')
            .select(`
                *,
                alunos(id_evo)
            `)
            .in('tipo', ['Recebimento', 'Acolhimento'])
            .order('data_hora', { ascending: false });

        // 3. Map interactions
        return residents.map(s => {
            const studentInteractions = (interactions || [])
                .filter((i: any) => i.alunos?.id_evo === s.evoId);

            const lastWhatsApp = studentInteractions.find((i: any) => i.tipo === 'Recebimento');
            const lastReception = studentInteractions.find((i: any) => i.tipo === 'Acolhimento');

            return {
                ...s,
                barrier: lastWhatsApp?.mensagem || s.barrier || 'Aguardando diagnóstico via WhatsApp...',
                barrierType: s.barrierType || 'N/A',
                awaitingProfessor: !!lastReception && (new Date().getTime() - new Date(lastReception.data_hora).getTime() < 1000 * 60 * 60 * 4) // 4 hour window
            }
        });
    } catch (error) {
        console.error('Data Fetch Error (Supabase):', error);
        return [];
    }
}

export async function registerCheckIn(evoId: string) {
    await supabase.from('alunos').update({
        ultima_presenca: new Date().toISOString()
    }).eq('id_evo', evoId);
    return { success: true };
}

export async function finalizeAccomodation(studentId: string, actions: string[]) {
    try {
        // studentId here is the UUID in Supabase (or evoId if passed from UI)
        // If it's a UUID, we can use it directly. If it's numeric, search by id_evo.
        const identifier = isNaN(Number(studentId)) ? { id: studentId } : { id_evo: studentId };
        
        const { data: student } = await supabase.from('alunos').select('id, id_evo').match(identifier).single();
        if (!student) return { success: false, error: 'Student not found' };

        const content = `[Acolhimento Recepção] Ações: ${actions.join(', ')}`;
        
        await supabase.from('logs_interacoes').insert({
            aluno_id: student.id,
            tipo: 'Acolhimento',
            mensagem: content,
            status_entrega: 'OK',
            role: 'Recepção'
        });

        await supabase.from('alunos').update({
            updated_at: new Date().toISOString()
        }).eq('id', student.id);

        return { success: true };
    } catch (error) {
        console.error('Finalize Accomodation Error:', error);
        return { success: false, error: String(error) };
    }
}

export async function checkNewAcolhimentos(lastSeenTimestamp: string) {
    const { data: newAcolhimentos } = await supabase
        .from('logs_interacoes')
        .select('data_hora')
        .eq('tipo', 'Acolhimento')
        .gt('data_hora', lastSeenTimestamp)
        .order('data_hora', { ascending: false });

    return {
        hasUpdates: (newAcolhimentos?.length || 0) > 0,
        latest: newAcolhimentos?.[0]?.data_hora || lastSeenTimestamp
    };
}

export async function updateMessageStatus(evoId: string, message: string) {
    const timestamp = new Date().toISOString();
    const { updateRowById, appendToSheet } = await import('@/lib/sheets');

    await updateRowById('Base_Alunos', 'ID_EVO', evoId, {
        updated_at: timestamp,
        last_button_click: timestamp,
        status_envio: 'enviado'
    });
    
    await appendToSheet('Logs_Interacoes', {
        Data_Hora: timestamp,
        ID_Aluno: evoId,
        Tipo: 'Hook_Message',
        Mensagem: `WhatsApp Enviado manualmente pela Recepção: ${message.substring(0, 100)}...`,
        Status_Entrega: 'OK',
        Classificacao: 'N/A',
        Role: 'Recepção'
    });
    
    return { success: true };
}


export async function sendAutomaticMessage(evoId: string, phone: string, rawMessage: string): Promise<{ success: boolean; error?: any }> {
    try {
        const session = await getServerSession(authOptions);
        const userName = session?.user?.name || session?.user?.email || 'Sistema';

        // 1. Fetch student for personalization
        const { data: student, error: studentError } = await supabase.from('alunos').select('*').eq('id_evo', evoId).single();
        
        if (studentError || !student) {
            console.error('[Supabase] Student not found for ID:', evoId);
            return { success: false, error: 'Aluno não encontrado no banco de dados.' };
        }

        const firstName = (student.nome || 'Aluno').split(' ')[0];
        const lastWorkout = student.ultima_presenca 
            ? format(new Date(student.ultima_presenca), "dd/MM/yyyy") 
            : 'um tempo';

        const personalizedMessage = rawMessage
            ? rawMessage.replace(/{{nome}}/g, firstName).replace(/{{Ultima_Presenca}}/g, lastWorkout)
            : `[Meta Template: mensagem_1] Olá, ${firstName}...`;
        const finalLogMessage = personalizedMessage || `[Meta Template: mensagem_1] Olá, ${firstName}...`;

        // 2. Send WhatsApp using Meta Template 'mensagem_1'
        const result: any = await sendWhatsAppMessage(phone, personalizedMessage, {
            studentName: firstName,
            templateName: 'mensagem_1'
        });

        if (!result.success) {
            console.error('[WhatsApp API] Failed to send message:', result.error);
            return { success: false, error: result.error };
        }

        // 3. Update student in Supabase + Google Sheets (Dual-Write)
        const now = new Date();
        const timestamp = now.toISOString();

        const { updateRowById, appendToSheet } = await import('@/lib/sheets');

        await updateRowById('Base_Alunos', 'ID_EVO', evoId, {
            updated_at: timestamp,
            last_button_click: timestamp,
            status_envio: 'Mensagem Enviada',
            data_envio: format(now, 'dd/MM/yyyy'),
            hora_envio: format(now, 'HH:mm:ss'),
            usuario_envio: userName
        });

        // 4. Log interaction in BOTH Supabase and Google Sheets
        await appendToSheet('Logs_Interacoes', {
            Data_Hora: timestamp,
            ID_Aluno: evoId,
            Tipo: 'Acolhimento',
            Mensagem: finalLogMessage,
            Status_Entrega: 'OK',
            Status_Envio: 'OK',
            Classificacao: 'N/A',
            Role: 'Recepção',
            metadata: {
                whatsapp_result: result.data || result,
                whatsapp_mode: result.mode || 'LIVE',
                template_used: 'mensagem_1',
                recipient_phone: phone,
                sender_user: userName
            }
        });

        return { success: true };
    } catch (error: any) {
        console.error('Send message exception:', error);
        return { success: false, error: error.message || 'Erro inesperado no servidor' };
    }
}
