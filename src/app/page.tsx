import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { LEVEL_LABELS } from "@/lib/labels";
import type { Level } from "@/generated/prisma/client";

export default async function HomePage() {
  const user = await requireUser();
  const userLevel = user.level as Level;

  const [enrollments, attempts, recommendedPrograms, recommendedQuizzes] =
    await Promise.all([
      prisma.enrollment.findMany({
        where: { userId: user.id },
        include: { program: { include: { _count: { select: { items: true } } } } },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.quizAttempt.findMany({
        where: { userId: user.id },
        orderBy: { submittedAt: "desc" },
        take: 5,
        include: { quiz: { select: { title: true } } },
      }),
      prisma.trainingProgram.findMany({
        where: { status: "PUBLISHED", level: userLevel },
        take: 4,
        include: { _count: { select: { items: true } } },
      }),
      prisma.quiz.findMany({
        where: { level: userLevel },
        take: 4,
        include: { _count: { select: { questions: true } } },
      }),
    ]);

  const inProgress = enrollments.filter((e) => e.status === "IN_PROGRESS");
  const completed = enrollments.filter((e) => e.status === "COMPLETED");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">
        Chào {user.name} 👋
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Cấp độ của bạn: {LEVEL_LABELS[user.level]}. Đây là các nội dung đào tạo
        và đánh giá dành cho bạn.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-2xl font-semibold text-slate-900">
            {inProgress.length}
          </div>
          <div className="text-sm text-slate-500">Chương trình đang học</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-2xl font-semibold text-slate-900">
            {completed.length}
          </div>
          <div className="text-sm text-slate-500">Chương trình đã hoàn thành</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-2xl font-semibold text-slate-900">
            {attempts.filter((a) => a.passed).length}/{attempts.length}
          </div>
          <div className="text-sm text-slate-500">Bài đánh giá đạt (gần đây)</div>
        </div>
      </div>

      {inProgress.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase text-slate-500">
            Tiếp tục học
          </h2>
          <div className="mt-3 space-y-2">
            {inProgress.map((e) => {
              const completedIds: string[] = JSON.parse(e.completedItems || "[]");
              const total = e.program._count.items;
              return (
                <Link
                  key={e.id}
                  href={`/programs/${e.programId}`}
                  className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-indigo-300"
                >
                  <div className="font-medium text-slate-900">
                    {e.program.title}
                  </div>
                  <div className="mt-1 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full bg-indigo-600"
                      style={{
                        width: total ? `${(completedIds.length / total) * 100}%` : "0%",
                      }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {completedIds.length}/{total} tài liệu
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase text-slate-500">
            Chương trình đào tạo gợi ý cho bạn
          </h2>
          <Link href="/programs" className="text-sm text-indigo-600 hover:underline">
            Xem tất cả →
          </Link>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {recommendedPrograms.map((p) => (
            <Link
              key={p.id}
              href={`/programs/${p.id}`}
              className="rounded-lg border border-slate-200 bg-white p-4 hover:border-indigo-300"
            >
              <div className="font-medium text-slate-900">{p.title}</div>
              <p className="mt-1 text-xs text-slate-400">
                {p._count.items} tài liệu
              </p>
            </Link>
          ))}
          {recommendedPrograms.length === 0 && (
            <p className="text-sm text-slate-400">
              Chưa có chương trình phù hợp cấp độ của bạn.
            </p>
          )}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase text-slate-500">
            Bài đánh giá gợi ý cho bạn
          </h2>
          <Link href="/quizzes" className="text-sm text-indigo-600 hover:underline">
            Xem tất cả →
          </Link>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {recommendedQuizzes.map((q) => (
            <Link
              key={q.id}
              href={`/quizzes/${q.id}`}
              className="rounded-lg border border-slate-200 bg-white p-4 hover:border-indigo-300"
            >
              <div className="font-medium text-slate-900">{q.title}</div>
              <p className="mt-1 text-xs text-slate-400">
                {q._count.questions} câu hỏi
              </p>
            </Link>
          ))}
          {recommendedQuizzes.length === 0 && (
            <p className="text-sm text-slate-400">
              Chưa có bài đánh giá phù hợp cấp độ của bạn.
            </p>
          )}
        </div>
      </section>

      {attempts.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase text-slate-500">
            Lịch sử làm bài đánh giá gần đây
          </h2>
          <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-slate-100">
                {attempts.map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-3 text-slate-800">{a.quiz.title}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(a.submittedAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          a.passed
                            ? "rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
                            : "rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600"
                        }
                      >
                        {a.score}% {a.passed ? "· Đạt" : "· Chưa đạt"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
