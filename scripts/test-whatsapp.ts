import { sendWhatsAppMessage } from '../src/lib/whatsapp';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function main() {
    console.log('Fetching students to find Hassan Elsangedy...');
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let key = process.env.GOOGLE_PRIVATE_KEY;
    if (key && key.includes('\\n')) key = key.replace(/\\n/g, '\n');
    if (key && key.startsWith('"') && key.endsWith('"')) key = key.substring(1, key.length - 1);

    const serviceAccountAuth = new JWT({
        email: email,
        key: key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID as string, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle['Base_Alunos'];
    const rows = await sheet.getRows();
    const hassan = rows.find(r => r.get('Nome') && r.get('Nome').includes('Hassan Elsangedy'));
    
    if (!hassan) {
        console.error('Hassan Elsangedy not found in Base_Alunos!');
        return;
    }

    const unformattedPhone = hassan.get('Telefone') || hassan.get('phone');
    if (!unformattedPhone) {
        console.error('Hassan Elsangedy has no phone number!');
        return;
    }

    const cleanPhone = unformattedPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    
    let message = hassan.get('Mensagens');
    if (!message) {
        console.warn('No custom message found for Hassan. Sending a default ping.');
        message = `Teste de WhatsApp Módulo Engage - Olá Hassan! O Token Permanente está funcionando perfeitamente 🚀`;
    }

    console.log(`Sending message to ${hassan.get('Nome')} at ${phoneWithCountry}...`);
    console.log(`Message: ${message}`);

    const res = await sendWhatsAppMessage(phoneWithCountry, message);
    
    if (res.success) {
        console.log('✅ Message sent successfully!', res);
    } else {
        console.error('❌ Failed to send message limit/token:', res);
    }
}

main().catch(console.error);
