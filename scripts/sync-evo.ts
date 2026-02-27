
import { PrismaClient } from '@prisma/client'
import { evoService } from '../src/lib/evo'
import { calculateScore } from '../src/lib/score'
import { startOfMonth, endOfMonth, getWeek } from 'date-fns'

const prisma = new PrismaClient()

async function syncEvoData() {
    console.log("🚀 Starting EVO Sync...")

    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const currentMonthStr = now.toISOString().substring(0, 7) // "2026-02"

    // 1. Fetch access logs for the current month
    // Note: In a real scenario, you might want to fetch only the latest logs and increment.
    // For this implementation, we fetch logs and aggregate.
    console.log(`📅 Fetching logs for ${currentMonthStr}...`)
    const logs = await evoService.getAccessLogs(monthStart.toISOString())

    console.log(`✅ Loaded ${logs.length} access logs.`)

    // 2. Aggregate data by Member ID
    const studentStats: Record<string, {
        name: string,
        unit: string,
        workouts: number,
        weeks: Set<number>,
        lastDate: Date
    }> = {}

    for (const log of logs) {
        const id = String(log.idMember)
        const date = new Date(log.date)
        const week = getWeek(date)

        if (!studentStats[id]) {
            studentStats[id] = {
                name: log.name,
                unit: log.unit,
                workouts: 0,
                weeks: new Set(),
                lastDate: date
            }
        }

        studentStats[id].workouts += 1
        studentStats[id].weeks.add(week)
        if (date > studentStats[id].lastDate) {
            studentStats[id].lastDate = date
        }
    }

    // 3. Process and Save to Database
    console.log(`💾 Updating database for ${Object.keys(studentStats).length} students...`)
    let updatedCount = 0

    for (const [evoId, stats] of Object.entries(studentStats)) {
        console.log(`🔄 Processing student ${evoId}: ${stats.name}`)
        const weeksActive = stats.weeks.size
        const { total, band, barrier } = calculateScore(stats.workouts, weeksActive)

        // Upsert student
        const student = await prisma.student.upsert({
            where: { evoId },
            update: {
                name: stats.name,
                unit: stats.unit,
                frequency: stats.workouts,
                consistency: weeksActive,
                score: total,
                band: band,
                barrier: barrier,
                lastWorkoutDate: stats.lastDate,
                updatedAt: new Date()
            },
            create: {
                evoId,
                name: stats.name,
                unit: stats.unit,
                frequency: stats.workouts,
                consistency: weeksActive,
                score: total,
                band: band,
                barrier: barrier,
                lastWorkoutDate: stats.lastDate
            }
        })

        // 3.5 Automated Hook Message Trigger
        if (band === 'Red' && stats.name) {
            // Check if student already received a hook recently to avoid spam (Simple check)
            const lastHook = await prisma.interaction.findFirst({
                where: {
                    studentId: student.id,
                    type: 'Hook_Message'
                },
                orderBy: { createdAt: 'desc' }
            });

            // If no hook in last 7 days, send one
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            if (!lastHook || lastHook.createdAt < sevenDaysAgo) {
                const { sendWhatsAppMessage, HOOK_MESSAGES } = require('../src/lib/whatsapp');
                // Mock phone if missing
                const phone = "5511999999999";
                console.log(`📱 [TRIGGER] Sending Hook Message to ${stats.name} (${band})`);

                await sendWhatsAppMessage(phone, HOOK_MESSAGES.Red(stats.name.split(' ')[0]));

                // Record interaction
                await prisma.interaction.create({
                    data: {
                        studentId: student.id,
                        type: 'Hook_Message',
                        content: HOOK_MESSAGES.Red(stats.name.split(' ')[0]),
                        outcome: 'Sent',
                        staffRole: 'System'
                    }
                });
            }
        }

        updatedCount++
    }

    // 4. Export to CSV (Secondary Source of Truth / Google Sheets compatible)
    console.log(`📊 Exporting snapshot to CSV...`)
    const csvContent = [
        ["EvoID", "Name", "Unit", "Frequency", "Consistency", "Score", "Band", "LastWorkout"].join(","),
        ...Object.entries(studentStats).map(([evoId, stats]) => {
            const { total, band } = calculateScore(stats.workouts, stats.weeks.size);
            return [
                evoId,
                `"${stats.name}"`,
                `"${stats.unit}"`,
                stats.workouts,
                stats.weeks.size,
                total,
                band,
                stats.lastDate.toISOString()
            ].join(",");
        })
    ].join("\n");

    const fs = require('fs');
    const path = require('path');
    fs.writeFileSync(path.join(__dirname, '../public/data_snapshot.csv'), csvContent);

    console.log(`✨ Sync completed! ${updatedCount} students processed and exported to public/data_snapshot.csv.`)
}

syncEvoData()
    .catch(e => {
        console.error("❌ Sync failed:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
