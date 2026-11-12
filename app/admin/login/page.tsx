import { Logo } from "@/components/ui/Logo";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-md rounded-3xl border border-line bg-card p-8 sm:p-10">
        <Logo />
        <h1 className="mt-8 text-3xl">Team sign-in</h1>
        <p className="mt-2 text-body-muted">Enter the admin password to view enquiries.</p>
        <LoginForm next={typeof next === "string" ? next : ""} />
      </div>
    </main>
  );
}
