import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function checkPhone() {
    const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

    const res = await fetch(`https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}?fields=display_phone_number,name_status`, {
        headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
    });
    
    console.log(await res.json());

    const resTemplates = await fetch(`https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/message_templates`, {
        headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
    });
    const templates = await resTemplates.json();
    console.log("Approved Templates:");
    console.log(templates);

    // Try fetching WABA ID
    const resWaba = await fetch(`https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}?fields=whatsapp_business_api_data`, {
        headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
    });
    console.log(await resWaba.json());
}
checkPhone();
