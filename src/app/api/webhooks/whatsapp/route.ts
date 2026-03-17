
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

const VERIFY_TOKEN = 'evoque_engage_2024';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        return new Response(challenge, { status: 200, headers: { 'Content-Type': 'text/plain' } });
    }
    return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        if (body.object === 'whatsapp_business_account') {
            const entry = body.entry?.[0];
            const change = entry?.changes?.[0];
            const value = change?.value;
            const message = value?.messages?.[0];

            if (message) {
                const from = message.from;
                const text = message.text?.body || '';
                const now = new Date();
                const timestamp = now.toISOString();

                // 1. Identificar Aluno (Robust match by phone)
                // Normalize "from" to match potential variants in DB
                const { data: student } = await supabase
                    .from('alunos')
                    .select('*')
                    .or(`telefone.eq.${from},telefone.ilike.%${from.replace(/^55/, '')}%`)
                    .limit(1)
                    .single();

                const studentInternalId = student?.id || null;
                const studentEvoId = student?.id_evo || 'Não Identificado';

                // 2. Classificação via Gemini (Shannon)
                const analysis = await askGemini(text);

                // 3. Registrar no Log de Interações
                await supabase.from('logs_interacoes').insert({
                    data_hora: timestamp,
                    aluno_id: studentInternalId,
                    tipo: 'Recebimento',
                    mensagem: text,
                    status_entrega: 'Recebido',
                    classificacao: analysis.classification || 'N/A'
                });

                // 4. Atualizar aluno se identificado
                if (studentInternalId) {
                    const updateData: any = {
                        barreira: analysis.classification === 'BI' ? 'Barreira Interna' : (analysis.classification === 'BE' ? 'Barreira Externa' : 'N/A'),
                        barreira_relatada: analysis.summary,
                        updated_at: timestamp
                    };

                    if (analysis.classification === 'BI') {
                        updateData.pontuacao_risco = 2;
                        updateData.status_adesao = 'Risco Crítico';
                    }

                    await supabase.from('alunos').update(updateData).eq('id', studentInternalId);
                    
                    // Log de Diagnóstico
                    await supabase.from('diagnostico_respostas').insert({
                        data: timestamp,
                        aluno_id: studentInternalId,
                        resposta_original: text,
                        classificacao_ia: analysis.classification,
                        subcategoria: analysis.summary,
                        status_intervencao: 'Pendente'
                    });
                }

                // 5. Monitoramento Hedônico
                const hedonico = extractHedonicFeedback(text);
                if (hedonico && studentInternalId) {
                    await supabase.from('monitoramento_hedonico').insert({
                        data_hora: timestamp,
                        aluno_id: studentInternalId,
                        feedback_afeto: String(hedonico.prazer),
                        acordo_intensidade: hedonico.esforco,
                        acao_tomada: 'Monitoramento Automático'
                    });
                }
            }
            return NextResponse.json({ status: 'success' });
        }
    } catch (error) {
        console.error('[App Webhook] Error:', error);
        return NextResponse.json({ status: 'error' }, { status: 500 });
    }
    return NextResponse.json({ status: 'not found' }, { status: 404 });
}

async function askGemini(text: string) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn('GEMINI_API_KEY not found. Using fallback analysis.');
        return fallbackAnalyzeResponse(text);
    }
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `
Analise a seguinte mensagem enviada por um aluno de academia.
Determine se o motivo principal do aluno não estar indo treinar é uma Barreira Interna (BI - problemas com a academia, professor, ambiente cheio, dores/lesões, desmotivação) ou Barreira Externa (BE - viagem, trabalho, pouco tempo, problema familiar, problema de saúde não relacionado à academia).
Retorne um objeto JSON estrito com o seguinte formato:
{"classification": "BI" ou "BE", "summary": "Resumo humano do motivo com no MÁXIMO 10 palavras"}. 
Se não houver nenhum motivo explícito de falta, responda com classification "N/A" e summary "N/A".
-----------------------
Mensagem do aluno: "${text}"
` }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.1
                }
            })
        });

        const data = await response.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
            return JSON.parse(jsonText);
        }
    } catch (error) {
        console.error('Gemini error:', error);
    }
    return fallbackAnalyzeResponse(text);
}

function fallbackAnalyzeResponse(text: string) {
    const lower = text.toLowerCase();

    // BI (Internal)
    if (lower.includes('professor') || lower.includes('atendimento')) return { classification: 'BI', summary: 'Problema com professor/atendimento' };
    if (lower.includes('cheio') || lower.includes('lotado')) return { classification: 'BI', summary: 'Academia muito cheia' };
    if (lower.includes('dor') || lower.includes('lesão') || lower.includes('machucado')) return { classification: 'BI', summary: 'Dor / Lesão física' };
    if (lower.includes('preguiça') || lower.includes('desanimado') || lower.includes('difícil')) return { classification: 'BI', summary: 'Desmotivação' };

    // BE (External)
    if (lower.includes('viagem') || lower.includes('feriado')) return { classification: 'BE', summary: 'Em viagem / Feriado' };
    if (lower.includes('trabalho') || lower.includes('reunião') || lower.includes('tempo')) return { classification: 'BE', summary: 'Sem tempo / Excesso de trabalho' };
    if (lower.includes('doença') || lower.includes('médico') || lower.includes('internado')) return { classification: 'BE', summary: 'Problema de saúde externa' };

    return { classification: 'N/A', summary: 'N/A' };
}

function extractHedonicFeedback(text: string) {
    const numbers = text.match(/\d+/g);
    if (numbers && numbers.length >= 1) {
        const value = parseInt(numbers[0]);
        if (value >= 0 && value <= 10) {
            return {
                prazer: value,
                esforco: numbers[1] ? parseInt(numbers[1]) : 5
            };
        }
    }
    return null;
}
