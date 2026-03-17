
import { supabase } from './supabase';

const TABLE_MAP: Record<string, string> = {
    'Base_Alunos': 'alunos',
    'Logs_Interacoes': 'logs_interacoes',
    'Perfil_Professores': 'perfil_professores',
    'Monitoramento_Hedonico': 'monitoramento_hedonico',
    'Diagnostico_Respostas': 'diagnostico_respostas'
};

const COLUMN_MAP: Record<string, Record<string, string>> = {
    'alunos': {
        'id_evo': 'ID_EVO',
        'nome': 'Nome',
        'telefone': 'Telefone',
        'pontuacao_risco': 'Pontuacao_Risco',
        'status_adesao': 'Status_Adesao',
        'barreira': 'Barreira',
        'barreira_relatada': 'Barreira_Relatada',
        'ultima_presenca': 'Ultima_Presenca',
        'unidade': 'Unidade',
        'faixa_cor': 'Faixa_Cor',
        'professor_referencia': 'Professor_Referencia',
        'updated_at': 'Ultima_Interacao',
        'status_envio': 'Status_Envio',
        'data_envio': 'Data_Envio',
        'hora_envio': 'Hora_Envio',
        'usuario_envio': 'Usuario_Envio',
        'last_button_click': 'LastButtonClick',
        'acolhimento_pendente': 'Acolhimento_Pendente'
    },
    'logs_interacoes': {
        'data_hora': 'Data_Hora',
        'tipo': 'Tipo',
        'mensagem': 'Mensagem',
        'status_entrega': 'Status_Entrega',
        'classificacao': 'Classificacao',
        'role': 'Role'
    },
    'perfil_professores': {
        'nome': 'Nome',
        'especialidade': 'Especialidade',
        'media_autonomia': 'Media_Autonomia',
        'media_competencia': 'Media_Competencia',
        'media_relacionamento': 'Media_Relacionamento',
        'pr': 'PR',
        'per': 'PER',
        'soft_skills': 'Soft_Skills'
    }
};

function mapToSheet(table: string, data: any) {
    const map = COLUMN_MAP[table];
    if (!map) return data;
    const result: any = {};
    for (const [dbKey, sheetKey] of Object.entries(map)) {
        if (data[dbKey] !== undefined) {
            result[sheetKey] = data[dbKey];
        } else if (data[sheetKey] !== undefined) {
            result[sheetKey] = data[sheetKey]; // Already mapped or using sheet key
        }
    }
    // Add internal ID
    if (data.id) result.ID_Geral = data.id;
    if (data.id_evo) result.ID_Aluno = data.id_evo;

    return { ...data, ...result };
}

function mapToDb(table: string, data: any) {
    const map = COLUMN_MAP[table];
    if (!map) return data;
    const result: any = {};
    for (const [dbKey, sheetKey] of Object.entries(map)) {
        if (data[sheetKey] !== undefined) {
            result[dbKey] = data[sheetKey];
        }
    }
    return result;
}

export async function getSheetRows(sheetTitle: string) {
    const table = TABLE_MAP[sheetTitle];
    if (!table) return [];

    let query = supabase.from(table).select('*');
    
    // For logs, join with student to get ID_Aluno (evo_id)
    if (table === 'logs_interacoes' || table === 'monitoramento_hedonico' || table === 'diagnostico_respostas') {
        query = query.select('*, alunos(id_evo)');
    }

    const { data, error } = await query;
    if (error) {
        console.error(`[Supabase] Error fetching ${sheetTitle}:`, error);
        return [];
    }

    return data.map(row => {
        const mapped = mapToSheet(table, row);
        if (row.alunos) {
            mapped.ID_Aluno = row.alunos.id_evo;
        }
        return mapped;
    });
}

export async function appendToSheet(sheetTitle: string, data: any) {
    const table = TABLE_MAP[sheetTitle];
    if (!table) return;

    const dbData = mapToDb(table, data);
    
    // Resolve aluno_id from ID_Aluno (evo_id)
    if (data.ID_Aluno && !dbData.aluno_id) {
        const { data: student } = await supabase.from('alunos').select('id').eq('id_evo', data.ID_Aluno).single();
        if (student) dbData.aluno_id = student.id;
    }

    const { error } = await supabase.from(table).insert([dbData]);
    if (error) console.error(`[Supabase] Error inserting into ${sheetTitle}:`, error);
}

export async function updateRowById(sheetTitle: string, idColumn: string, idValue: string, updateData: any) {
    const table = TABLE_MAP[sheetTitle];
    if (!table) return false;

    const dbData = mapToDb(table, updateData);
    
    let query = supabase.from(table).update(dbData);
    if (idColumn === 'ID_EVO' || idColumn === 'ID_Aluno') {
        query = query.eq('id_evo', idValue);
    } else {
        query = query.eq('id', idValue);
    }

    const { error } = await query;
    if (error) {
        console.error(`[Supabase] Error updating ${sheetTitle}:`, error);
        return false;
    }
    return true;
}

export async function findStudentByPhone(phone: string) {
    const { data, error } = await supabase
        .from('alunos')
        .select('*')
        .or(`telefone.eq.${phone},telefone.ilike.%${phone.replace(/^55/, '')}%`)
        .limit(1)
        .single();

    if (error || !data) return null;
    return mapToSheet('alunos', data);
}

export async function getRecentSheetRows(sheetTitle: string, limit: number = 10) {
    const table = TABLE_MAP[sheetTitle];
    if (!table) return [];

    const { data, error } = await supabase
        .from(table)
        .select('*, alunos(id_evo)')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) return [];
    return data.map(row => {
        const mapped = mapToSheet(table, row);
        if (row.alunos) mapped.ID_Aluno = row.alunos.id_evo;
        return mapped;
    });
}

// Preserve other functions by mapping or implementing
export async function updateSheetRow(sheetTitle: string, campaignTitle: string, updateData: any) {
    // This is for Campaigns, which I haven't migrated yet
    console.warn('updateSheetRow (Campaigns) not yet implemented for Supabase');
}

export async function findRowByColumn(sheetTitle: string, columnName: string, columnValue: string) {
    const table = TABLE_MAP[sheetTitle];
    if (!table) return null;
    
    const { data } = await supabase.from(table).select('*').eq(columnName, columnValue).limit(1).single();
    return data ? mapToSheet(table, data) : null;
}
