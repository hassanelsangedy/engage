
'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

// Import logic (duplicated here for now since score.ts is shared utils but server actions must be self-contained or import pure logic)

export async function importStudents(data: { name: string; evoId: string; unit: string; frequency: number; consistency: number }[]) {
    let count = 0;
    const processDate = new Date();
    const currentMonth = processDate.toISOString().substring(0, 7); // e.g., "2026-02"

    for (const row of data) {
        // Score logic
        let freqScore = 1;
        if (row.frequency >= 10) freqScore = 4;
        else if (row.frequency >= 6) freqScore = 3;
        else if (row.frequency >= 3) freqScore = 2;

        let consScore = 1;
        if (row.consistency >= 4) consScore = 4;
        else if (row.consistency >= 3) consScore = 3;
        else if (row.consistency >= 2) consScore = 2;

        const total = freqScore + consScore;

        let band = "Green";
        if (total <= 3) band = "Red";
        else if (total <= 5) band = "Yellow";

        // Upsert Student
        const student = await prisma.student.upsert({
            where: { evoId: String(row.evoId) }, // Ensure string
            update: {
                frequency: row.frequency,
                consistency: row.consistency,
                score: total,
                band: band,
                unit: row.unit,
                updatedAt: new Date()
            },
            create: {
                evoId: String(row.evoId),
                name: row.name,
                unit: row.unit,
                frequency: row.frequency,
                consistency: row.consistency,
                score: total,
                band: band
            }
        })

        // Create History record
        await prisma.attendanceHistory.create({
            data: {
                studentId: student.id,
                month: currentMonth,
                frequency: row.frequency,
                consistency: row.consistency,
                score: total,
                band: band
            }
        })

        count++;
    }

    revalidatePath('/admin');
    revalidatePath('/reception');
    revalidatePath('/professor');
    revalidatePath('/coordinator');

    return { success: true, count };
}

export async function getStats(unit?: string) {
    const where: any = {};
    if (unit) {
        where.unit = { contains: unit, mode: 'insensitive' };
    }

    const red = await prisma.student.count({ where: { ...where, band: 'Red' } });
    const yellow = await prisma.student.count({ where: { ...where, band: 'Yellow' } });
    const green = await prisma.student.count({ where: { ...where, band: 'Green' } });
    const total = await prisma.student.count({ where });

    // Interactions logic could be filtered by unit if we relate interactive to student unit, but for now just general count or join.
    // Simplifying: we'll count all interactions for now as Interaction table doesn't have Unit directly, 
    // it relates to Student.

    // Improved Interaction Count with relation:
    const interactions = await prisma.interaction.count({
        where: unit ? {
            student: {
                unit: { contains: unit, mode: 'insensitive' }
            }
        } : {}
    });

    return { red, yellow, green, total, interactions };
}
