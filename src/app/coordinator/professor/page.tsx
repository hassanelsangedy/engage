
import { getRiskList } from '@/app/reception/actions'
import ProfessorDashboard from './dashboard'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getSheetRows } from '@/lib/sheets'

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function ProfessorPage({ searchParams }: { searchParams: Promise<{ unit?: string }> }) {
    const { unit } = await searchParams
    const students = await getRiskList(unit)
    const session = await getServerSession(authOptions);
    const professorName = session?.user?.name || 'Coordenador';

    // Fetch feedbacks for this professor
    const allFeedbacks = await getSheetRows('Feedback_Coordenador');
    const professorFeedbacks = allFeedbacks.filter((f: any) =>
        f.Professor === professorName && f.Status === 'Pendente'
    );

    return (
        <ProfessorDashboard
            initialStudents={students}
            unit={unit}
            professorName={professorName}
            feedbacks={professorFeedbacks}
        />
    )
}
