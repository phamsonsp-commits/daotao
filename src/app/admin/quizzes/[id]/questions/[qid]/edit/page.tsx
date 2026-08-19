import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { updateQuestion, deleteQuestion } from "@/lib/actions/quizzes";
import { QuestionForm } from "@/components/QuestionForm";

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string; qid: string }>;
}) {
  await requireAdmin();
  const { id, qid } = await params;

  const question = await prisma.question.findUnique({ where: { id: qid } });
  if (!question || question.quizId !== id) notFound();

  const boundUpdate = updateQuestion.bind(null, id, qid);
  const boundDelete = deleteQuestion.bind(null, id, qid);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Sửa câu hỏi</h1>
        <form action={boundDelete}>
          <button className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
            Xoá câu hỏi
          </button>
        </form>
      </div>
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
        <QuestionForm
          action={boundUpdate}
          submitLabel="Lưu thay đổi"
          defaultValues={{
            text: question.text,
            type: question.type,
            options: JSON.parse(question.options),
            correctIndexes: JSON.parse(question.correctIndexes),
          }}
        />
      </div>
    </div>
  );
}
