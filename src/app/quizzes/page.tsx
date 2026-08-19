import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { LEVEL_LABELS } from "@/lib/labels";

export default async function QuizzesPage() {
  const user = await requireUser();

  const [quizzes, attempts] = await Promise.all([
    prisma.quiz.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { questions: true } } },
    }),
    prisma.quizAttempt.findMany({
      where: { userId: user.id },
      orderBy: { submittedAt: "desc" },
    }),
  ]);

  const bestByQuiz = new Map<string, { score: number; passed: boolean }>();
  for (const a of attempts) {
    const current = bestByQuiz.get(a.quizId);
    if (!current || a.score > current.score) {
      bestByQuiz.set(a.quizId, { score: a.score, passed: a.passed });
    }
  }

  const recommended = quizzes.filter((q) => q.level === user.level);
  const others = quizzes.filter((q) => q.level !== user.level);

  const renderCard = (quiz: (typeof quizzes)[number]) => {
    const best = bestByQuiz.get(quiz.id);
    return (
      <Link
        key={quiz.id}
        href={`/quizzes/${quiz.id}`}
        className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-indigo-300 hover:shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {LEVEL_LABELS[quiz.level]}
          </span>
          {best && (
            <span
              className={
                best.passed
                  ? "rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
                  : "rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600"
              }
            >
              {best.passed ? "Đạt" : "Chưa đạt"} · {best.score}%
            </span>
          )}
        </div>
        <h3 className="mt-2 font-medium text-slate-900">{quiz.title}</h3>
        {quiz.description && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
            {quiz.description}
          </p>
        )}
        <p className="mt-2 text-xs text-slate-400">
          {quiz._count.questions} câu hỏi · Cần đạt {quiz.passScore}%
        </p>
      </Link>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Bài đánh giá</h1>
      <p className="mt-1 text-sm text-slate-500">
        Làm bài đánh giá để kiểm tra mức độ nắm quy định, quy trình theo cấp
        độ của bạn.
      </p>

      {recommended.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold uppercase text-slate-500">
            Dành cho cấp độ của bạn ({LEVEL_LABELS[user.level]})
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {recommended.map(renderCard)}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase text-slate-500">
          Bài đánh giá khác
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {others.map(renderCard)}
        </div>
        {quizzes.length === 0 && (
          <p className="text-sm text-slate-400">Chưa có bài đánh giá nào.</p>
        )}
      </div>
    </div>
  );
}
