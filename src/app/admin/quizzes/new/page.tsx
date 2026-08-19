import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { createQuiz } from "@/lib/actions/quizzes";
import { LEVEL_LABELS, LEVEL_ORDER } from "@/lib/labels";

export default async function NewQuizPage({
  searchParams,
}: {
  searchParams: Promise<{ programId?: string }>;
}) {
  await requireAdmin();
  const { programId } = await searchParams;

  const programs = await prisma.trainingProgram.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true, level: true },
  });
  const preselected = programId
    ? programs.find((p) => p.id === programId)
    : undefined;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-slate-900">
        Tạo bài đánh giá
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Sau khi tạo, bạn có thể thêm câu hỏi trắc nghiệm cho bài đánh giá này.
      </p>

      <form
        action={createQuiz}
        className="mt-6 space-y-4 rounded-lg border border-slate-200 bg-white p-6"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Tên bài đánh giá
          </label>
          <input
            name="title"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="VD: Đánh giá kiến thức Quy chế nghỉ phép"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Mô tả
          </label>
          <textarea
            name="description"
            rows={2}
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
              defaultValue={preselected?.level ?? "STAFF"}
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
              defaultValue={70}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Thuộc chương trình đào tạo (không bắt buộc)
          </label>
          <select
            name="programId"
            defaultValue={programId ?? ""}
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
        <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
          Tạo bài đánh giá
        </button>
      </form>
    </div>
  );
}
