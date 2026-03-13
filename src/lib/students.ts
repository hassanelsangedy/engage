
import { getSheetRows, updateRowById, appendToSheet } from './sheets';
import { Student, Band } from './types';

export async function getAllAtRiskStudents(unit?: string): Promise<Student[]> {
    try {
        const rows = await getSheetRows('Base_Alunos');

        return rows
            .filter((r: any) => {
                const isAtRisk = ['Vermelha', 'Amarela', 'Red', 'Yellow'].includes(r.Faixa_Cor);
                if (!isAtRisk) return false;
                if (unit && r.Unidade && !r.Unidade.toLowerCase().includes(unit.toLowerCase())) return false;
                return true;
            })
            .map((r: any) => ({
                id: r.ID_Geral || r.ID_Aluno || String(r.ID_EVO),
                evoId: String(r.ID_EVO || r.ID_Aluno),
                name: r.Nome || 'Aluno sem Nome',
                unit: r.Unidade || null,
                phone: r.Telefone || null,
                frequency: Number(r.Frequencia_Mensal) || 0,
                consistency: Number(r.Consistencia_Semanal) || 0,
                score: Number(r.Pontuacao_Risco) || 0,
                band: (r.Faixa_Cor === 'Vermelha' || r.Faixa_Cor === 'Red') ? 'Red' : 'Yellow' as Band,
                barrier: r.Barreira_Relatada || null,
                barrierType: r.Classificacao_IA || null,
                lastWorkoutDate: r.Ultima_Presenca ? new Date(r.Ultima_Presenca) : null,
                updatedAt: new Date(r.Ultima_Interacao || Date.now())
            }));
    } catch (error) {
        console.error('Error fetching students from Sheets:', error);
        return [];
    }
}

export async function getStudentByEvoId(evoId: string): Promise<Student | null> {
    const rows = await getSheetRows('Base_Alunos');
    const row = rows.find((r: any) => String(r.ID_EVO || r.ID_Aluno) === evoId);
    if (!row) return null;

    return {
        id: row.ID_Geral || row.ID_Aluno || String(row.ID_EVO),
        evoId: String(row.ID_EVO || row.ID_Aluno),
        name: row.Nome || 'Aluno sem Nome',
        unit: row.Unidade || null,
        phone: row.Telefone || null,
        frequency: Number(row.Frequencia_Mensal) || 0,
        consistency: Number(row.Consistencia_Semanal) || 0,
        score: Number(row.Pontuacao_Risco) || 0,
        band: (row.Faixa_Cor === 'Vermelha' || row.Faixa_Cor === 'Red') ? 'Red' : 'Yellow' as Band,
        barrier: row.Barreira_Relatada || null,
        barrierType: row.Classificacao_IA || null,
        lastWorkoutDate: row.Ultima_Presenca ? new Date(row.Ultima_Presenca) : null,
        updatedAt: new Date(row.Ultima_Interacao || Date.now())
    };
}

export async function registerReceptionLog(evoId: string, content: string) {
    await appendToSheet('Logs_Interacoes', {
        Data_Hora: new Date().toISOString(),
        ID_Aluno: evoId,
        Tipo: 'Acolhimento',
        Mensagem: content,
        Status_Entrega: 'OK'
    });

    // Update the signaling flag for the professor dashboard
    // We'll use a specific column 'Acolhimento_Pendente' if it exists, or just update 'Ultima_Interacao'
    await updateRowById('Base_Alunos', 'ID_EVO', evoId, {
        Acolhimento_Pendente: 'Sim',
        Ultima_Interacao: new Date().toISOString()
    });
}
