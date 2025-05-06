'use server';

import * as z from 'zod';
import bcrypt from 'bcrypt';

import { RegisterSchema } from '@/schemas';
import { db } from '@/lib/db';
import { getUserByEmail } from '@/data/user';
import { generateVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/mail';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';

export const register = async (
  values: z.infer<typeof RegisterSchema>,
  isFromOAuth?: boolean
) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Campos inválidos!' };
  }

  const { email, name, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: 'Email já está em uso!' };
  }

  // Verificamos se o usuário veio do OAuth explicitamente ou pelo email
  const isOAuthUser = isFromOAuth || email.includes('@gmail.com');

  // Criar o usuário
  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      // Se o usuário veio do Google, já marcamos como verificado
      emailVerified: isOAuthUser ? new Date() : null
    }
  });

  console.log("Usuário criado:", user.id, user.email);

  // Se o usuário veio do Google, não enviamos email de confirmação
  if (!isOAuthUser) {
    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(verificationToken.email, verificationToken.token);
    return { 
      success: 'Email de confirmação enviado!',
      redirect: '/auth/login'
    };
  } else {
    // Para usuários que vieram do Google, redirecionamos para seleção de organização
    return { 
      success: 'Conta criada com sucesso!',
      redirect: DEFAULT_LOGIN_REDIRECT
    };
  }
};
