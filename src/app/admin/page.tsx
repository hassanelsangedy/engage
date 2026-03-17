import { getEfficacyReport, getRetentionIntelligence, getJourneyConfig, getStats, getPendingUsers } from './actions'
import { getStratification } from '../coordinator/strategic/actions'
import AdminDashboard from './dashboard'

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const report = await getEfficacyReport()
    const intelligence = await getRetentionIntelligence()
    const journey = await getJourneyConfig()
    const stats = await getStats()
    const stratification = await getStratification()
    const pendingUsers = await getPendingUsers()

    return <AdminDashboard
        data={report}
        intelligence={intelligence}
        journey={journey}
        stats={stats}
        stratification={stratification}
        pendingUsers={pendingUsers}
    />
}
