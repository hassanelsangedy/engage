
'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { calculateScore } from '@/lib/score'
import { appendToSheet } from '@/lib/sheets'

// Import logic
export async function importStudents(data: { name: string; evoId: string; unit: string; frequency: number; consistency: number }[]) {
    let count = 0;
    const processDate = new Date();
    const currentMonth = processDate.toISOString().substring(0, 7); // e.g., "2026-02"

    for (const row of data) {
        const { total, band } = calculateScore(row.frequency, row.consistency);

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
    const blue = await prisma.student.count({ where: { ...where, band: 'Blue' } });
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

    return { red, yellow, green, blue, total, interactions };
}

export async function getEfficacyReport() {
    // 1. Get all students who were in RED band at any point in history
    const historyRed = await prisma.attendanceHistory.findMany({
        where: { band: 'Red' },
        select: { studentId: true },
        distinct: ['studentId']
    });

    const atRiskIds = historyRed.map(h => h.studentId);

    if (atRiskIds.length === 0) {
        return {
            migrationRate: 0,
            intervention: { rate: 0, count: 0 },
            control: { rate: 0, count: 0 }
        };
    }

    // 2. Fetch current status of these specifically identified students
    const studentsAtRisk = await prisma.student.findMany({
        where: { id: { in: atRiskIds } },
        include: {
            _count: {
                select: { interactions: true }
            }
        }
    });

    // Groups
    const interventionGroup = studentsAtRisk.filter(s => s._count.interactions > 0);
    const controlGroup = studentsAtRisk.filter(s => s._count.interactions === 0);

    const calculateMigration = (group: typeof studentsAtRisk) => {
        if (group.length === 0) return 0;
        const migrated = group.filter(s => s.band !== 'Red').length;
        return Math.round((migrated / group.length) * 100);
    };

    const globalMigration = calculateMigration(studentsAtRisk);
    const interventionRate = calculateMigration(interventionGroup);
    const controlRate = calculateMigration(controlGroup);

    return {
        migrationRate: globalMigration,
        totalAtRisk: studentsAtRisk.length,
        intervention: {
            rate: interventionRate,
            count: interventionGroup.length,
            migrated: interventionGroup.filter(s => s.band !== 'Red').length
        },
        control: {
            rate: controlRate,
            count: controlGroup.length,
            migrated: controlGroup.filter(s => s.band !== 'Red').length
        }
    };
}

export async function saveCampaign(data: { title: string, audience: string, frequency: number, content: string }) {
    const campaign = await prisma.campaign.create({
        data: {
            title: data.title,
            audience: data.audience,
            frequency: data.frequency,
            messageContent: data.content,
            isActive: true
        }
    });

    // Real Google Sheets Integration
    try {
        await appendToSheet('Config_Campanhas', {
            Data: new Date().toISOString(),
            Campanha: campaign.title,
            Publico: campaign.audience,
            Frequencia: `${campaign.frequency}d`,
            Conteudo: campaign.messageContent,
            Status: campaign.isActive ? 'Ativo' : 'Inativo'
        });
    } catch (e) {
        console.error('Failed to sync campaign to Google Sheets:', e);
    }

    revalidatePath('/admin');
    return { success: true, campaign };
}

export async function getCampaigns() {
    return await prisma.campaign.findMany({
        orderBy: { createdAt: 'desc' }
    });
}

export async function getRetentionIntelligence() {
    // Funnel Mock (In real app, query different interaction types)
    const funnel = {
        sent: await prisma.interaction.count({ where: { type: 'Hook_Message' } }),
        responses: await prisma.interaction.count({ where: { type: 'Student_Response' } }),
        reception: await prisma.interaction.count({ where: { type: 'Reception_Alert' } }),
        adjustment: await prisma.interaction.count({ where: { type: 'Professor_Adjustment' } }),
        validation: await prisma.interaction.count({ where: { type: 'Coordinator_Review' } })
    };

    // BI vs BE
    const biCount = await prisma.interaction.count({ where: { barrierType: 'BI' } });
    const beCount = await prisma.interaction.count({ where: { barrierType: 'BE' } });
    const totalBarrier = biCount + beCount;
    const biRatio = totalBarrier > 0 ? (biCount / totalBarrier) * 100 : 0;

    // Training Mods
    const trainingMods = await prisma.interaction.findMany({
        where: { trainingMod: { not: null } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { student: true }
    });

    // Ombuds Feedbacks
    const feedbacks = await prisma.interaction.findMany({
        where: { type: 'Coordinator_Review' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { student: true }
    });

    return { funnel, biRatio, biCount, beCount, trainingMods, feedbacks };
}

export async function toggleCampaign(id: string, currentStatus: boolean) {
    const campaign = await prisma.campaign.update({
        where: { id },
        data: { isActive: !currentStatus }
    });

    // Optional: Log status change to Google Sheets? 
    // For now just revalidate.
    revalidatePath('/admin');
    return { success: true, campaign };
}

export async function deleteCampaign(id: string) {
    await prisma.campaign.delete({ where: { id } });
    revalidatePath('/admin');
    return { success: true };
}
