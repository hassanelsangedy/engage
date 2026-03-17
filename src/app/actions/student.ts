
'use server'

import { getAllAtRiskStudents } from '@/lib/students'

export async function getAtRiskStudents(unit?: string) {
    return await getAllAtRiskStudents(unit);
}
