import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { LEVEL_LABELS, ROLE_LABELS } from "@/lib/labels";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Người dùng
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý tài khoản, vai trò và cấp độ nhân sự.
          </p>
        </div>
        <Link
          href="/admin/users/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          + Tạo người dùng
        </Link>
      </div>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Họ tên</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Vai trò</th>
              <th className="px-4 py-3">Cấp độ</th>
              <th className="px-4 py-3">Phòng ban</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                <td className="px-4 py-3 text-slate-600">{ROLE_LABELS[u.role]}</td>
                <td className="px-4 py-3 text-slate-600">{LEVEL_LABELS[u.level]}</td>
                <td className="px-4 py-3 text-slate-600">{u.department ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/users/${u.id}/edit`}
                    className="text-indigo-600 hover:underline"
                  >
                    Sửa
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
