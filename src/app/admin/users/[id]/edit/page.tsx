import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { updateUser, deleteUser } from "@/lib/actions/users";
import { LEVEL_LABELS, LEVEL_ORDER, ROLE_LABELS } from "@/lib/labels";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();

  const boundUpdate = updateUser.bind(null, user.id);
  const boundDelete = deleteUser.bind(null, user.id);

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Sửa người dùng</h1>
        <form action={boundDelete}>
          <button className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
            Xoá
          </button>
        </form>
      </div>
      <form
        action={boundUpdate}
        className="mt-6 space-y-4 rounded-lg border border-slate-200 bg-white p-6"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Họ tên
          </label>
          <input
            name="name"
            required
            defaultValue={user.name}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            disabled
            defaultValue={user.email}
            className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Đặt lại mật khẩu (để trống nếu không đổi)
          </label>
          <input
            type="password"
            name="password"
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
              defaultValue={user.role}
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
              defaultValue={user.level}
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
            defaultValue={user.department ?? ""}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
          Lưu thay đổi
        </button>
      </form>
    </div>
  );
}
