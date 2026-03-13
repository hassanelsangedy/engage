
import { PrismaClient } from '@prisma/client'
import { sendWhatsAppMessage, HOOK_MESSAGES } from '../src/lib/whatsapp'

const prisma = new PrismaClient()

async function processFollowUps() {
    console.log("⏰ Processing 24h Follow-ups...")

    const now = new Date()
    const twentyFiveHoursAgo = new Date(now.getTime() - (25 * 60 * 60 * 1000))
    const twentyThreeHoursAgo = new Date(now.getTime() - (23 * 60 * 60 * 1000))

    // 1. Find professor adjustments from ~24h ago for students who were at risk (Hook/Acolhimento)
    const recentAdjustments = await prisma.interaction.findMany({
        where: {
            type: 'Professor_Adjustment',
            createdAt: {
                gte: twentyFiveHoursAgo,
                lte: twentyThreeHoursAgo
            }
        },
        include: {
            student: true
        }
    })

    console.log(`🔍 Found ${recentAdjustments.length} candidate adjustments from ~24h ago.`)

    for (const interaction of recentAdjustments) {
        const student = interaction.student

        // Check if follow-up already sent
        const alreadySent = await prisma.interaction.findFirst({
            where: {
                studentId: student.id,
                type: 'FollowUp_24h'
            }
        })

        if (!alreadySent) {
            console.log(`✉️ Sending follow-up to ${student.name}...`)
            const phone = student.phone || "5511999999999"
            await sendWhatsAppMessage(phone, HOOK_MESSAGES.FollowUp_24h(student.name.split(' ')[0]))

            await prisma.interaction.create({
                data: {
                    studentId: student.id,
                    type: 'FollowUp_24h',
                    content: HOOK_MESSAGES.FollowUp_24h(student.name.split(' ')[0]),
                    outcome: 'Sent',
                    staffRole: 'System'
                }
            })
        }
    }

    console.log("✅ Follow-up processing completed.")
}

processFollowUps()
    .catch(e => {
        console.error("❌ Follow-up process failed:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
