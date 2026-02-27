
'use server'

import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function registerInteraction(data: {
    studentId: string
    type: 'Reception_Alert' | 'Professor_Adjustment' | 'Coordinator_Review' | 'Hook_Message' | 'FollowUp_24h'
    content?: string
    outcome?: string
    staffRole: string
    barrierType?: string
    trainingMod?: string
}) {
    try {
        const interaction = await prisma.interaction.create({
            data: {
                studentId: data.studentId,
                type: data.type,
                content: data.content,
                outcome: data.outcome,
                staffRole: data.staffRole,
                barrierType: data.barrierType,
                trainingMod: data.trainingMod
            },
        })

        // Revalidate all pages to reflect updated status if we add indicators later
        revalidatePath('/reception')
        revalidatePath('/professor')
        revalidatePath('/coordinator')

        return { success: true, interaction }
    } catch (error) {
        console.error('Failed to register interaction:', error)
        return { success: false, error: 'Failed to register interaction' }
    }
}
