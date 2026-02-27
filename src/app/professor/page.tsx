
import { getRiskList } from '../reception/actions'
import ProfessorDashboard from './dashboard'

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function ProfessorPage({ searchParams }: { searchParams: Promise<{ unit?: string }> }) {
    const { unit } = await searchParams
    const students = await getRiskList(unit)

    return <ProfessorDashboard initialStudents={students} unit={unit} />
}
