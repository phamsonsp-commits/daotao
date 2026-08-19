import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

export default async function AdminHomePage() {
  await requireAdmin();

  const [
    documentCount,
    programCount,
    publishedProgramCount,
    quizCount,
    userCount,
    attemptCount,
    passedAttemptCount,
  ] = await Promise.all([
    prisma.document.count(),
    prisma.trainingProgram.count(),
    prisma.trainingProgram.count({ where: { status: "PUBLISHED" } }),
    prisma.quiz.count(),
    prisma.user.count(),
    prisma.quizAttempt.count(),
    prisma.quizAttempt.count({ where: { passed: true } }),
  ]);

  const passRate = attemptCount > 0 ? Math.round((passedAttemptCount / attemptCount) * 100) : null;

  const cards = [
    { label: "Tài liệu", value: documentCount, href: "/admin/documents" },
    {
      label: "Chương trình đào tạo",
      value: `${publishedProgramCount}/${programCount} đã phát hành`,
      href: "/admin/programs",
    },
    { label: "Bài đánh giá", value: quizCount, href: "/admin/quizzes" },
    { label: "Người dùng", value: userCount, href: "/admin/users" },
    {
      label: "Lượt làm bài đánh giá",
      value: attemptCount,
      href: "/admin/quizzes",
    },
    {
      label: "Tỷ lệ đạt",
      value: passRate === null ? "—" : `${passRate}%`,
      href: "/admin/quizzes",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">
        Tổng quan quản trị
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Theo dõi kho tài liệu, chương trình đào tạo và kết quả đánh giá nhân
        sự.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-lg border border-slate-200 bg-white p-4 hover:border-indigo-300"
          >
            <div className="text-2xl font-semibold text-slate-900">
              {c.value}
            </div>
            <div className="mt-1 text-sm text-slate-500">{c.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
