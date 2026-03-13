
import { sendWhatsAppMessage } from '../src/lib/whatsapp';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    console.log('--- Iniciando Teste de Disparo WhatsApp ---');
    const result = await sendWhatsAppMessage('+55 84 99615-1905', 'deu certo');
    console.log('Resultado:', JSON.stringify(result, null, 2));
    console.log('--- Fim do Teste ---');
}

test();
