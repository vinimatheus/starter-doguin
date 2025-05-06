"use client";

import * as z from "zod";
import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';

import { cn } from "@/lib/utils";

import { LoginSchema } from "@/schemas";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/auth/form-error";
import { FormSucess } from "@/components/auth/form-sucess";

import { login } from "@/actions/login";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Separator } from "@/components/ui/separator";
import { FaGoogle } from "react-icons/fa";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const [isReturningUser, setIsReturningUser] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsReturningUser(!!user);
  }, []);

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Email já está em uso com um provedor diferente!"
      : "";

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      login(values, callbackUrl).then((data) => {
        if (data?.error) {
          form.reset();
          setError(data.error);
          return;
        }

        if (data?.success) {
          form.reset();
          setSuccess(data.success);
          return;
        }
      });
    });
  };

  const onClick = () => {
    signIn('google', {
      callbackUrl: callbackUrl || DEFAULT_LOGIN_REDIRECT
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {isReturningUser ? "Bem-vindo de volta" : "Bem-vindo"}
          </CardTitle>
          <CardDescription>Faça login</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6">
                <>
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
                            disabled={isPending}
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
                        <Button
                          size="sm"
                          variant="link"
                          asChild
                          className="px-0 font-normal"
                        >
                          <Link href="/auth/reset">Esqueceu a senha?</Link>
                        </Button>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              </div>
              <FormError message={error || urlError} />
              <FormSucess message={success} />
              <Button disabled={isPending} type="submit" className="w-full">
                Login
              </Button>
            </form>
          </Form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Ou continue com
                </span>
              </div>
            </div>

            <div className="mt-4">
              <Button
                size="lg"
                className="w-full flex items-center justify-center gap-2"
                variant="outline"
                onClick={onClick}
              >
                <FaGoogle className="h-5 w-5" />
                <span>Continuar com Google</span>
              </Button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <Link href="/auth/register" className="text-primary hover:underline">
                Cadastre-se
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
