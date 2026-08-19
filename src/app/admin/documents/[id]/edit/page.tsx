import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { updateDocument, deleteDocument } from "@/lib/actions/documents";
import { DocumentForm } from "@/components/DocumentForm";

export default async function EditDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) notFound();

  const boundUpdate = updateDocument.bind(null, doc.id);
  const boundDelete = deleteDocument.bind(null, doc.id);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Sửa tài liệu</h1>
        <form action={boundDelete}>
          <button
            type="submit"
            className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
          >
            Xoá tài liệu
          </button>
        </form>
      </div>
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
        <DocumentForm
          action={boundUpdate}
          submitLabel="Lưu thay đổi"
          defaultValues={doc}
        />
      </div>
    </div>
  );
}
