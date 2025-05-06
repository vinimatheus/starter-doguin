'use client';

import * as z from 'zod';
import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from "next-auth/react";

import { cn } from '@/lib/utils';

import { RegisterSchema } from '@/schemas';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/auth/form-error';
import { FormSucess } from '@/components/auth/form-sucess';

import { register } from '@/actions/register';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import Link from 'next/link';
import { FaGoogle } from "react-icons/fa";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();

  const searchParams = useSearchParams();
  const router = useRouter();
  
  const emailParam = searchParams.get("email");
  const errorType = searchParams.get("error");
  const isOAuthError = errorType === "oauth_user_not_found";
  
  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: '',
      email: emailParam || '',
      password: ''
    }
  });
  
  // Atualizar o formulário se o parâmetro de email mudar
  useEffect(() => {
    if (emailParam) {
      form.setValue("email", emailParam);
    }
  }, [emailParam, form]);

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setError('');
    setSuccess('');

    startTransition(() => {
      register(values, isOAuthError).then((data) => {
        if (data?.error) {
          form.reset();
          setError(data.error);
        }

        if (data?.success) {
          form.reset();
          setSuccess(data.success);
          
          // Se houver um redirecionamento após o registro
          if (data.redirect) {
            setTimeout(() => {
              router.push(data.redirect);
            }, 2000);
          }
        }
      });
    });
  };
  
  const onClick = () => {
    // Registro com Google
    signIn('google', { 
      callbackUrl: '/select-organization',
      redirect: true
    });
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Crie sua conta</CardTitle>
          <CardDescription>
            {isOAuthError 
              ? "Registre-se para continuar" 
              : "Escolha como deseja se registrar"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isOAuthError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Você precisa criar uma conta antes de entrar com Google. Clique no botão abaixo para criar uma conta com seu Google.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="mb-4">
            <Button
              size="lg"
              className="w-full flex items-center justify-center gap-2" 
              variant="outline"
              onClick={onClick}
              type="button"
            >
              <FaGoogle className="h-5 w-5" />
              <span>
                {isOAuthError ? "Criar conta com Google" : "Registrar com Google"}
              </span>
            </Button>
          </div>
          
          <div className="relative text-center text-sm mb-4 after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Ou continue com email
            </span>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6">
                {/* Nome */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="João Silva"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending || !!emailParam}
                          placeholder="joao.silva@exemplo.com"
                          type="email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Senha */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="******"
                          type="password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormError message={error} />
              <FormSucess message={success} />
              <div className="mt-4">
                <Button disabled={isPending} type="submit" className="w-full">
                  Criar conta
                </Button>
              </div>
            </form>
          </Form>
          <Link href="/auth/login">
            <Button variant="link" size={'sm'} className="w-full">
              Já tem conta criada? Faça login aqui
            </Button>
          </Link>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        Ao clicar em continuar, você concorda com nossos{' '}
        <a href="#">Termos de Serviço</a> e{' '}
        <a href="#">Política de Privacidade</a>.
      </div>
    </div>
  );
}

export default RegisterForm;
