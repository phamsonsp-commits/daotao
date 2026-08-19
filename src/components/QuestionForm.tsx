import { MAX_OPTIONS } from "@/lib/quiz-constants";

type Props = {
  action: (formData: FormData) => void;
  submitLabel: string;
  defaultValues?: {
    text?: string;
    type?: string;
    options?: string[];
    correctIndexes?: number[];
  };
};

export function QuestionForm({ action, submitLabel, defaultValues = {} }: Props) {
  const options = defaultValues.options ?? [];
  const correct = new Set(defaultValues.correctIndexes ?? []);
  const slots = Array.from({ length: MAX_OPTIONS }, (_, i) => i);

  return (
    <form action={action} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Nội dung câu hỏi
        </label>
        <textarea
          name="text"
          rows={2}
          required
          defaultValue={defaultValues.text}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="max-w-xs">
        <label className="block text-sm font-medium text-slate-700">
          Dạng câu hỏi
        </label>
        <select
          name="type"
          defaultValue={defaultValues.type ?? "SINGLE_CHOICE"}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="SINGLE_CHOICE">Một đáp án đúng</option>
          <option value="MULTI_CHOICE">Nhiều đáp án đúng</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Các lựa chọn (đánh dấu ô bên phải nếu là đáp án đúng, để trống dòng
          không dùng)
        </label>
        <div className="mt-2 space-y-2">
          {slots.map((i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-5 text-xs text-slate-400">{i + 1}.</span>
              <input
                name={`option_${i}`}
                defaultValue={options[i] ?? ""}
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder={`Lựa chọn ${i + 1}`}
              />
              <label className="flex items-center gap-1 text-xs text-slate-600">
                <input
                  type="checkbox"
                  name={`correct_${i}`}
                  defaultChecked={correct.has(i)}
                />
                Đúng
              </label>
            </div>
          ))}
        </div>
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
