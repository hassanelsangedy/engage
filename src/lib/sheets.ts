
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { supabase } from './supabase';

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || '1wb_CVBbFbasy9cvZFVyhZOLwZkcpUyrsvFP6a_OlbNo';

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
        'role': 'Role',
        'metadata': 'Metadata' // To allow it to pass through to DB
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

/**
 * Helper to get Sheet Instance (with Auth)
 */
async function getSheetDoc() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!email || !key) {
        throw new Error('Google credentials missing - set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY');
    }

    const auth = new JWT({
        email: email,
        key: key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, auth);
    await doc.loadInfo();
    return doc;
}

function mapToSheet(table: string, data: any) {
    const map = COLUMN_MAP[table];
    if (!map) return data;
    const result: any = {};
    for (const [dbKey, sheetKey] of Object.entries(map)) {
        if (data[dbKey] !== undefined) {
            result[sheetKey] = data[dbKey];
        } else if (data[sheetKey] !== undefined) {
            result[sheetKey] = data[sheetKey];
        }
    }
    // Handle IDs
    if (data.id) result.ID_Geral = data.id;
    if (data.id_evo) result.ID_Aluno = data.id_evo;
    if (data.aluno_id && !result.ID_Aluno) {
        // If we have aluno_id (UUID), we might need to resolve it back to EVO ID for the sheet?
        // But the mapping usually happens the other way.
    }

    return result;
}

function mapToDb(table: string, data: any) {
    const map = COLUMN_MAP[table];
    if (!map) return data;
    const result: any = {};
    for (const [dbKey, sheetKey] of Object.entries(map)) {
        if (data[sheetKey] !== undefined) {
            result[dbKey] = data[sheetKey];
        } else if (data[dbKey] !== undefined) {
            result[dbKey] = data[dbKey]; // Already in DB format
        }
    }
    // Specific logic for UUID foreign keys and JSONB metadata
    if (table === 'logs_interacoes' || table === 'monitoramento_hedonico') {
        if (data.aluno_id) result.aluno_id = data.aluno_id;
        if (data.metadata) result.metadata = data.metadata;
    }
    return result;
}

/**
 * Fetch rows from Supabase (mapped to Sheet names if possible)
 */
export async function getSheetRows(sheetTitle: string) {
    const table = TABLE_MAP[sheetTitle];
    if (!table) return [];

    let query = supabase.from(table).select('*');
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

/**
 * Append to BOTH Supabase and Google Sheet
 */
export async function appendToSheet(sheetTitle: string, data: any) {
    try {
        const table = TABLE_MAP[sheetTitle] || sheetTitle;
        const dbData = mapToDb(table, data);
        
        let targetId = data.ID_Aluno || data.id_evo;

        // 1. Resolve alumno_id (UUID) from ID_Aluno (EVO ID) for DB if missing
        if (targetId && !dbData.aluno_id && (table === 'logs_interacoes' || table === 'monitoramento_hedonico')) {
            const { data: student } = await supabase.from('alunos').select('id, telefone').eq('id_evo', targetId).single();
            if (student) {
                dbData.aluno_id = student.id;
                // If the sheet data doesnt have a phone, we can add it from the DB student
                if (!data.Telefone && student.telefone) data.Telefone = student.telefone;
            }
        }

        console.log(`[Dual-Write] Inserting into Supabase ${table}...`, dbData);
        // 2. Insert into Supabase
        const { error: dbError } = await supabase.from(table).insert([dbData]);
        if (dbError) {
            console.error('[Supabase Sync Error]:', dbError);
        }

        // 3. Insert into Google Sheet (The Mirror)
        let syncStatus = 'Success';
        try {
            const doc = await getSheetDoc();
            const sheet = doc.sheetsByTitle[sheetTitle];
            if (sheet) {
                const sheetData = mapToSheet(table, data);
                if (targetId) sheetData.ID_Aluno = targetId;
                if (data.Telefone) sheetData.Telefone = data.Telefone;
                
                await sheet.addRow(sheetData);
                console.log(`[Google Sheets API] Sync OK: Row added to ${sheetTitle}`);
            } else {
                syncStatus = 'Error: Sheet Not Found';
                console.warn(`[Google Sheets] Sheet "${sheetTitle}" not found`);
            }
        } catch (err: any) {
            syncStatus = `Error: ${err.message}`;
            console.error(`[Google Sheets Sync Error] ${sheetTitle}:`, err.message);
        }

        // Update the Supabase record with sync status if it was a log
        if (table === 'logs_interacoes' && data.metadata) {
             // Optional: we could update the previous insert, but for now let's just log it
        }

    } catch (error) {
        console.error(`[Dual-Write Sync Error] appendToSheet(${sheetTitle}):`, error);
    }
}

/**
 * Update BOTH Supabase and Google Sheet
 */
export async function updateRowById(sheetTitle: string, idColumn: string, idValue: string, updateData: any) {
    try {
        const table = TABLE_MAP[sheetTitle] || sheetTitle;
        const dbData = mapToDb(table, updateData);
        
        // 1. Update Supabase
        let query = supabase.from(table).update(dbData);
        if (idColumn === 'ID_EVO' || idColumn === 'ID_Aluno' || idColumn === 'id_evo') {
            query = query.eq('id_evo', idValue);
        } else if (idColumn === 'ID_Geral' || idColumn === 'id') {
            query = query.eq('id', idValue);
        } else {
            query = query.eq(idColumn, idValue);
        }
        const { error: dbError } = await query;

        // 2. Update Google Sheet
        const doc = await getSheetDoc();
        const sheet = doc.sheetsByTitle[sheetTitle];
        if (sheet) {
            const rows = await sheet.getRows();
            const row = rows.find(r => r.get(idColumn) == idValue);
            if (row) {
                const sheetUpdate = mapToSheet(table, updateData);
                for (const [key, value] of Object.entries(sheetUpdate)) {
                    row.set(key, value);
                }
                const now = new Date();
                row.set('Ultima_Interacao', `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`);
                await row.save();
                console.log(`[Google Sheets API] Sync OK: Updated ${idValue} in ${sheetTitle}`);
            }
        }
        return !dbError;
    } catch (error) {
        console.error(`[Dual-Write Sync Error] updateRowById(${sheetTitle}):`, error);
        return false;
    }
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

export async function findRowByColumn(sheetTitle: string, columnName: string, columnValue: string) {
    const table = TABLE_MAP[sheetTitle];
    if (table) {
        const { data } = await supabase.from(table).select('*').eq(columnName, columnValue).limit(1).single();
        if (data) return mapToSheet(table, data);
    }
    return null;
}
