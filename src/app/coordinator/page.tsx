
import { getStats } from '../admin/actions'
import { TrendingUp, Users, MessageCircle, AlertTriangle, ArrowUpRight } from 'lucide-react'
import BackgroundDecoration from '@/components/ui/background-decoration'

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function CoordinatorPage({ searchParams }: { searchParams: Promise<{ unit?: string }> }) {
    const { unit } = await searchParams
    const stats = await getStats(unit)

    // Real stats from DB now!
    const INTERACTION_COUNT = stats.interactions
    const RESPONSE_RATE = 58 // Still mocked for now

    return (
        <div className="p-8 max-w-7xl mx-auto relative min-h-screen">
            <BackgroundDecoration />
            <div className="relative z-10">
                <header className="mb-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Painel do Coordenador</h1>
                        <p className="text-gray-500">Validação de Qualidade e Métricas de Retenção</p>
                        {unit && (
                            <div className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-md inline-block mt-2">
                                Unidade: {unit.toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Sistema Operacional
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Risco Crítico (Vermelha)</p>
                                <h3 className="text-4xl font-bold text-gray-900 mt-2 group-hover:text-red-600 transition-colors">{stats.red}</h3>
                            </div>
                            <div className="bg-red-50 p-3 rounded-xl text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="flex items-center text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded w-fit">
                            Prioridade Máxima
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Risco Atenção (Amarela)</p>
                                <h3 className="text-4xl font-bold text-gray-900 mt-2 group-hover:text-yellow-600 transition-colors">{stats.yellow}</h3>
                            </div>
                            <div className="bg-yellow-50 p-3 rounded-xl text-yellow-500 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="flex items-center text-xs text-yellow-700 font-medium bg-yellow-50 px-2 py-1 rounded w-fit">
                            Ação Preventiva
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Interações Mensais (Real)</p>
                                <h3 className="text-4xl font-bold text-gray-900 mt-2 group-hover:text-blue-600 transition-colors">{INTERACTION_COUNT}</h3>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <MessageCircle className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="flex items-center text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded w-fit">
                            <ArrowUpRight className="w-3 h-3 mr-1" /> Dados em tempo real
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Taxa de Resposta</p>
                                <h3 className="text-4xl font-bold text-gray-900 mt-2 group-hover:text-purple-600 transition-colors">{RESPONSE_RATE}%</h3>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-xl text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="flex items-center text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded w-fit">
                            Meta: &gt;50% (Atingida)
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-80 flex flex-col items-center justify-center text-center">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Retenção de Faixa Vermelha</h3>
                        <p className="text-sm text-gray-500 mb-6">Comparativo Histórico</p>
                        <div className="w-full h-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400">
                            [Gráfico de Migração em Breve]
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-80 flex flex-col items-center justify-center text-center">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Eficácia por Professor</h3>
                        <p className="text-sm text-gray-500 mb-6">Volume de ajustes hedônicos</p>
                        <div className="w-full h-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400">
                            [Ranking de Performance em Breve]
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
