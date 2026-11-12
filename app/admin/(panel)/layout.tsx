import Link from "next/link";
import { logout } from "@/app/admin/login/actions";
import { Logo } from "@/components/ui/Logo";
import { requireAdmin } from "@/lib/admin-auth";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-5">
            <Link href="/admin/survey" aria-label="DarShe admin home">
              <Logo markClassName="h-6 w-auto" textClassName="text-2xl" />
            </Link>
            <span className="border-l border-line pl-3 text-sm font-medium text-body-muted sm:pl-5">
              Survey responses
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              rel="noopener"
              className="hidden text-sm font-medium text-body-muted hover:text-terracotta-dark sm:inline"
            >
              View site
            </Link>
            <form action={logout}>
              <button type="submit" className="btn-outline !px-5 !py-2 text-sm">
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1400px] px-5 py-8 sm:px-8">{children}</main>
    </div>
  );
}
