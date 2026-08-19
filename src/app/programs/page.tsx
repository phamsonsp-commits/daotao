import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { LEVEL_LABELS } from "@/lib/labels";

export default async function ProgramsPage() {
  const user = await requireUser();

  const [programs, enrollments] = await Promise.all([
    prisma.trainingProgram.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { items: true } } },
    }),
    prisma.enrollment.findMany({ where: { userId: user.id } }),
  ]);

  const statusByProgram = new Map(enrollments.map((e) => [e.programId, e.status]));

  const recommended = programs.filter((p) => p.level === user.level);
  const others = programs.filter((p) => p.level !== user.level);

  const renderCard = (p: (typeof programs)[number]) => {
    const status = statusByProgram.get(p.id);
    return (
      <Link
        key={p.id}
        href={`/programs/${p.id}`}
        className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-indigo-300 hover:shadow-sm"
      >
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {LEVEL_LABELS[p.level]}
          </span>
          {status === "COMPLETED" && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              Đã hoàn thành
            </span>
          )}
          {status === "IN_PROGRESS" && (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
              Đang học
            </span>
          )}
        </div>
        <h3 className="mt-2 font-medium text-slate-900">{p.title}</h3>
        {p.description && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
            {p.description}
          </p>
        )}
        <p className="mt-2 text-xs text-slate-400">
          {p._count.items} tài liệu trong chương trình
        </p>
      </Link>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">
        Chương trình đào tạo
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Học theo lộ trình được xây dựng từ quy chế, quy trình và tài liệu công
        ty / sản phẩm.
      </p>

      {recommended.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold uppercase text-slate-500">
            Dành cho cấp độ của bạn ({LEVEL_LABELS[user.level]})
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {recommended.map(renderCard)}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase text-slate-500">
          Chương trình khác
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {others.map(renderCard)}
        </div>
        {programs.length === 0 && (
          <p className="text-sm text-slate-400">
            Chưa có chương trình đào tạo nào được phát hành.
          </p>
        )}
      </div>
    </div>
  );
}
