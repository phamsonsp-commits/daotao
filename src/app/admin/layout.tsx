import Link from "next/link";
import { requireAdmin } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  const links = [
    { href: "/admin", label: "Tổng quan" },
    { href: "/admin/documents", label: "Tài liệu" },
    { href: "/admin/programs", label: "Chương trình đào tạo" },
    { href: "/admin/quizzes", label: "Bài đánh giá" },
    { href: "/admin/users", label: "Người dùng" },
  ];

  return (
    <div>
      <nav className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3 text-sm">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
