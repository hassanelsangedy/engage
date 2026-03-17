
import bcrypt from 'bcryptjs';

const users = [
    { email: 'admin@evoque.com', password: 'admin_evoque_2024', role: 'ADMIN', name: 'Administrador' },
    { email: 'coord@evoque.com', password: 'coord_evoque_2024', role: 'COORDINATOR', name: 'Coordenador' },
    { email: 'recepcao@evoque.com', password: 'recepcao_evoque_2024', role: 'RECEPTION', name: 'Recepção' },
    { email: 'professor@evoque.com', password: 'prof_evoque_2024', role: 'PROFESSOR', name: 'Professor' }
];

async function generateHashes() {
    console.log('--- GERADOR DE HASHES PARA GOOGLE SHEETS ---');
    console.log('Copie e cole estes valores na aba "Usuarios" da sua planilha:\n');

    for (const user of users) {
        const hash = await bcrypt.hash(user.password, 10);
        console.log(`Email: ${user.email}`);
        console.log(`Hash: ${hash}`);
        console.log(`Role: ${user.role}`);
        console.log('-------------------');
    }
}

generateHashes();
