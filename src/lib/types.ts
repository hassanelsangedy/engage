
export type Band = 'Red' | 'Yellow' | 'Green' | 'Blue' | 'Unknown';
export type StatusAdesao = 'Risco Crítico' | 'Alerta' | 'Ideal' | 'Super Ativo' | 'Desconhecido';

export interface Student {
    id: string;
    evoId: string;
    name: string;
    unit: string | null;
    phone?: string | null;
    frequency: number;
    consistency: number;
    score: number;
    band: Band;
    statusAdesao?: StatusAdesao;
    barrier: string | null;
    barrierType: string | null;
    lastWorkoutDate?: Date | null;
    updatedAt: Date;
    lastMessageDate?: Date | null;
    lastButtonClick?: Date | null;
    message?: string;
    shift?: string | null;
    messageSentStatus?: 'pendente' | 'enviado' | 'erro' | 'Enviado via API' | 'Mensagem Enviada';
}

export interface Interaction {
    id: string;
    studentId: string;
    type: 'Reception_Alert' | 'Professor_Adjustment' | 'Coordinator_Review' | 'Hook_Message' | 'FollowUp_24h' | 'Generic' | 'Student_Response';
    content: string | null;
    outcome: string | null;
    staffRole: string | null;
    createdAt: Date;
}

export interface EfficacyReport {
    migrationRate: number;
    totalAtRisk: number;
    intervention: {
        rate: number;
        count: number;
        migrated: number;
    };
    control: {
        rate: number;
        count: number;
        migrated: number;
    };
}

export interface Campaign {
    id: string;
    title: string;
    audience: string;
    frequency: number;
    messageContent: string;
    isActive: boolean;
    cron: string | null;
    hora: string | null;
    diasSemana: string | null;
    frequencyLabel: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export type Role = 'ADMIN' | 'COORDINATOR' | 'PROFESSOR' | 'RECEPTION';

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: Role;
    unit?: string | null;
    createdAt: Date;
}
