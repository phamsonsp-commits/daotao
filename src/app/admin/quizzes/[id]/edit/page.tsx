import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { updateQuizMeta, deleteQuiz, deleteQuestion } from "@/lib/actions/quizzes";
import { LEVEL_LABELS, LEVEL_ORDER } from "@/lib/labels";

const TYPE_LABELS: Record<string, string> = {
  SINGLE_CHOICE: "Một đáp án đúng",
  MULTI_CHOICE: "Nhiều đáp án đúng",
};

export default async function EditQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [quiz, programs] = await Promise.all([
    prisma.quiz.findUnique({
      where: { id },
      include: { questions: { orderBy: { order: "asc" } } },
    }),
    prisma.trainingProgram.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
  ]);
  if (!quiz) notFound();

  const boundUpdateMeta = updateQuizMeta.bind(null, quiz.id);
  const boundDelete = deleteQuiz.bind(null, quiz.id);

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">{quiz.title}</h1>
        <form action={boundDelete}>
          <button className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
            Xoá bài đánh giá
          </button>
        </form>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-700">Thông tin chung</h2>
        <form action={boundUpdateMeta} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Tên bài đánh giá
            </label>
            <input
              name="title"
              required
              defaultValue={quiz.title}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Mô tả
            </label>
            <textarea
              name="description"
              rows={2}
              defaultValue={quiz.description}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Cấp độ áp dụng
              </label>
              <select
                name="level"
                defaultValue={quiz.level}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                {LEVEL_ORDER.map((value) => (
                  <option key={value} value={value}>
                    {LEVEL_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Điểm đạt tối thiểu (%)
              </label>
              <input
                type="number"
                name="passScore"
                min={1}
                max={100}
                defaultValue={quiz.passScore}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Thuộc chương trình đào tạo
            </label>
            <select
              name="programId"
              defaultValue={quiz.programId ?? ""}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Không thuộc chương trình nào</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <button className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
            Lưu thông tin
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">
            Câu hỏi ({quiz.questions.length})
          </h2>
          <Link
            href={`/admin/quizzes/${quiz.id}/questions/new`}
            className="text-sm text-indigo-600 hover:underline"
          >
            + Thêm câu hỏi
          </Link>
        </div>
        <ol className="mt-4 space-y-2">
          {quiz.questions.map((q, index) => (
            <li
              key={q.id}
              className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2"
            >
              <div>
                <div className="text-xs text-slate-500">
                  Câu {index + 1} · {TYPE_LABELS[q.type]}
                </div>
                <div className="font-medium text-slate-800">{q.text}</div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Link
                  href={`/admin/quizzes/${quiz.id}/questions/${q.id}/edit`}
                  className="text-indigo-600 hover:underline"
                >
                  Sửa
                </Link>
                <form action={deleteQuestion.bind(null, quiz.id, q.id)}>
                  <button className="text-red-600 hover:underline">Xoá</button>
                </form>
              </div>
            </li>
          ))}
          {quiz.questions.length === 0 && (
            <p className="text-sm text-slate-400">Chưa có câu hỏi nào.</p>
          )}
        </ol>
      </section>
    </div>
  );
}
