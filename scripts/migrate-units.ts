
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateUnits() {
    console.log('Starting Unit Migration...')

    const mappings = [
        { old: 'Centro', new: 'Ribeirão Pires' },
        { old: 'Norte', new: 'Pereira Barreto (Santo André)' },
        { old: 'Sul', new: 'Guilhermina' },
        { old: 'Leste', new: 'Guaianazes' },
        // Lowercase versions just in case
        { old: 'centro', new: 'Ribeirão Pires' },
        { old: 'norte', new: 'Pereira Barreto (Santo André)' },
        { old: 'sul', new: 'Guilhermina' },
        { old: 'leste', new: 'Guaianazes' },
    ]

    for (const mapping of mappings) {
        // Update Students
        const students = await prisma.student.updateMany({
            where: {
                unit: { contains: mapping.old, mode: 'insensitive' }
            },
            data: {
                unit: mapping.new
            }
        })
        console.log(`Updated ${students.count} students from ${mapping.old} to ${mapping.new}`)

        // Update History
        const history = await prisma.attendanceHistory.updateMany({
            where: {
                student: {
                    unit: mapping.new // Since updateMany above already updated students? No, this is history.
                }
            },
            data: {
                // Actually, history doesn't have a unit field. It's related to a student.
            }
        })
        // Wait, schema check: AttendanceHistory doesn't have a unit field.
    }

    console.log('Migration Complete!')
}

migrateUnits().catch(console.error).finally(() => prisma.$disconnect())
