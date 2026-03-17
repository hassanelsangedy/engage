import { sendWhatsAppMessage } from './whatsapp';
import { getSheetRows, updateRowById, appendToSheet } from './sheets';

/**
 * Core Journey Scheduler (Engage.Evoque Methodology)
 * Runs every minute to check if any journey trigger conditions are met.
 */
export async function checkAndSendMessages() {
    try {
        const now = new Date();
        const currentHour = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

        console.log(`[Scheduler] Checking Journey Triggers at ${currentHour}...`);

        // 1. Fetch Journey Config and Students from Google Sheets
        const [stages, students, interactions] = await Promise.all([
            getSheetRows('Config_Campanhas'),
            getSheetRows('Base_Alunos'),
            getSheetRows('Logs_Interacoes')
        ]);

        const activeStages = stages.filter((s: any) => (s.Ativo === 'Sim' || s.Status === 'Ativo') && (s.Hora_Envio === currentHour || s.Hora === currentHour));

        if (activeStages.length === 0) return;

        for (const stage of activeStages) {
            const triggerId = stage.ID_Gatilho || stage.ID_Campanha;
            console.log(`[Scheduler] Processing Trigger: ${stage.Gatilho || stage.Campanha} (${triggerId})`);

            let targets: any[] = [];

            // 2. Identify Target Students per Trigger Logic
            switch (triggerId) {
                case 'AC01': // Acolhimento (Pós-1º Treino)
                    targets = students.filter((s: any) => Number(s.Frequencia_Mensal) === 1 && ['Azul', 'Blue'].includes(s.Faixa_Cor));
                    break;

                case 'DI01': // Diagnóstico / O Gancho
                    targets = students.filter((s: any) => ['Vermelha', 'Red'].includes(s.Faixa_Cor));
                    break;

                case 'AH01': // Ajuste Hedônico
                    // Find students whose most recent interaction was 'BI'
                    targets = students.filter((s: any) => s.Barreira === 'BI');
                    break;

                case 'VI01': // Vínculo
                    targets = students.filter((s: any) => s.Barreira === 'BE' && ['Vermelha', 'Red'].includes(s.Faixa_Cor));
                    break;

                case 'RE01': // Recuperação
                    const fifteenDaysAgo = new Date();
                    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

                    targets = students.filter((s: any) => {
                        const lastWorkout = s.Ultima_Presenca ? new Date(s.Ultima_Presenca) : null;
                        return (lastWorkout && lastWorkout.getTime() < fifteenDaysAgo.getTime()) || (s.Faixa_Cor === 'Relapse' || s.Faixa_Cor === 'Risco');
                    });
                    break;

                case 'Red_High': // High Engagement Red Band (Premissa personalizada)
                    targets = students.filter((s: any) => {
                        const isRed = s.Faixa_Cor === 'Vermelha' || s.Faixa_Cor === 'Red';
                        const hasFreq = Number(s.Frequencia_Mensal || 0) >= 10;
                        const hasCons = Number(s.Consistencia_Semanal || 0) >= 0.7;
                        return isRed && hasFreq && hasCons;
                    });
                    break;

                default:
                    // Generic band trigger
                    const targetBand = stage.Publico_Alvo || stage.Publico;
                    if (targetBand) {
                        if (targetBand === 'Red_High') {
                            targets = students.filter((s: any) => {
                                const isRed = s.Faixa_Cor === 'Vermelha' || s.Faixa_Cor === 'Red';
                                const hasFreq = Number(s.Frequencia_Mensal || 0) >= 10;
                                const hasCons = Number(s.Consistencia_Semanal || 0) >= 0.7;
                                return isRed && hasFreq && hasCons;
                            });
                        } else {
                            targets = students.filter((s: any) => s.Faixa_Cor === targetBand);
                        }
                    }
                    break;
            }

            // 3. Send Personalized Messages
            for (const student of targets) {
                const phone = student.Telefone || student.phone;
                const studentName = student.Nome || student.name;
                const studentId = student.ID_EVO || student.ID_Aluno || student.id;

                if (!phone) continue;

                const messageTemplate = stage.Mensagem_Template || stage.Conteudo;
                const personalizedMessage = messageTemplate.replace(/{{nome}}/g, studentName);

                console.log(`[Scheduler] Sending to ${studentName} (${studentId}): ${stage.Gatilho || stage.Campanha}`);


                const templateMeta = stage.Template_Meta || stage.Template;
                const result = await sendWhatsAppMessage(phone, personalizedMessage, {
                    templateName: templateMeta,
                    studentName: studentName
                });


                if (result.success) {
                    await appendToSheet('Logs_Interacoes', {
                        Data_Hora: new Date().toISOString(),
                        ID_Aluno: studentId,
                        Tipo: 'Hook_Message',
                        Mensagem: personalizedMessage,
                        Status_Entrega: 'OK'
                    });
                }
            }

            // 4. Update Spreadsheet Log
            await updateRowById('Config_Campanhas', stage.ID_Gatilho ? 'ID_Gatilho' : 'ID_Campanha', triggerId, {
                Ultimo_Envio: now.toISOString()
            });
        }
    } catch (error) {
        console.error('[Scheduler] Critical Error:', error);
    }
}
