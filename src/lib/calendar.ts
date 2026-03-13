
import { google } from 'googleapis';

export async function createCalendarEvent(title: string, rrule: string | null) {
    if (!rrule) return null;

    try {
        const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (!email || !key) {
            console.error('Google credentials missing for Calendar API');
            return null;
        }

        const auth = new google.auth.JWT({
            email: email,
            key: key,
            scopes: ['https://www.googleapis.com/auth/calendar.events'],
        });

        const calendar = google.calendar({ version: 'v3', auth });

        // 1. Prepare Start/End based on RRULE hour/minute if available
        // For simplicity, we create the event starting today at the specified hour.
        const now = new Date();

        // Extract hour/minute from RRULE if present (BYHOUR=X;BYMINUTE=Y)
        const hourMatch = rrule.match(/BYHOUR=(\d+)/);
        const minuteMatch = rrule.match(/BYMINUTE=(\d+)/);

        const startHour = hourMatch ? parseInt(hourMatch[1]) : 9;
        const startMinute = minuteMatch ? parseInt(minuteMatch[1]) : 0;

        const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute, 0);
        const endDate = new Date(startDate.getTime() + 30 * 60 * 1000); // 30 min duration

        // 2. Format RRULE for Calendar API (must start with RRULE:)
        // Ensure it doesn't have duplicate RRULE: prefix
        const recurrenceRule = rrule.startsWith('RRULE:') ? rrule : `RRULE:${rrule}`;

        const event = {
            summary: `[Engage] Disparo: ${title}`,
            description: 'Disparo automático de campanha via Engage Consultoria.',
            start: {
                dateTime: startDate.toISOString(),
                timeZone: 'America/Sao_Paulo',
            },
            end: {
                dateTime: endDate.toISOString(),
                timeZone: 'America/Sao_Paulo',
            },
            recurrence: [recurrenceRule],
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
        });

        console.log(`[Google Calendar] Event created: ${response.data.htmlLink}`);
        return response.data.id;
    } catch (err) {
        console.error('[Google Calendar] Error creating event:', err);
        return null;
    }
}
