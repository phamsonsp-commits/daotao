"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6, "Mật khẩu cần ít nhất 6 ký tự"),
  role: z.enum(["ADMIN", "EMPLOYEE"]),
  level: z.enum(["INTERN", "STAFF", "SENIOR", "MANAGER"]),
  department: z.string().optional().default(""),
});

export async function createUser(formData: FormData) {
  await requireAdmin();
  const data = createSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    level: formData.get("level"),
    department: formData.get("department") ?? "",
  });

  const passwordHash = await bcrypt.hash(data.password, 10);

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase().trim(),
      passwordHash,
      role: data.role,
      level: data.level,
      department: data.department || null,
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

const updateSchema = z.object({
  name: z.string().min(2),
  role: z.enum(["ADMIN", "EMPLOYEE"]),
  level: z.enum(["INTERN", "STAFF", "SENIOR", "MANAGER"]),
  department: z.string().optional().default(""),
  password: z.string().optional().default(""),
});

export async function updateUser(userId: string, formData: FormData) {
  await requireAdmin();
  const data = updateSchema.parse({
    name: formData.get("name"),
    role: formData.get("role"),
    level: formData.get("level"),
    department: formData.get("department") ?? "",
    password: formData.get("password") ?? "",
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      role: data.role,
      level: data.level,
      department: data.department || null,
      ...(data.password
        ? { passwordHash: await bcrypt.hash(data.password, 10) }
        : {}),
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function deleteUser(userId: string) {
  const admin = await requireAdmin();
  if (admin.id === userId) {
    redirect(
      "/admin/users?error=" + encodeURIComponent("Không thể tự xoá tài khoản của chính bạn."),
    );
  }
  try {
    await prisma.user.delete({ where: { id: userId } });
  } catch {
    redirect(
      "/admin/users?error=" +
        encodeURIComponent(
          "Không thể xoá: người dùng này đã tạo tài liệu / chương trình / bài đánh giá.",
        ),
    );
  }
  revalidatePath("/admin/users");
  redirect("/admin/users");
}
