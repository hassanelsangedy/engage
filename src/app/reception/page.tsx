
import { getRiskList } from './actions'
import ReceptionDashboard from './dashboard'

// Ensure fresh data on every request
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function ReceptionPage({ searchParams }: { searchParams: Promise<{ unit?: string }> }) {
    const { unit } = await searchParams
    const riskList = await getRiskList(unit)

    return <ReceptionDashboard initialStudents={riskList} unit={unit} />
}
