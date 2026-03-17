
'use server'

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getSheetRows, appendToSheet } from '@/lib/sheets'
import { revalidatePath } from 'next/cache'

export async function getHedonicAnalytics() {
    try {
        const [hedonicoRows, baseRows] = await Promise.all([
            getSheetRows('Monitoramento_Hedonico'),
            getSheetRows('Base_Alunos')
        ]);

        // Create a lookup for student bands
        const studentBands: Record<string, string> = {};
        baseRows.forEach((r: any) => {
            const evoId = String(r.ID_EVO || '');
            const band = r.Faixa_Cor || 'N/A';
            if (evoId) studentBands[evoId] = band;
        });

        // Enhance hedonico data with bands
        const enhancedData = hedonicoRows.map((r: any) => ({
            ...r,
            band: studentBands[String(r.ID_Aluno)] || 'N/A',
            imc: parseFloat(r.IMC) || 0,
            satisfaction: mapSatisfaction(r.Feedback_Afeto)
        }));

        return enhancedData;
    } catch (error) {
        console.error('Failed to fetch hedonic analytics:', error);
        return [];
    }
}

function mapSatisfaction(feedback: string): number {
    switch (feedback) {
        case 'Gostei muito': return 10;
        case 'Gostei': return 7;
        case 'Neutro': return 5;
        case 'Detestei': return 0;
        default: return 5;
    }
}

export async function saveCoordinatorFeedback(data: {
    professorName: string,
    message: string
}) {
    try {
        const session = await getServerSession(authOptions);
        const coordinatorName = session?.user?.name || 'Coordenador';

        await appendToSheet('Feedback_Coordenador', {
            Data: new Date().toISOString().split('T')[0],
            Data_Hora: new Date().toISOString(),
            Professor: data.professorName,
            Mensagem: data.message,
            Coordenador: coordinatorName,
            Status: 'Pendente'
        });

        revalidatePath('/coordinator/analytics');
        revalidatePath('/professor'); // So the professor sees the alert
        return { success: true };
    } catch (error) {
        console.error('Failed to save coordinator feedback:', error);
        return { success: false, error: 'Erro ao salvar feedback' };
    }
}
