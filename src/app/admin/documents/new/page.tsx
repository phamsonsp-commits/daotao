import { requireAdmin } from "@/lib/session";
import { createDocument } from "@/lib/actions/documents";
import { DocumentForm } from "@/components/DocumentForm";

export default async function NewDocumentPage() {
  await requireAdmin();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-slate-900">Tạo tài liệu mới</h1>
      <p className="mt-1 text-sm text-slate-500">
        Nhập nội dung quy chế, quy trình hoặc tài liệu công ty / sản phẩm. Tài
        liệu này có thể được dùng để xây dựng chương trình đào tạo.
      </p>
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
        <DocumentForm action={createDocument} submitLabel="Tạo tài liệu" />
      </div>
    </div>
  );
}
