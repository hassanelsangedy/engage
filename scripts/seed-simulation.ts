
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando semente de simulação (Simulation Seed)...');

    // 1. Criar Alunos de Exemplo com diferentes perfis
    const studentsData = [
        { evoId: "101", name: "Ricardo Silva", unit: "Evoque Centro", frequency: 2, consistency: 1, score: 3, band: "Red", barrier: "Falta de motivação" },
        { evoId: "102", name: "Ana Oliveira", unit: "Evoque Centro", frequency: 1, consistency: 2, score: 3, band: "Red", barrier: "Lesão leve" },
        { evoId: "201", name: "Marcos Souza", unit: "Evoque Sul", frequency: 5, consistency: 3, score: 5, band: "Yellow", barrier: "Trabalho excessivo" },
        { evoId: "202", name: "Julia Santos", unit: "Evoque Sul", frequency: 4, consistency: 4, score: 6, band: "Green", barrier: null },
        { evoId: "301", name: "Fernando Costa", unit: "Evoque Centro", frequency: 12, consistency: 4, score: 8, band: "Blue", barrier: null },
        { evoId: "302", name: "Beatriz Lima", unit: "Evoque Sul", frequency: 15, consistency: 4, score: 8, band: "Blue", barrier: null },
    ];

    const students = [];
    for (const s of studentsData) {
        const student = await prisma.student.upsert({
            where: { evoId: s.evoId },
            update: s,
            create: s,
        });
        students.push(student);
        console.log(`✅ Aluno: ${student.name} [${student.band}]`);
    }

    // 2. Criar Histórico de Frequência (Para mostrar taxa de migração)
    const historyData = [
        { studentId: students[0].id, month: "2026-01", frequency: 1, consistency: 1, score: 2, band: "Red" },
        { studentId: students[1].id, month: "2026-01", frequency: 2, consistency: 1, score: 3, band: "Red" },
        { studentId: students[2].id, month: "2026-01", frequency: 3, consistency: 1, score: 3, band: "Red" }, // Migrou de Red para Yellow
    ];

    for (const h of historyData) {
        await prisma.attendanceHistory.create({ data: h });
    }
    console.log('✅ Histórico de frequência populado.');

    // 3. Criar Interações (Para métricas de mensagens e barreiras)
    const interactionData = [
        // Mensagens disparadas (Hooks)
        { studentId: students[0].id, type: "Hook_Message", content: "Olá Ricardo! Sentimos sua falta...", barrierType: "BI", outcome: "Pendente" },
        { studentId: students[1].id, type: "Hook_Message", content: "Olá Ana! Como está seu progresso?", barrierType: "BE", outcome: "Respondido" },
        { studentId: students[2].id, type: "Hook_Message", content: "Marcos, vamos manter o ritmo!", barrierType: "BI", outcome: "Pendente" },

        // Respostas
        { studentId: students[1].id, type: "Student_Response", content: "Oi! Tive um problema no joelho.", outcome: "Ajuste Sugerido" },

        // Ajustes de Salão
        { studentId: students[1].id, type: "Professor_Adjustment", content: "Troca de Leg Press por Extensora leve.", staffRole: "Professor", outcome: "Concluído", trainingMod: "Redução de carga em membros inferiores" },
        { studentId: students[0].id, type: "Reception_Alert", content: "Abordagem calorosa na entrada.", staffRole: "Recepção", outcome: "Em progresso" },
    ];

    for (const i of (interactionData as any)) {
        await prisma.interaction.create({ data: i });
    }
    console.log('✅ Interações e diagnósticos de barreiras criados.');

    // 4. Criar Campanhas de Exemplo
    const campaignsData = [
        { title: "Desafio de Segunda", audience: "Red", frequency: 1, messageContent: "Te esperamos!", isActive: true, hora: "09:00", diasSemana: "Seg", frequencyLabel: "Semanal" },
        { title: "Mantenha o Foco", audience: "Yellow", frequency: 1, messageContent: "Não perca o ritmo!", isActive: false, hora: "14:30", diasSemana: "Ter,Qui", frequencyLabel: "Personalizado" },
    ];

    for (const c of campaignsData) {
        await prisma.campaign.create({ data: c });
    }
    console.log('✅ Campanhas agendadas criadas.');

    console.log('✨ Seed Finalizado com sucesso!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
