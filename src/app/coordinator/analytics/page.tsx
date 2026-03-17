
import { getHedonicAnalytics } from './actions'
import AnalyticsView from './analytics-view'

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
    const data = await getHedonicAnalytics();

    return (
        <div className="min-h-screen bg-slate-50 pt-10 pb-20">
            <AnalyticsView initialData={data} />
        </div>
    )
}
