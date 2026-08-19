import { requireAdmin } from "@/lib/session";
import { createProgram } from "@/lib/actions/programs";
import { LEVEL_LABELS, LEVEL_ORDER } from "@/lib/labels";

export default async function NewProgramPage() {
  await requireAdmin();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-slate-900">
        Tạo chương trình đào tạo
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Sau khi tạo, bạn có thể thêm tài liệu thủ công hoặc dùng chức năng tự
        động tạo từ kho quy chế / quy trình / tài liệu công ty theo cấp độ.
      </p>

      <form action={createProgram} className="mt-6 space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Tên chương trình
          </label>
          <input
            name="title"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="VD: Đào tạo hội nhập cho Nhân viên mới"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Mô tả
          </label>
          <textarea
            name="description"
            rows={3}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Cấp độ nhân sự áp dụng
          </label>
          <select
            name="level"
            defaultValue="STAFF"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {LEVEL_ORDER.map((value) => (
              <option key={value} value={value}>
                {LEVEL_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Tạo chương trình
        </button>
      </form>
    </div>
  );
}
