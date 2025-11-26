"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client";
import { z } from "zod";
import { useRouter } from "next/navigation";
import SpinLoader from "./SpinLoader";

import { useTransition } from "react";

// Schema de validação com Zod
const signupSchema = z.object({
  userName: z.string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres"),
  email: z.string()
    .email("Email inválido")
    .min(1, "Email é obrigatório"),
  password: z.string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .max(100, "Senha deve ter no máximo 100 caracteres"),
  confirmPassword: z.string()
    .min(1, "Confirmação de senha é obrigatória"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"], // Define onde o erro aparece
});

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    // Extrair dados do formulário
    const rawData = {
      userName: formData.get("user") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirm-password") as string,
    };

    // Validar com Zod
    const result = signupSchema.safeParse(rawData);

    if (!result.success) {
      // Exibir o primeiro erro encontrado
      const firstError = result.error.issues[0];
      toast.error(firstError.message);
      return;
    }

    // Dados validados
    const validatedData = result.data;

    startTransition(async () => {
      const form = event.currentTarget;
      form.reset();


      await authClient.signUp.email({
        email: validatedData.email,
        password: validatedData.password,
        name: validatedData.userName,
        callbackURL: "/dashboard"
      }, {
        onRequest: () => {
          //show loading
        },
        onSuccess: () => {
          //redirect to the dashboard or sign in page
          toast.success("Conta criada com sucesso!");

          router.push("/dashboard");
        },
        onError: (ctx) => {
          // display the error message
          toast.error(ctx.error.message);
        },
      });
    })
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}
      onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Fill in the form below to create your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input name="user" id="name" type="text" placeholder="John Doe" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input name="email" id="email" type="email" placeholder="m@example.com" required />
          <FieldDescription>
            We&apos;ll use this to contact you. We will not share your email
            with anyone else.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input name="password" id="password" type="password" required />
          <FieldDescription>
            Must be at least 8 characters long.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <Input name="confirm-password" id="confirm-password" type="password" required />
          <FieldDescription>Please confirm your password.</FieldDescription>
        </Field>
        <Field>
          <Button type="submit"
            disabled={isPending}
            className="disabled:opacity-80 disabled:cursor-not-allowed"
          >
            {isPending ? <SpinLoader className="[&_div]:w-5 [&_div]:h-5 border-white" /> : "Create Account"}
          </Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <Button variant="outline" type="button"
            className="disabled:opacity-50 disabled:cursor-not-allowed">


            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                fill="currentColor"
              />
            </svg>
            Sign up with GitHub



          </Button>
          <FieldDescription className="px-6 text-center">
            Already have an account? <Link href="/login">Sign in</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
