import type { Metadata } from "next";
import "./globals.css";
import { auth } from "@/auth";
import Link from "next/link";
import { ROLE_LABELS, LEVEL_LABELS } from "@/lib/labels";
import { logout } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Đào tạo nội bộ",
  description: "Nền tảng đào tạo nội bộ về quy định, quy trình công ty",
};

export default async function RootLayout({
  children,
}: LayoutProps<"/">) {
  const session = await auth();
  const user = session?.user;

  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 font-sans text-slate-900">
        {user && (
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="flex flex-wrap items-center gap-5">
                <Link href="/" className="text-base font-semibold text-indigo-700">
                  Đào tạo nội bộ
                </Link>
                <nav className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <Link href="/documents" className="hover:text-indigo-700">
                    Thư viện tài liệu
                  </Link>
                  <Link href="/programs" className="hover:text-indigo-700">
                    Chương trình đào tạo
                  </Link>
                  <Link href="/quizzes" className="hover:text-indigo-700">
                    Bài đánh giá
                  </Link>
                  <Link href="/search" className="hover:text-indigo-700">
                    Tìm kiếm
                  </Link>
                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="font-medium text-indigo-700 hover:text-indigo-900"
                    >
                      Quản trị
                    </Link>
                  )}
                </nav>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="text-right leading-tight">
                  <div className="font-medium text-slate-800">{user.name}</div>
                  <div className="text-xs text-slate-500">
                    {ROLE_LABELS[user.role] ?? user.role} ·{" "}
                    {LEVEL_LABELS[user.level] ?? user.level}
                  </div>
                </div>
                <form action={logout}>
                  <button
                    type="submit"
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-600 hover:bg-slate-100"
                  >
                    Đăng xuất
                  </button>
                </form>
              </div>
            </div>
          </header>
        )}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
