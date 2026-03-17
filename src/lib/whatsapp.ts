
/**
 * WhatsApp Business API Integration (Meta)
 * Using Phone Number ID: 1011085045422077 from Meta Console
 */

export async function sendWhatsAppMessage(
    phone: string, 
    message: string, 
    options?: { templateName?: string, studentName?: string }
) {
    const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '1011085045422077';
    const API_VERSION = 'v17.0'; // Updated to match user example
    const cleanPhone = phone.replace(/\D/g, '');
    const studentName = options?.studentName || 'Aluno';

    if (!ACCESS_TOKEN) {
        console.warn('[WhatsApp] WHATSAPP_ACCESS_TOKEN not found. Running in MOCK mode.');
        console.log(`[MOCK EMAIL to ${cleanPhone}]: ${message}`);
        return { success: true, messageId: `mock_${Date.now()}` };
    }

    // Default to 'mensagem_1' if no template specified, as requested by user
    const templateName = options?.templateName || 'mensagem_1';

    try {
        console.log(`[WhatsApp API] Sending Template: ${templateName} to ${cleanPhone}...`);

        const response = await fetch(`https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: cleanPhone,
                type: 'template',
                template: {
                    name: templateName,
                    language: { 
                        code: 'pt_BR' 
                    },
                    components: [
                        {
                            type: 'body',
                            parameters: [
                                {
                                    type: 'text',
                                    text: studentName,
                                    parameter_name: 'nome'  // Required: template uses named variable {{nome}}
                                }
                            ]
                        }
                    ]
                }
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('[WhatsApp API] Meta API Error:', data);
            return { 
                success: false, 
                error: `Meta API Error: ${data.error?.message || 'Erro desconhecido'} (Code: ${data.error?.code})`,
                fullData: data
            };
        }

        console.log('[WhatsApp API] Success:', data.messages?.[0]?.id);
        return { 
            success: true, 
            messageId: data.messages?.[0]?.id,
            data: data
        };

    } catch (error: any) {
        console.error('[WhatsApp API] Fetch Exception:', error);
        return { success: false, error: `Exception: ${error.message || String(error)}` };
    }
}

/**
 * Specifically sends a WhatsApp Template (Keeping for backward compatibility if needed)
 */
export async function sendWhatsAppTemplate(
    phone: string, 
    templateName: string, 
    languageCode: string = 'pt_BR',
    bodyParameters: any[] = []
) {
    // Redireciona para a função principal com a lógica unificada
    return await sendWhatsAppMessage(phone, '', {
        templateName,
        studentName: bodyParameters[0]?.text
    });
}

export const HOOK_MESSAGES = {
    Red: (name: string) => `Olá ${name}! Sentimos sua falta nos treinos. 🏋️‍♂️ Sua saúde e progresso são nossa prioridade. Vamos agendar uma conversa rápida com seu coordenador para ajustarmos seu plano e garantir que você atinja seus objetivos? Responda AGORA e voltamos com tudo!`,
    Yellow: (name: string) => `E aí ${name}! Você está no caminho certo, mas notamos uma pequena oscilação na sua frequência. Que tal mantermos o ritmo essa semana? Estamos aqui para te apoiar! 🔥`,
    FollowUp_24h: (name: string) => `E aí ${name}, como você está se sentindo hoje após o treino de ontem? 🦾 Esperamos que as dores sejam apenas do progresso! Qualquer dúvida com seu novo ajuste, procure seu professor. Tamo junto!`
};
