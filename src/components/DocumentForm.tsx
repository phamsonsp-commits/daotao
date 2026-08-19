import { CATEGORY_LABELS, LEVEL_LABELS, LEVEL_ORDER } from "@/lib/labels";

type Props = {
  action: (formData: FormData) => void;
  submitLabel: string;
  defaultValues?: {
    title?: string;
    category?: string;
    level?: string;
    tags?: string;
    summary?: string;
    content?: string;
    version?: string;
  };
};

export function DocumentForm({ action, submitLabel, defaultValues = {} }: Props) {
  return (
    <form action={action} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Tiêu đề tài liệu
        </label>
        <input
          name="title"
          required
          defaultValue={defaultValues.title}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="VD: Quy chế nghỉ phép năm 2026"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Loại tài liệu
          </label>
          <select
            name="category"
            defaultValue={defaultValues.category ?? "QUY_CHE"}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Cấp độ áp dụng
          </label>
          <select
            name="level"
            defaultValue={defaultValues.level ?? "STAFF"}
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
            Phiên bản
          </label>
          <input
            name="version"
            defaultValue={defaultValues.version ?? "1.0"}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Từ khoá (cách nhau bởi dấu phẩy)
        </label>
        <input
          name="tags"
          defaultValue={defaultValues.tags}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="nghỉ phép, nhân sự, hr"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Tóm tắt ngắn
        </label>
        <textarea
          name="summary"
          rows={2}
          defaultValue={defaultValues.summary}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Tóm tắt nội dung chính để hiển thị trong danh sách và kết quả tìm kiếm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Nội dung (hỗ trợ Markdown)
        </label>
        <textarea
          name="content"
          rows={16}
          required
          defaultValue={defaultValues.content}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
          placeholder={"## Mục đích\n\n...\n\n## Phạm vi áp dụng\n\n..."}
        />
      </div>

      <button
        type="submit"
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
      >
        {submitLabel}
      </button>
    </form>
  );
}
