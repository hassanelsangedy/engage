
/**
 * EVO API Integration Library
 * Handles authentication and data fetching from W12 EVO system.
 */

export interface EvoAccessLog {
    idMember: number;
    name: string;
    date: string; // ISO String
    unit: string;
}

export class EvoService {
    private baseUrl: string;
    private authHeader: string;

    constructor() {
        const dns = process.env.EVO_DNS || '';
        const apiKey = process.env.EVO_API_KEY || '';

        this.baseUrl = `https://api.w12app.com.br`;
        // Basic Auth: base64(dns:apiKey)
        this.authHeader = `Basic ${Buffer.from(`${dns}:${apiKey}`).toString('base64')}`;
    }

    /**
     * Fetch access logs from the turnstiles.
     * @param startDate Filter logs from this date (ISO string)
     */
    async getAccessLogs(startDate?: string): Promise<EvoAccessLog[]> {
        if (!process.env.EVO_API_KEY) {
            console.warn("EVO_API_KEY not found. Returning mock data.");
            return this.getMockLogs();
        }

        try {
            const url = new URL(`${this.baseUrl}/api/v1/accesscontrol/logs`);
            if (startDate) url.searchParams.append('startDate', startDate);

            const response = await fetch(url.toString(), {
                headers: {
                    'Authorization': this.authHeader,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`EVO API error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.map((log: any) => ({
                idMember: log.idMember,
                name: log.memberName,
                date: log.accessDate,
                unit: log.branchName
            }));
        } catch (error) {
            console.error("Failed to fetch access logs from EVO:", error);
            return [];
        }
    }

    /**
     * Mock data for development when API keys are missing.
     */
    private getMockLogs(): EvoAccessLog[] {
        const now = new Date();
        return [
            { idMember: 1001, name: "João Silva", date: now.toISOString(), unit: "Centro" },
            { idMember: 1002, name: "Maria Souza", date: new Date(now.getTime() - 1000 * 60 * 30).toISOString(), unit: "Centro" },
            { idMember: 1003, name: "Carlos Pereira", date: new Date(now.getTime() - 1000 * 60 * 60).toISOString(), unit: "Norte" }
        ];
    }
}

export const evoService = new EvoService();
