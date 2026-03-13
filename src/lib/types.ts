
export type Band = 'Red' | 'Yellow' | 'Green' | 'Blue' | 'Unknown';

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
    barrier: string | null;
    lastWorkoutDate?: Date | null;
    updatedAt: Date;
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
