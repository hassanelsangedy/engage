
'use server'

import { appendToSheet, getSheetRows } from '@/lib/sheets'
import bcrypt from 'bcryptjs'

export async function registerUser(formData: FormData) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as string

    // 1. Validations
    if (!name || !email || !password || !role) {
        return { success: false, error: 'Todos os campos são obrigatórios' }
    }

    if (!email.toLowerCase().endsWith('@evoque.com.br') && !email.toLowerCase().endsWith('@evoque.com')) {
        return { success: false, error: 'Utilize um e-mail corporativo @evoque.com.br' }
    }

    try {
        // 2. Check if user already exists
        const rows = await getSheetRows('Usuarios');
        const existing = rows.find((r: any) =>
            String(r.Email || r.email || '').toLowerCase().trim() === email.toLowerCase().trim()
        );

        if (existing) {
            return { success: false, error: 'Este e-mail já está registado' }
        }

        // 3. Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 4. Register in Google Sheets
        // Following user request for headers: id, name, email, password_hash, role, status, createdAt
        // and also map to existing system headers for compatibility
        await appendToSheet('Usuarios', {
            id: Math.random().toString(36).substring(2, 9),
            name: name,
            Email: email, // Maps to current auth
            email: email, // Requested header
            'Senha (Hash para colar na planilha)': passwordHash, // Maps to current auth
            password_hash: passwordHash, // Requested header
            Role: role, // Maps to current auth
            role: role, // Requested header
            Status: 'Pendente',
            status: 'Pendente',
            CreatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
        });

        return { success: true }
    } catch (error: any) {
        console.error('Registration Error:', error.message);
        return { success: false, error: 'Falha ao processar registo' }
    }
}
