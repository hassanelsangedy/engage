'use server';

import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getSheetRows, appendToSheet, updateRowById } from "@/lib/sheets"
import { Role, User } from "@/lib/types"

async function ensureAdmin() {
    const session = await getServerSession(authOptions)
    if ((session?.user as any)?.role !== 'ADMIN') {
        throw new Error("Unauthorized access")
    }
}

export async function getUsers(): Promise<any[]> {
    await ensureAdmin()
    const rows = await getSheetRows('Usuarios')
    return rows.map((r: any) => ({
        id: r.id || r.Email || r.email,
        name: r.name || r.Name || String(r.Email || r.email || '').split('@')[0],
        email: r.Email || r.email,
        role: (r.Role || r.role || 'PROFESSOR') as Role,
        unit: r.Unidade || r.unit || '',
        status: (r.Status || r.status || 'Ativo').trim(),
        createdAt: r.CreatedAt || r.createdAt || new Date().toISOString()
    }))
}

export async function approveUser(email: string) {
    await ensureAdmin()
    try {
        // Try searching by Email (existing header) or email (new header)
        let success = await updateRowById('Usuarios', 'Email', email, { Status: 'Ativo', status: 'Ativo' })
        if (!success) {
            success = await updateRowById('Usuarios', 'email', email, { status: 'Ativo', Status: 'Ativo' })
        }

        revalidatePath('/admin/users')
        revalidatePath('/admin')
        return { success: true }
    } catch (error) {
        console.error('Error approving user:', error)
        return { success: false, error: 'Erro ao aprovar utilizador' }
    }
}

export async function createUser(data: { name: string, email: string, password: string, role: Role, unit?: string }) {
    await ensureAdmin()

    const hashedPassword = await bcrypt.hash(data.password, 10)

    try {
        const newUser = {
            id: Math.random().toString(36).substring(2, 9),
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: data.role,
            unit: data.unit || '',
            createdAt: new Date().toISOString()
        }

        await appendToSheet('Usuarios', newUser)

        revalidatePath('/admin/users')
        return { success: true, user: newUser }
    } catch (error: any) {
        return { success: false, error: 'Erro ao criar usuário.' }
    }
}

export async function updateUserRole(userId: string, role: Role) {
    await ensureAdmin()
    try {
        await updateRowById('Usuarios', 'id', userId, { role })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Erro ao atualizar perfil.' }
    }
}

export async function deleteUser(userId: string) {
    await ensureAdmin()
    try {
        // Since we don't have a direct "deleteRow" by default in our current Sheets library,
        // we can flag as inactive or we'd need to implement row deletion.
        // For simplicity during this migration, we'll mark the role as 'DISABLED' or similar
        // if we had that role, but since we don't, we'll just log it.
        // NOTE: Full deletion from Sheets requires finding the row object and calling row.delete().
        console.warn('Delete user called for ID:', userId, '- Note: delete logic from Sheets requires implementation of deleteRow in sheets.ts');
        return { success: false, error: 'A remoção total via Sheets ainda não está ativa. Tente desativar por perfil.' }
    } catch (error) {
        return { success: false, error: 'Erro ao remover acesso.' }
    }
}
