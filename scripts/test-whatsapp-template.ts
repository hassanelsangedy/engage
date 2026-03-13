
import { sendWhatsAppTemplate } from '../src/lib/whatsapp';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    console.log('--- Iniciando Teste de Disparo TEMPLATE WhatsApp ---');
    // Using the 'hello_world' template from your screenshot
    const result = await sendWhatsAppTemplate('+55 84 99615-1905', 'hello_world', 'en_US');
    console.log('Resultado:', JSON.stringify(result, null, 2));
    console.log('--- Fim do Teste ---');
}

test();
