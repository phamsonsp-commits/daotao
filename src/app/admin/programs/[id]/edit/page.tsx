import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import {
  updateProgramMeta,
  setProgramStatus,
  deleteProgram,
  addProgramItems,
  removeProgramItem,
  moveProgramItem,
  autoGenerateProgramItems,
} from "@/lib/actions/programs";
import {
  CATEGORY_LABELS,
  LEVEL_LABELS,
  LEVEL_ORDER,
  PROGRAM_STATUS_LABELS,
} from "@/lib/labels";

export default async function EditProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const program = await prisma.trainingProgram.findUnique({
    where: { id },
    include: {
      items: { orderBy: { order: "asc" }, include: { document: true } },
      quizzes: { include: { _count: { select: { questions: true } } } },
    },
  });
  if (!program) notFound();

  const includedIds = program.items.map((i) => i.documentId);
  const availableDocuments = await prisma.document.findMany({
    where: { id: { notIn: includedIds } },
    orderBy: [{ category: "asc" }, { title: "asc" }],
  });

  const boundUpdateMeta = updateProgramMeta.bind(null, program.id);
  const boundDelete = deleteProgram.bind(null, program.id);
  const boundAddItems = addProgramItems.bind(null, program.id);
  const boundAutoGenerate = autoGenerateProgramItems.bind(null, program.id);
  const publish = setProgramStatus.bind(null, program.id, "PUBLISHED");
  const unpublish = setProgramStatus.bind(null, program.id, "DRAFT");

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {program.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {PROGRAM_STATUS_LABELS[program.status]} · {LEVEL_LABELS[program.level]}
          </p>
        </div>
        <div className="flex gap-2">
          {program.status === "DRAFT" ? (
            <form action={publish}>
              <button className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500">
                Phát hành
              </button>
            </form>
          ) : (
            <form action={unpublish}>
              <button className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
                Chuyển về nháp
              </button>
            </form>
          )}
          <form action={boundDelete}>
            <button className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
              Xoá
            </button>
          </form>
        </div>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-700">Thông tin chung</h2>
        <form action={boundUpdateMeta} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Tên chương trình
            </label>
            <input
              name="title"
              required
              defaultValue={program.title}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Mô tả
            </label>
            <textarea
              name="description"
              rows={3}
              defaultValue={program.description}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-slate-700">
              Cấp độ áp dụng
            </label>
            <select
              name="level"
              defaultValue={program.level}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              {LEVEL_ORDER.map((value) => (
                <option key={value} value={value}>
                  {LEVEL_LABELS[value]}
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
        <h2 className="text-sm font-semibold text-slate-700">
          Tự động tạo nội dung từ kho tài liệu
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Gom nhanh các quy chế, quy trình, tài liệu công ty / sản phẩm phù hợp
          cấp độ (và loại tài liệu nếu chọn) vào chương trình này.
        </p>
        <form
          action={boundAutoGenerate}
          className="mt-4 flex flex-wrap items-end gap-3"
        >
          <div>
            <label className="block text-xs font-medium text-slate-600">
              Cấp độ
            </label>
            <select
              name="level"
              defaultValue={program.level}
              className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              {LEVEL_ORDER.map((value) => (
                <option key={value} value={value}>
                  {LEVEL_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">
              Loại tài liệu
            </label>
            <select
              name="category"
              defaultValue=""
              className="mt-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Tất cả loại</option>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
            Tự động thêm tài liệu phù hợp
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-700">
          Nội dung chương trình ({program.items.length} tài liệu)
        </h2>
        <ol className="mt-4 space-y-2">
          {program.items.map((item, index) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2"
            >
              <div>
                <div className="text-xs text-slate-500">
                  {index + 1}. {CATEGORY_LABELS[item.document.category]} ·{" "}
                  {LEVEL_LABELS[item.document.level]}
                </div>
                <div className="font-medium text-slate-800">
                  {item.document.title}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <form action={moveProgramItem.bind(null, program.id, item.id, "up")}>
                  <button
                    type="submit"
                    disabled={index === 0}
                    className="rounded border border-slate-300 px-2 py-1 text-slate-600 hover:bg-white disabled:opacity-30"
                  >
                    ↑
                  </button>
                </form>
                <form
                  action={moveProgramItem.bind(null, program.id, item.id, "down")}
                >
                  <button
                    type="submit"
                    disabled={index === program.items.length - 1}
                    className="rounded border border-slate-300 px-2 py-1 text-slate-600 hover:bg-white disabled:opacity-30"
                  >
                    ↓
                  </button>
                </form>
                <form action={removeProgramItem.bind(null, program.id, item.id)}>
                  <button
                    type="submit"
                    className="rounded border border-red-200 px-2 py-1 text-red-600 hover:bg-red-50"
                  >
                    Gỡ
                  </button>
                </form>
              </div>
            </li>
          ))}
          {program.items.length === 0 && (
            <p className="text-sm text-slate-400">
              Chưa có tài liệu nào trong chương trình.
            </p>
          )}
        </ol>

        <details className="mt-6">
          <summary className="cursor-pointer text-sm font-medium text-indigo-700">
            + Thêm tài liệu thủ công
          </summary>
          <form action={boundAddItems} className="mt-3 space-y-3">
            <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-slate-200 p-3">
              {availableDocuments.map((doc) => (
                <label key={doc.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="documentIds" value={doc.id} />
                  <span>
                    {doc.title}{" "}
                    <span className="text-xs text-slate-400">
                      ({CATEGORY_LABELS[doc.category]} · {LEVEL_LABELS[doc.level]})
                    </span>
                  </span>
                </label>
              ))}
              {availableDocuments.length === 0 && (
                <p className="text-sm text-slate-400">
                  Tất cả tài liệu đã có trong chương trình.
                </p>
              )}
            </div>
            <button className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
              Thêm tài liệu đã chọn
            </button>
          </form>
        </details>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">
            Bài đánh giá thuộc chương trình
          </h2>
          <Link
            href={`/admin/quizzes/new?programId=${program.id}`}
            className="text-sm text-indigo-600 hover:underline"
          >
            + Tạo bài đánh giá
          </Link>
        </div>
        <ul className="mt-3 space-y-2">
          {program.quizzes.map((quiz) => (
            <li key={quiz.id}>
              <Link
                href={`/admin/quizzes/${quiz.id}/edit`}
                className="block rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm hover:border-indigo-300"
              >
                {quiz.title}{" "}
                <span className="text-xs text-slate-400">
                  ({quiz._count.questions} câu hỏi)
                </span>
              </Link>
            </li>
          ))}
          {program.quizzes.length === 0 && (
            <p className="text-sm text-slate-400">
              Chưa có bài đánh giá nào cho chương trình này.
            </p>
          )}
        </ul>
      </section>
    </div>
  );
}
