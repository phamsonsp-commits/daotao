import { notFound } from "next/navigation";
import Link from "next/link";
import { marked } from "marked";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { CATEGORY_LABELS, LEVEL_LABELS } from "@/lib/labels";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) notFound();

  const html = await marked.parse(doc.content);

  return (
    <div className="max-w-3xl">
      <Link href="/documents" className="text-sm text-indigo-600 hover:underline">
        ← Quay lại thư viện tài liệu
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
          {CATEGORY_LABELS[doc.category]}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
          {LEVEL_LABELS[doc.level]}
        </span>
        <span className="text-slate-400">Phiên bản {doc.version}</span>
      </div>

      <h1 className="mt-2 text-2xl font-semibold text-slate-900">{doc.title}</h1>
      {doc.tags && (
        <p className="mt-1 text-sm text-slate-400">
          Từ khoá: {doc.tags}
        </p>
      )}

      <article
        className="prose-doc mt-6 rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-800"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
