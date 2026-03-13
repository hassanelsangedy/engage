
'use client'

import { useState } from 'react'
import Papa from 'papaparse'
import { Upload, FileUp, CheckCircle, AlertCircle } from 'lucide-react'
import { importStudents } from './actions'
import BackgroundDecoration from '@/components/ui/background-decoration'

// Helper to normalize strings (lowercase, remove accents)
const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

const findKey = (row: any, candidates: string[]) => {
    const keys = Object.keys(row);
    for (const candidate of candidates) {
        // Exact match first
        if (row[candidate]) return row[candidate];

        // Fuzzy match found key
        const foundKey = keys.find(k => normalize(k).includes(candidate));
        if (foundKey) return row[foundKey];
    }
    return null;
}

export default function AdminPage() {
    const [file, setFile] = useState<File | null>(null)
    const [status, setStatus] = useState<'idle' | 'parsing' | 'uploading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0])
            setStatus('idle')
            setMessage('')
        }
    }

    const handleUpload = async () => {
        if (!file) return

        setStatus('parsing')

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    setStatus('uploading')

                    if (results.data.length === 0) {
                        setStatus('error')
                        setMessage('O arquivo parece vazio.')
                        return
                    }

                    // Debug: Log headers found
                    console.log("Headers found:", results.meta.fields);

                    const mappedData = results.data.map((row: any) => {
                        // Normalize Keys Logic
                        const name = findKey(row, ['nome', 'aluno', 'student', 'nome do aluno', 'cliente']);
                        const evoId = findKey(row, ['id', 'id evo', 'codigo', 'matricula', 'id_cliente']);
                        const unit = findKey(row, ['unidade', 'unit', 'filial', 'loja']);

                        // Frequency and Consistency often have spaces or varying names
                        const frequencyRaw = findKey(row, ['frequencia', 'freq', 'treinos', 'visitas', 'visits', 'frequency']);
                        const consistencyRaw = findKey(row, ['consistencia', 'consist', 'semanas', 'weeks', 'consistency']);

                        return {
                            name: name,
                            evoId: String(evoId || ''), // Ensure string
                            unit: unit || 'N/A',
                            frequency: parseInt(String(frequencyRaw || '0').replace(/\D/g, '') || '0'), // Remove non-digits
                            consistency: parseInt(String(consistencyRaw || '0').replace(/\D/g, '') || '0')
                        };
                    }).filter(r => r.name && r.evoId && r.evoId !== 'undefined')

                    console.log("Importing", mappedData.length, "valid rows from", results.data.length, "total");

                    if (mappedData.length === 0) {
                        setStatus('error')
                        // Provide more detailed feedback about what columns were found vs expected
                        const foundHeaders = results.meta.fields ? results.meta.fields.join(', ') : 'Nenhum';
                        setMessage(`Nenhum dado válido encontrado. Colunas detectadas: [${foundHeaders}]. O sistema busca por colunas similares a: Nome, ID, Unidade, Frequência, Consistência.`)
                        return
                    }

                    const res = await importStudents(mappedData)

                    if (res.success) {
                        setStatus('success')
                        setMessage(`${res.count} alunos importados com sucesso!`)
                    } else {
                        setStatus('error')
                        setMessage('Erro ao salvar no banco.')
                    }
                } catch (err: any) {
                    console.error(err)
                    setStatus('error')
                    setMessage('Erro no processamento: ' + err.message)
                }
            },
            error: (err) => {
                setStatus('error')
                setMessage('Erro ao ler CSV: ' + err.message)
            }
        })
    }

    return (
        <div className="p-8 max-w-4xl mx-auto relative min-h-screen">
            <BackgroundDecoration />
            <div className="relative z-10">
                <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 text-slate-900">
                    <Upload className="w-8 h-8 text-blue-600" />
                    Importação de Dados (EVO)
                </h1>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Selecione o arquivo CSV
                        </label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FileUp className="w-10 h-10 mb-3 text-gray-400" />
                                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Clique para enviar</span> ou arraste</p>
                                    <p className="text-xs text-gray-500 max-w-xs text-center">
                                        Suporta CSV com colunas flexíveis (ex: Nome/Aluno, ID/Matrícula, Frequência/Treinos)
                                    </p>
                                </div>
                                <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                            </label>
                        </div>
                    </div>

                    {file && (
                        <div className="mb-4 text-sm text-gray-600 bg-blue-50 p-2 rounded border border-blue-100">
                            Arquivo: <span className="font-semibold">{file.name}</span>
                        </div>
                    )}

                    <button
                        onClick={handleUpload}
                        disabled={!file || status === 'parsing' || status === 'uploading'}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors shadow-sm"
                    >
                        {status === 'parsing' ? 'Lendo Arquivo...' :
                            status === 'uploading' ? 'Processando Dados...' :
                                'Iniciar Importação Inteligente'}
                    </button>

                    {status === 'success' && (
                        <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 border border-green-100">
                            <CheckCircle className="w-5 h-5" />
                            {message}
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-2 border border-red-100">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <span>{message}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
