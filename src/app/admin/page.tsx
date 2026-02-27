
import { getEfficacyReport, getCampaigns, getRetentionIntelligence } from './actions'
import AdminDashboard from './dashboard'

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const report = await getEfficacyReport()
    const campaigns = await getCampaigns()
    const intelligence = await getRetentionIntelligence()

    return <AdminDashboard data={report} campaigns={campaigns} intelligence={intelligence} />
}
