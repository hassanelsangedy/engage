
import { getStats } from '../admin/actions'
import { getFinishedStudents } from './actions'
import CoordinatorDashboard from './dashboard'

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function CoordinatorPage({ searchParams }: { searchParams: Promise<{ unit?: string }> }) {
    const { unit } = await searchParams
    const stats = await getStats(unit)
    const finishedStudents = await getFinishedStudents(unit)

    return <CoordinatorDashboard initialStudents={finishedStudents as any} stats={stats} unit={unit} />
}
