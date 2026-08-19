import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { CATEGORY_LABELS, LEVEL_LABELS, PROGRAM_STATUS_LABELS } from "@/lib/labels";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireUser();
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const [documents, programs, quizzes] = query
    ? await Promise.all([
        prisma.document.findMany({
          where: {
            OR: [
              { title: { contains: query } },
              { summary: { contains: query } },
              { tags: { contains: query } },
              { content: { contains: query } },
            ],
          },
          take: 20,
          orderBy: { updatedAt: "desc" },
        }),
        prisma.trainingProgram.findMany({
          where: {
            status: "PUBLISHED",
            OR: [
              { title: { contains: query } },
              { description: { contains: query } },
            ],
          },
          take: 20,
          orderBy: { updatedAt: "desc" },
        }),
        prisma.quiz.findMany({
          where: {
            OR: [
              { title: { contains: query } },
              { description: { contains: query } },
            ],
          },
          take: 20,
          orderBy: { createdAt: "desc" },
        }),
      ])
    : [[], [], []];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Tìm kiếm</h1>
      <p className="mt-1 text-sm text-slate-500">
        Tìm tài liệu, chương trình đào tạo và bài đánh giá theo từ khoá.
      </p>

      <form className="mt-6 flex gap-3" action="/search">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Nhập từ khoá, ví dụ: nghỉ phép, quy trình bán hàng..."
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Tìm kiếm
        </button>
      </form>

      {!query && (
        <p className="mt-8 text-sm text-slate-400">
          Nhập từ khoá để bắt đầu tìm kiếm.
        </p>
      )}

      {query && (
        <div className="mt-8 space-y-8">
          <section>
            <h2 className="text-sm font-semibold uppercase text-slate-500">
              Tài liệu ({documents.length})
            </h2>
            <div className="mt-3 space-y-2">
              {documents.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/documents/${doc.id}`}
                  className="block rounded-lg border border-slate-200 bg-white p-3 hover:border-indigo-300"
                >
                  <div className="text-xs text-indigo-700">
                    {CATEGORY_LABELS[doc.category]} · {LEVEL_LABELS[doc.level]}
                  </div>
                  <div className="font-medium text-slate-900">{doc.title}</div>
                  {doc.summary && (
                    <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">
                      {doc.summary}
                    </p>
                  )}
                </Link>
              ))}
              {documents.length === 0 && (
                <p className="text-sm text-slate-400">Không tìm thấy tài liệu.</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase text-slate-500">
              Chương trình đào tạo ({programs.length})
            </h2>
            <div className="mt-3 space-y-2">
              {programs.map((p) => (
                <Link
                  key={p.id}
                  href={`/programs/${p.id}`}
                  className="block rounded-lg border border-slate-200 bg-white p-3 hover:border-indigo-300"
                >
                  <div className="text-xs text-indigo-700">
                    {LEVEL_LABELS[p.level]} · {PROGRAM_STATUS_LABELS[p.status]}
                  </div>
                  <div className="font-medium text-slate-900">{p.title}</div>
                </Link>
              ))}
              {programs.length === 0 && (
                <p className="text-sm text-slate-400">
                  Không tìm thấy chương trình đào tạo.
                </p>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase text-slate-500">
              Bài đánh giá ({quizzes.length})
            </h2>
            <div className="mt-3 space-y-2">
              {quizzes.map((quiz) => (
                <Link
                  key={quiz.id}
                  href={`/quizzes/${quiz.id}`}
                  className="block rounded-lg border border-slate-200 bg-white p-3 hover:border-indigo-300"
                >
                  <div className="text-xs text-indigo-700">
                    {LEVEL_LABELS[quiz.level]}
                  </div>
                  <div className="font-medium text-slate-900">{quiz.title}</div>
                </Link>
              ))}
              {quizzes.length === 0 && (
                <p className="text-sm text-slate-400">
                  Không tìm thấy bài đánh giá.
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
