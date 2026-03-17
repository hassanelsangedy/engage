import { getRiskList, getAllBaseStudents } from '@/app/reception/actions'
import ReceptionDashboard from './dashboard'

// Ensure fresh data on every request
export const revalidate = 0;
export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export default async function ReceptionPage({ searchParams }: { searchParams: Promise<{ unit?: string }> }) {
    const session = await getServerSession(authOptions)
    const userRole = (session?.user as any)?.role
    const userUnit = (session?.user as any)?.unit

    const { unit: paramUnit } = await searchParams

    let effectiveUnit: string | undefined;

    if (userRole === 'ADMIN') {
        // Admins can view any unit, prioritizing the URL parameter, then their assigned unit
        effectiveUnit = paramUnit || userUnit;
    } else {
        // Non-admins are strictly locked to their assigned unit, ignoring URL parameters
        effectiveUnit = userUnit;
    }

    // If no unit is assigned or determined, provide a fallback or error state
    // For now, we'll pass undefined, assuming downstream functions can handle it
    // or display a message in the UI. A more robust solution might redirect or throw an error.
    if (!effectiveUnit) {
        // Example: You might want to render a specific component or throw an error
        // return <div>No unit assigned for this user. Please contact support.</div>;
        // Or, if the downstream functions can handle `undefined` gracefully, proceed.
    }

    const [riskList, allStudents] = await Promise.all([
        getRiskList(effectiveUnit),
        getAllBaseStudents(effectiveUnit)
    ])

    return <ReceptionDashboard initialStudents={riskList} allBaseStudents={allStudents} unit={effectiveUnit} />
}
