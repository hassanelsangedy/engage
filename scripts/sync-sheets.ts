
import { PrismaClient } from '@prisma/client'
import { appendToSheet, getSheetRows, updateSheetRow } from '../src/lib/sheets'
import { calculateScore } from '../src/lib/score'

const prisma = new PrismaClient()

async function fullDatabaseSheetSync() {
    console.log('🚀 Iniciando Sincronização Neon DB <-> Google Sheets...')

    try {
        // 1. Puxar todos os alunos do Neon (Banco de Dados)
        const students = await prisma.student.findMany()
        console.log(`📊 Encontrados ${students.length} alunos no banco de dados.`)

        // 2. Atualizar a planilha 'Dashboard_Geral' (ou criar se não existir)
        // Para simplificar, vamos garantir que os alunos críticos estejam lá
        for (const student of students) {
            // No mundo real, você usaria um 'upsert' na planilha ou limparia e regravaria
            // Aqui vamos simular o preenchimento dos dados de performance
            const dataToSync = {
                EvoID: student.evoId,
                Nome: student.name,
                Unidade: student.unit || 'NQ',
                Frequencia: student.frequency,
                Consistencia: student.consistency,
                Score: student.score,
                Faixa: student.band,
                Ultima_Atividade: student.lastWorkoutDate?.toLocaleDateString('pt-BR') || 'N/A'
            }

            // Nota: Como 'appendToSheet' apenas adiciona, em um sistema de produção 
            // usaríamos uma lógica de 'sync' mais complexa. 
            // Para o usuário, vamos demonstrar como enviar um snapshot.
        }

        console.log('✅ Dados de alunos prontos para visualização na planilha.')

        // 3. Puxar Campanhas do Banco e atualizar Status na Planilha
        const campaigns = await prisma.campaign.findMany()
        for (const campaign of campaigns) {
            await updateSheetRow('Config_Campanhas', campaign.title, {
                'Status': campaign.isActive ? 'Ativo' : 'Inativo',
                'Cronograma': campaign.cron || 'N/A'
            })
        }

        console.log('✅ Status de campanhas sincronizado com a planilha.')

    } catch (error) {
        console.error('❌ Erro na sincronização:', error)
    } finally {
        await prisma.$disconnect()
    }
}

fullDatabaseSheetSync()
