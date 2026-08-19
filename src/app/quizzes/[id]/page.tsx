import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { submitQuizAttempt } from "@/lib/actions/quizzes";
import { LEVEL_LABELS } from "@/lib/labels";

export default async function TakeQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!quiz) notFound();

  const attempts = await prisma.quizAttempt.findMany({
    where: { quizId: id, userId: user.id },
    orderBy: { submittedAt: "desc" },
  });
  const latest = attempts[0];
  const latestAnswers: Record<string, number[]> = latest
    ? JSON.parse(latest.answers)
    : {};

  const boundSubmit = submitQuizAttempt.bind(null, quiz.id);

  return (
    <div className="max-w-2xl">
      <Link href="/quizzes" className="text-sm text-indigo-600 hover:underline">
        ← Quay lại bài đánh giá
      </Link>

      <div className="mt-3 flex items-center gap-2 text-xs">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
          {LEVEL_LABELS[quiz.level]}
        </span>
        <span className="text-slate-400">Cần đạt {quiz.passScore}%</span>
      </div>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">{quiz.title}</h1>
      {quiz.description && (
        <p className="mt-1 text-sm text-slate-500">{quiz.description}</p>
      )}

      {latest && (
        <div
          className={
            latest.passed
              ? "mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
              : "mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          }
        >
          Kết quả gần nhất: <strong>{latest.score}%</strong> —{" "}
          {latest.passed ? "Đạt yêu cầu" : "Chưa đạt yêu cầu"} (
          {new Date(latest.submittedAt).toLocaleString("vi-VN")})
          {attempts.length > 1 && (
            <span className="ml-1 text-xs text-slate-500">
              · Đã làm {attempts.length} lần
            </span>
          )}
        </div>
      )}

      {quiz.questions.length === 0 ? (
        <p className="mt-6 text-sm text-slate-400">
          Bài đánh giá này chưa có câu hỏi.
        </p>
      ) : (
        <form action={boundSubmit} className="mt-6 space-y-6">
          {quiz.questions.map((q, index) => {
            const options: string[] = JSON.parse(q.options);
            const correct: number[] = JSON.parse(q.correctIndexes);
            const previouslySelected = new Set(latestAnswers[q.id] ?? []);
            const inputType = q.type === "SINGLE_CHOICE" ? "radio" : "checkbox";

            return (
              <div
                key={q.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <p className="font-medium text-slate-800">
                  Câu {index + 1}. {q.text}
                </p>
                <div className="mt-3 space-y-2">
                  {options.map((opt, i) => {
                    const wasCorrect = correct.includes(i);
                    const showReview = !!latest;
                    return (
                      <label
                        key={i}
                        className={
                          "flex items-center gap-2 rounded-md border px-3 py-2 text-sm " +
                          (showReview && wasCorrect
                            ? "border-emerald-300 bg-emerald-50"
                            : showReview && previouslySelected.has(i)
                              ? "border-red-300 bg-red-50"
                              : "border-slate-200")
                        }
                      >
                        <input
                          type={inputType}
                          name={`q_${q.id}`}
                          value={i}
                          defaultChecked={previouslySelected.has(i)}
                        />
                        {opt}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            {latest ? "Làm lại bài đánh giá" : "Nộp bài"}
          </button>
        </form>
      )}
    </div>
  );
}
