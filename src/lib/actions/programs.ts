"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import type { DocumentCategory, Level } from "@/generated/prisma/client";

const metaSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional().default(""),
  level: z.enum(["INTERN", "STAFF", "SENIOR", "MANAGER"]),
});

export async function createProgram(formData: FormData) {
  const user = await requireAdmin();
  const data = metaSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    level: formData.get("level"),
  });

  const program = await prisma.trainingProgram.create({
    data: { ...data, createdById: user.id },
  });

  revalidatePath("/admin/programs");
  redirect(`/admin/programs/${program.id}/edit`);
}

export async function updateProgramMeta(programId: string, formData: FormData) {
  await requireAdmin();
  const data = metaSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    level: formData.get("level"),
  });

  await prisma.trainingProgram.update({ where: { id: programId }, data });

  revalidatePath(`/admin/programs/${programId}/edit`);
  revalidatePath("/programs");
}

export async function setProgramStatus(programId: string, status: "DRAFT" | "PUBLISHED") {
  await requireAdmin();
  await prisma.trainingProgram.update({ where: { id: programId }, data: { status } });
  revalidatePath(`/admin/programs/${programId}/edit`);
  revalidatePath("/admin/programs");
  revalidatePath("/programs");
}

export async function deleteProgram(programId: string) {
  await requireAdmin();
  await prisma.trainingProgram.delete({ where: { id: programId } });
  revalidatePath("/admin/programs");
  redirect("/admin/programs");
}

export async function addProgramItems(programId: string, formData: FormData) {
  await requireAdmin();
  const documentIds = formData.getAll("documentIds").map(String);
  if (documentIds.length === 0) {
    revalidatePath(`/admin/programs/${programId}/edit`);
    return;
  }

  const existing = await prisma.programItem.findMany({
    where: { programId },
    select: { documentId: true, order: true },
  });
  const existingIds = new Set(existing.map((i) => i.documentId));
  let nextOrder = existing.reduce((max, i) => Math.max(max, i.order), -1) + 1;

  const toAdd = documentIds.filter((id) => !existingIds.has(id));
  await prisma.programItem.createMany({
    data: toAdd.map((documentId) => ({
      programId,
      documentId,
      order: nextOrder++,
    })),
  });

  revalidatePath(`/admin/programs/${programId}/edit`);
}

export async function removeProgramItem(programId: string, itemId: string) {
  await requireAdmin();
  await prisma.programItem.delete({ where: { id: itemId } });
  revalidatePath(`/admin/programs/${programId}/edit`);
}

export async function moveProgramItem(
  programId: string,
  itemId: string,
  direction: "up" | "down",
) {
  await requireAdmin();
  const items = await prisma.programItem.findMany({
    where: { programId },
    orderBy: { order: "asc" },
  });
  const index = items.findIndex((i) => i.id === itemId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= items.length) return;

  const a = items[index];
  const b = items[swapWith];
  await prisma.$transaction([
    prisma.programItem.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.programItem.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);

  revalidatePath(`/admin/programs/${programId}/edit`);
}

// "Tự động tạo chương trình đào tạo" — gom các tài liệu phù hợp cấp độ / loại
// vào chương trình, giúp admin nhanh chóng dựng bản nháp từ kho quy chế, quy
// trình và tài liệu công ty / sản phẩm đã có sẵn.
export async function autoGenerateProgramItems(programId: string, formData: FormData) {
  await requireAdmin();
  const level = String(formData.get("level") || "");
  const category = String(formData.get("category") || "");

  const program = await prisma.trainingProgram.findUniqueOrThrow({
    where: { id: programId },
  });

  const documents = await prisma.document.findMany({
    where: {
      level: (level || program.level) as Level,
      category: category ? (category as DocumentCategory) : undefined,
    },
    orderBy: [{ category: "asc" }, { title: "asc" }],
  });

  const existing = await prisma.programItem.findMany({
    where: { programId },
    select: { documentId: true },
  });
  const existingIds = new Set(existing.map((i) => i.documentId));
  const toAdd = documents.filter((d) => !existingIds.has(d.id));

  let nextOrder = (
    await prisma.programItem.aggregate({
      where: { programId },
      _max: { order: true },
    })
  )._max.order;
  nextOrder = (nextOrder ?? -1) + 1;

  await prisma.$transaction([
    prisma.programItem.createMany({
      data: toAdd.map((d, i) => ({
        programId,
        documentId: d.id,
        order: nextOrder + i,
      })),
    }),
    prisma.trainingProgram.update({
      where: { id: programId },
      data: { autoGenerated: true },
    }),
  ]);

  revalidatePath(`/admin/programs/${programId}/edit`);
}
