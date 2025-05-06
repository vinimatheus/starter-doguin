/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient, UserRole } = require('@prisma/client');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require('bcrypt');
 
const prismadb = new PrismaClient();

async function main() {
  try {
    console.log('Iniciando limpeza do banco de dados...');

    // Remover todos os convites
    try {
      await prismadb.invitation.deleteMany({});
      console.log('✅ Convites removidos');
    } catch (_) {
      console.log('⚠️ Falha ao remover convites');
    }

    try {
      await prismadb.membership.deleteMany({});
      console.log('✅ Associações de membros removidas');
    } catch (_) {
      console.log('⚠️ Falha ao remover associações de membros');
    }

    // Remover todas as organizações
    try {
      await prismadb.organization.deleteMany({});
      console.log('✅ Organizações removidas');
    } catch (_) {
      console.log('⚠️ Falha ao remover organizações');
    }

    // Remover todas as contas
    try {
      await prismadb.account.deleteMany({});
      console.log('✅ Contas removidas');
    } catch (_) {
      console.log('⚠️ Falha ao remover contas');
    }

    // Remover todas as sessões (se existir a tabela)
    try {
      // Verificar se a tabela existe fazendo uma consulta segura
      await prismadb.$executeRaw`DELETE FROM "Session";`;
      console.log('✅ Sessões removidas');
    } catch (_) {
      console.log('⚠️ Tabela de sessões não encontrada ou não pode ser limpa');
    }

    // Remover todos os usuários
    try {
      await prismadb.user.deleteMany({});
      console.log('✅ Usuários removidos');
    } catch (_) {
      console.log('⚠️ Falha ao remover usuários');
    }

    console.log('Banco de dados limpo com sucesso!');

    // Lista de usuários a serem criados
    const users = [
      { name: 'Vinicius Matheus Moreira', email: 'vinicius@profood.com.br' },
    ];

    const fixedPassword = 'Dadada321';
    
    // Criar usuários
    for (const userData of users) {
      // Criar senha para novo usuário
      const hashedPassword = await bcrypt.hash(fixedPassword, 10);
      
      // Criar usuário administrador
      const user = await prismadb.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: UserRole.ADMIN,
          emailVerified: new Date(),
        },
      });

      console.log(`Usuário ${userData.name} criado com ID: ${user.id} e senha: ${fixedPassword}`);
    }
  } catch (error) {
    console.error('Erro ao criar/atualizar usuários:', error);
  } finally {
    await prismadb.$disconnect();
  }
}

main()
  .then(async () => {
    await prismadb.$disconnect();
    console.log('🎉 Banco de dados resetado com sucesso!');
  })
  .catch(async (e) => {
    console.error(e);
    await prismadb.$disconnect();
    process.exit(1);
  });