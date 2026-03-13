
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Replace with any other SMTP host if needed
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function sendWeeklyReport(pdf: Buffer, recipient: string) {
    const info = await transporter.sendMail({
        from: `"Engage | Evoque Intelligence" <${process.env.EMAIL_USER}>`,
        to: recipient,
        subject: `📈 Weekly Retention Report: Evoque Academy`,
        text: `Prezados gestores,\n\nSegue em anexo o relatório semanal de retenção e inteligência do Engage.\n\nContém a análise de migração de faixas, ROI de retenção e lista de chamada para intervenção pró-ativa.\n\nAtenciosamente,\nEngage Engine`,
        attachments: [
            {
                filename: `Weekly-Report-${new Date().toISOString().split('T')[0]}.pdf`,
                content: pdf,
            },
        ],
    });

    console.log(`[Mailer] Report sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
}
