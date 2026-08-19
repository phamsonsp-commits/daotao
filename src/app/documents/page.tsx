import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { CATEGORY_LABELS, LEVEL_LABELS, LEVEL_ORDER } from "@/lib/labels";
import type { DocumentCategory, Level } from "@/generated/prisma/client";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; level?: string }>;
}) {
  await requireUser();
  const { category, level } = await searchParams;

  const documents = await prisma.document.findMany({
    where: {
      category: category ? (category as DocumentCategory) : undefined,
      level: level ? (level as Level) : undefined,
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">
        Thư viện tài liệu
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Quy chế, quy trình và tài liệu về công ty / sản phẩm.
      </p>

      <form className="mt-6 flex flex-wrap gap-3 text-sm" action="/documents">
        <select
          name="category"
          defaultValue={category ?? ""}
          className="rounded-md border border-slate-300 px-3 py-2"
        >
          <option value="">Tất cả loại tài liệu</option>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          name="level"
          defaultValue={level ?? ""}
          className="rounded-md border border-slate-300 px-3 py-2"
        >
          <option value="">Tất cả cấp độ</option>
          {LEVEL_ORDER.map((value) => (
            <option key={value} value={value}>
              {LEVEL_LABELS[value]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
        >
          Lọc
        </button>
      </form>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {documents.map((doc) => (
          <Link
            key={doc.id}
            href={`/documents/${doc.id}`}
            className="rounded-lg border border-slate-200 bg-white p-4 hover:border-indigo-300 hover:shadow-sm"
          >
            <div className="flex items-center gap-2 text-xs">
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
                {CATEGORY_LABELS[doc.category]}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                {LEVEL_LABELS[doc.level]}
              </span>
            </div>
            <h2 className="mt-2 font-medium text-slate-900">{doc.title}</h2>
            {doc.summary && (
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                {doc.summary}
              </p>
            )}
          </Link>
        ))}
        {documents.length === 0 && (
          <p className="text-sm text-slate-400">Không có tài liệu phù hợp.</p>
        )}
      </div>
    </div>
  );
}
