import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { enrollInProgram, toggleProgramItem } from "@/lib/actions/enrollment";
import { CATEGORY_LABELS, LEVEL_LABELS } from "@/lib/labels";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const program = await prisma.trainingProgram.findUnique({
    where: { id },
    include: {
      items: { orderBy: { order: "asc" }, include: { document: true } },
      quizzes: true,
    },
  });
  if (!program || program.status !== "PUBLISHED") notFound();

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_programId: { userId: user.id, programId: program.id } },
  });
  const completed: string[] = enrollment
    ? JSON.parse(enrollment.completedItems || "[]")
    : [];

  const boundEnroll = enrollInProgram.bind(null, program.id);
  const total = program.items.length;
  const done = program.items.filter((i) => completed.includes(i.id)).length;

  return (
    <div className="max-w-3xl">
      <Link href="/programs" className="text-sm text-indigo-600 hover:underline">
        ← Quay lại chương trình đào tạo
      </Link>

      <div className="mt-3 flex items-center gap-2 text-xs">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
          {LEVEL_LABELS[program.level]}
        </span>
      </div>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">
        {program.title}
      </h1>
      {program.description && (
        <p className="mt-1 text-sm text-slate-500">{program.description}</p>
      )}

      {!enrollment ? (
        <form action={boundEnroll} className="mt-4">
          <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
            Bắt đầu học
          </button>
        </form>
      ) : (
        <div className="mt-4">
          <div className="h-2 w-64 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-indigo-600"
              style={{ width: total ? `${(done / total) * 100}%` : "0%" }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {done}/{total} tài liệu đã hoàn thành
            {enrollment.status === "COMPLETED" && " · Đã hoàn thành chương trình 🎉"}
          </p>
        </div>
      )}

      <ol className="mt-6 space-y-2">
        {program.items.map((item, index) => {
          const isDone = completed.includes(item.id);
          const boundToggle = toggleProgramItem.bind(null, program.id, item.id);
          return (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3"
            >
              <Link href={`/documents/${item.documentId}`} className="flex-1">
                <div className="text-xs text-slate-400">
                  {index + 1}. {CATEGORY_LABELS[item.document.category]}
                </div>
                <div
                  className={
                    isDone
                      ? "font-medium text-slate-400 line-through"
                      : "font-medium text-slate-800"
                  }
                >
                  {item.document.title}
                </div>
              </Link>
              <form action={boundToggle}>
                <button
                  type="submit"
                  className={
                    isDone
                      ? "rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700"
                      : "rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                  }
                >
                  {isDone ? "Đã học ✓" : "Đánh dấu đã học"}
                </button>
              </form>
            </li>
          );
        })}
      </ol>

      {program.quizzes.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase text-slate-500">
            Bài đánh giá
          </h2>
          <div className="mt-3 space-y-2">
            {program.quizzes.map((quiz) => (
              <Link
                key={quiz.id}
                href={`/quizzes/${quiz.id}`}
                className="block rounded-lg border border-slate-200 bg-white px-4 py-3 hover:border-indigo-300"
              >
                <div className="font-medium text-slate-800">{quiz.title}</div>
                {quiz.description && (
                  <p className="text-sm text-slate-500">{quiz.description}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
