import { RRule } from 'rrule'
import cron from 'node-cron'
import { sendWhatsAppMessage } from '../src/lib/whatsapp'
import { getSheetRows, updateRowById, appendToSheet } from '../src/lib/sheets'

/**
 * MOTOR DE CRONOGRAMA (Schedule Engine)
 * Responsável por ler a planilha, bater horários e disparar campanhas.
 */
async function processCampaignsFromSheet() {
    console.log(`[ScheduleEngine] Tick: ${new Date().toLocaleString('pt-BR')}...`)

    try {
        // 1. Ler Campanhas Ativas da Planilha
        const campaigns = await getSheetRows('Config_Campanhas')
        if (!campaigns || campaigns.length === 0) {
            console.log('[ScheduleEngine] Nenhuma campanha encontrada na aba Config_Campanhas.')
            return
        }

        const now = new Date()
        const currentHourMin = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
        const todayDayMap: any = { 1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sab', 0: 'Dom' }
        const currentDayName = todayDayMap[now.getDay()]

        for (const row of campaigns) {
            try {
                // Mapeamento de colunas da planilha
                const title = row.Campanha || row.title
                const audience = row.Publico || row.audience
                const cronRule = row.Cronograma || row.cron
                const horaConfig = row.Hora || row.hora
                const diasSemanaStr = row.Dias_Semana || row.diasSemana
                const status = row.Status || row.status
                const lastSent = row.Ultimo_Envio || row.lastSent
                const content = row.Conteudo || row.content

                if (status !== 'Ativo') continue

                let shouldExecute = false

                // Prioridade A: Verificação via Colunas Hora e Dias_Semana
                if (horaConfig && diasSemanaStr && diasSemanaStr !== 'N/A') {
                    if (currentHourMin === horaConfig && diasSemanaStr.includes(currentDayName)) {
                        shouldExecute = true
                    }
                }
                // Prioridade B: Fallback via RRULE (caso as colunas acima estejam vazias)
                else if (cronRule && cronRule !== 'N/A') {
                    const rruleStr = cronRule.startsWith('RRULE:') ? cronRule : `RRULE:${cronRule}`
                    const rule = RRule.fromString(rruleStr)
                    const nowMinute = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0, 0)
                    const occurrences = rule.between(
                        new Date(nowMinute.getTime() - 1000),
                        new Date(nowMinute.getTime() + 1000)
                    )
                    if (occurrences.length > 0) shouldExecute = true
                }

                if (shouldExecute) {
                    const todayStr = new Date().toLocaleDateString('pt-BR')
                    // Evitar duplicidade no mesmo dia (Verifica se 'lastSent' já contém a data de hoje)
                    if (lastSent && lastSent.includes(todayStr)) {
                        console.log(`[ScheduleEngine] Campanha "${title}" já disparada hoje. Pulando.`)
                        continue
                    }

                    console.log(`[ScheduleEngine] DISPARO IDENTIFICADO: "${title}" para o público "${audience}"`)
                    await executeTriageAndSend(title, audience, content)
                }
            } catch (err) {
                console.error(`[ScheduleEngine] Erro ao processar linha da planilha:`, err)
            }
        }
    } catch (err) {
        console.error('[ScheduleEngine] Erro fatal ao ler planilha:', err)
    }
}

/**
 * EXECUÇÃO DE TRIAGEM E ENVIO
 * Filtra alunos na Planilha e registra logs.
 */
async function executeTriageAndSend(title: string, audience: string, content: string) {
    const audienceMap: any = {
        'Faixa Vermelha': 'Vermelha',
        'Faixa Amarela': 'Amarela',
        'Faixa Verde': 'Verde',
        'Faixa Azul': 'Azul',
        'Recaída': 'Relapse'
    }
    const targetBand = audienceMap[audience] || audience

    // 1. Filtrar na Base_Alunos (Google Sheets)
    const allStudents = await getSheetRows('Base_Alunos')
    const students = allStudents.filter((s: any) => s.Faixa_Cor === targetBand)

    console.log(`[ScheduleEngine] Triagem: ${students.length} alunos encontrados na faixa "${targetBand}"`)

    for (const student of students) {
        const phone = student.Telefone || student.phone
        if (!phone) continue

        const studentName = student.Nome || student.name || 'Aluno'
        const evoId = student.ID_EVO || student.evoId || student.id

        const formattedMsg = content.replace(/\{\{nome_aluno\}\}/g, studentName.split(' ')[0])

        // 2. Enviar via API de WhatsApp
        const result = await sendWhatsAppMessage(phone, formattedMsg)

        // 3. Registrar Log de Envio Real na Planilha (Aba Logs_Envio)
        try {
            const timestamp = new Date().toISOString()
            await appendToSheet('Logs_Envio', {
                Data: new Date().toLocaleString('pt-BR'),
                Data_Hora: timestamp,
                Campanha: title,
                Aluno: studentName,
                Telefone: phone,
                Mensagem: formattedMsg,
                Status: result.success ? 'Enviado' : 'Falhou'
            })

            // Registrar também como Interação para o Dashboard
            await appendToSheet('Logs_Interacoes', {
                Data_Hora: timestamp,
                ID_Aluno: String(evoId),
                Tipo: 'Hook_Message',
                Mensagem: formattedMsg,
                Status_Entrega: result.success ? 'OK' : 'Falhou',
                Role: 'Engine/Schedule'
            })
        } catch (e) {
            console.error('[ScheduleEngine] Falha ao gravar Log_Envio:', e)
        }
    }

    // 4. Registrar na Planilha o 'Último Envio' (Data e Hora)
    const lastExecutionStr = `${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`

    // Note: updateRowById is more robust than updateSheetRow (which used title as primary key)
    await updateRowById('Config_Campanhas', 'Campanha', title, {
        'Ultimo_Envio': lastExecutionStr
    })

    console.log(`[ScheduleEngine] Ciclo de envio finalizado para "${title}"`)
}

// Configuração do Cron Job para rodar a cada minuto
console.log('[ScheduleEngine] Motor de Cronograma Iniciado. Monitorando planilha...')
cron.schedule('* * * * *', () => {
    processCampaignsFromSheet()
})

// Execução imediata para teste rápido ao iniciar
processCampaignsFromSheet()
