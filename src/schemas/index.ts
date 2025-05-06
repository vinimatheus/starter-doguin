import * as z from 'zod';

export const UserRoleSchema = z.enum(['ADMIN', 'USER']);
export const MemberRoleSchema = z.enum(['OWNER', 'ADMIN', 'MEMBER']);

export const LoginSchema = z.object({
  email: z.string().email({
    message: 'Um email válido é necessário!'
  }),
  password: z.string().min(1, {
    message: 'Senha é obrigatória!'
  }),
  code: z.string().optional()
});

export const RegisterSchema = z.object({
  email: z.string().email({
    message: 'Um email válido é necessário!'
  }),
  password: z.string().min(6, {
    message: 'A senha deve ter pelo menos 6 caracteres!'
  }),
  name: z.string().min(1, {
    message: 'Nome é obrigatório!'
  })
});

export const ResetSchema = z.object({
  email: z.string().email({
    message: 'Um email válido é necessário!'
  })
});

export const NewPasswordSchema = z.object({
  password: z.string().min(6, {
    message: 'A senha deve ter pelo menos 6 caracteres!'
  })
});


export const SettingsSchema = z.object({
  name: z.string().optional(),
  role: UserRoleSchema.optional(),
  email: z.string().email().optional()
});

export const ProfileSchema = z.object({
  name: z.string().min(1, {
    message: 'Nome é obrigatório!'
  }),
  email: z.string().email({
    message: 'Email válido é obrigatório!'
  }),
  password: z.string().min(6, {
    message: 'A senha deve ter pelo menos 6 caracteres!'
  }).optional(),
  currentPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine(data => {
  // Se password for fornecido, confirmPassword deve corresponder
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"]
}).refine(data => {
  // Se password for fornecido, currentPassword também deve ser
  if (data.password && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "Senha atual é obrigatória para definir uma nova senha",
  path: ["currentPassword"]
});

export const OrganizationSchema = z.object({
  name: z.string().min(3, {
    message: 'Nome da organização deve ter pelo menos 3 caracteres!'
  }),
  description: z.string().optional()
});

export const OrganizationMemberSchema = z.object({
  email: z.string().email({
    message: 'Um email válido é necessário!'
  }),
  role: MemberRoleSchema.default('MEMBER')
});
