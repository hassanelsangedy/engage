
/**
 * Mock utility for sending WhatsApp messages.
 * In a real scenario, this would integrate with a provider like Twilio, Z-API, or WhatsApp Business API.
 */
export async function sendWhatsAppMessage(phone: string, message: string) {
    console.log(`[WhatsApp API] Sending message to ${phone}:`);
    console.log(`---`);
    console.log(message);
    console.log(`---`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return { success: true, messageId: `msg_${Math.random().toString(36).substr(2, 9)}` };
}

export const HOOK_MESSAGES = {
    Red: (name: string) => `Olá ${name}! Sentimos sua falta nos treinos. 🏋️‍♂️ Sua saúde e progresso são nossa prioridade. Vamos agendar uma conversa rápida com seu coordenador para ajustarmos seu plano e garantir que você atinja seus objetivos? Responda AGORA e voltamos com tudo!`,
    Yellow: (name: string) => `E aí ${name}! Você está no caminho certo, mas notamos uma pequena oscilação na sua frequência. Que tal mantermos o ritmo essa semana? Estamos aqui para te apoiar! 🔥`,
    FollowUp_24h: (name: string) => `E aí ${name}, como você está se sentindo hoje após o treino de ontem? 🦾 Esperamos que as dores sejam apenas do progresso! Qualquer dúvida com seu novo ajuste, procure seu professor. Tamo junto!`
};
