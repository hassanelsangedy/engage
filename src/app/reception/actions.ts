
'use server'

import prisma from '@/lib/db'
import { Student } from '@/lib/types'

export async function searchStudent(query: string) {
    if (!query) return null;

    const student = await prisma.student.findFirst({
        where: {
            OR: [
                { evoId: query },
                { name: { contains: query } }
            ]
        },
    });

    return student;
}

export async function getRiskList(unit?: string) {
    const where: any = {
        band: { in: ['Red', 'Yellow'] }
    };

    if (unit) {
        where.unit = { contains: unit, mode: 'insensitive' };
    }

    return await prisma.student.findMany({
        where,
        orderBy: [
            { band: 'asc' },
            { updatedAt: 'desc' }
        ],
        take: 50
    }) as unknown as Student[];
}

export async function registerCheckIn(evoId: string) {
    const student = await prisma.student.update({
        where: { evoId },
        data: {
            lastWorkoutDate: new Date(),
            updatedAt: new Date()
        }
    });

    return student;
}
