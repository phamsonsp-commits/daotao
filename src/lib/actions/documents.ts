"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const documentSchema = z.object({
  title: z.string().min(3, "Tiêu đề phải có ít nhất 3 ký tự"),
  category: z.enum(["QUY_CHE", "QUY_TRINH", "SAN_PHAM", "CONG_TY"]),
  level: z.enum(["INTERN", "STAFF", "SENIOR", "MANAGER"]),
  tags: z.string().optional().default(""),
  summary: z.string().optional().default(""),
  content: z.string().min(10, "Nội dung phải có ít nhất 10 ký tự"),
  version: z.string().optional().default("1.0"),
});

function parseForm(formData: FormData) {
  return documentSchema.parse({
    title: formData.get("title"),
    category: formData.get("category"),
    level: formData.get("level"),
    tags: formData.get("tags") ?? "",
    summary: formData.get("summary") ?? "",
    content: formData.get("content"),
    version: formData.get("version") || "1.0",
  });
}

export async function createDocument(formData: FormData) {
  const user = await requireAdmin();
  const data = parseForm(formData);

  const doc = await prisma.document.create({
    data: { ...data, createdById: user.id },
  });

  revalidatePath("/documents");
  revalidatePath("/admin/documents");
  redirect(`/admin/documents/${doc.id}/edit`);
}

export async function updateDocument(documentId: string, formData: FormData) {
  await requireAdmin();
  const data = parseForm(formData);

  await prisma.document.update({
    where: { id: documentId },
    data,
  });

  revalidatePath("/documents");
  revalidatePath(`/documents/${documentId}`);
  revalidatePath("/admin/documents");
  redirect("/admin/documents");
}

export async function deleteDocument(documentId: string) {
  await requireAdmin();
  try {
    await prisma.document.delete({ where: { id: documentId } });
  } catch {
    redirect(
      "/admin/documents?error=" +
        encodeURIComponent(
          "Không thể xoá: tài liệu đang được dùng trong một chương trình đào tạo. Hãy gỡ khỏi chương trình trước.",
        ),
    );
  }
  revalidatePath("/documents");
  revalidatePath("/admin/documents");
  redirect("/admin/documents");
}
