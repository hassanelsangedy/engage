
'use server'

import prisma from '@/lib/db'

export async function getAtRiskStudents(unit?: string) {
    const where: any = {
        band: { in: ['Red', 'Yellow'] }
    };

    if (unit) {
        where.unit = { contains: unit, mode: 'insensitive' };
    }

    return await prisma.student.findMany({
        where,
        orderBy: [
            { band: 'asc' }, // Red first then Yellow
            { updatedAt: 'desc' }
        ],
        take: 100
    });
}
