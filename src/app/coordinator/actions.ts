
'use server'

import prisma from '@/lib/db'

export async function getFinishedStudents(unit?: string) {
    // A student "finished training" if they had a Professor_Adjustment today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const interactions = await prisma.interaction.findMany({
        where: {
            type: 'Professor_Adjustment',
            createdAt: { gte: startOfDay },
            student: unit ? { unit: { contains: unit, mode: 'insensitive' } } : {}
        },
        include: {
            student: true
        },
        orderBy: { createdAt: 'desc' }
    });

    // Remove duplicates (same student could have multiple adjustments, unlikely but possible)
    const uniqueStudents = Array.from(new Map(interactions.map(i => [i.student.id, i.student])).values());

    return uniqueStudents;
}
