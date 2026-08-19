import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { LEVEL_LABELS } from "@/lib/labels";

export default async function AdminQuizzesPage() {
  await requireAdmin();

  const quizzes = await prisma.quiz.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      program: { select: { title: true } },
      _count: { select: { questions: true, attempts: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Bài đánh giá
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Kiểm tra kiến thức theo từng cấp độ nhân sự.
          </p>
        </div>
        <Link
          href="/admin/quizzes/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          + Tạo bài đánh giá
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Tên bài đánh giá</th>
              <th className="px-4 py-3">Cấp độ</th>
              <th className="px-4 py-3">Chương trình</th>
              <th className="px-4 py-3">Câu hỏi</th>
              <th className="px-4 py-3">Lượt làm bài</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {quizzes.map((quiz) => (
              <tr key={quiz.id}>
                <td className="px-4 py-3 font-medium text-slate-800">
                  {quiz.title}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {LEVEL_LABELS[quiz.level]}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {quiz.program?.title ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {quiz._count.questions}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {quiz._count.attempts}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/quizzes/${quiz.id}/edit`}
                    className="text-indigo-600 hover:underline"
                  >
                    Quản lý
                  </Link>
                </td>
              </tr>
            ))}
            {quizzes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Chưa có bài đánh giá nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
