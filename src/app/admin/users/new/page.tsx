import { requireAdmin } from "@/lib/session";
import { createUser } from "@/lib/actions/users";
import { LEVEL_LABELS, LEVEL_ORDER, ROLE_LABELS } from "@/lib/labels";

export default async function NewUserPage() {
  await requireAdmin();

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-slate-900">
        Tạo người dùng mới
      </h1>
      <form
        action={createUser}
        className="mt-6 space-y-4 rounded-lg border border-slate-200 bg-white p-6"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Họ tên
          </label>
          <input
            name="name"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Mật khẩu
          </label>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Vai trò
            </label>
            <select
              name="role"
              defaultValue="EMPLOYEE"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Cấp độ
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
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Phòng ban
          </label>
          <input
            name="department"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
          Tạo người dùng
        </button>
      </form>
    </div>
  );
}
