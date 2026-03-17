
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const passwordAdmin = await bcrypt.hash('admin_evoque_2024', 10)
    const passwordCoord = await bcrypt.hash('coord_evoque_2024', 10)
    const passwordRecep = await bcrypt.hash('recepcao_evoque_2024', 10)
    const passwordProf = await bcrypt.hash('prof_evoque_2024', 10)

    // Admin
    await prisma.user.upsert({
        where: { email: 'admin@evoque.com' },
        update: {},
        create: {
            email: 'admin@evoque.com',
            name: 'Administrador Sistêmico',
            password: passwordAdmin,
            role: 'ADMIN',
        },
    })

    // Coordenador
    await prisma.user.upsert({
        where: { email: 'coord@evoque.com' },
        update: {},
        create: {
            email: 'coord@evoque.com',
            name: 'Coordenador Regional',
            password: passwordCoord,
            role: 'COORDINATOR',
            unit: 'ribeirao_pires'
        },
    })

    // Recepção
    await prisma.user.upsert({
        where: { email: 'recepcao@evoque.com' },
        update: {},
        create: {
            email: 'recepcao@evoque.com',
            name: 'Recepção Unidade 1',
            password: passwordRecep,
            role: 'RECEPTION',
            unit: 'ribeirao_pires'
        },
    })

    // Professor
    await prisma.user.upsert({
        where: { email: 'professor@evoque.com' },
        update: {},
        create: {
            email: 'professor@evoque.com',
            name: 'Professor Técnico',
            password: passwordProf,
            role: 'PROFESSOR',
            unit: 'ribeirao_pires'
        },
    })

    console.log('Seed completed successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
