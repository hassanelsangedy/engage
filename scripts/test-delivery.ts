import { sendWhatsAppTemplate, sendWhatsAppMessage } from '../src/lib/whatsapp';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function main() {
    console.log('Testing WhatsApp API Delivery...');

    const number1 = '5584996151905'; // With 9
    const number2 = '558496151905'; // Without 9

    console.log(`Sending text to ${number1}...`);
    const resText1 = await sendWhatsAppMessage(number1, `Teste de envio de texto normal para ${number1}`);
    console.log(resText1);

    console.log(`Sending text to ${number2}...`);
    const resText2 = await sendWhatsAppMessage(number2, `Teste de envio de texto normal para ${number2}`);
    console.log(resText2);

    console.log(`Sending template to ${number1}...`);
    const resTpl1 = await sendWhatsAppTemplate(number1, 'hello_world', 'en_US');
    console.log(resTpl1);

    console.log(`Sending template to ${number2}...`);
    const resTpl2 = await sendWhatsAppTemplate(number2, 'hello_world', 'en_US');
    console.log(resTpl2);
}

main().catch(console.error);
