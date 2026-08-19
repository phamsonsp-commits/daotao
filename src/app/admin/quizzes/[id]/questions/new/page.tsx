import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { createQuestion } from "@/lib/actions/quizzes";
import { QuestionForm } from "@/components/QuestionForm";

export default async function NewQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const quiz = await prisma.quiz.findUnique({ where: { id }, select: { id: true, title: true } });
  if (!quiz) notFound();

  const boundCreate = createQuestion.bind(null, quiz.id);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-slate-900">
        Thêm câu hỏi — {quiz.title}
      </h1>
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
        <QuestionForm action={boundCreate} submitLabel="Thêm câu hỏi" />
      </div>
    </div>
  );
}
