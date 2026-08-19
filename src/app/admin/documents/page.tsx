import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { CATEGORY_LABELS, LEVEL_LABELS } from "@/lib/labels";

export default async function AdminDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;

  const documents = await prisma.document.findMany({
    orderBy: { updatedAt: "desc" },
    include: { createdBy: { select: { name: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Quản lý tài liệu
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Quy chế, quy trình và tài liệu công ty / sản phẩm dùng làm nguồn dữ
            liệu cho đào tạo và đánh giá.
          </p>
        </div>
        <Link
          href="/admin/documents/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          + Tạo tài liệu
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
              <th className="px-4 py-3">Tiêu đề</th>
              <th className="px-4 py-3">Loại</th>
              <th className="px-4 py-3">Cấp độ</th>
              <th className="px-4 py-3">Người tạo</th>
              <th className="px-4 py-3">Cập nhật</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td className="px-4 py-3 font-medium text-slate-800">
                  {doc.title}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {CATEGORY_LABELS[doc.category]}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {LEVEL_LABELS[doc.level]}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {doc.createdBy?.name}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {doc.updatedAt.toLocaleDateString("vi-VN")}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/documents/${doc.id}/edit`}
                    className="text-indigo-600 hover:underline"
                  >
                    Sửa
                  </Link>
                </td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Chưa có tài liệu nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
