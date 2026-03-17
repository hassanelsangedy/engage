import { getRiskList } from '@/app/reception/actions'
import ProfessorDashboard from './dashboard'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getSheetRows } from '@/lib/sheets'

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function ProfessorPage({ searchParams }: { searchParams: Promise<{ unit?: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return null

    const userRole = (session?.user as any)?.role
    const userUnit = (session?.user as any)?.unit
    const { unit: paramUnit } = await searchParams

    // Non-admins are locked to their assigned unit
    const effectiveUnit = userRole === 'ADMIN' ? (paramUnit || userUnit) : userUnit

    const students = await getRiskList(effectiveUnit)
    const professorName = session.user?.name || 'Professor'

    // Fetch feedbacks for this professor
    const allFeedbacks = await getSheetRows('Feedback_Coordenador');
    const professorFeedbacks = allFeedbacks.filter((f: any) =>
        f.Professor === professorName && f.Status === 'Pendente'
    );

    return (
        <ProfessorDashboard
            initialStudents={students}
            unit={effectiveUnit}
            professorName={professorName}
            feedbacks={professorFeedbacks}
        />
    )
}
