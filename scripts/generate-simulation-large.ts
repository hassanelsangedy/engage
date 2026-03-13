
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Iniciando Injeção de 500 Registros para Simulação de Estresse...');

    const bands = ["Red", "Yellow", "Green", "Blue"];
    const units = ["Evoque Centro", "Evoque Sul", "Evoque Norte"];
    const barriers = ["BI", "BE", null];

    // 1. Criar 500 Alunos
    const studentPromises = [];
    for (let i = 1; i <= 500; i++) {
        const band = bands[Math.floor(Math.random() * bands.length)];
        const unit = units[Math.floor(Math.random() * units.length)];

        studentPromises.push(prisma.student.upsert({
            where: { evoId: `sim_${i}` },
            update: {
                name: `Aluno Simulado ${i}`,
                unit: unit,
                frequency: Math.floor(Math.random() * 20),
                consistency: Math.floor(Math.random() * 5),
                score: Math.floor(Math.random() * 7) + 2,
                band: band,
                updatedAt: new Date()
            },
            create: {
                evoId: `sim_${i}`,
                name: `Aluno Simulado ${i}`,
                unit: unit,
                frequency: Math.floor(Math.random() * 20),
                consistency: Math.floor(Math.random() * 5),
                score: Math.floor(Math.random() * 7) + 2,
                band: band
            }
        }));
    }

    const students = await Promise.all(studentPromises);
    console.log(`✅ 500 Alunos criados/atualizados.`);

    // 2. Criar 1000 Interações aleatórias
    const interactionPromises = [];
    for (let j = 0; j < 1000; j++) {
        const student = students[Math.floor(Math.random() * students.length)];
        const type = ["Hook_Message", "Student_Response", "Professor_Adjustment", "Reception_Alert"][Math.floor(Math.random() * 4)];
        const barrierType = barriers[Math.floor(Math.random() * barriers.length)];

        interactionPromises.push(prisma.interaction.create({
            data: {
                studentId: student.id,
                type: type,
                content: `Simulação de conteúdo ${j}`,
                barrierType: type === "Hook_Message" ? barrierType : null,
                outcome: Math.random() > 0.5 ? "Concluído" : "Pendente",
                trainingMod: type === "Professor_Adjustment" ? "Ajuste técnico simulado" : null
            }
        }));
    }

    await Promise.all(interactionPromises);
    console.log(`✅ 1000 Interações geradas.`);

    console.log('✨ Simulação de 500 registros concluída com sucesso!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
